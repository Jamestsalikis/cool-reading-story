import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// Creates ALL page predictions in a single function call — avoids 5 concurrent
// Vercel function invocations which cause burst 500s.
// Returns an array of { page_number, poll_url } for the frontend to poll.
export const maxDuration = 30;

const REPLICATE_API_TOKEN = process.env.REPLICATE_API_TOKEN;

async function createPrediction(prompt: string): Promise<{ id: string; poll_url: string } | null> {
  const res = await fetch(
    'https://api.replicate.com/v1/models/black-forest-labs/flux-schnell/predictions',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${REPLICATE_API_TOKEN}`,
        'Content-Type': 'application/json',
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

  if (!res.ok) {
    const text = await res.text();
    console.error('Replicate create failed:', res.status, text.slice(0, 200));
    return null;
  }

  const prediction = await res.json();
  if (prediction.error || !prediction.urls?.get) {
    console.error('Bad prediction response:', JSON.stringify(prediction).slice(0, 200));
    return null;
  }

  return { id: prediction.id, poll_url: prediction.urls.get };
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    if (!REPLICATE_API_TOKEN) {
      return NextResponse.json({ error: 'Replicate not configured' }, { status: 500 });
    }

    const { story_id } = await request.json();
    if (!story_id) return NextResponse.json({ error: 'story_id required' }, { status: 400 });

    const { data: story } = await supabase
      .from('stories')
      .select('pages')
      .eq('id', story_id)
      .eq('parent_id', user.id)
      .single();

    if (!story) return NextResponse.json({ error: 'Story not found' }, { status: 404 });

    const pages = story.pages || [];
    const pagesNeedingImages = pages.filter(
      (p: { image_prompt?: string; image_url?: string }) => p.image_prompt && !p.image_url
    );

    if (pagesNeedingImages.length === 0) {
      return NextResponse.json({ predictions: [] });
    }

    // Create all predictions in parallel — each Replicate call takes ~300-500ms,
    // so 5 in parallel = ~500ms total, well within any timeout limit.
    const results = await Promise.all(
      pagesNeedingImages.map(async (page) => {
        const result = await createPrediction(page.image_prompt);
        if (!result) console.error(`Failed prediction for page ${page.page_number}`);
        return result ? { page_number: page.page_number, poll_url: result.poll_url } : null;
      })
    );

    const predictions = results.filter(Boolean) as { page_number: number; poll_url: string }[];

    return NextResponse.json({ predictions });

  } catch (err) {
    console.error('start-images error:', err);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
