'use client';

// Runs once on app start (native only): styles the status bar to match the light
// cream header, and hides the native splash screen once the web app has mounted.
// Everything is dynamically imported + guarded so it's a no-op on the web build.
import { useEffect } from 'react';
import { isNativeApp } from '@/lib/iap';

export default function NativeInit() {
  useEffect(() => {
    if (!isNativeApp()) return;
    (async () => {
      try {
        const { StatusBar, Style } = await import('@capacitor/status-bar');
        // Style.Light = dark icons/text, for our light cream header.
        await StatusBar.setStyle({ style: Style.Light });
      } catch { /* plugin unavailable */ }
      try {
        const { SplashScreen } = await import('@capacitor/splash-screen');
        await SplashScreen.hide();
      } catch { /* plugin unavailable */ }
    })();
  }, []);

  return null;
}
