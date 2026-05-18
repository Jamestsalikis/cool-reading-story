import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { parseBody, generateImageSchema } from '@/lib/validation';

// Starts a Replicate prediction and returns immediately.
// If Replicate finishes within 8s (fast path), saves to DB and returns image_url.
// Otherwise returns { status: 'processing', prediction_id, poll_url } for the
// frontend to poll via /api/poll-image  -  keeps this function well under Vercel's limit.
export const maxDuration = 30;

const REPLICATE_API_TOKEN = process.env.REPLICATE_API_TOKEN;

// TalePop visual style  -  appended to every Replicate prompt for consistent illustration style
const TALEPOP_STYLE_SUFFIX =
  'Pixar 3D CGI render, subsurface skin scattering, volumetric rim lighting, specular eye highlights, ' +
  'smooth rounded cartoon anatomy, large expressive eyes, vibrant saturated jewel-tone colours, ' +
  'shallow depth of field, warm cinematic lighting, magical storybook atmosphere, ' +
  'professional Disney Pixar animated feature film quality. ' +
'Character always faces toward the viewer, face clearly visible and expressive, never shown from behind. ' +
'No text, no words, no letters in the image.';

// Derive a stable integer seed from a story UUID so all pages of one story
// use the same Flux seed  -  improves visual consistency across illustrations.
function storyIdToSeed(storyId: string): number {
  let hash = 0;
  for (let i = 0; i < storyId.length; i++) {
    hash = (Math.imul(31, hash) + storyId.charCodeAt(i)) | 0;
  }
  return Math.abs(hash) % 2147483647; // keep within Replicate's int32 range
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { story_id, page_number } = await parseBody(request, generateImageSchema);
    if (!story_id || page_number == null) {
      return NextResponse.json({ error: 'story_id and page_number required' }, { status: 400 });
    }

    if (!REPLICATE_API_TOKEN) {
      return NextResponse.json({ error: 'Replicate not configured' }, { status: 500 });
    }

    // Fetch pages AND character_anchor together — anchor locks character appearance across all pages
    const { data: story } = await supabase
      .from('stories')
      .select('pages, character_anchor')
      .eq('id', story_id)
      .eq('parent_id', user.id)
      .single();

    if (!story) return NextResponse.json({ error: 'Story not found' }, { status: 404 });

    const pages = story.pages || [];
    const pageIndex = pages.findIndex((p: { page_number: number }) => p.page_number === page_number);

    if (pageIndex === -1) return NextResponse.json({ error: 'Page not found' }, { status: 404 });

    const page = pages[pageIndex];
    if (!page.image_prompt) return NextResponse.json({ error: 'No image prompt' }, { status: 400 });

    // Build final prompt:
    //   1. character_anchor (from DB — canonical appearance, never drifts between pages)
    //   2. page-specific scene description
    //   3. TalePop style suffix
    //
    // Injecting the stored anchor FIRST means the character description is always
    // the same across all 5 pages, even if Claude slightly varied wording per page.
    const characterAnchor = story.character_anchor || '';
    const finalPrompt = characterAnchor
      ? `${characterAnchor} ${page.image_prompt} ${TALEPOP_STYLE_SUFFIX}`
      : `${page.image_prompt} ${TALEPOP_STYLE_SUFFIX}`;

    // Create prediction  -  retry once on 429 (rate limit) with a 5s backoff.
    // Two attempts x ~500ms each + 5s wait = ~6s worst case, within Hobby's 10s limit.
    let prediction: { id?: string; urls?: { get: string }; error?: string } | null = null;

    for (let attempt = 0; attempt < 2; attempt++) {
      if (attempt > 0) {
        await new Promise(r => setTimeout(r, 5000)); // wait 5s before retry
      }

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
              prompt: finalPrompt,
              go_fast: true,
              num_outputs: 1,
              aspect_ratio: '2:3',
              output_format: 'webp',
              output_quality: 80,
              // Deterministic seed per story keeps style/palette consistent across pages
              seed: storyIdToSeed(story_id),
            },
          }),
        }
      );

      if (createRes.status === 429) {
        console.log(`Replicate 429 on attempt ${attempt + 1}, ${attempt === 0 ? 'retrying in 5s' : 'giving up'}`);
        continue; // retry
      }

      if (!createRes.ok) {
        const text = await createRes.text();
        console.error('Replicate error:', createRes.status, text.slice(0, 200));
        return NextResponse.json({ error: 'Replicate request failed' }, { status: 500 });
      }

      prediction = await createRes.json();
      break;
    }

    if (!prediction || prediction.error || !prediction.urls?.get) {
      console.error('Prediction failed or rate limited:', prediction?.error);
      return NextResponse.json({ error: 'rate_limited' }, { status: 429 });
    }

    const pollUrl = prediction.urls.get;

    // Save poll_url to DB immediately so page refreshes can resume this prediction
    // instead of creating a new one (which would generate a different image)
    const updatedPages = pages.map((p: { page_number: number }) =>
      p.page_number === page_number ? { ...p, poll_url: pollUrl } : p
    );
    await supabase.from('stories').update({ pages: updatedPages }).eq('id', story_id);

    return NextResponse.json({
      status: 'processing',
      prediction_id: prediction.id,
      poll_url: pollUrl,
      page_number,
    });

  } catch (err) {
    if (err instanceof Response) return err;

    console.error('generate-image error:', err);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}

