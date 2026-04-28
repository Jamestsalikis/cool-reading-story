import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const maxDuration = 60;
export const dynamic = 'force-dynamic';

const REPLICATE_API_TOKEN = process.env.REPLICATE_API_TOKEN;

// Fable poses to generate
const POSES = [
  {
    id: 'welcome',
    prompt: '3D cartoon character illustration, young woman early 20s named Fable, short wavy dark brown bob haircut, round circle glasses, warm olive skin, rosy cheeks, friendly warm smile, wearing a deep burgundy dark red cardigan over a cream white blouse, holding a small colorful storybook in one hand and waving with the other, Pixar animation style, clay render, soft studio lighting, pure white background, full body portrait, charming and approachable expression, high quality illustration',
  },
  {
    id: 'writing',
    prompt: '3D cartoon character illustration, young woman early 20s named Fable, short wavy dark brown bob haircut, round circle glasses, warm olive skin, rosy cheeks, focused concentrated expression with slight smile, wearing a deep burgundy dark red cardigan over a cream white blouse, leaning forward writing with a quill pen on glowing paper, ink sparkles, Pixar animation style, clay render, soft studio lighting, pure white background, full body portrait, high quality illustration',
  },
  {
    id: 'excited',
    prompt: '3D cartoon character illustration, young woman early 20s named Fable, short wavy dark brown bob haircut, round circle glasses, warm olive skin, rosy cheeks, very excited delighted expression, wide open eyes, big smile, wearing a deep burgundy dark red cardigan over a cream white blouse, both arms raised with joy, colorful books and stars floating around her, Pixar animation style, clay render, soft studio lighting, pure white background, full body portrait, high quality illustration',
  },
  {
    id: 'painting',
    prompt: '3D cartoon character illustration, young woman early 20s named Fable, short wavy dark brown bob haircut, round circle glasses, warm olive skin, rosy cheeks, focused creative expression with tongue slightly out in concentration, wearing a deep burgundy dark red cardigan over a cream white blouse, holding a paintbrush raised up, small floating easel beside her with a colorful painting, Pixar animation style, clay render, soft studio lighting, pure white background, full body portrait, high quality illustration',
  },
  {
    id: 'finished',
    prompt: '3D cartoon character illustration, young woman early 20s named Fable, short wavy dark brown bob haircut, round circle glasses, warm olive skin, rosy cheeks, satisfied proud gentle smile, eyes slightly squinting in happiness, wearing a deep burgundy dark red cardigan over a cream white blouse, hands clasped together in front, slight bow, a finished colorful storybook floating in a golden glow beside her, Pixar animation style, clay render, soft studio lighting, pure white background, full body portrait, high quality illustration',
  },
];

async function generateAndStore(
  supabase: ReturnType<typeof createClient> extends Promise<infer T> ? T : never,
  pose: typeof POSES[0]
): Promise<{ id: string; url: string } | null> {
  try {
    // Create Replicate prediction with wait
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
            prompt: pose.prompt,
            go_fast: true,
            num_outputs: 1,
            aspect_ratio: '2:3',
            output_format: 'webp',
            output_quality: 90,
          },
        }),
      }
    );

    if (!res.ok) {
      console.error(`Replicate error for ${pose.id}:`, res.status);
      return null;
    }

    const prediction = await res.json();
    if (prediction.status !== 'succeeded' || !prediction.output?.[0]) {
      console.error(`Prediction failed for ${pose.id}:`, prediction.error);
      return null;
    }

    const imageUrl = prediction.output[0];

    // Download image
    const imgRes = await fetch(imageUrl);
    if (!imgRes.ok) return null;
    const imgBuffer = await imgRes.arrayBuffer();

    // Upload to Supabase Storage
    const filePath = `fable-${pose.id}.webp`;
    const { error: uploadError } = await supabase.storage
      .from('story-images')
      .upload(filePath, imgBuffer, { contentType: 'image/webp', upsert: true });

    if (uploadError) {
      console.error(`Storage error for ${pose.id}:`, uploadError.message);
      return null;
    }

    const { data: { publicUrl } } = supabase.storage.from('story-images').getPublicUrl(filePath);
    return { id: pose.id, url: publicUrl };
  } catch (err) {
    console.error(`Error generating ${pose.id}:`, err);
    return null;
  }
}

export async function POST() {
  const supabase = await createClient();

  // Admin only
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data: adminRow } = await supabase
    .from('admin_emails')
    .select('email')
    .eq('email', user.email)
    .single();
  if (!adminRow) return NextResponse.json({ error: 'Admin only' }, { status: 403 });

  if (!REPLICATE_API_TOKEN) {
    return NextResponse.json({ error: 'Replicate not configured' }, { status: 500 });
  }

  // Generate all poses sequentially (avoid rate limits)
  const results: Record<string, string> = {};
  for (const pose of POSES) {
    console.log(`Generating Fable: ${pose.id}...`);
    const result = await generateAndStore(supabase, pose);
    if (result) {
      results[result.id] = result.url;
      console.log(`✓ ${pose.id}: ${result.url}`);
    }
  }

  return NextResponse.json({ success: true, poses: results });
}
