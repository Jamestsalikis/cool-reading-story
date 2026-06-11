import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const maxDuration = 60;

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const REPLICATE_API_TOKEN = process.env.REPLICATE_API_TOKEN!;

// Admin-only maintenance endpoint. Finds every story whose pages still carry an
// expiring replicate.delivery image URL and re-triggers the image edge function for it.
// The edge function (v3+) treats replicate.delivery URLs as "needs image" and regenerates
// them onto permanent Supabase Storage URLs. Safe to run repeatedly (idempotent).
//
// POST body (optional): { "limit": number } to cap how many stories are processed per call.
export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    // Admin gate
    const { data: adminRow } = await supabase
      .from('admin_emails')
      .select('email')
      .eq('email', user.email ?? '')
      .maybeSingle();
    if (!adminRow) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    let limit = 1000;
    try {
      const body = await request.json();
      if (body && typeof body.limit === 'number' && body.limit > 0) limit = body.limit;
    } catch { /* no body is fine */ }

    // Find stories still pointing at expiring Replicate URLs. We can't LIKE-filter a
    // jsonb column via PostgREST, so fetch id+pages and match in JS (one-off admin scan).
    const { data: rows, error } = await supabase
      .from('stories')
      .select('id, title, pages');

    if (error) {
      console.error('[backfill-images] query error:', error.message);
      return NextResponse.json({ error: 'Query failed' }, { status: 500 });
    }

    const targets = (rows ?? [])
      .filter((s) => JSON.stringify(s.pages ?? []).includes('replicate.delivery'))
      .slice(0, limit)
      .map((s) => ({ id: s.id, title: s.title }));
    let triggered = 0;

    // Fire the edge function for each story. It responds immediately (waitUntil) and
    // regenerates in the background, so we stagger slightly to be gentle on Replicate.
    for (const s of targets) {
      try {
        await fetch(`${SUPABASE_URL}/functions/v1/generate-story-images`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
            'apikey': SUPABASE_SERVICE_ROLE_KEY,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ story_id: s.id, replicate_token: REPLICATE_API_TOKEN }),
        });
        triggered++;
        await new Promise((r) => setTimeout(r, 400));
      } catch (e) {
        console.error('[backfill-images] trigger failed for', s.id, e);
      }
    }

    return NextResponse.json({ found: targets.length, triggered, story_ids: targets.map((s) => s.id) });
  } catch (e) {
    console.error('[backfill-images] error:', e);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
