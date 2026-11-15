'use client';

/**
 * Meta Pixel loader + first-touch attribution capture.
 *
 * - Does nothing until NEXT_PUBLIC_META_PIXEL_ID is set in Vercel.
 * - Never loads in the TalePop native app (Capacitor shell loads this site) or
 *   on the signed-in app pages, so child-facing screens stay pixel free.
 * - Fires PageView on each marketing page view, and CompleteRegistration once
 *   after a brand new Google sign-up (the auth callback leaves a short-lived
 *   tp_new_signup cookie). Email sign-ups fire CompleteRegistration on the
 *   signup page itself.
 */
import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { captureAttribution } from '@/lib/attribution';
import { isNativeApp } from '@/lib/iap';
import { META_PIXEL_ID, track } from '@/lib/pixel';

const APP_ONLY = ['/dashboard', '/stories', '/onboarding', '/admin'];

declare global {
  interface Window { fbq?: ((...a: unknown[]) => void) & { callMethod?: unknown; queue?: unknown[]; loaded?: boolean; version?: string; push?: unknown }; _fbq?: unknown }
}

function loadPixel(id: string) {
  if (window.fbq) return;
  /* Meta's standard base code, unminified */
  const fbq = function (...args: unknown[]) {
    const f = fbq as unknown as { callMethod?: (...a: unknown[]) => void; queue: unknown[] };
    if (f.callMethod) f.callMethod(...args); else f.queue.push(args);
  } as unknown as NonNullable<Window['fbq']>;
  fbq.push = fbq; fbq.loaded = true; fbq.version = '2.0'; fbq.queue = [];
  window.fbq = fbq; window._fbq = fbq;
  const s = document.createElement('script');
  s.async = true;
  s.src = 'https://connect.facebook.net/en_US/fbevents.js';
  document.head.appendChild(s);
  window.fbq('init', id);
}

export function MetaPixel() {
  const pathname = usePathname() || '/';

  useEffect(() => {
    if (isNativeApp()) return;
    if (APP_ONLY.some((p) => pathname.startsWith(p))) return;
    captureAttribution();
    if (!META_PIXEL_ID) return;
    loadPixel(META_PIXEL_ID);
    track('PageView');
    const m = document.cookie.match(/(?:^|; )tp_new_signup=([^;]*)/);
    if (m) {
      track('CompleteRegistration', { content_name: 'signup', status: true, method: decodeURIComponent(m[1]) });
      document.cookie = 'tp_new_signup=; Max-Age=0; Path=/';
    }
  }, [pathname]);

  return null;
}
