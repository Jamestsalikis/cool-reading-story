import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const maxDuration = 60;

const REPLICATE_API_TOKEN = process.env.REPLICATE_API_TOKEN;

async function generateImage(prompt: string): Promise<string | null> {
  try {
    const res = await fetch(
      'https://api.replicate.com/v1/models/black-forest-labs/flux-schnell/predictions',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${REPLICATE_API_TOKEN}`,
          'Content-Type': 'application/json',
          Prefer: 'wait=20',
        },
        body: JSON.stringify({
          input: { prompt, go_fast: true, num_outputs: 1, aspect_ratio: '4:3', output_format: 'webp', output_quality: 80 },
        }),
      }
    );
    if (!res.ok) return null;
    const prediction = await res.json();
    if (prediction.status === 'succeeded' && prediction.output?.[0]) return prediction.output[0];
    if (prediction.error || !prediction.urls?.get) return null;

    // Poll up to 5 times (15s) if not immediate
    for (let i = 0; i < 5; i++) {
      await new Promise(r => setTimeout(r, 3000));
      const poll = await fetch(prediction.urls.get, { headers: { Authorization: `Bearer ${REPLICATE_API_TOKEN}` } });
      const p = await poll.json();
      if (p.status === 'succeeded' && p.output?.[0]) return p.output[0];
      if (p.status === 'failed') return null;
    }
  } catch { return null; }
  return null;
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { story_id } = await request.json();

  const { data: story } = await supabase
    .from('stories')
    .select('pages')
    .eq('id', story_id)
    .eq('parent_id', user.id)
    .single();
  if (!story) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const pages = story.pages || [];
  const pagesNeedingImages = pages.filter(
    (p: { image_prompt?: string; image_url?: string }) => p.image_prompt && !p.image_url
  );

  if (pagesNeedingImages.length === 0) return NextResponse.json({ done: true });

  // Generate ALL images in parallel — each saves to DB independently as soon as it's done.
  // Re-fetches pages before each save to avoid race conditions overwriting each other.
  await Promise.all(
    pagesNeedingImages.map(async (page: { page_number: number; image_prompt: string }) => {
      const imageUrl = await generateImage(page.image_prompt);
      if (!imageUrl) return;

      // Re-fetch current pages so concurrent saves don't overwrite each other
      const { data: current } = await supabase
        .from('stories')
        .select('pages')
        .eq('id', story_id)
        .single();

      if (!current?.pages) return;

      const updatedPages = current.pages.map((p: { page_number: number }) =>
        p.page_number === page.page_number ? { ...p, image_url: imageUrl } : p
      );

      await supabase.from('stories').update({ pages: updatedPages }).eq('id', story_id);
    })
  );

  return NextResponse.json({ done: true });
}
