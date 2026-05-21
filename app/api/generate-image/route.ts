import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { parseBody, generateImageSchema } from '@/lib/validation';

// Starts a Replicate prediction and returns immediately.
// If Replicate finishes within 8s (fast path), saves to DB and returns image_url.
// Otherwise returns { status: 'processing', prediction_id, poll_url } for the
// frontend to poll via /api/poll-image  -  keeps this function well under Vercel's limit.
export const maxDuration = 30;

const REPLICATE_API_TOKEN = process.env.REPLICATE_API_TOKEN;

// TalePop visual style — SPLIT into prefix (positive, goes FIRST for Flux token weighting)
// and suffix (negative guardrails, goes last).
// Placing the 3D CGI directive at position 0 in the token stream is the key fix for
// page 1 rendering as 2D illustration — Flux weights early tokens most heavily.
const TALEPOP_STYLE_PREFIX =
  'Pixar 3D CGI animated film render, NOT 2D illustration, NOT flat art, NOT vector art, NOT cel shading. ' +
  'Subsurface skin scattering, volumetric rim lighting, specular eye highlights, ' +
  'smooth rounded cartoon anatomy, large expressive eyes, vibrant saturated jewel-tone colours, ' +
  'shallow depth of field, warm cinematic lighting, magical storybook atmosphere, ' +
  'professional Disney Pixar animated feature film quality. ';

const TALEPOP_STYLE_SUFFIX =
  'No floating limbs, no disconnected body parts, clean natural anatomy and proportions. ' +
  'Each animal and character has exactly one head — no duplicate or extra heads anywhere. ' +
  'Every character and creature shown with their complete full body visible — no cropped torsos, no cut-off limbs, entire figure from head to feet or tail always in frame. ' +
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

    // Fetch pages and character_anchor only.
    // character_anchor already contains skin tone (baked in by generate-story).
    // image_prompt also starts with character_anchor verbatim (per Claude's template),
    // so we just need: STYLE PREFIX + image_prompt + STYLE SUFFIX.
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

    // Idempotency: if image is already generated or prediction already started, return early.
    // Prevents duplicate Replicate predictions when pre-gen IIFE and story page race.
    if (page.image_url) {
      return NextResponse.json({ status: 'already_done', image_url: page.image_url, page_number });
    }
    if (page.poll_url) {
      return NextResponse.json({ status: 'already_processing', poll_url: page.poll_url, page_number });
    }

    // Build final prompt.
    // image_prompt already contains character_anchor at the start (Claude is instructed to copy
    // it verbatim as the first line of every image_prompt). Adding characterAnchor separately
    // would double it, bury the scene description, and cause "character portrait" images.
    // Structure: STYLE (3D CGI first for Flux token weighting) → image_prompt (anchor + scene)
    const finalPrompt = `${TALEPOP_STYLE_PREFIX}${page.image_prompt} ${TALEPOP_STYLE_SUFFIX}`;

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
              // Page-specific seed: same story + same page = same image on reload;
              // different pages get different seeds so illustrations don't look identical.
              seed: storyIdToSeed(story_id + '_p' + String(page_number)),
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

