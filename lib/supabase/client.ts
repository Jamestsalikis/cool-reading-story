import { createBrowserClient } from '@supabase/ssr';

/**
 * DEV PREVIEW ONLY.
 *
 * Routes under /dev-preview render the real dashboard, onboarding and reader
 * components against fabricated data, so the look can be worked on without an
 * account and without touching any real database. Nothing else in the app can
 * reach this: it is keyed on the pathname, and /dev-preview exists only on the
 * redesign branch.
 *
 * THIS MUST NOT BE MERGED TO MAIN. Delete app/dev-preview, lib/supabase/__mock.ts
 * and this branch before the release merge.
 */
function isDevPreview() {
  if (process.env.NEXT_PUBLIC_PREVIEW_MOCK === '1') return true;
  return typeof window !== 'undefined' && window.location.pathname.startsWith('/dev-preview');
}

export function createClient() {
  if (isDevPreview()) {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { createMockClient } = require('./__mock');
    return createMockClient() as unknown as ReturnType<typeof createBrowserClient>;
  }
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
