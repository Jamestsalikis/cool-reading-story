import { NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { createClient } from '@/lib/supabase/server';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// Generation limits per subscription tier
const TIER_LIMITS: Record<string, number> = {
  free: 1,       // 1 story ever (trial)
  trialing: 1,   // 1 story during trial
  digital: 4,    // 4/month
  heirloom: 999, // unlimited
};

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

  return `You are a master children's story writer creating a personalised bedtime story.

Child profile:
- Name: ${name}
- Age: ${age}
- Gender: ${gender} (use pronouns: ${pronouns.they}/${pronouns.them}/${pronouns.their})
- Interests: ${interests.join(', ')}
${appearanceDesc ? `- Appearance: ${appearanceDesc}` : ''}
${petDesc ? `- Pet: ${petDesc}` : ''}
${siblingDesc ? `- Siblings: ${siblingDesc}` : ''}
- Reading level: ${reading_level} → target ${wordTarget} words

Requirements:
1. ${name} is the hero — describe ${pronouns.them} with their actual appearance
2. Weave their interests naturally into the plot — they drive the adventure
3. Include their pet or siblings if provided — give them real roles
4. Include a warm, gentle moral lesson that emerges naturally from the story
5. End on a cosy, bedtime-appropriate note — winding down, not exciting
6. Use language appropriate for age ${age}: ${reading_level === 'beginner' ? 'short sentences, simple words, lots of repetition' : reading_level === 'intermediate' ? 'flowing sentences, rich descriptions, some new vocabulary' : 'complex narrative, vivid imagery, sophisticated vocabulary'}
7. Make it feel uniquely written FOR ${name} — not a generic story with a name swapped in

Return ONLY valid JSON, no markdown, no explanation:
{
  "title": "A creative, specific story title (not generic)",
  "content": "The full story — paragraphs separated by \\n\\n",
  "moral": "The gentle lesson in one sentence",
  "theme_emoji": "One emoji representing the story theme",
  "word_count": estimated_word_count_as_number
}`;
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

    // Generate story via Claude Sonnet (cost-efficient, high quality)
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
      max_tokens: 2048,
      messages: [{ role: 'user', content: prompt }],
    });

    const rawContent = message.content[0].type === 'text' ? message.content[0].text : '';

    // Parse JSON response
    let storyData: {
      title: string;
      content: string;
      moral: string;
      theme_emoji: string;
      word_count: number;
    };

    try {
      const cleaned = rawContent.replace(/^```json\n?/, '').replace(/\n?```$/, '').trim();
      storyData = JSON.parse(cleaned);
    } catch {
      return NextResponse.json({ error: 'Failed to parse story from AI' }, { status: 500 });
    }

    // Save story to DB
    const { data: story, error: storyError } = await supabase
      .from('stories')
      .insert({
        child_id,
        parent_id: user.id,
        title: storyData.title,
        content: storyData.content,
        moral: storyData.moral,
        theme: storyData.theme_emoji,
        word_count: storyData.word_count,
        reading_time_minutes: Math.ceil((storyData.word_count || 500) / 150),
      })
      .select()
      .single();

    if (storyError) {
      return NextResponse.json({ error: 'Failed to save story' }, { status: 500 });
    }

    return NextResponse.json({ story });
  } catch (error) {
    console.error('Story generation error:', error);
    return NextResponse.json({ error: 'Story generation failed' }, { status: 500 });
  }
}
