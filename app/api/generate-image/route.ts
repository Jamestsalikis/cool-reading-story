import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// Starts a Replicate prediction and returns immediately.
// If Replicate finishes within 8s (fast path), saves to DB and returns image_url.
// Otherwise returns { status: 'processing', prediction_id, poll_url } for the
// frontend to poll via /api/poll-image — keeps this function well under Vercel's limit.
export const maxDuration = 30;

const REPLICATE_API_TOKEN = process.env.REPLICATE_API_TOKEN;

export async function POST(request: Request) {
  try {
    const supabase = await createClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { story_id, page_number } = await request.json();
    if (!story_id || page_number == null) {
      return NextResponse.json({ error: 'story_id and page_number required' }, { status: 400 });
    }

    if (!REPLICATE_API_TOKEN) {
      return NextResponse.json({ error: 'Replicate not configured' }, { status: 500 });
    }

    const { data: story } = await supabase
      .from('stories')
      .select('pages')
      .eq('id', story_id)
      .eq('parent_id', user.id)
      .single();

    if (!story) return NextResponse.json({ error: 'Story not found' }, { status: 404 });

    const pages = story.pages || [];
    const pageIndex = pages.findIndex((p: { page_number: number }) => p.page_number === page_number);

    if (pageIndex === -1) return NextResponse.json({ error: 'Page not found' }, { status: 404 });

    const page = pages[pageIndex];
    if (!page.image_prompt) return NextResponse.json({ error: 'No image prompt' }, { status: 400 });

    // Fire prediction immediately — no Prefer: wait header so this returns in <1s
    // Frontend handles all polling via /api/poll-image
    const createRes = await fetch(
      'https://api.replicate.com/v1/models/black-forest-labs/flux-schnell/predictions',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${REPLICATE_API_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          input: {
            prompt: page.image_prompt,
            go_fast: true,
            num_outputs: 1,
            aspect_ratio: '4:3',
            output_format: 'webp',
            output_quality: 80,
          },
        }),
      }
    );

    if (!createRes.ok) {
      const text = await createRes.text();
      console.error('Replicate error:', createRes.status, text.slice(0, 200));
      return NextResponse.json({ error: 'Replicate request failed', detail: text.slice(0, 200) }, { status: 500 });
    }

    const prediction = await createRes.json();

    if (prediction.error) {
      console.error('Prediction error:', prediction.error);
      return NextResponse.json({ error: prediction.error }, { status: 500 });
    }

    // Return poll URL — frontend polls /api/poll-image every 3s
    return NextResponse.json({
      status: 'processing',
      prediction_id: prediction.id,
      poll_url: prediction.urls?.get,
      page_number,
    });

  } catch (err) {
    console.error('generate-image error:', err);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
