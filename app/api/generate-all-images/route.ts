import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const maxDuration = 60;

const REPLICATE_API_TOKEN = process.env.REPLICATE_API_TOKEN;

// Generates one image. Uses Prefer: wait=10 so Replicate holds the connection
// until the image is done (Flux Schnell typically finishes in 2-5s).
// No extra polling — keeps each call predictably short so all 5 fit in 60s.
async function generateImage(prompt: string): Promise<string | null> {
  try {
    const res = await fetch(
      'https://api.replicate.com/v1/models/black-forest-labs/flux-schnell/predictions',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${REPLICATE_API_TOKEN}`,
          'Content-Type': 'application/json',
          Prefer: 'wait=10',
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
    if (!res.ok) return null;
    const prediction = await res.json();
    if (prediction.status === 'succeeded' && prediction.output?.[0]) {
      return prediction.output[0];
    }
    return null;
  } catch {
    return null;
  }
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

  const pages: Array<{ page_number: number; image_prompt?: string; image_url?: string }> =
    story.pages || [];

  // Sequential — Replicate 429s on concurrent requests. Each image typically
  // takes 2-5s with Prefer: wait=10, so 5 images = ~15-25s total, well within 60s.
  for (const page of pages) {
    if (!page.image_prompt || page.image_url) continue;

    const imageUrl = await generateImage(page.image_prompt);
    if (!imageUrl) continue;

    // Re-fetch before each save so concurrent page opens don't overwrite each other
    const { data: current } = await supabase
      .from('stories')
      .select('pages')
      .eq('id', story_id)
      .single();

    if (!current?.pages) continue;

    const updatedPages = current.pages.map((p: { page_number: number }) =>
      p.page_number === page.page_number ? { ...p, image_url: imageUrl } : p
    );

    await supabase.from('stories').update({ pages: updatedPages }).eq('id', story_id);
  }

  return NextResponse.json({ done: true });
}
