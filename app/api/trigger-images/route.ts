import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const maxDuration = 10;

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const REPLICATE_API_TOKEN = process.env.REPLICATE_API_TOKEN!;

// Thin proxy that kicks off the Supabase Edge Function for background image generation.
// The edge function uses EdgeRuntime.waitUntil so it responds immediately and keeps
// processing even if the user closes their browser — images are generated server-side.
export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { story_id } = await request.json();
    if (!story_id) return NextResponse.json({ error: 'story_id required' }, { status: 400 });

    // Validate story belongs to this user before triggering generation
    const { data: story } = await supabase
      .from('stories')
      .select('id')
      .eq('id', story_id)
      .eq('parent_id', user.id)
      .single();
    if (!story) return NextResponse.json({ error: 'Story not found' }, { status: 404 });

    // Fire edge function — we don\'t await the full result.
    // The edge function responds immediately (via waitUntil) and keeps running
    // on Supabase infrastructure independently of this request.
    fetch(`${SUPABASE_URL}/functions/v1/generate-story-images`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        'apikey': SUPABASE_SERVICE_ROLE_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ story_id, replicate_token: REPLICATE_API_TOKEN }),
    }).catch(err => console.error('[trigger-images] Edge function call failed:', err));

    return NextResponse.json({ status: 'triggered', story_id });
  } catch (e) {
    console.error('[trigger-images] Error:', e);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
