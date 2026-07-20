'use client';

// Client-side auth wrappers. These replace the `'use server'` actions in
// actions.ts for the bundled native app (which has no Next.js server), and are
// safe to use on the web too: @supabase/ssr's browser client persists the
// session to cookies, so the website's middleware still sees the session.
//
// Same return shapes as the old server actions so page call-sites barely change.

import { createClient } from './client';
import { isNativeApp } from '../iap';

// Custom URL scheme the OAuth flow returns to on native (registered in
// ios Info.plist + Supabase allowed redirect URLs). The deep-link listener in
// components/NativeInit.tsx catches it and completes the session.
export const NATIVE_AUTH_REDIRECT = 'com.talepopstories.app://auth-callback';

// Base URL for auth email / OAuth redirects.
// Web + local dev: the configured site URL, or the current origin.
// (Native deep-link handling is layered on in a later step.)
function redirectBase(): string {
  if (process.env.NEXT_PUBLIC_SITE_URL) return process.env.NEXT_PUBLIC_SITE_URL;
  if (typeof window !== 'undefined') return window.location.origin;
  return '';
}

export async function signIn(formData: FormData) {
  const supabase = createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: String(formData.get('email') ?? ''),
    password: String(formData.get('password') ?? ''),
  });
  if (error) return { error: error.message };
  return { success: true };
}

export async function signUp(formData: FormData) {
  const supabase = createClient();
  const email = String(formData.get('email') ?? '');
  const { error } = await supabase.auth.signUp({
    email,
    password: String(formData.get('password') ?? ''),
    options: {
      emailRedirectTo: `${redirectBase()}/auth/callback?next=/onboarding`,
    },
  });
  if (error) return { error: error.message };
  return { success: true, email };
}

export async function resendVerificationEmail(email: string) {
  const supabase = createClient();
  const { error } = await supabase.auth.resend({
    type: 'signup',
    email,
    options: {
      emailRedirectTo: `${redirectBase()}/auth/callback?next=/onboarding`,
    },
  });
  if (error) return { error: error.message };
  return { success: true };
}

export async function signInWithGoogle() {
  const supabase = createClient();

  if (isNativeApp()) {
    // Native: get the Google consent URL without navigating, open it in an
    // in-app browser, and let the deep-link listener finish the session when
    // Google redirects back to NATIVE_AUTH_REDIRECT. PKCE code_verifier is
    // stored by this (singleton) client, so exchangeCodeForSession works.
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: NATIVE_AUTH_REDIRECT, skipBrowserRedirect: true },
    });
    if (error) return { error: error.message };
    if (!data?.url) return { error: 'Could not start Google sign-in' };
    const { Browser } = await import('@capacitor/browser');
    await Browser.open({ url: data.url });
    return { success: true };
  }

  // Web: standard redirect to Google's consent screen.
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo: `${redirectBase()}/auth/callback` },
  });
  if (error) return { error: error.message };
  if (data?.url && typeof window !== 'undefined') window.location.href = data.url;
  return { success: true };
}

export async function signOut() {
  const supabase = createClient();
  await supabase.auth.signOut();
}
