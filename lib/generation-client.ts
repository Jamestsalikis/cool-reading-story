'use client';

// Story generation calls. In the bundled native app there is no Next.js server,
// so generation goes DIRECTLY to the Supabase `app-generate` edge function
// (JWT-authed, secrets + paywall server-side). On the web we keep calling the
// existing Next.js API routes unchanged.
//
// Returns a fetch-like { ok, status, data } so call-sites stay almost identical.

import { createClient } from './supabase/client';
import { isNativeApp } from './iap';

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
export function generateStory(childId: string): Promise<GenResult> {
  return isNativeApp()
    ? callEdge({ mode: 'new', child_id: childId })
    : callApi('/api/generate-story', { child_id: childId });
}

/** Generate the next chapter (sequel) from an existing story. */
export function generateSequel(storyId: string): Promise<GenResult> {
  return isNativeApp()
    ? callEdge({ mode: 'sequel', story_id: storyId })
    : callApi('/api/generate-sequel', { story_id: storyId });
}
