import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const maxDuration = 60;

const REPLICATE_API_TOKEN = process.env.REPLICATE_API_TOKEN;

async function generateImage(prompt: string): Promise<string | null> {
  if (!REPLICATE_API_TOKEN) return null;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 50000);

  try {
    const res = await fetch(
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
        signal: controller.signal,
      }
    );

    clearTimeout(timeout);

    if (!res.ok) {
      const text = await res.text();
      console.error('Replicate error:', res.status, text.slice(0, 200));
      return null;
    }

    const prediction = await res.json();

    if (prediction.status === 'succeeded' && prediction.output?.[0]) {
      return prediction.output[0];
    }

    if (prediction.error) {
      console.error('Prediction error:', prediction.error);
      return null;
    }

    // Poll
    const pollUrl = prediction.urls?.get;
    if (!pollUrl) return null;

    for (let i = 0; i < 20; i++) {
      await new Promise((r) => setTimeout(r, 2000));
      const pollRes = await fetch(pollUrl, {
        headers: { Authorization: `Bearer ${REPLICATE_API_TOKEN}` },
      });
      const polled = await pollRes.json();
      if (polled.status === 'succeeded' && polled.output?.[0]) return polled.output[0];
      if (polled.status === 'failed') return null;
    }
  } catch (err: unknown) {
    clearTimeout(timeout);
    console.error('Image generation error:', err instanceof Error ? err.message : err);
  }

  return null;
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { story_id, page_number } = await request.json();
    if (!story_id || page_number == null) return NextResponse.json({ error: 'story_id and page_number required' }, { status: 400 });

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
    if (!page.image_prompt) return NextResponse.json({ error: 'No image prompt for this page' }, { status: 400 });

    console.log(`Generating image for page ${page_number}`);
    const imageUrl = await generateImage(page.image_prompt);

    if (!imageUrl) return NextResponse.json({ error: 'Image generation failed' }, { status: 500 });

    // Update just this page
    const updatedPages = [...pages];
    updatedPages[pageIndex] = { ...page, image_url: imageUrl };

    await supabase
      .from('stories')
      .update({ pages: updatedPages })
      .eq('id', story_id);

    return NextResponse.json({ image_url: imageUrl, page_number });
  } catch (err) {
    console.error('Error:', err);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
