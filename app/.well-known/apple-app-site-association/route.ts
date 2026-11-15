/**
 * iOS Universal Links file, served at /.well-known/apple-app-site-association
 * as application/json with no redirect (Apple will not follow redirects).
 *
 * App ID = <Team ID>.<bundle ID>. Both come from the repo:
 *   Team ID T937LK2FW8 (Talepop Pty Ltd, MAC-BUILD-RUNBOOK.md)
 *   bundle  com.talepopstories.app (capacitor.config.ts, matches the App Store listing)
 * Override with APPLE_TEAM_ID / IOS_BUNDLE_ID if either ever changes.
 *
 * This file alone does nothing until the iOS app ships with the Associated
 * Domains entitlement "applinks:www.talepopstories.com" (the bare domain
 * redirects to www, so Apple can only verify www) and handles appUrlOpen.
 */
export const dynamic = 'force-static';

const TEAM_ID = process.env.APPLE_TEAM_ID || 'T937LK2FW8';
const BUNDLE_ID = process.env.IOS_BUNDLE_ID || 'com.talepopstories.app';

// Only the "get the app" links open the app. Everything else stays on the web,
// including sign-in callbacks, which must never be captured by the app.
const PATHS = [
  { '/': '/auth/*', exclude: true },
  { '/': '/app' },
  { '/': '/app/*' },
  { '/': '/download' },
  { '/': '/get' },
];

export function GET() {
  const body = {
    applinks: {
      details: [{ appIDs: [`${TEAM_ID}.${BUNDLE_ID}`], components: PATHS }],
    },
  };
  return new Response(JSON.stringify(body), {
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'public, max-age=3600' },
  });
}
