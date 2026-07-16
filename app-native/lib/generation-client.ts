'use client';

// Story generation calls. In the bundled native app there is no Next.js server,
// so generation goes DIRECTLY to the Supabase `app-generate` edge function
// (JWT-authed, secrets + paywall server-side). On the web we keep calling the
// existing Next.js API routes unchanged.
//
// Returns a fetch-like { ok, status, data } so call-sites stay almost identical.

import { createClient } from './supabase/client';
import { isNativeApp } from './iap';
import { getSampleStoryClient } from './sample-stories/client';

export type GenResult = { ok: boolean; status: number; data: Record<string, unknown> & { story?: { id?: string }; error?: string; reason?: string; message?: string } };

async function parse(res: Response): Promise<GenResult> {
  let data = {};
  try { data = await res.json(); } catch { /* empty body */ }
  return { ok: res.ok, status: res.status, data };
}

async function callEdge(body: Record<string, unknown>): Promise<GenResult> {
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();
  const token = session?.access_token ?? '';
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '';
  const res = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/app-generate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      'apikey': anon,
    },
    body: JSON.stringify(body),
  });
  return parse(res);
}

async function callApi(path: string, body: Record<string, unknown>): Promise<GenResult> {
  const res = await fetch(path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  return parse(res);
}

/** Generate a brand-new story for a child. */
export async function generateStory(childId: string): Promise<GenResult> {
  if (!isNativeApp()) {
    // Web keeps the Next.js route (which does its own sample-story shortcut).
    return callApi('/api/generate-story', { child_id: childId });
  }
  // Native: offer a curated sample template as a candidate. The edge function
  // uses it ONLY for a free user's first book; otherwise it generates with AI.
  // Server-side gating keeps the "1 free per child" rule tamper-proof.
  const sampleCandidate = await buildSampleCandidate(childId);
  return callEdge({ mode: 'new', child_id: childId, sample_candidate: sampleCandidate });
}

// Pick + personalise a bundled sample story for this child, or null if the
// child has no trial interest / no matching template.
async function buildSampleCandidate(childId: string): Promise<unknown | null> {
  try {
    const supabase = createClient();
    const { data: child } = await supabase
      .from('children')
      .select('name, gender, interests, reading_level, appearance')
      .eq('id', childId)
      .single();
    if (!child) return null;
    const app = (child.appearance ?? {}) as Record<string, unknown>;
    return await getSampleStoryClient(
      (child.interests ?? []) as string[],
      {
        name: child.name,
        gender: child.gender ?? undefined,
        hairColour: app.hairColour as string | undefined,
        eyeColour: app.eyeColour as string | undefined,
        skinColour: app.skinColour as string | undefined,
        siblings: app.siblings as { name: string }[] | undefined,
        friends: app.friends as { name: string }[] | undefined,
      },
      (child.reading_level as string) ?? 'intermediate',
    );
  } catch {
    return null; // fall through to AI on any error
  }
}

/** Generate the next chapter (sequel) from an existing story. */
export function generateSequel(storyId: string): Promise<GenResult> {
  return isNativeApp()
    ? callEdge({ mode: 'sequel', story_id: storyId })
    : callApi('/api/generate-sequel', { story_id: storyId });
}
