import { NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { createClient } from '@/lib/supabase/server';
import { checkGenerationAllowed, decrementStoryCount } from '@/lib/subscription';

export const maxDuration = 60;

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { story_id } = await request.json();
    if (!story_id) return NextResponse.json({ error: 'story_id required' }, { status: 400 });

    // Paywall check
    const paywallResult = await checkGenerationAllowed(supabase, user.id, user.email);
    if (!paywallResult.allowed) {
      return NextResponse.json({ error: 'paywall', reason: paywallResult.reason }, { status: 402 });
    }

    // Fetch the source story + child profile
    const { data: sourceStory } = await supabase
      .from('stories')
      .select('*, children(*)')
      .eq('id', story_id)
      .eq('parent_id', user.id)
      .single();

    if (!sourceStory) return NextResponse.json({ error: 'Story not found' }, { status: 404 });

    const child = sourceStory.children;
    const volumeNumber = (sourceStory.volume_number ?? 1) + 1;

    // Per-child daily limit: each child can only receive 1 story per day.
    // Exception: if extra books have been purchased today, bypass the per-child limit
    // (extra books raise the account ceiling and can be used for any child).
    if (paywallResult.reason === 'subscribed') {
      const { data: subRecord } = await supabase
        .from('user_subscriptions')
        .select('extra_books_today')
        .eq('user_id', user.id)
        .single();
      const hasExtraBooks = (subRecord?.extra_books_today ?? 0) > 0;
      if (!hasExtraBooks) {
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);
        const { count: storiesForChildToday } = await supabase
          .from('stories')
          .select('id', { count: 'exact', head: true })
          .eq('child_id', child.id)
          .gte('created_at', todayStart.toISOString());
        if ((storiesForChildToday ?? 0) >= 1) {
          return NextResponse.json(
            { error: `${child.name} already has a story for today. Each child gets one story per day.` },
            { status: 429 }
          );
        }
      }
    }

    if (volumeNumber > 4) {
      return NextResponse.json({ error: 'Series is complete (max 4 volumes)' }, { status: 400 });
    }

    const isFinalVolume = volumeNumber === 4;

    // Get series_id  -  create one if this is the first sequel
    const seriesId = sourceStory.series_id ?? sourceStory.id;
    const seriesTitle = sourceStory.series_title ?? sourceStory.title;

    const pronouns = child.gender === 'Girl'
      ? { they: 'she', them: 'her', their: 'her' }
      : child.gender === 'Boy'
      ? { they: 'he', them: 'him', their: 'his' }
      : { they: 'they', them: 'them', their: 'their' };

    const wordTarget = child.reading_level === 'beginner' ? 400
      : child.reading_level === 'intermediate' ? 700 : 1000;

    const previousSummary = sourceStory.pages
      ?.map((p: { content: string }) => p.content)
      .join('\n\n')
      .slice(0, 1500); // Keep prompt lean  -  first 1500 chars of previous story

    const appearance = child.appearance || {};
    const appearanceDesc = [
      appearance.hairColour ? `${appearance.hairColour} hair` : null,
      appearance.eyeColour ? `${appearance.eyeColour} eyes` : null,
    ].filter(Boolean).join(', ');

    const prompt = `You are a master children's story writer. You are writing Volume ${volumeNumber} of a personalised bedtime picture book series.

MANDATORY SAFETY RULES  -  these override everything else:
- Never generate sexual, romantic, adult, or suggestive content of any kind
- Never generate violence, gore, horror, or frightening content
- Never generate abusive, bullying, discriminatory, or hateful content
- The story must be 100% wholesome, safe, and appropriate for children aged 3-12
- NEVER use em dashes in any text output, story content, titles, or prompts. Use commas, full stops, or rewrite the sentence instead

TALEPOP BRAND VOICE & WRITING STYLE:
- Warm, encouraging, and full of wonder  -  every sentence should feel like a hug
- Speak to children with joy and delight; speak to the adventure with excitement
- Celebrate imagination, curiosity, and confidence  -  the child is capable and brave
- Titles: bold, exciting, and specific to the adventure (rendered in a large playful heading font  -  make them pop)
- Story prose: smooth, flowing, natural rhythm  -  reads beautifully aloud at bedtime
- Use vivid sensory details: colours, sounds, smells, textures that bring the world to life
- Avoid passive voice; keep the child actively doing, discovering, and choosing

Child profile:
- Name: ${child.name}
- Age: ${child.age}
- Gender: ${child.gender} (use pronouns: ${pronouns.they}/${pronouns.them}/${pronouns.their})
- Interests: ${(child.interests || []).join(', ')}
${appearanceDesc ? `- Appearance: ${appearanceDesc}` : ''}
${appearance.city || appearance.country ? `- Lives in: ${[appearance.city, appearance.country].filter(Boolean).join(', ')}` : ''}

Previous story summary (Volume ${volumeNumber - 1}):
"""
${previousSummary}
"""

Requirements:
1. This is a DIRECT continuation of the previous story  -  pick up where it left off or begin the next adventure the same characters would naturally go on
2. Reference events, characters, or objects from the previous story naturally
3. ${child.name} is still the hero with the same appearance and personality
4. ${isFinalVolume ? 'This is the FINAL volume of the series  -  bring the overall adventure to a satisfying, complete conclusion. Give the series a proper ending with a meaningful resolution.' : 'Leave a natural story hook at the end that sets up one more adventure.'}
5. Include a warm, gentle moral lesson appropriate to this chapter
6. ${isFinalVolume ? 'End with a warm, complete, satisfying conclusion  -  this is the final book in the series. Resolve the adventure fully. Give the characters and the child reader a proper farewell and a sense of wholeness. End on a cosy, peaceful bedtime note with no unresolved threads. No cliffhanger.' : 'End with a warm goodnight or goodbye that settles the child toward sleep  -  but weave in a single cliffhanger seed on the final page. Choose whichever style fits the story\'s plot and the child\'s interests most naturally:\n   - DISCOVERY: the hero notices something mysterious just as their eyes grow heavy (a glowing door, an unrecognised star, a sealed note slipped under the mat)\n   - VISITOR: a gentle knock, a shadow, or a distant voice calls from somewhere unknown  -  just as the story closes, before it is answered\n   - OBJECT: a character quietly passes the hero something (a torn map, a magical item, a tiny key) and whispers they will need it for what is coming, then the hero drifts off holding it\n   - NARRATOR TEASE: after the goodnight, the narrator speaks one warm line directly to the child: \"But little did [name] know... tomorrow would bring the biggest adventure yet.\"\n   The cliffhanger must feel like a natural part of the story, not bolted on at the end. Keep it gentle  -  curious and exciting, not scary. The page 5 image stays warm and sleepy; the hook lives in the words only.'}
7. Use language appropriate for age ${child.age}: ${child.reading_level === 'beginner' ? 'short sentences, simple words' : child.reading_level === 'intermediate' ? 'flowing sentences, rich descriptions' : 'complex narrative, vivid imagery'}
8. Split into exactly 5 pages, 2-4 paragraphs each
9. For each page, write an image prompt. Copy the CHARACTER ANCHOR below word-for-word at the start, then describe only the scene action.

CHARACTER ANCHOR (copy verbatim at the start of every image prompt):
"Premium illustrated children's picture book art, warm painterly style, bold ink outlines, expressive cartoon character with large bright eyes, jewel-tone palette of midnight navy and ocean teal and sunshine yellow and tangerine orange, magical golden atmospheric lighting, dreamy enchanted background. Main character: ${child.name}, a ${child.age}-year-old ${child.gender === 'Boy' ? 'boy' : child.gender === 'Girl' ? 'girl' : 'child'}${appearanceDesc ? ` with ${appearanceDesc}` : ''}, wearing ${child.gender === 'Girl' ? 'a bright colourful dress' : 'a blue t-shirt and dark jeans'}, same face and outfit in every scene, consistent cartoon character design."

Then in 1-2 sentences describe only the scene action (what is happening, where, with whom).

CRITICAL RULE: End every image prompt with exactly this phrase: "No text, no words, no letters anywhere in the image."

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
      "content": "Page text  -  2-4 paragraphs",
      "image_prompt": "Premium illustrated children's picture book art, warm painterly style, bold ink outlines, expressive cartoon character with large bright eyes, jewel-tone palette of midnight navy and ocean teal and sunshine yellow and tangerine orange, magical golden atmospheric lighting, dreamy enchanted background. Main character: [name], a [age]-year-old [boy/girl] with [appearance], wearing [outfit], same face and outfit in every scene, consistent cartoon character design. [Scene action]. No text, no words, no letters anywhere in the image."
    }
  ]
}`;

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 4096,
      messages: [{ role: 'user', content: prompt }],
    });

    const inputTokens = message.usage.input_tokens;
    const outputTokens = message.usage.output_tokens;
    console.log(`Sequel tokens  -  input: ${inputTokens}, output: ${outputTokens}`);

    const rawContent = message.content[0].type === 'text' ? message.content[0].text : '';
    let storyData: {
      title: string; moral: string; theme_emoji: string; word_count: number;
      pages: { page_number: number; content: string; image_prompt: string }[];
    };

    try {
      const cleaned = rawContent.replace(/^```json\n?/, '').replace(/\n?```$/, '').trim();
      storyData = JSON.parse(cleaned);
    } catch {
      return NextResponse.json({ error: 'Failed to parse story from AI' }, { status: 500 });
    }

    const pagesForDB = storyData.pages.map((page) => ({ ...page, image_url: null, poll_url: null }));
    const fullContent = pagesForDB.map((p) => p.content).join('\n\n');

    // Update source story's series_id if this is the first sequel
    if (!sourceStory.series_id) {
      await supabase.from('stories').update({ series_id: seriesId, series_title: seriesTitle, volume_number: 1 }).eq('id', story_id);
    }

    const { data: newStory, error: storyError } = await supabase
      .from('stories')
      .insert({
        child_id: child.id,
        parent_id: user.id,
        title: storyData.title,
        content: fullContent,
        moral: storyData.moral,
        theme: storyData.theme_emoji,
        word_count: storyData.word_count,
        reading_time_minutes: Math.ceil((storyData.word_count || 500) / 150),
        pages: pagesForDB,
        series_id: seriesId,
        series_title: seriesTitle,
        volume_number: volumeNumber,
        input_tokens: inputTokens,
        output_tokens: outputTokens,
      })
      .select()
      .single();

    if (storyError) {
      console.error('Sequel save error:', storyError);
      return NextResponse.json({ error: 'Failed to save story' }, { status: 500 });
    }

    await decrementStoryCount(supabase, user.id, paywallResult.reason);

    return NextResponse.json({ story: newStory });
  } catch (error) {
    console.error('Sequel generation error:', error);
    return NextResponse.json({ error: 'Sequel generation failed' }, { status: 500 });
  }
}
