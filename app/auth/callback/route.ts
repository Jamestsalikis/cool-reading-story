import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createClient } from '@/lib/supabase/server';
import { ATTR_COOKIE, parseAttributionCookie } from '@/lib/attribution';

/** A user created in the last 15 minutes counts as a brand new sign-up. */
const NEW_USER_WINDOW_MS = 15 * 60 * 1000;

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/dashboard';

  if (code) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      const res = NextResponse.redirect(`${origin}${next}`);
      const user = data?.user;
      try {
        // Google sign-ups cannot carry form data, so on their first callback we
        // copy the first-touch attribution cookie into user_metadata and leave a
        // short-lived cookie that tells the Meta Pixel to fire CompleteRegistration.
        // Email sign-ups already saved attribution (and fired the event) on /signup.
        const isNew = user && Date.now() - new Date(user.created_at).getTime() < NEW_USER_WINDOW_MS;
        if (user && isNew && !user.user_metadata?.attribution) {
          const provider = String(user.app_metadata?.provider || 'oauth');
          const attribution = parseAttributionCookie((await cookies()).get(ATTR_COOKIE)?.value);
          await supabase.auth.updateUser({
            data: { ...(attribution ? { attribution } : {}), signup_method: provider },
          });
          if (provider !== 'email') {
            res.cookies.set('tp_new_signup', provider, { path: '/', maxAge: 600, sameSite: 'lax', httpOnly: false });
          }
        }
      } catch (e) {
        console.warn('[auth/callback] attribution save skipped', e);
      }
      return res;
    }
  }

  // Auth error  -  redirect to login with error param
  return NextResponse.redirect(`${origin}/login?error=auth_error`);
}
