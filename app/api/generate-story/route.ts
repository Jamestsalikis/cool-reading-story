import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { checkGenerationAllowed, decrementStoryCount } from '@/lib/subscription';
import { getSampleStory, isTrialInterest } from '@/lib/sample-stories/server';
import { parseBody, generateStorySchema } from '@/lib/validation';

// Story text generation is handled by the Supabase Edge Function (generate-story-text).
// This Next.js route only does fast work: auth, paywall, child data, sample story lookup.
// For premium users needing fresh stories, it creates a placeholder and fires the edge fn.
export const maxDuration = 10;

const REPLICATE_API_TOKEN = process.env.REPLICATE_API_TOKEN;

function buildPrompt(child: {
  name: string;
  age: number;
  gender: string;
  interests: string[];
  appearance: Record<string, unknown>;
  reading_level: string;
}, previousTitles: string[] = []) {
  const { name, age, gender, interests, appearance, reading_level } = child;

  const pronouns =
    gender === 'Girl'
      ? { they: 'she', them: 'her', their: 'her' }
      : gender === 'Boy'
      ? { they: 'he', them: 'him', their: 'his' }
      : { they: 'they', them: 'them', their: 'their' };

  const wordTarget =
    reading_level === 'beginner' ? 400 : reading_level === 'intermediate' ? 700 : 1000;

  // Map stored skin colour label to a descriptive phrase for image prompts
  const skinToneMap: Record<string, string> = {
    White: 'fair/light skin',
    Tanned: 'light tan skin',
    'Semi Brown': 'warm medium-brown skin',
    Brown: 'deep brown skin',
  };
  const skinDesc = appearance.skinColour ? skinToneMap[appearance.skinColour as string] || `${appearance.skinColour} skin` : null;

  const appearanceDesc = [
    skinDesc,
    appearance.hairColour ? `${appearance.hairColour} hair` : null,
    appearance.eyeColour ? `${appearance.eyeColour} eyes` : null,
  ]
    .filter(Boolean)
    .join(', ');

  const petColour = appearance.petColour as string | null || null;
  const petDesc =
    appearance.petName && appearance.petType
      ? `${name}'s beloved pet ${appearance.petType} named ${appearance.petName}${petColour ? ` (${petColour})` : ''}`
      : null;

  const siblings: { name: string; nickname: string; hairColour?: string }[] = Array.isArray(appearance.siblings) ? appearance.siblings : [];
  const siblingDesc = siblings.length > 0
    ? siblings.map(s => {
        const parts = [s.nickname ? `${s.name} (${s.nickname})` : s.name];
        if (s.hairColour) parts.push(`${s.hairColour} hair`);
        return parts.join(', ');
      }).join(' | ')
    : null;

  const friends: { name: string; nickname: string; hairColour?: string }[] = Array.isArray(appearance.friends) ? appearance.friends : [];
  const bestFriendDesc = friends.length > 0
    ? friends.map(f => {
        const parts = [f.nickname ? `${f.name} (nickname: ${f.nickname})` : f.name];
        if (f.hairColour) parts.push(`${f.hairColour} hair`);
        return parts.join(', ');
      }).join(' | ')
    : null;

  const locationDesc = [
    appearance.city,
    appearance.country,
  ].filter(Boolean).join(', ');

  const followUpAnswers: { question: string; answer: string }[] =
    Array.isArray(appearance.followUpAnswers) ? appearance.followUpAnswers : [];
  const followUpDesc = followUpAnswers.length > 0
    ? followUpAnswers.map(({ question, answer }) => `  - ${question} → ${answer}`).join('\n')
    : null;

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
OUTFIT RULES: (a) Pick a specific, distinctive outfit that matches ${name}'s interests. (b) Name EVERY piece: top, bottom, shoes  -  each with a precise colour word. (c) Avoid generic combos like "blue shirt and brown pants"  -  use vivid specific colours like "cherry-red hoodie", "mustard-yellow overalls", "sky-blue sneakers". (d) The outfit is fixed for the whole book  -  never change it between pages.
TEXT OUTFIT RULE: In the story content (page text), describe ${name}'s appearance ONLY using the outfit defined in the character_anchor. Do NOT invent different colours or clothing in the text that contradict the anchor (e.g. if the anchor says "cherry-red hoodie", the text must say "red hoodie" not "yellow hoodie").

11. COMPANION ANCHOR: If the story features a recurring non-protagonist character (an animal, creature, magical being, or friend) who appears on 2 or more pages, define them in a 'companion_anchor' field using this format:
"[species/type with specific colour e.g. 'a young Triceratops with bright green scales and short golden horns'], [size/build e.g. 'about the size of a car'], [1-2 distinctive features e.g. 'wearing a small red bandana around their neck'], same creature, same appearance in every image."
COMPANION RULES: (a) Species/type must be 100% consistent across all pages - if page 1 has a Triceratops, every page must have a Triceratops, never a T-Rex or Brachiosaurus. (b) Colours and distinctive features are fixed for the whole book. (c) In every image_prompt where the companion appears, paste the companion_anchor after the character_anchor. (d) If no recurring non-protagonist character exists, set companion_anchor to an empty string "".

12. SECONDARY CHARACTER APPEARANCE — siblings, friends, and pets must look VISUALLY DISTINCT from ${name} in every image prompt where they appear. Follow these rules:
   - If a sibling/friend has a provided hair colour, use it EXACTLY in every image_prompt where they appear (e.g. "Max, a boy with straight brown hair").
   - If no hair colour is provided, assign them a hair colour that is DIFFERENT from ${name}'s — and keep it consistent across all pages.
   - Each sibling/friend MUST wear a different outfit colour scheme from ${name}'s character_anchor outfit. Choose a completely different palette.
   - Pets: if a colour/description is provided (e.g. "golden, fluffy"), include it in every image_prompt where the pet appears.
   - In every image_prompt where a sibling, friend, or pet appears, describe them with their specific hair/colour/outfit details so the image model renders them as distinct individuals.

CRITICAL IMAGE PROMPT RULES:

ANATOMY (non-negotiable):
- The character always has exactly 2 arms, exactly 2 legs, exactly 2 feet, exactly 2 hands. Never more, never fewer.
- Never show extra limbs, merged limbs, floating body parts, or distorted anatomy.
- Clothing and fabric (capes, blankets, coats, dresses) must fall freely and NEVER connect to, merge with, or appear attached to a limb or body part.
- Page 5 (bedtime): if the character is wearing a cape, it must be folded on the bed or hung aside -- not connected to any body part while they sleep.

CONSISTENCY (non-negotiable):
- Start EVERY image_prompt with the character_anchor string  -  word for word, no changes
- If a companion_anchor is defined, paste it immediately after the character_anchor in every image_prompt where that companion appears
- The character must look identical in all 5 images: same face, same age (${age}), same exact outfit  -  never taller, never older, never different clothes
- NEVER change the outfit between pages: if the anchor says "cherry-red hoodie and mustard-yellow shorts", every page must show exactly that
- End every image prompt with: "No text, no words, no letters anywhere in the image."

PAGE SPECIFICITY (non-negotiable):
- Each image_prompt MUST be uniquely tied to what actually happens on that page. Do NOT write generic scene prompts.
- Extract from the page text: the specific named location, the specific action happening, any named creatures or magical objects, and the emotional moment.
- If page 2 text mentions "${name} found a tiny blue door hidden behind a waterfall", the image MUST show: a tiny blue door, a waterfall, and ${name} discovering it - NOT just "${name} standing in a forest".
- A reader who sees only the image should be able to tell which page of the story it illustrates.
- Each of the 5 images must look completely different in composition and setting - never repeat the same scene or location.


WHAT MAKES A GREAT CHILDREN'S BOOK ILLUSTRATION (apply to every page):
- Capture the EMOTIONAL PEAK of that page - the single most exciting or heartfelt moment, not a neutral in-between moment
- Show STRONG EMOTION on the character's face: wide eyes of wonder, a beaming smile of triumph, eyebrows raised in surprise, a focused determined gaze - the child reading should FEEL what ${name} feels
- Use DYNAMIC COMPOSITION - avoid the character just standing still. Show them mid-action: leaping, reaching, pointing, spinning, crouching to look at something magical, running with arms out
- Vary the composition across the 5 pages so the book feels cinematic and alive:
  Page 1 - Wide establishing shot: show the full world, ${name} small within a large magical environment, setting the sense of adventure and scale
  Page 2 - Discovery / reaction shot: ${name} close-up or mid-shot, face expressing the moment of surprise or excitement when the adventure begins
  Page 3 - Action shot: the most dynamic moment - movement, energy, something happening; diagonal lines, flying objects, rushing wind
  Page 4 - Dramatic / emotional peak: the highest-stakes or most wondrous moment; strong lighting contrast, foreground detail, depth
  Page 5 - Warm resolution: cosy and intimate, soft golden light, ${name} at peace - a scene that feels like a hug and naturally invites sleep
- ENVIRONMENTAL STORYTELLING: the background must actively tell the story - glowing portals, weather matching the mood, magical sparks, creatures reacting, shadows and light that create drama
- LIGHTING IS MOOD: use warm golden glows for triumph and safety, cool moonlit blues for mystery, sunrise pinks for hope, shafts of magical light to spotlight ${name} as the hero
- FOREGROUND DEPTH: include foreground elements (flowers, rocks, foliage, sparkles) to give the scene 3D depth and draw the child's eye into the picture
- Every image should make a child say "WOW" and want to know what happens next - except page 5 which should make them feel safe and sleepy

Return ONLY valid JSON, no markdown, no explanation:
{
  "title": "A creative, specific story title (not generic)",
  "moral": "The gentle lesson in one sentence",
  "theme_emoji": "One emoji representing the story theme",
  "word_count": estimated_total_word_count_as_number,
  "character_anchor": "Pixar 3D CGI render, subsurface skin scattering, volumetric rim lighting, specular eye highlights, smooth rounded cartoon anatomy, large expressive eyes, vibrant saturated colours, professional Disney Pixar animated feature film quality. ${name}, a ${age}-year-old child with ${skinDesc ?? 'fair/light skin'}, [EXACT HAIR COLOUR AND STYLE], wearing [EXACT OUTFIT: every piece named with specific vivid colours]  -  same character, same face, same exact outfit in every image.",
  "companion_anchor": "[IF story has a recurring creature/animal/friend: describe species+colour+size+1-2 fixed features. If no recurring companion, use empty string \"\"]",
  "pages": [
    {
      "page_number": 1,
      "content": "First short paragraph (1-3 sentences).\n\nSecond short paragraph (1-3 sentences).\n\nThird short paragraph (1-3 sentences if needed).",
      "image_prompt": "[character_anchor copied verbatim] [3-5 sentences that describe THIS PAGE SPECIFICALLY: (1) the exact named location from this page's text e.g. 'a glowing crystal cave with purple stalactites dripping silver light', (2) the specific action the character is doing at this exact story moment e.g. 'leaping across a gap between two floating islands, arms outstretched, hair streaming behind', (3) if a sibling/friend/pet appears on this page: describe them by name with their specific hair colour and outfit colour so they look visually DIFFERENT from ${name} — e.g. 'beside them stands Max, a boy with straight brown hair wearing a green jacket and grey jeans', (4) the emotional expression on the character's face matching this page's mood]. No text, no words, no letters anywhere in the image."
    }
  ]
}`;
}

async function generateImage(prompt: string): Promise<string | null> {
  if (!REPLICATE_API_TOKEN) {
    console.error('REPLICATE_API_TOKEN not set');
    return null;
  }

  console.log('Generating image for prompt:', prompt.slice(0, 80));

  try {
    // Create prediction
    const createRes = await fetch(
      'https://api.replicate.com/v1/models/black-forest-labs/flux-schnell/predictions',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${REPLICATE_API_TOKEN}`,
          'Content-Type': 'application/json',
          Prefer: 'wait=30',
        },
        body: JSON.stringify({
          input: {
            prompt,
            go_fast: true,
            num_outputs: 1,
            aspect_ratio: '4:3',
            output_format: 'webp',
            output_quality: 80,
          },
        }),
      }
    );

    console.log('Replicate HTTP status:', createRes.status);
    const prediction = await createRes.json();
    console.log('Replicate response:', JSON.stringify(prediction).slice(0, 300));

    // If Prefer: wait returned a completed result
    if (prediction.status === 'succeeded' && prediction.output?.[0]) {
      console.log('Image generated (immediate)');
      return prediction.output[0];
    }

    if (prediction.error) {
      console.error('Replicate error:', prediction.error);
      return null;
    }

    console.log('Prediction status:', prediction.status, ' -  polling...');

    // Otherwise poll
    const pollUrl = prediction.urls?.get;
    if (!pollUrl) {
      console.error('No poll URL in response');
      return null;
    }

    for (let i = 0; i < 25; i++) {
      await new Promise((r) => setTimeout(r, 1500));
      const pollRes = await fetch(pollUrl, {
        headers: { Authorization: `Bearer ${REPLICATE_API_TOKEN}` },
      });
      const polled = await pollRes.json();
      console.log(`Poll ${i + 1}: status=${polled.status}`);
      if (polled.status === 'succeeded' && polled.output?.[0]) {
        console.log('Image generated after polling');
        return polled.output[0];
      }
      if (polled.status === 'failed') {
        console.error('Prediction failed:', polled.error);
        break;
      }
    }
  } catch (err) {
    if (err instanceof Response) return err;

    console.error('Image generation error:', err);
  }

  return null;
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient();

    // Verify auth
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { child_id } = await parseBody(request, generateStorySchema);

    // Paywall check
    const paywallResult = await checkGenerationAllowed(supabase, user.id, user.email);
    if (!paywallResult.allowed) {
      return NextResponse.json(
        { error: 'paywall', reason: paywallResult.reason },
        { status: 402 }
      );
    }

    // Fetch child profile
    const { data: child, error: childError } = await supabase
      .from('children')
      .select('*')
      .eq('id', child_id)
      .eq('parent_id', user.id)
      .single();

    if (childError || !child) {
      return NextResponse.json({ error: 'Child not found' }, { status: 404 });
    }

    // Free user per-child gate: each child gets exactly one free story.
    // Once has_used_free_story is true, that child can't generate again until subscribed.
    if (paywallResult.reason === 'free') {
      if (child.has_used_free_story) {
        return NextResponse.json(
          { error: 'paywall', reason: 'free_exhausted' },
          { status: 402 }
        );
      }
    }

    // Per-child daily limit: each child can only receive 1 story per day.
    // Exception: if the parent has purchased extra books today (99c each), those
    // raise the daily ceiling. When an extra book is consumed, decrement the counter.
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
        .eq('child_id', child_id)
        .gte('created_at', todayStart.toISOString());
      if ((storiesForChildToday ?? 0) >= 1) {
        if (extraBooksAvailable <= 0) {
          return NextResponse.json(
            { error: `${child.name} already has a story for today. Each child gets one story per day.` },
            { status: 429 }
          );
        }
        // Using an extra book slot — flag for decrement after generation
        consumedExtraBook = true;
      }
    }

    // --- PRE-GENERATED TRIAL STORY SHORTCUT ---
    // Free users get a static sample story for their FIRST book only — no Claude API call.
    // Books 2 and 3 are AI-generated so each feels unique and personal.
    const { data: subData } = await supabase
      .from('user_subscriptions')
      .select('status, free_stories_remaining')
      .eq('user_id', user.id)
      .single();

    const isFreeUser = !subData || subData.status !== 'subscribed';
    // For cache lookup: use the first interest that matches a trial interest.
    // This ensures a custom interest added first doesn't bypass the cache for free users.
    const allInterests = (child.interests || []) as string[];
    const primaryInterest = allInterests.find(i => isTrialInterest(i)) || allInterests[0] || '';

    // Only serve cached story if this child has no stories yet (first book only)
    const { count: existingStoryCount } = await supabase
      .from('stories')
      .select('id', { count: 'exact', head: true })
      .eq('child_id', child_id);
    const isFirstBook = (existingStoryCount ?? 0) === 0;

    if (isFreeUser && isTrialInterest(primaryInterest) && isFirstBook) {
      const appearance = (child.appearance || {}) as Record<string, string>;
      const siblings = Array.isArray(appearance.siblings) ? appearance.siblings : [];
      const friends = Array.isArray(appearance.friends) ? appearance.friends : [];
      const sampleStory = getSampleStory(allInterests, {
        name: child.name,
        age: child.age,
        gender: child.gender,
        hairColour: appearance.hairColour,
        eyeColour: appearance.eyeColour,
        skinColour: appearance.skinColour,
        siblings,
        friends,
      }, child.reading_level);
      if (sampleStory) {
        const pagesForDB = sampleStory.pages.map((page) => ({
          ...page,
          image_url: null,
          poll_url: null,
        }));
        const fullContent = pagesForDB.map((p) => p.content).join('\n\n');
        const { data: story, error: storyError } = await supabase
          .from('stories')
          .insert({
            child_id,
            parent_id: user.id,
            title: sampleStory.title,
            content: fullContent,
            moral: sampleStory.moral,
            theme: sampleStory.theme_emoji,
            word_count: sampleStory.word_count,
            reading_time_minutes: Math.ceil((sampleStory.word_count || 400) / 150),
            pages: pagesForDB,
            input_tokens: 0,
            output_tokens: 0,
            character_anchor: sampleStory.character_anchor,
            is_sample: true,
          })
          .select()
          .single();
        if (storyError) {
          console.error('Sample story save error:', storyError);
          return NextResponse.json({ error: 'Failed to save story' }, { status: 500 });
        }
        await decrementStoryCount(supabase, user.id, paywallResult.reason, child_id);
        if (consumedExtraBook) {
          const { data: sr } = await supabase.from('user_subscriptions').select('extra_books_today').eq('user_id', user.id).single();
          await supabase.from('user_subscriptions').update({ extra_books_today: Math.max(0, (sr?.extra_books_today ?? 1) - 1) }).eq('user_id', user.id);
        }
        return NextResponse.json({ story });
      }
    }
    // --- END PRE-GEN SHORTCUT ---

    // Fetch this child's previous story titles so Claude can avoid repeating them
    const { data: prevStories } = await supabase
      .from('stories')
      .select('title')
      .eq('child_id', child_id)
      .order('created_at', { ascending: false })
      .limit(10);
    const previousTitles = (prevStories || []).map((s: { title: string }) => s.title).filter(Boolean);

    // Build the prompt here (in Next.js where the helper lives)
    const prompt = buildPrompt({
      name: child.name,
      age: child.age,
      gender: child.gender || 'child',
      interests: child.interests || [],
      appearance: child.appearance || {},
      reading_level: child.reading_level || 'intermediate',
    }, previousTitles);

    // Hand off to the Supabase Edge Function which calls Claude Sonnet with no timeout.
    // The edge function inserts a placeholder story, responds immediately with story_id,
    // then generates the full story + images in the background via EdgeRuntime.waitUntil.
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
          child_id,
          parent_id: user.id,
          anthropic_api_key: process.env.ANTHROPIC_API_KEY,
          replicate_token: REPLICATE_API_TOKEN,
          child_appearance: child.appearance || {},
        }),
      }
    );

    if (!edgeRes.ok) {
      const errText = await edgeRes.text();
      console.error('[generate-story] Edge function error:', errText);
      return NextResponse.json({ error: 'Story generation failed' }, { status: 500 });
    }

    const { story_id } = await edgeRes.json();
    if (!story_id) {
      return NextResponse.json({ error: 'Story generation failed — no story ID returned' }, { status: 500 });
    }

    // Decrement story quota now that story record is confirmed created
    await decrementStoryCount(supabase, user.id, paywallResult.reason, child_id);
    if (consumedExtraBook) {
      const { data: sr } = await supabase.from('user_subscriptions').select('extra_books_today').eq('user_id', user.id).single();
      await supabase.from('user_subscriptions').update({ extra_books_today: Math.max(0, (sr?.extra_books_today ?? 1) - 1) }).eq('user_id', user.id);
    }

    // Return minimal story object — client navigates to /stories/{id} and polls for content
    return NextResponse.json({
      story: {
        id: story_id,
        title: 'Writing your story…',
        pages: [],
        children: { name: child.name, age: child.age },
      },
    });
  } catch (error) {
    if (error instanceof Response) return error;

    console.error('Story generation error:', error);
    return NextResponse.json({ error: 'Story generation failed' }, { status: 500 });
  }
}







