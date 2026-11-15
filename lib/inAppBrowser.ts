/**
 * Social app in-app browsers (Instagram, Facebook, Messenger, TikTok and so on).
 * Google blocks OAuth sign-in inside these embedded webviews with
 * "403 disallowed_useragent", so "Continue with Google" is a dead end there.
 *
 * We match named apps only. A generic Android "; wv)" match would also catch
 * the TalePop native app (Capacitor), which must keep its own behaviour.
 */
export type InAppName = 'Instagram' | 'Facebook' | 'Messenger' | 'TikTok' | 'Snapchat' | 'LinkedIn' | 'Pinterest' | 'X' | 'Threads' | 'LINE' | null;

export function detectInApp(ua: string): InAppName {
  if (/Barcelona/i.test(ua)) return 'Threads';
  if (/Instagram/i.test(ua)) return 'Instagram';
  if (/FB_IAB\/MESSENGER|MessengerForiOS|FBAN\/Messenger/i.test(ua)) return 'Messenger';
  if (/FBAN|FBAV|FB_IAB|FBIOS|FB4A|\[FB/i.test(ua)) return 'Facebook';
  if (/musical_ly|TikTok|Bytedance|BytedanceWebview/i.test(ua)) return 'TikTok';
  if (/Snapchat/i.test(ua)) return 'Snapchat';
  if (/LinkedInApp/i.test(ua)) return 'LinkedIn';
  if (/Pinterest/i.test(ua)) return 'Pinterest';
  if (/Twitter|TwitterAndroid/i.test(ua)) return 'X';
  if (/\bLine\//i.test(ua)) return 'LINE';
  return null;
}

/**
 * A link that asks Android to open this page in Chrome (works from Instagram
 * and Facebook on Android). iOS has no reliable equivalent from inside these
 * apps, so iPhone users get "tap ... then Open in browser" plus Copy link.
 */
export function androidOpenInChromeUrl(href: string): string {
  const u = new URL(href);
  return `intent://${u.host}${u.pathname}${u.search}#Intent;scheme=https;package=com.android.chrome;S.browser_fallback_url=${encodeURIComponent(href)};end`;
}
