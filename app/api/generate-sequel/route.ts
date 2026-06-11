import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { checkGenerationAllowed, decrementStoryCount } from '@/lib/subscription';
import { parseBody, generateSequelSchema } from '@/lib/validation';

// Sequel TEXT generation is handled by the Supabase Edge Function (generate-story-text,
// sequel mode) so it is NOT bound by the Vercel function timeout. This route only does
// fast work: auth, paywall, per-child/volume checks, prompt building, then fires the
// edge function and returns a story id. The client polls the new story until text is ready.
export const maxDuration = 15;

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { story_id } = await parseBody(request, generateSequelSchema);

    // Paywall check
    const paywallResult = await checkGenerationAllowed(supabase, user.id, user.email);
    if (!paywallResult.allowed) {
      return NextResponse.json({ error: 'paywall', reason: paywallResult.reason }, { status: 402 });
    }

    // Fetch the story the user opened + child profile
    const { data: sourceStory } = await supabase
      .from('stories')
      .select('*, children(*)')
      .eq('id', story_id)
      .eq('parent_id', user.id)
      .single();

    if (!sourceStory) return NextResponse.json({ error: 'Story not found' }, { status: 404 });

    const child = sourceStory.children;

    // Identify the series and its CURRENT latest volume. We continue from the latest
    // volume in the series, not whichever story the user happened to open. This is what
    // stops "tap next chapter on Volume 1 twice" creating two Volume 2s.
    const seriesId = sourceStory.series_id ?? sourceStory.id;
    const { data: seriesRows } = await supabase
      .from('stories')
      .select('id, volume_number, pages, character_anchor, series_title, title')
      .or(`series_id.eq.${seriesId},id.eq.${seriesId}`)
      .eq('parent_id', user.id);

    const candidates = (seriesRows && seriesRows.length > 0) ? seriesRows : [sourceStory];
    const latestStory = candidates.reduce((a, b) =>
      ((b.volume_number ?? 1) > (a.volume_number ?? 1) ? b : a)
    );

    const volumeNumber = (latestStory.volume_number ?? 1) + 1;
    if (volumeNumber > 3) {
      return NextResponse.json({ error: 'Series is complete (max 3 volumes)' }, { status: 400 });
    }

    const seriesTitle = sourceStory.series_title ?? latestStory.series_title ?? sourceStory.title;

    // Per-child daily limit: each child can only receive 1 story per day.
    // Exception: if extra books have been purchased today, consume one to bypass the limit.
    let consumedExtraBook = false;
    if (paywallResult.reason === 'subscribed') {
      const { data: subRecord } = await supabase
        .from('user_subscriptions')
        .select('extra_books_today')
        .eq('user_id', user.id)
        .single();
      const extraBooksAvailable = subRecord?.extra_books_today ?? 0;
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);
      const { count: storiesForChildToday } = await supabase
        .from('stories')
        .select('id', { count: 'exact', head: true })
        .eq('child_id', child.id)
        .gte('created_at', todayStart.toISOString());
      if ((storiesForChildToday ?? 0) >= 1) {
        if (extraBooksAvailable <= 0) {
          return NextResponse.json(
            { error: `${child.name} already has a story for today. Each child gets one story per day.` },
            { status: 429 }
          );
        }
        consumedExtraBook = true;
      }
    }

    const isFinalVolume = volumeNumber === 3;

    const pronouns = child.gender === 'Girl'
      ? { they: 'she', them: 'her', their: 'her' }
      : child.gender === 'Boy'
      ? { they: 'he', them: 'him', their: 'his' }
      : { they: 'they', them: 'them', their: 'their' };

    const previousSummary = latestStory.pages
      ?.map((p: { content: string }) => p.content)
      .join('\n\n')
      .slice(0, 1500); // Keep prompt lean — first 1500 chars of the latest volume

    const appearance = child.appearance || {};
    const appearanceDesc = [
      appearance.hairColour ? `${appearance.hairColour} hair` : null,
      appearance.eyeColour ? `${appearance.eyeColour} eyes` : null,
    ].filter(Boolean).join(', ');

    // Recurring cast (siblings/friends are humans; pet is its species) — used to
    // lock each character's form so they don't morph between pages.
    const seqSiblings = Array.isArray(appearance.siblings) ? appearance.siblings : [];
    const seqFriends = Array.isArray(appearance.friends) ? appearance.friends : [];
    const castList = [
      ...seqSiblings.map((c: { name: string; hairColour?: string }) => `${c.name} (sibling, human child${c.hairColour ? `, ${c.hairColour} hair` : ''})`),
      ...seqFriends.map((c: { name: string; hairColour?: string }) => `${c.name} (friend, human child${c.hairColour ? `, ${c.hairColour} hair` : ''})`),
      ...(appearance.petName && appearance.petType ? [`${appearance.petName} (pet, a ${appearance.petColour ? appearance.petColour + ' ' : ''}${appearance.petType})`] : []),
    ];
    const castDesc = castList.join('; ');

    // Reuse the series' character anchor so the hero looks identical across the whole
    // series and stays on the TALEPOP LoRA style. Fall back to a fresh Pixar-3D anchor
    // (same format the main story flow uses) if the source story has none.
    const characterAnchor = (latestStory.character_anchor && latestStory.character_anchor.trim())
      ? latestStory.character_anchor.trim()
      : (sourceStory.character_anchor && sourceStory.character_anchor.trim())
      ? sourceStory.character_anchor.trim()
      : `Pixar 3D CGI render, subsurface skin scattering, volumetric rim lighting, specular eye highlights, smooth rounded cartoon anatomy, large expressive eyes, vibrant saturated colours, professional Disney Pixar animated feature film quality. ${child.name}, a ${child.age}-year-old ${child.gender === 'Boy' ? 'boy' : child.gender === 'Girl' ? 'girl' : 'child'}${appearanceDesc ? ` with ${appearanceDesc}` : ''}, same character, same face, same exact outfit in every image.`;

    const prompt = `You are a master children's story writer. You are writing Volume ${volumeNumber} of a personalised bedtime picture book series.

MANDATORY SAFETY RULES — these override everything else:
- Never generate sexual, romantic, adult, or suggestive content of any kind
- Never generate violence, gore, horror, or frightening content
- Never generate abusive, bullying, discriminatory, or hateful content
- The story must be 100% wholesome, safe, and appropriate for children aged 3-12
- NEVER use em dashes in any text output, story content, titles, or prompts. Use commas, full stops, or rewrite the sentence instead

TALEPOP BRAND VOICE & WRITING STYLE:
- Warm, encouraging, and full of wonder — every sentence should feel like a hug
- Speak to children with joy and delight; speak to the adventure with excitement
- Celebrate imagination, curiosity, and confidence — the child is capable and brave
- Titles: bold, exciting, and specific to the adventure (rendered in a large playful heading font — make them pop)
- Story prose: smooth, flowing, natural rhythm — reads beautifully aloud at bedtime
- Use vivid sensory details: colours, sounds, smells, textures that bring the world to life
- Avoid passive voice; keep the child actively doing, discovering, and choosing

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
1. This is a DIRECT continuation of the previous story — pick up where it left off or begin the next adventure the same characters would naturally go on
2. Reference events, characters, or objects from the previous story naturally
3. ${child.name} is still the hero with the same appearance and personality
4. ${isFinalVolume ? 'This is the FINAL volume of the series — bring the overall adventure to a satisfying, complete conclusion. Give the series a proper ending with a meaningful resolution.' : 'Leave a natural story hook at the end that sets up one more adventure.'}
5. Include a warm, gentle moral lesson appropriate to this chapter
6. ${isFinalVolume ? 'End with a warm, complete, satisfying conclusion — this is the final book in the series. Resolve the adventure fully. Give the characters and the child reader a proper farewell and a sense of wholeness. End on a cosy, peaceful bedtime note with no unresolved threads. No cliffhanger.' : 'End with a warm goodnight or goodbye that settles the child toward sleep — but weave in a single cliffhanger seed on the final page. Choose whichever style fits the story\'s plot and the child\'s interests most naturally:\n   - DISCOVERY: the hero notices something mysterious just as their eyes grow heavy (a glowing door, an unrecognised star, a sealed note slipped under the mat)\n   - VISITOR: a gentle knock, a shadow, or a distant voice calls from somewhere unknown — just as the story closes, before it is answered\n   - OBJECT: a character quietly passes the hero something (a torn map, a magical item, a tiny key) and whispers they will need it for what is coming, then the hero drifts off holding it\n   - NARRATOR TEASE: after the goodnight, the narrator speaks one warm line directly to the child: \"But little did [name] know... tomorrow would bring the biggest adventure yet.\"\n   The cliffhanger must feel like a natural part of the story, not bolted on at the end. Keep it gentle — curious and exciting, not scary. The page 5 image stays warm and sleepy; the hook lives in the words only.'}
7. Use language appropriate for age ${child.age}: ${child.reading_level === 'beginner' ? 'short sentences, simple words' : child.reading_level === 'intermediate' ? 'flowing sentences, rich descriptions' : 'complex narrative, vivid imagery'}
8. Split into exactly 5 pages, 2-4 paragraphs each
9. For each page, write an image_prompt. Start it with the CHARACTER ANCHOR below copied word-for-word (do not change a single word), then add 2-4 sentences describing only this page's specific scene: the location, the action ${child.name} is doing, anyone else present, and ${child.name}'s expression.

CHARACTER ANCHOR (copy verbatim at the start of every image_prompt — do not alter a single word; this keeps ${child.name} looking identical to the earlier books in the series):
"${characterAnchor}"

After the anchor, add 2-4 sentences describing ONLY this page's scene and action (location, what is happening, who is present, the character's expression). Do not add any other art-style words.

CRITICAL RULE: End every image_prompt with exactly this phrase: "No text, no words, no letters anywhere in the image."

RECURRING CHARACTERS (this is the same series — keep every character identical across all pages):
${castDesc ? `Recurring cast: ${castDesc}.` : ''}
FORM LOCK (non-negotiable): every named character keeps ONE fixed form for the whole book. ${child.name}, siblings and friends are HUMAN children in every image. A pet is its stated animal species in every image. A story creature keeps ONE species. NEVER turn a character from a human into an animal or an animal into a human, and NEVER change an animal's species, between pages.
For each recurring character, decide their fixed appearance once (humans: a hair colour and a fixed outfit in a palette different from ${child.name}; pets/creatures: species + colour + 1-2 fixed features) and paste that SAME description into every image_prompt where they appear. Do not restyle or re-colour them from page to page — identical repetition is what stops them morphing between images.

IMPORTANT: The series is called "${seriesTitle}". Every volume title MUST start with "${seriesTitle}: " followed by a short subtitle (2-5 words) describing this chapter's specific adventure. Example: "${seriesTitle}: The Enchanted Map".

Return ONLY valid JSON:
{
  "title": "${seriesTitle}: [short subtitle for this chapter, e.g. '${seriesTitle}: The Lost Map']",
  "moral": "The gentle lesson in one sentence",
  "theme_emoji": "One emoji",
  "word_count": estimated_total_as_number,
  "pages": [
    {
      "page_number": 1,
      "content": "Page text — 2-4 paragraphs",
      "image_prompt": "${characterAnchor} [2-4 sentences describing only this page\'s scene and action]. No text, no words, no letters anywhere in the image."
    }
  ]
}`;

    // Promote the root story to a series on the first sequel.
    if (!sourceStory.series_id) {
      await supabase
        .from('stories')
        .update({ series_id: seriesId, series_title: seriesTitle, volume_number: sourceStory.volume_number ?? 1 })
        .eq('id', seriesId);
    }

    // Hand off to the edge function (sequel mode). It inserts a placeholder carrying the
    // series fields + reused anchor, returns the new story id immediately, then writes the
    // text and fires image generation in the background — no Vercel timeout involved.
    const edgeRes = await fetch(
      `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/generate-story-text`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
          'apikey': process.env.SUPABASE_SERVICE_ROLE_KEY!,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt,
          child_id: child.id,
          parent_id: user.id,
          anthropic_api_key: process.env.ANTHROPIC_API_KEY,
          replicate_token: process.env.REPLICATE_API_TOKEN,
          child_appearance: appearance,
          sequel: {
            series_id: seriesId,
            series_title: seriesTitle,
            volume_number: volumeNumber,
            character_anchor: characterAnchor,
          },
        }),
      }
    );

    if (!edgeRes.ok) {
      const errText = await edgeRes.text();
      console.error('[generate-sequel] Edge function error:', errText);
      return NextResponse.json({ error: 'Sequel generation failed' }, { status: 500 });
    }

    const { story_id: newStoryId } = await edgeRes.json();
    if (!newStoryId) {
      return NextResponse.json({ error: 'Sequel generation failed — no story ID returned' }, { status: 500 });
    }

    // Decrement quota now that the story record is confirmed created.
    await decrementStoryCount(supabase, user.id, paywallResult.reason, child.id);
    if (consumedExtraBook) {
      const { data: sr } = await supabase.from('user_subscriptions').select('extra_books_today').eq('user_id', user.id).single();
      await supabase.from('user_subscriptions').update({ extra_books_today: Math.max(0, (sr?.extra_books_today ?? 1) - 1) }).eq('user_id', user.id);
    }

    return NextResponse.json({ story: { id: newStoryId, title: 'Writing the next chapter…', pages: [] } });
  } catch (error) {
    if (error instanceof Response) return error;
    console.error('Sequel generation error:', error);
    return NextResponse.json({ error: 'Sequel generation failed' }, { status: 500 });
  }
}
