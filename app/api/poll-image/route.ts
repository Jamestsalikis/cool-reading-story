import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// Lightweight endpoint: polls Replicate ONCE for a prediction's status.
// If succeeded, saves image_url to Supabase and returns it.
// Each call completes in <2s — well within Vercel Hobby's 10s limit.
export const maxDuration = 15;

const REPLICATE_API_TOKEN = process.env.REPLICATE_API_TOKEN;

export async function POST(request: Request) {
  try {
    const supabase = await createClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { story_id, page_number, poll_url } = await request.json();
    if (!story_id || page_number == null || !poll_url) {
      return NextResponse.json({ error: 'story_id, page_number, and poll_url required' }, { status: 400 });
    }

    if (!REPLICATE_API_TOKEN) {
      return NextResponse.json({ error: 'Replicate not configured' }, { status: 500 });
    }

    // Single poll — fast, no waiting
    const pollRes = await fetch(poll_url, {
      headers: { Authorization: `Bearer ${REPLICATE_API_TOKEN}` },
    });

    if (!pollRes.ok) {
      return NextResponse.json({ status: 'error', error: 'Poll request failed' }, { status: 500 });
    }

    const polled = await pollRes.json();

    if (polled.status === 'succeeded' && polled.output?.[0]) {
      const replicateUrl = polled.output[0];

      // Upload image to Supabase Storage for a permanent URL.
      // Replicate CDN URLs expire after ~1 hour — Storage URLs never expire.
      let permanentUrl = replicateUrl; // fallback if upload fails
      try {
        const imgRes = await fetch(replicateUrl);
        if (imgRes.ok) {
          const imgBuffer = await imgRes.arrayBuffer();
          const filePath = `${story_id}/page-${page_number}.webp`;
          const { error: uploadError } = await supabase.storage
            .from('story-images')
            .upload(filePath, imgBuffer, { contentType: 'image/webp', upsert: true });
          if (!uploadError) {
            const { data: { publicUrl } } = supabase.storage.from('story-images').getPublicUrl(filePath);
            permanentUrl = publicUrl;
          } else {
            console.error('Storage upload error:', uploadError.message);
          }
        }
      } catch (uploadErr) {
        console.error('Image upload failed, using Replicate URL:', uploadErr);
      }

      // Fetch story and save permanent URL, clearing poll_url
      const { data: story } = await supabase
        .from('stories')
        .select('pages')
        .eq('id', story_id)
        .eq('parent_id', user.id)
        .single();

      if (story) {
        const pages = story.pages || [];
        const updatedPages = pages.map((p: { page_number: number }) =>
          p.page_number === page_number ? { ...p, image_url: permanentUrl, poll_url: null } : p
        );
        await supabase.from('stories').update({ pages: updatedPages }).eq('id', story_id);
      }

      return NextResponse.json({ status: 'succeeded', image_url: permanentUrl, page_number });
    }

    if (polled.status === 'failed') {
      console.error('Prediction failed:', polled.error);
      return NextResponse.json({ status: 'failed', error: polled.error });
    }

    // Still processing
    return NextResponse.json({ status: polled.status ?? 'processing' });

  } catch (err) {
    console.error('poll-image error:', err);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
