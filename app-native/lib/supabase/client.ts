'use client';

// Native-app Supabase client. Unlike the website (which uses the cookie-based
// @supabase/ssr client for server rendering), the bundled app has no server, so
// it uses the standard supabase-js client with localStorage persistence. This is
// what actually keeps the user signed in across app launches in the webview.
//
// Singleton — supabase-js warns if multiple GoTrueClient instances share storage.
import { createClient as createSupabaseClient, type SupabaseClient } from '@supabase/supabase-js';

let client: SupabaseClient | undefined;

export function createClient(): SupabaseClient {
  if (client) return client;
  client = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        // PKCE: OAuth returns a ?code= we exchange in the deep-link handler
        // (NativeInit). The code_verifier is kept in this client's localStorage.
        flowType: 'pkce',
        // We handle the OAuth return URL manually via the appUrlOpen listener.
        detectSessionInUrl: false,
        storage: typeof window !== 'undefined' ? window.localStorage : undefined,
      },
    },
  );
  return client;
}
