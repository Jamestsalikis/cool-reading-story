import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const maxDuration = 30;
export const dynamic = 'force-dynamic';

const REPLICATE_API_TOKEN = process.env.REPLICATE_API_TOKEN;
const BASE = '3D cartoon character illustration, young woman early 20s, short wavy dark brown bob haircut, round circle glasses, warm olive skin, rosy cheeks, wearing a deep burgundy dark red cardigan over a cream white blouse, Pixar animation style, clay render, soft studio lighting, pure white background, full body portrait, high quality illustration, charming friendly character';

const PROMPTS: Record<string, string> = {
  welcome: `${BASE}, friendly warm smile, holding a small colorful storybook in one hand and giving a cheerful wave with the other`,
  writing: `${BASE}, focused expression with slight smile, leaning forward writing with a quill pen, golden ink sparkles floating around the pen tip`,
  painting: `${BASE}, creative excited expression, holding a paintbrush raised up with paint on the tip, small floating canvas with colorful illustrations nearby`,
};

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const secretKey = 'fable-generate-2026';

  if (body.secret !== secretKey) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  const pose = body.pose as string;
  const customPrompt = body.prompt as string | undefined;
  if (!pose) {
    return NextResponse.json({ error: 'pose required' }, { status: 400 });
  }
  // Use custom prompt if provided, otherwise fall back to built-in
  const prompt = customPrompt || PROMPTS[pose];
  if (!prompt) {
    return NextResponse.json({ error: 'Invalid pose. Use: welcome, writing, or painting' }, { status: 400 });
  }

  if (!REPLICATE_API_TOKEN) {
    return NextResponse.json({ error: 'Replicate not configured' }, { status: 500 });
  }

  try {
    const res = await fetch(
      'https://api.replicate.com/v1/models/black-forest-labs/flux-schnell/predictions',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${REPLICATE_API_TOKEN}`,
          'Content-Type': 'application/json',
          Prefer: 'wait=25',
        },
        body: JSON.stringify({
          input: {
            prompt: prompt,
            go_fast: true,
            num_outputs: 1,
            aspect_ratio: '2:3',
            output_format: 'webp',
            output_quality: 90,
          },
        }),
      }
    );

    if (!res.ok) return NextResponse.json({ error: 'Replicate error' }, { status: 500 });

    const prediction = await res.json();
    if (prediction.status !== 'succeeded' || !prediction.output?.[0]) {
      return NextResponse.json({ error: 'Generation failed', detail: prediction.error }, { status: 500 });
    }

    const imageUrl = prediction.output[0];

    // Download and upload to Supabase Storage
    const supabase = await createClient();
    const imgRes = await fetch(imageUrl);
    if (!imgRes.ok) return NextResponse.json({ error: 'Download failed' }, { status: 500 });

    const imgBuffer = await imgRes.arrayBuffer();
    const filePath = `fable-${pose}.webp`;

    const { error: uploadError } = await supabase.storage
      .from('story-images')
      .upload(filePath, imgBuffer, { contentType: 'image/webp', upsert: true });

    if (uploadError) return NextResponse.json({ error: uploadError.message }, { status: 500 });

    const { data: { publicUrl } } = supabase.storage.from('story-images').getPublicUrl(filePath);

    return NextResponse.json({ success: true, pose, url: publicUrl });
  } catch (err) {
    console.error('Fable generation error:', err);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
