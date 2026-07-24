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
          const supabase = createClient();
          try {
            // Regex-extract (URL() can mis-parse a custom scheme like com.x.app://).
            const code = url.match(/[?&]code=([^&]+)/)?.[1];
            if (code) {
              await supabase.auth.exchangeCodeForSession(decodeURIComponent(code));
            } else {
              // Fallback for implicit flow: tokens in the URL hash.
              const hash = url.includes('#') ? url.slice(url.indexOf('#') + 1) : '';
              const params = new URLSearchParams(hash);
              const access_token = params.get('access_token');
              const refresh_token = params.get('refresh_token');
              if (access_token && refresh_token) {
                await supabase.auth.setSession({ access_token, refresh_token });
              }
            }
          } catch (e) {
            console.error('[auth] OAuth callback failed:', e);
          }
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
