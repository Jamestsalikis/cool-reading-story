'use client';

// Runs once on app start (native only):
//  - styles the status bar to match the light cream header
//  - hides the native splash once the web app has mounted
//  - listens for the OAuth deep-link return (Google/Apple via browser) and
//    completes the Supabase session, then routes into the app
// Everything is dynamically imported + guarded so it's a no-op on the web build.
import { useEffect } from 'react';
import { isNativeApp } from '@/lib/iap';
import { createClient } from '@/lib/supabase/client';

export default function NativeInit() {
  useEffect(() => {
    if (!isNativeApp()) return;
    let cleanup: (() => void) | undefined;

    (async () => {
      try {
        const { StatusBar, Style } = await import('@capacitor/status-bar');
        await StatusBar.setStyle({ style: Style.Light }); // dark icons for the light header
      } catch { /* plugin unavailable */ }

      // Complete OAuth when the browser redirects back to our custom scheme.
      try {
        const { App } = await import('@capacitor/app');
        const handle = await App.addListener('appUrlOpen', async ({ url }) => {
          if (!url || !url.includes('auth-callback')) return;
          try {
            const supabase = createClient();
            const parsed = new URL(url);
            const code = parsed.searchParams.get('code');
            if (code) {
              await supabase.auth.exchangeCodeForSession(code);
            }
          } catch { /* fall through */ }
          try {
            const { Browser } = await import('@capacitor/browser');
            await Browser.close();
          } catch { /* browser may already be closed */ }
          // Reload from the entry point; the splash routes to /dashboard when a
          // session exists (or back to /login if the exchange failed).
          window.location.href = '/';
        });
        cleanup = () => { handle.remove(); };
      } catch { /* plugin unavailable */ }

      try {
        const { SplashScreen } = await import('@capacitor/splash-screen');
        await SplashScreen.hide();
      } catch { /* plugin unavailable */ }
    })();

    return () => { cleanup?.(); };
  }, []);

  return null;
}
