import { NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { createClient } from '@/lib/supabase/server';

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
  appearance: Record<string, string>;
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

  const siblingDesc = appearance.siblingNames
    ? `siblings named ${appearance.siblingNames}`
    : null;

  return `You are a master children's story writer creating a personalised bedtime picture book.

Child profile:
- Name: ${name}
- Age: ${age}
- Gender: ${gender} (use pronouns: ${pronouns.they}/${pronouns.them}/${pronouns.their})
- Interests: ${interests.join(', ')}
${appearanceDesc ? `- Appearance: ${appearanceDesc}` : ''}
${petDesc ? `- Pet: ${petDesc}` : ''}
${siblingDesc ? `- Siblings: ${siblingDesc}` : ''}
- Reading level: ${reading_level} → target ${wordTarget} words total

Requirements:
1. ${name} is the hero — describe ${pronouns.them} with their actual appearance
2. Weave their interests naturally into the plot — they drive the adventure
3. Include their pet or siblings if provided — give them real roles
4. Include a warm, gentle moral lesson that emerges naturally from the story
5. End on a cosy, bedtime-appropriate note — winding down, not exciting
6. Use language appropriate for age ${age}: ${reading_level === 'beginner' ? 'short sentences, simple words, lots of repetition' : reading_level === 'intermediate' ? 'flowing sentences, rich descriptions, some new vocabulary' : 'complex narrative, vivid imagery, sophisticated vocabulary'}
7. Make it feel uniquely written FOR ${name} — not a generic story with a name swapped in
8. Split the story into exactly 5 pages. Each page should have 2-4 paragraphs of text.
9. For each page, write a short image prompt (1-2 sentences) describing a scene to illustrate it — children's picture book watercolor style, warm and cosy, featuring ${name}${appearanceDesc ? ` with ${appearanceDesc}` : ''}.

Return ONLY valid JSON, no markdown, no explanation:
{
  "title": "A creative, specific story title (not generic)",
  "moral": "The gentle lesson in one sentence",
  "theme_emoji": "One emoji representing the story theme",
  "word_count": estimated_total_word_count_as_number,
  "pages": [
    {
      "page_number": 1,
      "content": "Page text here — 2-4 paragraphs",
      "image_prompt": "Children's watercolor picture book illustration, [specific scene description], warm soft colors, cosy and magical, no text"
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

    console.log('Prediction status:', prediction.status, '— polling...');

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

    // TODO: Re-enable generation limits before go-live
    // Limits temporarily disabled during development/testing

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
    console.log(`Token usage — input: ${inputTokens}, output: ${outputTokens}, total: ${inputTokens + outputTokens}`);

    const rawContent = message.content[0].type === 'text' ? message.content[0].text : '';

    // Parse JSON response
    let storyData: {
      title: string;
      moral: string;
      theme_emoji: string;
      word_count: number;
      pages: { page_number: number; content: string; image_prompt: string }[];
    };

    try {
      const cleaned = rawContent.replace(/^```json\n?/, '').replace(/\n?```$/, '').trim();
      storyData = JSON.parse(cleaned);
    } catch {
      return NextResponse.json({ error: 'Failed to parse story from AI' }, { status: 500 });
    }

    // Save story immediately — image generation is handled separately by
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
      })
      .select()
      .single();

    if (storyError) {
      console.error('Story save error:', storyError);
      return NextResponse.json({ error: 'Failed to save story' }, { status: 500 });
    }

    return NextResponse.json({ story });
  } catch (error) {
    console.error('Story generation error:', error);
    return NextResponse.json({ error: 'Story generation failed' }, { status: 500 });
  }
}
