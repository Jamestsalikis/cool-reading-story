import { NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { createClient } from '@/lib/supabase/server';
import { checkGenerationAllowed, decrementStoryCount } from '@/lib/subscription';
import { getSampleStory, isTrialInterest } from '@/lib/sample-stories/index';

// Extend Vercel function timeout to 60s (Pro plan) to allow time for image generation
export const maxDuration = 60;

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const REPLICATE_API_TOKEN = process.env.REPLICATE_API_TOKEN;

function buildPrompt(child: {
  name: string;
  age: number;
  gender: string;
  interests: string[];
  appearance: Record<string, unknown>;
  reading_level: string;
}) {
  const { name, age, gender, interests, appearance, reading_level } = child;

  const pronouns =
    gender === 'Girl'
      ? { they: 'she', them: 'her', their: 'her' }
      : gender === 'Boy'
      ? { they: 'he', them: 'him', their: 'his' }
      : { they: 'they', them: 'them', their: 'their' };

  const wordTarget =
    reading_level === 'beginner' ? 400 : reading_level === 'intermediate' ? 700 : 1000;

  const appearanceDesc = [
    appearance.hairColour ? `${appearance.hairColour} hair` : null,
    appearance.eyeColour ? `${appearance.eyeColour} eyes` : null,
  ]
    .filter(Boolean)
    .join(', ');

  const petDesc =
    appearance.petName && appearance.petType
      ? `${name}'s beloved pet ${appearance.petType} named ${appearance.petName}`
      : null;

  const siblings: { name: string; nickname: string }[] = Array.isArray(appearance.siblings) ? appearance.siblings : [];
  const siblingDesc = siblings.length > 0
    ? siblings.map(s => s.nickname ? `${s.name} (nickname: ${s.nickname})` : s.name).join(', ')
    : null;

  const friends: { name: string; nickname: string }[] = Array.isArray(appearance.friends) ? appearance.friends : [];
  const bestFriendDesc = friends.length > 0
    ? friends.map(f => f.nickname ? `${f.name} (nickname: ${f.nickname})` : f.name).join(', ')
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

Requirements:
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
10. Before writing page prompts, define a CHARACTER ANCHOR. Begin with this EXACT style prefix (copy it word for word): "Premium illustrated children's picture book art, warm painterly style, bold ink outlines, expressive cartoon character with large bright eyes, jewel-tone palette of midnight navy and ocean teal and sunshine yellow and tangerine orange, magical golden atmospheric lighting, dreamy enchanted background."  -  then describe: ${name}'s specific hair style and colour, eye colour, and a specific named outfit (e.g. "a red polka-dot dress and white sandals" or "a yellow striped hoodie and blue jeans and white sneakers"). Choose an outfit that fits ${name}'s personality and interests. This full anchor must be copied verbatim into every image prompt.

CRITICAL IMAGE PROMPT RULES:

CONSISTENCY (non-negotiable):
- Start EVERY image_prompt with the character_anchor string  -  word for word, no changes
- The character must look identical in all 5 images: same face, same age (${age}), same exact outfit  -  never taller, never older
- End every image prompt with: "No text, no words, no letters anywhere in the image."

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
  "character_anchor": "Premium illustrated children's picture book art, warm painterly style, bold ink outlines, expressive cartoon character with large bright eyes, jewel-tone palette of midnight navy and ocean teal and sunshine yellow and tangerine orange, magical golden atmospheric lighting, dreamy enchanted background. [NAME], a [AGE]-year-old [GENDER] child with [HAIR DESCRIPTION], wearing [SPECIFIC OUTFIT]  -  same child, same face, same exact outfit in every image.",
  "pages": [
    {
      "page_number": 1,
      "content": "Page text here  -  2-4 paragraphs",
      "image_prompt": "[character_anchor copied verbatim] [1-2 sentences of scene action]. No text, no words, no letters anywhere in the image."
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

    const body = await request.json();
    const { child_id } = body;

    if (!child_id) {
      return NextResponse.json({ error: 'child_id required' }, { status: 400 });
    }

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

    // Per-child daily limit: each child can only receive 1 story per day.
    // This prevents a parent from using additional-child credits to generate
    // multiple stories for the same child.
    if (paywallResult.reason === 'subscribed') {
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);
      const { count: storiesForChildToday } = await supabase
        .from('stories')
        .select('id', { count: 'exact', head: true })
        .eq('child_id', child_id)
        .gte('created_at', todayStart.toISOString());
      if ((storiesForChildToday ?? 0) >= 1) {
        return NextResponse.json(
          { error: `${child.name} already has a story for today. Each child gets one story per day.` },
          { status: 429 }
        );
      }
    }

    // --- PRE-GENERATED TRIAL STORY SHORTCUT ---
    // Free users get a static sample story for trial interests  -  no Claude API call.
    const { data: subData } = await supabase
      .from('user_subscriptions')
      .select('status, free_stories_remaining')
      .eq('user_id', user.id)
      .single();

    const isFreeUser = !subData || subData.status !== 'subscribed';
    const primaryInterest = (child.interests || [])[0] || '';

    if (isFreeUser && isTrialInterest(primaryInterest)) {
      const sampleStory = getSampleStory(primaryInterest, child.name);
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
        await decrementStoryCount(supabase, user.id, paywallResult.reason);
        return NextResponse.json({ story });
      }
    }
    // --- END PRE-GEN SHORTCUT ---

    // Generate story + page breakdown via Claude
    const prompt = buildPrompt({
      name: child.name,
      age: child.age,
      gender: child.gender || 'child',
      interests: child.interests || [],
      appearance: child.appearance || {},
      reading_level: child.reading_level || 'intermediate',
    });

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 4096,
      messages: [{ role: 'user', content: prompt }],
    });

    // Capture real token usage from the API response
    const inputTokens  = message.usage.input_tokens;
    const outputTokens = message.usage.output_tokens;
    console.log(`Token usage  -  input: ${inputTokens}, output: ${outputTokens}, total: ${inputTokens + outputTokens}`);

    const rawContent = message.content[0].type === 'text' ? message.content[0].text : '';

    // Parse JSON response
    let storyData: {
      title: string;
      moral: string;
      theme_emoji: string;
      word_count: number;
      character_anchor?: string;
      pages: { page_number: number; content: string; image_prompt: string }[];
    };

    try {
      const cleaned = rawContent.replace(/^```json\n?/, '').replace(/\n?```$/, '').trim();
      storyData = JSON.parse(cleaned);
    } catch {
      return NextResponse.json({ error: 'Failed to parse story from AI' }, { status: 500 });
    }

    // Save story immediately  -  image generation is handled separately by
    // /api/generate-all-images (sequential, Replicate-rate-limit-safe).
    // No Replicate calls here to avoid competing with that endpoint.
    const pagesForDB = storyData.pages.map((page) => ({
      ...page,
      image_url: null,
      poll_url: null,
    }));

    // Combine content for full story text
    const fullContent = pagesForDB.map((p) => p.content).join('\n\n');

    // Save story to DB including real token counts
    const { data: story, error: storyError } = await supabase
      .from('stories')
      .insert({
        child_id,
        parent_id: user.id,
        title: storyData.title,
        content: fullContent,
        moral: storyData.moral,
        theme: storyData.theme_emoji,
        word_count: storyData.word_count,
        reading_time_minutes: Math.ceil((storyData.word_count || 500) / 150),
        pages: pagesForDB,
        input_tokens: inputTokens,
        output_tokens: outputTokens,
        character_anchor: storyData.character_anchor || null,
      })
      .select()
      .single();

    if (storyError) {
      console.error('Story save error:', storyError);
      return NextResponse.json({ error: 'Failed to save story' }, { status: 500 });
    }

    // Decrement story count now that story is confirmed saved
    await decrementStoryCount(supabase, user.id, paywallResult.reason);

    return NextResponse.json({ story });
  } catch (error) {
    console.error('Story generation error:', error);
    return NextResponse.json({ error: 'Story generation failed' }, { status: 500 });
  }
}
