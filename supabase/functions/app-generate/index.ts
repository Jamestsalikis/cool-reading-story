// app-generate — the native app's secure story-generation entry point.
//
// The bundled app has no Next.js server, so this edge function does the work the
// Next.js /api/generate-story + /api/generate-sequel routes do for the web:
//   1. Authenticate the caller by their Supabase JWT (Authorization header).
//   2. Enforce the paywall + per-child daily limit (service role, tamper-proof).
//   3. Build the Claude prompt SERVER-SIDE (content safety for a kids' app).
//   4. Hand off to generate-story-text (which writes text + fires images).
//
// Secrets come from function env (NEVER from the client):
//   SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY (already set),
//   ANTHROPIC_API_KEY, REPLICATE_API_TOKEN  (must be set — see PLAN.md Phase 4).
//
// NOTE: mirrors lib/subscription.ts + lib/story-prompt.ts + the two API routes.
// Keep in sync with those until the web routes are retired.

import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { createClient, SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2'

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}
const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...cors, 'Content-Type': 'application/json' } })

// ── Paywall (ported from lib/subscription.ts) ────────────────────────────────
type PaywallReason = 'admin' | 'free' | 'subscribed' | 'extra_book'
type PaywallResult =
  | { allowed: true; reason: PaywallReason }
  | { allowed: false; reason: 'no_subscription' | 'free_exhausted' | 'monthly_limit' | 'daily_limit' }

async function checkGenerationAllowed(db: SupabaseClient, userId: string, userEmail: string | undefined): Promise<PaywallResult> {
  const { data: adminRow } = await db.from('admin_emails').select('email').eq('email', userEmail ?? '').single()
  if (adminRow) return { allowed: true, reason: 'admin' }

  let { data: sub } = await db.from('user_subscriptions').select('*').eq('user_id', userId).single()
  if (!sub) {
    const { data: created } = await db.from('user_subscriptions')
      .insert({ user_id: userId, status: 'free', free_stories_remaining: 1 }).select().single()
    sub = created
  }
  if (!sub) return { allowed: false, reason: 'no_subscription' }

  if (sub.status === 'subscribed') {
    const now = new Date()
    const today = now.toISOString().split('T')[0]
    if (now >= new Date(sub.month_reset_date)) {
      const nextReset = new Date(now.getFullYear(), now.getMonth() + 1, 1).toISOString().split('T')[0]
      await db.from('user_subscriptions').update({ stories_this_month: 0, month_reset_date: nextReset }).eq('user_id', userId)
    }
    if (!sub.day_reset_date || sub.day_reset_date < today) {
      await db.from('user_subscriptions').update({ stories_today: 0, day_reset_date: today, extra_books_today: 0 }).eq('user_id', userId)
    }
    return { allowed: true, reason: 'subscribed' }
  }

  if (sub.status === 'free' || sub.status === 'cancelled') {
    const today = new Date().toISOString().split('T')[0]
    if (!sub.day_reset_date || sub.day_reset_date < today) {
      await db.from('user_subscriptions').update({ extra_books_today: 0, day_reset_date: today }).eq('user_id', userId)
      sub.extra_books_today = 0
    }
    if ((sub.free_stories_remaining ?? 0) > 0) return { allowed: true, reason: 'free' }
    if ((sub.extra_books_today ?? 0) > 0) return { allowed: true, reason: 'extra_book' }
    return { allowed: false, reason: 'free_exhausted' }
  }
  return { allowed: false, reason: 'no_subscription' }
}

async function decrementStoryCount(db: SupabaseClient, userId: string, reason: PaywallReason, childId?: string) {
  if (reason === 'admin') return
  if (reason === 'extra_book') {
    const { data: r } = await db.from('user_subscriptions').select('extra_books_today').eq('user_id', userId).single()
    await db.from('user_subscriptions').update({ extra_books_today: Math.max(0, (r?.extra_books_today ?? 0) - 1) }).eq('user_id', userId)
    return
  }
  if (reason === 'free') {
    if (childId) await db.from('children').update({ has_used_free_story: true }).eq('id', childId).eq('parent_id', userId)
    const { data: r } = await db.from('user_subscriptions').select('free_stories_remaining').eq('user_id', userId).single()
    await db.from('user_subscriptions').update({ free_stories_remaining: Math.max(0, (r?.free_stories_remaining ?? 0) - 1) }).eq('user_id', userId)
  }
  if (reason === 'subscribed') {
    await db.rpc('increment_stories_this_month', { uid: userId })
    await db.rpc('increment_stories_today', { uid: userId })
  }
}

// Per-child daily limit for subscribed users (1/day unless extra books bought).
// Returns { blocked, consumedExtraBook }.
async function checkChildDailyLimit(db: SupabaseClient, userId: string, childId: string, reason: PaywallReason) {
  if (reason !== 'subscribed') return { blocked: false, consumedExtraBook: false }
  const { data: subRecord } = await db.from('user_subscriptions').select('extra_books_today').eq('user_id', userId).single()
  const extraBooksAvailable = subRecord?.extra_books_today ?? 0
  const todayStart = new Date(); todayStart.setHours(0, 0, 0, 0)
  const { count } = await db.from('stories').select('id', { count: 'exact', head: true })
    .eq('child_id', childId).gte('created_at', todayStart.toISOString())
  if ((count ?? 0) >= 1) {
    if (extraBooksAvailable <= 0) return { blocked: true, consumedExtraBook: false }
    return { blocked: false, consumedExtraBook: true }
  }
  return { blocked: false, consumedExtraBook: false }
}

// ── Prompt builders (ported from lib/story-prompt.ts + the sequel route) ─────
// deno-lint-ignore no-explicit-any
function buildPrompt(child: any, previousTitles: string[] = []): string {
  const { name, age, gender, interests, appearance, reading_level } = child
  const pronouns = gender === 'Girl' ? { they: 'she', them: 'her', their: 'her' }
    : gender === 'Boy' ? { they: 'he', them: 'him', their: 'his' }
    : { they: 'they', them: 'them', their: 'their' }
  const wordTarget = reading_level === 'beginner' ? 400 : reading_level === 'intermediate' ? 700 : 1000
  const skinToneMap: Record<string, string> = { White: 'fair/light skin', Tanned: 'light tan skin', 'Semi Brown': 'warm medium-brown skin', Brown: 'deep brown skin' }
  const skinDesc = appearance.skinColour ? skinToneMap[appearance.skinColour] || `${appearance.skinColour} skin` : null
  const appearanceDesc = [skinDesc, appearance.hairColour ? `${appearance.hairColour} hair` : null, appearance.eyeColour ? `${appearance.eyeColour} eyes` : null].filter(Boolean).join(', ')
  const petColour = appearance.petColour || null
  const petDesc = appearance.petName && appearance.petType ? `${name}'s beloved pet ${appearance.petType} named ${appearance.petName}${petColour ? ` (${petColour})` : ''}` : null
  const siblings = Array.isArray(appearance.siblings) ? appearance.siblings : []
  // deno-lint-ignore no-explicit-any
  const siblingDesc = siblings.length > 0 ? siblings.map((s: any) => { const p = [s.nickname ? `${s.name} (${s.nickname})` : s.name]; if (s.hairColour) p.push(`${s.hairColour} hair`); return p.join(', ') }).join(' | ') : null
  const friends = Array.isArray(appearance.friends) ? appearance.friends : []
  // deno-lint-ignore no-explicit-any
  const bestFriendDesc = friends.length > 0 ? friends.map((f: any) => { const p = [f.nickname ? `${f.name} (nickname: ${f.nickname})` : f.name]; if (f.hairColour) p.push(`${f.hairColour} hair`); return p.join(', ') }).join(' | ') : null
  const locationDesc = [appearance.city, appearance.country].filter(Boolean).join(', ')
  const followUpAnswers = Array.isArray(appearance.followUpAnswers) ? appearance.followUpAnswers : []
  const followUpDesc = followUpAnswers.length > 0 ? followUpAnswers.map((qa: { question: string; answer: string }) => `  - ${qa.question} → ${qa.answer}`).join('\n') : null

  return `You are a master children's story writer creating a personalised bedtime picture book.

MANDATORY SAFETY RULES  -  these override everything else:
- Never generate sexual, romantic, adult, or suggestive content of any kind
- Never generate violence, gore, horror, or frightening content
- Never generate abusive, bullying, discriminatory, or hateful content
- Never generate content that could be used to groom, harm, or exploit children
- The story must be 100% wholesome, safe, and appropriate for children aged 3-12
- If any part of the child's profile could lead to harmful content, use safe alternative themes instead
- NEVER use em dashes in any text output, story content, titles, or prompts. Use commas, full stops, or rewrite the sentence instead

TALEPOP BRAND VOICE & WRITING STYLE:
This story will be typeset in two fonts that define the TalePop aesthetic  -  write to match their personalities:

TITLES (Bambino font  -  playful, friendly, hand-drawn, full of character):
- Punchy and specific: capture the exact adventure in 3-6 memorable words
- Warm and exciting  -  a child should want to read it the moment they see it
- Think hand-lettered, bouncy, joyful  -  never dry or generic

STORY PROSE (Nunito font  -  clean, rounded, easy to read, perfect for bedtime):
- Smooth natural rhythm that flows beautifully when read aloud
- Rounded, warm sentences  -  never stiff, formal, or clunky
- Short-to-medium sentences that breathe; commas for gentle pauses
- Clean and uncluttered  -  vivid but not overwrought

OVERALL VOICE:
- Warm, encouraging, full of wonder  -  every sentence should feel like a hug
- Speak to children with joy and delight; speak to the adventure with excitement
- Celebrate imagination, curiosity, and confidence  -  the child is capable and brave
- Use vivid sensory details: colours, sounds, smells, textures that bring the world to life
- Avoid passive voice; keep the child actively doing, discovering, and choosing

Child profile:
- Name: ${name}
- Age: ${age}
- Gender: ${gender} (use pronouns: ${pronouns.they}/${pronouns.them}/${pronouns.their})
- Interests: ${interests.join(', ')}
${appearanceDesc ? `- Appearance: ${appearanceDesc}` : ''}
${locationDesc ? `- Lives in: ${locationDesc}` : ''}
${petDesc ? `- Pet: ${petDesc}` : ''}
${siblingDesc ? `- Siblings: ${siblingDesc}` : ''}
${bestFriendDesc ? `- Best friend: ${bestFriendDesc}` : ''}
${followUpDesc ? `- Personal details from ${name}:\n${followUpDesc}` : ''}
- Reading level: ${reading_level} → target ${wordTarget} words total

${previousTitles.length > 0 ? `IMPORTANT  -  PREVIOUS STORIES WRITTEN FOR ${name}:
${previousTitles.map((t, i) => `  ${i + 1}. "${t}"`).join('\n')}
You MUST write a completely different story: different setting, different plot, different adventure type, different characters, and a different title. Do NOT repeat any theme, location, or concept from the list above.

` : ''}Requirements:
1. ${name} is the hero  -  describe ${pronouns.them} with their actual appearance
2. Weave their interests naturally into the plot  -  they drive the adventure
3. Include their pet, siblings, or best friend if provided  -  give them real roles using their actual names/nicknames
4. If a location is provided, set the story there or reference it naturally
5. Include a warm, gentle moral lesson that emerges naturally from the story
6. End with a warm goodnight or goodbye that settles ${name} toward sleep  -  but weave in a single cliffhanger seed on the final page. Choose whichever style fits the story's plot and ${name}'s interests most naturally:
   - DISCOVERY: the hero notices something mysterious just as their eyes grow heavy (a glowing door, an unrecognised star, a sealed note slipped under the mat)
   - VISITOR: a gentle knock, a shadow, or a distant voice calls from somewhere unknown  -  just as the story closes, before it is answered
   - OBJECT: a character quietly passes the hero something (a torn map, a magical item, a tiny key) and whispers they will need it for what is coming, then ${name} drifts off holding it
   - NARRATOR TEASE: after the goodnight, the narrator speaks one warm line directly to the child: "But little did ${name} know... tomorrow would bring the biggest adventure yet."
   The cliffhanger must feel like a natural part of the story, not bolted on at the end. Keep it gentle  -  curious and exciting, not scary. The page 5 image stays warm and sleepy; the hook lives in the words only.
7. Use language appropriate for age ${age}: ${reading_level === 'beginner' ? 'short sentences, simple words, lots of repetition' : reading_level === 'intermediate' ? 'flowing sentences, rich descriptions, some new vocabulary' : 'complex narrative, vivid imagery, sophisticated vocabulary'}
8. Make it feel uniquely written FOR ${name}  -  not a generic story with a name swapped in
9. Split the story into exactly 5 pages. Each page should have 2-4 paragraphs of text.
10. Before writing page prompts, define a CHARACTER ANCHOR using EXACTLY this format for the character_anchor field:
"Pixar 3D CGI render, subsurface skin scattering, volumetric rim lighting, specular eye highlights, smooth rounded cartoon anatomy, large expressive eyes, vibrant saturated colours, professional Disney Pixar animated feature film quality. ${name}, a ${age}-year-old child with ${skinDesc ?? 'fair/light skin'}, [EXACT HAIR: colour + style e.g. 'curly auburn hair'], wearing [EXACT OUTFIT: name every piece with specific colours e.g. 'a bright cobalt-blue hoodie with a yellow star, forest-green cargo shorts, and orange high-top sneakers']  -  same character, same face, same exact outfit in every image."
OUTFIT RULES: (a) Pick a specific, distinctive outfit that matches ${name}'s interests. (b) Name EVERY piece: top, bottom, shoes  -  each with a precise colour word. (c) Avoid generic combos like "blue shirt and brown pants"  -  use vivid specific colours. (d) The outfit is fixed for the whole book  -  never change it between pages.
TEXT OUTFIT RULE: In the story content (page text), describe ${name}'s appearance ONLY using the outfit defined in the character_anchor.

11. CAST ANCHORS (recurring secondary characters): Identify every named non-protagonist who appears on 2 or more pages — siblings, friends, pets, and any story-invented companion. Define a single FIXED anchor for each and store them in the 'companion_anchor' field (one per line; empty string "" only if there are genuinely none). EACH character's FORM IS FIXED FOR THE WHOLE BOOK:
   - Siblings and friends are HUMAN children. Format: "[Name], a human [boy/girl] child with [hair colour + style] hair, wearing [one fixed outfit with specific colours, a palette different from ${name}], same human child, same face and same outfit in every image."
   - A pet is its stated animal species. Format: "[Name], a [colour] [species] (a real animal of this exact species, never a human), same animal, same breed and markings in every image."
   - A story-invented creature/companion: "[species/type + specific colour], [size], [1-2 fixed features], same creature, same species in every image."

12. USING THE CAST ANCHORS: In EVERY image_prompt where one of these characters appears, paste that character's anchor VERBATIM (after the character_anchor). Siblings/friends must wear a different outfit palette from ${name}.

CRITICAL IMAGE PROMPT RULES:

ANATOMY (non-negotiable):
- The character always has exactly 2 arms, 2 legs, 2 feet, 2 hands. Never more, never fewer.
- Never show extra limbs, merged limbs, floating body parts, or distorted anatomy.
- Clothing must fall freely and NEVER connect to a limb or body part.

CONSISTENCY (non-negotiable):
- Start EVERY image_prompt with the character_anchor string  -  word for word, no changes
- If a companion_anchor is defined, paste it immediately after the character_anchor in every image_prompt where that companion appears
- FORM LOCK: every named character keeps ONE fixed form for the entire book. The hero, siblings and friends are HUMAN in every image; a pet/creature stays the SAME species. NEVER change a character's form or species between pages.
- The character must look identical in all 5 images: same face, same age (${age}), same exact outfit
- End every image prompt with: "No text, no words, no letters anywhere in the image."

PAGE SPECIFICITY (non-negotiable):
- Each image_prompt MUST be uniquely tied to what actually happens on that page. Extract the specific named location, the specific action, any named creatures/objects, and the emotional moment.
- A reader who sees only the image should be able to tell which page it illustrates.
- Each of the 5 images must look completely different in composition and setting.

WHAT MAKES A GREAT CHILDREN'S BOOK ILLUSTRATION (apply to every page):
- Capture the EMOTIONAL PEAK of that page. Show STRONG EMOTION on the character's face. Use DYNAMIC COMPOSITION.
- Vary composition: Page 1 wide establishing shot; Page 2 discovery/reaction; Page 3 action; Page 4 dramatic/emotional peak; Page 5 warm cosy resolution inviting sleep.
- Environmental storytelling, mood lighting, foreground depth.

Return ONLY valid JSON, no markdown, no explanation:
{
  "title": "A creative, specific story title (not generic)",
  "moral": "The gentle lesson in one sentence",
  "theme_emoji": "One emoji representing the story theme",
  "word_count": estimated_total_word_count_as_number,
  "character_anchor": "Pixar 3D CGI render, subsurface skin scattering, volumetric rim lighting, specular eye highlights, smooth rounded cartoon anatomy, large expressive eyes, vibrant saturated colours, professional Disney Pixar animated feature film quality. ${name}, a ${age}-year-old child with ${skinDesc ?? 'fair/light skin'}, [EXACT HAIR COLOUR AND STYLE], wearing [EXACT OUTFIT: every piece named with specific vivid colours]  -  same character, same face, same exact outfit in every image.",
  "companion_anchor": "[IF story has a recurring creature/animal/friend: describe species+colour+size+1-2 fixed features. If none, use empty string \\"\\"]",
  "pages": [
    { "page_number": 1, "content": "First paragraph.\\n\\nSecond paragraph.", "image_prompt": "[character_anchor verbatim] [3-5 sentences describing THIS PAGE: exact location, specific action, any companion anchor verbatim, the emotional expression]. No text, no words, no letters anywhere in the image." }
  ]
}`
}

// deno-lint-ignore no-explicit-any
function buildSequelPrompt(child: any, latestStory: any, sourceStory: any, volumeNumber: number, seriesTitle: string): { prompt: string; characterAnchor: string } {
  const isFinalVolume = volumeNumber === 3
  const pronouns = child.gender === 'Girl' ? { they: 'she', them: 'her', their: 'her' }
    : child.gender === 'Boy' ? { they: 'he', them: 'him', their: 'his' }
    : { they: 'they', them: 'them', their: 'their' }
  const previousSummary = latestStory.pages?.map((p: { content: string }) => p.content).join('\n\n').slice(0, 1500)
  const appearance = child.appearance || {}
  const appearanceDesc = [appearance.hairColour ? `${appearance.hairColour} hair` : null, appearance.eyeColour ? `${appearance.eyeColour} eyes` : null].filter(Boolean).join(', ')
  const seqSiblings = Array.isArray(appearance.siblings) ? appearance.siblings : []
  const seqFriends = Array.isArray(appearance.friends) ? appearance.friends : []
  const castList = [
    ...seqSiblings.map((c: { name: string; hairColour?: string }) => `${c.name} (sibling, human child${c.hairColour ? `, ${c.hairColour} hair` : ''})`),
    ...seqFriends.map((c: { name: string; hairColour?: string }) => `${c.name} (friend, human child${c.hairColour ? `, ${c.hairColour} hair` : ''})`),
    ...(appearance.petName && appearance.petType ? [`${appearance.petName} (pet, a ${appearance.petColour ? appearance.petColour + ' ' : ''}${appearance.petType})`] : []),
  ]
  const castDesc = castList.join('; ')
  const characterAnchor = (latestStory.character_anchor && latestStory.character_anchor.trim())
    ? latestStory.character_anchor.trim()
    : (sourceStory.character_anchor && sourceStory.character_anchor.trim())
    ? sourceStory.character_anchor.trim()
    : `Pixar 3D CGI render, subsurface skin scattering, volumetric rim lighting, specular eye highlights, smooth rounded cartoon anatomy, large expressive eyes, vibrant saturated colours, professional Disney Pixar animated feature film quality. ${child.name}, a ${child.age}-year-old ${child.gender === 'Boy' ? 'boy' : child.gender === 'Girl' ? 'girl' : 'child'}${appearanceDesc ? ` with ${appearanceDesc}` : ''}, same character, same face, same exact outfit in every image.`

  const prompt = `You are a master children's story writer. You are writing Volume ${volumeNumber} of a personalised bedtime picture book series.

MANDATORY SAFETY RULES — these override everything else:
- Never generate sexual, romantic, adult, or suggestive content of any kind
- Never generate violence, gore, horror, or frightening content
- Never generate abusive, bullying, discriminatory, or hateful content
- The story must be 100% wholesome, safe, and appropriate for children aged 3-12
- NEVER use em dashes in any text output. Use commas, full stops, or rewrite the sentence instead

TALEPOP BRAND VOICE: Warm, encouraging, full of wonder. Titles bold and specific. Prose smooth and flowing, reads beautifully aloud at bedtime. Vivid sensory details. Active voice.

Child profile:
- Name: ${child.name}
- Age: ${child.age}
- Gender: ${child.gender} (use pronouns: ${pronouns.they}/${pronouns.them}/${pronouns.their})
- Interests: ${(child.interests || []).join(', ')}
${castDesc ? `- Recurring characters (keep identical every page): ${castDesc}` : ''}
${appearanceDesc ? `- Appearance: ${appearanceDesc}` : ''}
${appearance.city || appearance.country ? `- Lives in: ${[appearance.city, appearance.country].filter(Boolean).join(', ')}` : ''}

Previous story summary (Volume ${volumeNumber - 1}):
"""
${previousSummary}
"""

Requirements:
1. This is a DIRECT continuation of the previous story
2. Reference events, characters, or objects from the previous story naturally
3. ${child.name} is still the hero with the same appearance and personality
4. ${isFinalVolume ? 'This is the FINAL volume — bring the overall adventure to a satisfying, complete conclusion.' : 'Leave a natural story hook at the end that sets up one more adventure.'}
5. Include a warm, gentle moral lesson appropriate to this chapter
6. ${isFinalVolume ? 'End with a warm, complete, satisfying conclusion. Resolve fully. No cliffhanger.' : 'End with a warm goodnight that settles the child toward sleep, but weave in a single gentle cliffhanger seed on the final page (a discovery, a visitor, an object passed to the hero, or a one-line narrator tease). Keep it gentle, curious not scary; the page 5 image stays warm and sleepy.'}
7. Use language appropriate for age ${child.age}: ${child.reading_level === 'beginner' ? 'short sentences, simple words' : child.reading_level === 'intermediate' ? 'flowing sentences, rich descriptions' : 'complex narrative, vivid imagery'}
8. Split into exactly 5 pages, 2-4 paragraphs each
9. For each page, write an image_prompt. Start it with the CHARACTER ANCHOR below copied word-for-word, then add 2-4 sentences describing only this page's specific scene.

CHARACTER ANCHOR (copy verbatim at the start of every image_prompt — do not alter a single word):
"${characterAnchor}"

CRITICAL RULE: End every image_prompt with exactly: "No text, no words, no letters anywhere in the image."

FORM LOCK (non-negotiable): every named character keeps ONE fixed form for the whole book. ${child.name}, siblings and friends are HUMAN children in every image. A pet is its stated animal species in every image. NEVER change a character's form or species between pages. Siblings/friends wear a palette different from ${child.name}.
${castDesc ? `Recurring cast: ${castDesc}.` : ''}

IMPORTANT: The series is called "${seriesTitle}". Every volume title MUST start with "${seriesTitle}: " followed by a short subtitle (2-5 words).

Return ONLY valid JSON:
{
  "title": "${seriesTitle}: [short subtitle for this chapter]",
  "moral": "The gentle lesson in one sentence",
  "theme_emoji": "One emoji",
  "word_count": estimated_total_as_number,
  "pages": [
    { "page_number": 1, "content": "Page text — 2-4 paragraphs", "image_prompt": "${characterAnchor} [2-4 sentences describing only this page's scene and action]. No text, no words, no letters anywhere in the image." }
  ]
}`
  return { prompt, characterAnchor }
}

// ── Hand off to generate-story-text (writes text + fires images) ─────────────
async function fireGeneration(
  supabaseUrl: string, serviceRoleKey: string, anthropicKey: string, replicateToken: string,
  // deno-lint-ignore no-explicit-any
  payload: Record<string, any>,
): Promise<string | null> {
  const res = await fetch(`${supabaseUrl}/functions/v1/generate-story-text`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${serviceRoleKey}`, 'apikey': serviceRoleKey, 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...payload, anthropic_api_key: anthropicKey, replicate_token: replicateToken }),
  })
  if (!res.ok) { console.error('[app-generate] generate-story-text error:', await res.text()) ; return null }
  const { story_id } = await res.json()
  return story_id ?? null
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors })
  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405)

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  const anonKey = Deno.env.get('SUPABASE_ANON_KEY')!
  const anthropicKey = Deno.env.get('ANTHROPIC_API_KEY')
  const replicateToken = Deno.env.get('REPLICATE_API_TOKEN')
  if (!anthropicKey || !replicateToken) return json({ error: 'server_not_configured' }, 500)

  // 1. Authenticate the caller by their JWT.
  const authHeader = req.headers.get('Authorization') ?? ''
  const userClient = createClient(supabaseUrl, anonKey, { global: { headers: { Authorization: authHeader } } })
  const { data: { user }, error: authErr } = await userClient.auth.getUser()
  if (authErr || !user) return json({ error: 'Unauthorized' }, 401)

  // 2. Service-role client for all privileged reads/writes.
  const db = createClient(supabaseUrl, serviceRoleKey)

  // deno-lint-ignore no-explicit-any
  let body: { mode?: string; child_id?: string; story_id?: string; sample_candidate?: any }
  try { body = await req.json() } catch { return json({ error: 'Bad request' }, 400) }
  const mode = body.mode === 'sequel' ? 'sequel' : 'new'

  // 3. Paywall.
  const paywall = await checkGenerationAllowed(db, user.id, user.email)
  if (!paywall.allowed) return json({ error: 'paywall', reason: paywall.reason }, 402)

  try {
    if (mode === 'new') {
      const childId = body.child_id
      if (!childId) return json({ error: 'child_id required' }, 400)
      const { data: child } = await db.from('children').select('*').eq('id', childId).eq('parent_id', user.id).single()
      if (!child) return json({ error: 'Child not found' }, 404)

      // Free per-child gate: each child gets one free story.
      if (paywall.reason === 'free' && child.has_used_free_story) return json({ error: 'paywall', reason: 'free_exhausted' }, 402)

      const limit = await checkChildDailyLimit(db, user.id, childId, paywall.reason)
      if (limit.blocked) return json({ error: `${child.name} already has a story for today. Each child gets one story per day.` }, 429)

      // Free user's FIRST book → serve the curated sample template (no AI) when
      // the client supplied a matching one. Gated server-side so the free rule
      // can't be gamed. Mirrors the web /api/generate-story sample shortcut.
      const { count: existingCount } = await db.from('stories').select('id', { count: 'exact', head: true }).eq('child_id', childId)
      const isFirstBook = (existingCount ?? 0) === 0
      const sample = body.sample_candidate
      if (paywall.reason === 'free' && isFirstBook && sample && Array.isArray(sample.pages) && sample.pages.length > 0) {
        // deno-lint-ignore no-explicit-any
        const pagesForDB = sample.pages.map((p: any) => ({ ...p, image_url: null, poll_url: null }))
        // deno-lint-ignore no-explicit-any
        const fullContent = pagesForDB.map((p: any) => p.content).join('\n\n')
        const { data: story, error: insErr } = await db.from('stories').insert({
          child_id: childId, parent_id: user.id,
          title: sample.title, content: fullContent, moral: sample.moral ?? '',
          theme: sample.theme_emoji ?? '✨', word_count: sample.word_count ?? 0,
          reading_time_minutes: Math.ceil((sample.word_count || 400) / 150),
          pages: pagesForDB, input_tokens: 0, output_tokens: 0,
          character_anchor: sample.character_anchor ?? null, is_sample: true,
        }).select().single()
        if (insErr || !story) { console.error('[app-generate] sample insert error:', insErr); return json({ error: 'Story save failed' }, 500) }
        await decrementStoryCount(db, user.id, 'free', childId)
        // Fire image generation (service role + replicate token).
        await fetch(`${supabaseUrl}/functions/v1/generate-story-images`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${serviceRoleKey}`, 'apikey': serviceRoleKey, 'Content-Type': 'application/json' },
          body: JSON.stringify({ story_id: story.id, replicate_token: replicateToken }),
        }).catch((e) => console.error('[app-generate] image trigger error:', e))
        return json({ story: { id: story.id, title: sample.title, pages: [] } })
      }

      const { data: prev } = await db.from('stories').select('title').eq('child_id', childId).order('created_at', { ascending: false }).limit(10)
      const previousTitles = (prev || []).map((s: { title: string }) => s.title).filter(Boolean)
      const prompt = buildPrompt({
        name: child.name, age: child.age, gender: child.gender || 'child',
        interests: child.interests || [], appearance: child.appearance || {}, reading_level: child.reading_level || 'intermediate',
      }, previousTitles)

      const storyId = await fireGeneration(supabaseUrl, serviceRoleKey, anthropicKey, replicateToken, {
        prompt, child_id: childId, parent_id: user.id, child_appearance: child.appearance || {},
      })
      if (!storyId) return json({ error: 'Story generation failed' }, 500)

      await decrementStoryCount(db, user.id, paywall.reason, childId)
      if (limit.consumedExtraBook) {
        const { data: sr } = await db.from('user_subscriptions').select('extra_books_today').eq('user_id', user.id).single()
        await db.from('user_subscriptions').update({ extra_books_today: Math.max(0, (sr?.extra_books_today ?? 1) - 1) }).eq('user_id', user.id)
      }
      return json({ story: { id: storyId, title: 'Writing your story…', pages: [] } })
    }

    // mode === 'sequel'
    const sourceId = body.story_id
    if (!sourceId) return json({ error: 'story_id required' }, 400)
    const { data: sourceStory } = await db.from('stories').select('*, children(*)').eq('id', sourceId).eq('parent_id', user.id).single()
    if (!sourceStory) return json({ error: 'Story not found' }, 404)
    const child = sourceStory.children

    const seriesId = sourceStory.series_id ?? sourceStory.id
    const { data: seriesRows } = await db.from('stories')
      .select('id, volume_number, pages, character_anchor, series_title, title')
      .or(`series_id.eq.${seriesId},id.eq.${seriesId}`).eq('parent_id', user.id)
    const candidates = (seriesRows && seriesRows.length > 0) ? seriesRows : [sourceStory]
    // deno-lint-ignore no-explicit-any
    const latestStory = candidates.reduce((a: any, b: any) => ((b.volume_number ?? 1) > (a.volume_number ?? 1) ? b : a))
    const volumeNumber = (latestStory.volume_number ?? 1) + 1
    if (volumeNumber > 3) return json({ error: 'Series is complete (max 3 volumes)' }, 400)
    const seriesTitle = sourceStory.series_title ?? latestStory.series_title ?? sourceStory.title

    const limit = await checkChildDailyLimit(db, user.id, child.id, paywall.reason)
    if (limit.blocked) return json({ error: `${child.name} already has a story for today. Each child gets one story per day.` }, 429)

    const { prompt, characterAnchor } = buildSequelPrompt(child, latestStory, sourceStory, volumeNumber, seriesTitle)

    if (!sourceStory.series_id) {
      await db.from('stories').update({ series_id: seriesId, series_title: seriesTitle, volume_number: sourceStory.volume_number ?? 1 }).eq('id', seriesId)
    }

    const storyId = await fireGeneration(supabaseUrl, serviceRoleKey, anthropicKey, replicateToken, {
      prompt, child_id: child.id, parent_id: user.id, child_appearance: child.appearance || {},
      sequel: { series_id: seriesId, series_title: seriesTitle, volume_number: volumeNumber, character_anchor: characterAnchor },
    })
    if (!storyId) return json({ error: 'Sequel generation failed' }, 500)

    await decrementStoryCount(db, user.id, paywall.reason, child.id)
    if (limit.consumedExtraBook) {
      const { data: sr } = await db.from('user_subscriptions').select('extra_books_today').eq('user_id', user.id).single()
      await db.from('user_subscriptions').update({ extra_books_today: Math.max(0, (sr?.extra_books_today ?? 1) - 1) }).eq('user_id', user.id)
    }
    return json({ story: { id: storyId, title: 'Writing the next chapter…', pages: [] } })
  } catch (e) {
    console.error('[app-generate] error:', e)
    return json({ error: 'Generation failed' }, 500)
  }
})
