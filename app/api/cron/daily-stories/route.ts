import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { buildPrompt } from '@/lib/story-prompt';

export const maxDuration = 60; // Pro plan: 60s; Hobby: capped at 10s but fire-and-forget keeps it fast

/**
 * Daily story cron — runs at 14:00 UTC (midnight AEST / 1am AEDT).
 * Generates one fresh story per child for every active subscriber.
 * Stories are ready on the shelf when families sit down for bedtime reading.
 *
 * Protected by CRON_SECRET env var — Vercel sends this automatically for cron jobs.
 * To test manually: curl -H "Authorization: Bearer <CRON_SECRET>" https://talepopstories.com/api/cron/daily-stories
 */
export async function GET(request: Request) {
  // Verify this is called by Vercel cron (or an authorised manual trigger)
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = createAdminClient();
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  const anthropicKey = process.env.ANTHROPIC_API_KEY!;
  const replicateToken = process.env.REPLICATE_API_TOKEN!;

  // Get all active subscribers
  const { data: subscribers, error: subErr } = await supabase
    .from('user_subscriptions')
    .select('user_id')
    .eq('status', 'subscribed');

  if (subErr || !subscribers?.length) {
    return NextResponse.json({ message: 'No active subscribers', generated: 0 });
  }

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const results: { child_id: string; status: string }[] = [];

  // Process all subscribers in parallel
  await Promise.allSettled(
    subscribers.map(async (sub) => {
      // Get all children for this subscriber
      const { data: children } = await supabase
        .from('children')
        .select('*')
        .eq('parent_id', sub.user_id);

      if (!children?.length) return;

      // Generate for each child in parallel
      await Promise.allSettled(
        children.map(async (child) => {
          try {
            // Skip if this child already has a story today (idempotent)
            const { count } = await supabase
              .from('stories')
              .select('id', { count: 'exact', head: true })
              .eq('child_id', child.id)
              .gte('created_at', todayStart.toISOString());

            if ((count ?? 0) > 0) {
              results.push({ child_id: child.id, status: 'skipped_already_has_story' });
              return;
            }

            // Get previous titles so Claude avoids repeating
            const { data: prevStories } = await supabase
              .from('stories')
              .select('title')
              .eq('child_id', child.id)
              .order('created_at', { ascending: false })
              .limit(10);
            const previousTitles = (prevStories || []).map((s: { title: string }) => s.title).filter(Boolean);

            const prompt = buildPrompt({
              name: child.name,
              age: child.age,
              gender: child.gender || 'child',
              interests: child.interests || [],
              appearance: child.appearance || {},
              reading_level: child.reading_level || 'intermediate',
            }, previousTitles);

            // Fire to Supabase edge function — it responds immediately (story_id) then
            // generates text + images in background via EdgeRuntime.waitUntil
            const edgeRes = await fetch(
              `${supabaseUrl}/functions/v1/generate-story-text`,
              {
                method: 'POST',
                headers: {
                  'Authorization': `Bearer ${serviceRoleKey}`,
                  'apikey': serviceRoleKey,
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  prompt,
                  child_id: child.id,
                  parent_id: sub.user_id,
                  anthropic_api_key: anthropicKey,
                  replicate_token: replicateToken,
                  child_appearance: child.appearance || {},
                  is_daily_gift: true, // flag so it doesn't count against daily manual limit
                }),
              }
            );

            if (edgeRes.ok) {
              results.push({ child_id: child.id, status: 'queued' });
            } else {
              const errText = await edgeRes.text();
              console.error(`[daily-cron] Edge fn error for child ${child.id}:`, errText);
              results.push({ child_id: child.id, status: 'error' });
            }
          } catch (err) {
            console.error(`[daily-cron] Failed for child ${child.id}:`, err);
            results.push({ child_id: child.id, status: 'error' });
          }
        })
      );
    })
  );

  const queued = results.filter(r => r.status === 'queued').length;
  const skipped = results.filter(r => r.status === 'skipped_already_has_story').length;
  const errors = results.filter(r => r.status === 'error').length;

  console.log(`[daily-cron] Done — queued: ${queued}, skipped: ${skipped}, errors: ${errors}`);

  return NextResponse.json({ queued, skipped, errors, total: results.length });
}
