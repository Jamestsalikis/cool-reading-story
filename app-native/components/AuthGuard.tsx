'use client';

// Client-side route protection. In the bundled native app there is no Next.js
// middleware, so this component guards the authenticated screens instead
// (dashboard, reader, onboarding). On the web it layers on top of middleware
// harmlessly (belt-and-braces).

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { initIAP } from '@/lib/iap';

function FullScreenSpinner() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#FFF4E6' }}>
      <style>{`@keyframes ag-spin{to{transform:rotate(360deg)}}`}</style>
      <div style={{ width: 40, height: 40, border: '4px solid rgba(255,107,53,0.2)', borderTopColor: '#FF6B35', borderRadius: '50%', animation: 'ag-spin 0.8s linear infinite' }} />
    </div>
  );
}

/** Wrap a protected screen. Redirects to /login when there is no session. */
export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [status, setStatus] = useState<'loading' | 'authed'>('loading');

  useEffect(() => {
    const supabase = createClient();
    let active = true;

    supabase.auth.getSession().then(({ data }) => {
      if (!active) return;
      if (data.session) {
        setStatus('authed');
        // Tie RevenueCat to this account so purchases map back to the user.
        void initIAP(data.session.user.id);
      } else router.replace('/login');
    });

    // React to sign-out (or session expiry) while on a protected screen.
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!active) return;
      if (session) setStatus('authed');
      else router.replace('/login');
    });

    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, [router]);

  if (status !== 'authed') return <FullScreenSpinner />;
  return <>{children}</>;
}

/** For /login and /signup: bounce already-authenticated users to the dashboard. */
export function useRedirectIfAuthenticated() {
  const router = useRouter();
  useEffect(() => {
    const supabase = createClient();
    let active = true;
    supabase.auth.getSession().then(({ data }) => {
      if (active && data.session) router.replace('/dashboard');
    });
    return () => { active = false; };
  }, [router]);
}
