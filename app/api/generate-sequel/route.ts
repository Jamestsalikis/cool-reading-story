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

    if (volumeNumber > 4) {
      return NextResponse.json({ error: 'Series is complete (max 4 volumes)' }, { status: 400 });
    }

    const isFinalVolume = volumeNumber === 4;

    // Get series_id — create one if this is the first sequel
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
      .slice(0, 1500); // Keep prompt lean — first 1500 chars of previous story

    const appearance = child.appearance || {};
    const appearanceDesc = [
      appearance.hairColour ? `${appearance.hairColour} hair` : null,
      appearance.eyeColour ? `${appearance.eyeColour} eyes` : null,
    ].filter(Boolean).join(', ');

    const prompt = `You are a master children's story writer. You are writing Volume ${volumeNumber} of a personalised bedtime picture book series.

MANDATORY SAFETY RULES — these override everything else:
- Never generate sexual, romantic, adult, or suggestive content of any kind
- Never generate violence, gore, horror, or frightening content
- Never generate abusive, bullying, discriminatory, or hateful content
- The story must be 100% wholesome, safe, and appropriate for children aged 3-12

TALEPOP BRAND VOICE & WRITING STYLE:
This story will be typeset in two fonts that define the TalePop aesthetic — write to match their personalities:

TITLES (Bambino font — playful, friendly, hand-drawn, full of character):
- Punchy and specific: capture the exact adventure in 3-6 memorable words
- Warm and exciting — a child should want to read it the moment they see it
- Think hand-lettered, bouncy, joyful — never dry or generic

STORY PROSE (Nunito font — clean, rounded, easy to read, perfect for bedtime):
- Smooth natural rhythm that flows beautifully when read aloud
- Rounded, warm sentences — never stiff, formal, or clunky
- Short-to-medium sentences that breathe; commas for gentle pauses
- Clean and uncluttered — vivid but not overwrought

OVERALL VOICE:
- Warm, encouraging, full of wonder — every sentence should feel like a hug
- Speak to children with joy and delight; speak to the adventure with excitement
- Celebrate imagination, curiosity, and confidence — the child is capable and brave
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
1. This is a DIRECT continuation of the previous story — pick up where it left off or begin the next adventure the same characters would naturally go on
2. Reference events, characters, or objects from the previous story naturally
3. ${child.name} is still the hero with the same appearance and personality
4. ${isFinalVolume ? 'This is the FINAL volume of the series — bring the overall adventure to a satisfying, complete conclusion. Give the series a proper ending with a meaningful resolution.' : 'Leave a natural story hook at the end that sets up one more adventure.'}
5. Include a warm, gentle moral lesson appropriate to this chapter
6. End on a cosy, bedtime-appropriate note
7. Use language appropriate for age ${child.age}: ${child.reading_level === 'beginner' ? 'short sentences, simple words' : child.reading_level === 'intermediate' ? 'flowing sentences, rich descriptions' : 'complex narrative, vivid imagery'}
8. Split into exactly 5 pages, 2-4 paragraphs each
9. For each page, write an image prompt. Copy the CHARACTER ANCHOR below word-for-word at the start, then write a vivid, cinematic scene description (see IMAGE PROMPT RULES below).

CHARACTER ANCHOR (copy verbatim at the start of every image prompt):
"Premium illustrated children's picture book art, warm painterly style, bold ink outlines, expressive cartoon character with large bright eyes, jewel-tone palette of midnight navy and ocean teal and sunshine yellow and tangerine orange, magical golden atmospheric lighting, dreamy enchanted background. Main character: ${child.name}, a ${child.age}-year-old ${child.gender === 'Boy' ? 'boy' : child.gender === 'Girl' ? 'girl' : 'child'}${appearanceDesc ? ` with ${appearanceDesc}` : ''}, wearing ${child.gender === 'Girl' ? 'a bright colourful dress' : 'a blue t-shirt and dark jeans'}, same face and outfit in every scene, consistent cartoon character design."

IMAGE PROMPT RULES — apply to every page:
- Capture the EMOTIONAL PEAK of that page — the most exciting or heartfelt moment, not a neutral in-between
- Show STRONG EMOTION on the character's face: wide eyes of wonder, beaming smile of triumph, raised eyebrows of surprise, focused determined gaze
- Use DYNAMIC COMPOSITION — avoid static standing poses; show the character mid-action: leaping, reaching, pointing, spinning, crouching toward something magical
- Vary composition across the 5 pages:
  • Page 1 — Wide establishing shot: full world visible, ${child.name} small within a large magical environment
  • Page 2 — Discovery / reaction shot: face close or mid-shot, expressing the moment of surprise or excitement
  • Page 3 — Action shot: most dynamic moment — movement, energy, diagonal lines, flying objects
  • Page 4 — Dramatic / emotional peak: highest-stakes moment; strong lighting contrast, foreground detail, depth
  • Page 5 — Warm resolution: cosy and intimate, soft golden light, ${child.name} at peace — feels like a hug
- ENVIRONMENTAL STORYTELLING: the background must actively tell the story — glowing portals, weather matching the mood, magical sparks, creatures reacting, dramatic shadows and light
- LIGHTING IS MOOD: warm golden glows for triumph, cool moonlit blues for mystery, sunrise pinks for hope, shafts of magical light spotlighting ${child.name} as the hero
- FOREGROUND DEPTH: include foreground elements (flowers, rocks, sparkles, foliage) to create 3D depth and draw the eye in
- Every page 1–4 image should make a child say "WOW" and want to turn the page; page 5 should feel safe and sleepy

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
      "content": "Page text — 2-4 paragraphs",
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
    const outputTokens = message.usag