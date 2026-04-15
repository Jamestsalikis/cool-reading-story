import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// Allow up to 5 minutes for image generation
export const maxDuration = 300;

const REPLICATE_API_TOKEN = process.env.REPLICATE_API_TOKEN;

async function generateImage(prompt: string): Promise<string | null> {
  if (!REPLICATE_API_TOKEN) return null;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 45000); // 45s per image max

  try {
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
        signal: controller.signal,
      }
    );

    clearTimeout(timeout);
    console.log('Replicate status:', createRes.status);

    if (!createRes.ok) {
      const text = await createRes.text();
      console.error('Replicate error response:', text.slice(0, 300));
      return null;
    }

    const prediction = await createRes.json();
    console.log('Prediction status:', prediction.status, 'id:', prediction.id);

    if (prediction.status === 'succeeded' && prediction.output?.[0]) {
      return prediction.output[0];
    }

    if (prediction.error) {
      console.error('Prediction error:', prediction.error);
      return null;
    }

    // Poll for completion
    const pollUrl = prediction.urls?.get;
    if (!pollUrl) return null;

    for (let i = 0; i < 30; i++) {
      await new Promise((r) => setTimeout(r, 2000));
      const pollRes = await fetch(pollUrl, {
        headers: { Authorization: `Bearer ${REPLICATE_API_TOKEN}` },
      });
      const polled = await pollRes.json();
      console.log(`Poll ${i + 1}: ${polled.status}`);
      if (polled.status === 'succeeded' && polled.output?.[0]) {
        return polled.output[0];
      }
      if (polled.status === 'failed') {
        console.error('Failed:', polled.error);
        return null;
      }
    }
  } catch (err: unknown) {
    clearTimeout(timeout);
    if (err instanceof Error && err.name === 'AbortError') {
      console.error('Image generation timed out');
    } else {
      console.error('Image generation error:', err);
    }
  }

  return null;
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { story_id } = body;

    if (!story_id) {
      return NextResponse.json({ error: 'story_id required' }, { status: 400 });
    }

    // Fetch story
    const { data: story, error: storyError } = await supabase
      .from('stories')
      .select('*')
      .eq('id', story_id)
      .eq('parent_id', user.id)
      .single();

    if (storyError || !story) {
      return NextResponse.json({ error: 'Story not found' }, { status: 404 });
    }

    const pages = story.pages || [];
    if (pages.length === 0) {
      return NextResponse.json({ error: 'No pages found' }, { status: 400 });
    }

    // Generate images one at a time to stay within limits and avoid overwhelming Replicate
    const updatedPages = [];
    for (const page of pages) {
      if (page.image_url) {
        // Already has an image, skip
        updatedPages.push(page);
      } else if (page.image_prompt) {
        console.log(`Generating image for page ${page.page_number}`);
        const imageUrl = await generateImage(page.image_prompt);
        updatedPages.push({ ...page, image_url: imageUrl });
        console.log(`Page ${page.page_number}: ${imageUrl ? 'SUCCESS' : 'FAILED'}`);
      } else {
        updatedPages.push(page);
      }
    }

    // Update story with images
    const { error: updateError } = await supabase
      .from('stories')
      .update({ pages: updatedPages })
      .eq('id', story_id);

    if (updateError) {
      console.error('Update error:', updateError);
      return NextResponse.json({ error: 'Failed to update story' }, { status: 500 });
    }

    return NextResponse.json({ pages: updatedPages });
  } catch (error) {
    console.error('Generate images error:', error);
    return NextResponse.json({ error: 'Image generation failed' }, { status: 500 });
  }
}
