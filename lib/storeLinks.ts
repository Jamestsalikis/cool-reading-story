/**
 * App store links and campaign hand-off, shared by the /app smart link and the
 * store buttons. Verified 16 Nov 2026:
 *   App Store: https://apps.apple.com/app/id6789373130 ("TalePop Children Stories",
 *              bundle com.talepopstories.app, seller Talepop Pty Ltd)
 *   Google Play: https://play.google.com/store/apps/details?id=com.talepopstories.app
 *              ("TalePop Children Stories - Apps on Google Play")
 */

export const IOS_APP_ID = '6789373130';
export const ANDROID_PACKAGE = 'com.talepopstories.app';
export const APP_STORE_BASE = `https://apps.apple.com/app/id${IOS_APP_ID}`;
export const PLAY_STORE_BASE = `https://play.google.com/store/apps/details?id=${ANDROID_PACKAGE}`;

/** The marketing params we keep from an ad click through to the store. */
export const TRACKING_KEYS = [
  'utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content', 'utm_id',
  'fbclid', 'gclid', 'gbraid', 'wbraid', 'ttclid', 'msclkid', 'twclid', 'li_fat_id',
] as const;

export type Platform = 'ios' | 'android' | 'desktop';

export function detectPlatform(ua: string): Platform {
  // iPadOS 13+ Safari reports itself as a Mac; the server cannot tell it apart
  // from a desktop Mac, so those iPads get the desktop page with both buttons.
  if (/iPhone|iPad|iPod/i.test(ua)) return 'ios';
  if (/Android/i.test(ua)) return 'android';
  return 'desktop';
}

type Params = Record<string, string | undefined>;

/**
 * App Store campaign link. Apple attributes App Analytics "campaigns" from
 * `ct` (campaign token, max 40 chars) together with `pt` (provider token, from
 * App Store Connect > App Analytics > Campaigns). Without pt Apple ignores ct,
 * so pt comes from NEXT_PUBLIC_APPSTORE_PROVIDER_TOKEN and ct is still sent.
 */
export function appStoreUrl(p: Params = {}): string {
  const u = new URL(APP_STORE_BASE);
  const ct = campaignToken(p);
  if (ct) u.searchParams.set('ct', ct);
  const pt = process.env.NEXT_PUBLIC_APPSTORE_PROVIDER_TOKEN;
  if (pt && ct) u.searchParams.set('pt', pt);
  u.searchParams.set('mt', '8');
  return u.toString();
}

/**
 * Google Play link. Play passes the `referrer` value to the installed app via
 * the Install Referrer API, so the full set of UTMs and click ids rides along
 * as one URL-encoded query string.
 */
export function playStoreUrl(p: Params = {}): string {
  const u = new URL(PLAY_STORE_BASE);
  const ref = new URLSearchParams();
  for (const k of TRACKING_KEYS) {
    const v = p[k];
    if (v) ref.set(k, v.slice(0, 200));
  }
  if (!ref.has('utm_source')) ref.set('utm_source', 'talepopstories.com');
  if (!ref.has('utm_medium')) ref.set('utm_medium', 'web');
  u.searchParams.set('referrer', ref.toString());
  return u.toString();
}

/** "source-campaign", trimmed to Apple's 40 character limit. */
export function campaignToken(p: Params): string {
  const parts = [p.utm_source, p.utm_campaign].filter(Boolean) as string[];
  const raw = parts.length ? parts.join('-') : 'web';
  return raw.replace(/[^\w.\-]+/g, '_').slice(0, 40);
}
