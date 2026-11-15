/**
 * talepopstories.com/app : one link for ads and bios.
 *   iPhone / iPad  -> App Store (with ct/pt campaign params)
 *   Android        -> Google Play (UTMs passed in the Play `referrer` param)
 *   Desktop        -> this page, with both buttons and a web signup link
 * ?platform=ios|android forces a store (used by the site's own store buttons).
 * UTMs and click ids come from the query string first, then from the first-touch
 * tp_attr cookie, and stay on the desktop page's links.
 * /download and /get redirect here (next.config.ts) with the query kept.
 */
import type { Metadata } from 'next';
import Link from 'next/link';
import { cookies, headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { StoreButtons } from '@/components/StoreButtons';
import { ATTR_COOKIE, parseAttributionCookie } from '@/lib/attribution';
import { TRACKING_KEYS, appStoreUrl, detectPlatform, playStoreUrl } from '@/lib/storeLinks';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Get the TalePop app',
  description: 'Download TalePop on the App Store or Google Play. First personalised bedtime story free.',
  alternates: { canonical: '/app' },
  robots: { index: false, follow: true },
};

type SP = Promise<Record<string, string | string[] | undefined>>;

export default async function AppLink({ searchParams }: { searchParams: SP }) {
  const sp = await searchParams;
  const one = (k: string) => { const v = sp[k]; return Array.isArray(v) ? v[0] : v; };

  const fromCookie = parseAttributionCookie((await cookies()).get(ATTR_COOKIE)?.value) || {};
  const params: Record<string, string | undefined> = {};
  for (const k of TRACKING_KEYS) params[k] = one(k) || (fromCookie as Record<string, string | undefined>)[k];

  const forced = one('platform');
  const ua = (await headers()).get('user-agent') || '';
  const platform = forced === 'ios' || forced === 'android' ? forced : detectPlatform(ua);

  if (platform === 'ios') redirect(appStoreUrl(params));
  if (platform === 'android') redirect(playStoreUrl(params));

  const keep = new URLSearchParams();
  for (const k of TRACKING_KEYS) { const v = one(k); if (v) keep.set(k, v); }
  const signupHref = '/signup' + (keep.toString() ? '?' + keep.toString() : '');

  return (
    <main style={{ minHeight: '100svh', display: 'grid', placeItems: 'center', background: '#0B0D1C', color: '#F6EFE4', padding: '32px 20px', fontFamily: "'Nunito', system-ui, sans-serif" }}>
      <div style={{ maxWidth: 520, width: '100%', textAlign: 'center' }}>
        <img src="/talepop-logo-app-icon.png" alt="TalePop" width={88} height={88} style={{ borderRadius: 22, margin: '0 auto 20px', display: 'block' }} />
        <h1 style={{ fontFamily: "'Baloo 2', sans-serif", fontSize: '2rem', lineHeight: 1.2, margin: 0 }}>Get the TalePop app</h1>
        <p style={{ color: '#B7B2C4', margin: '12px 0 28px', fontSize: '1.05rem' }}>
          Personalised bedtime stories with your child&apos;s name in every one. First story free.
        </p>
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <StoreButtons placement="app_page" size="lg" />
        </div>
        <p style={{ marginTop: 28, color: '#7C7893', fontSize: '.95rem' }}>
          On a computer? <Link href={signupHref} style={{ color: '#FFB765', fontWeight: 700 }}>Start on the web instead</Link>
        </p>
      </div>
    </main>
  );
}
