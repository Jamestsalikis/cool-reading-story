/**
 * Android App Links file, served at /.well-known/assetlinks.json as
 * application/json with no redirect.
 *
 * Package com.talepopstories.app is verified against the Google Play listing.
 * The SHA-256 signing certificate fingerprint is NOT in the repo. Get it from
 * Play Console > Test and release > App integrity > App signing key certificate
 * (use the Play app signing key, plus the upload key if you sideload builds),
 * then set ANDROID_SHA256_CERT_FINGERPRINTS in Vercel (comma separated, format
 * AB:CD:...). Until then this serves a clearly marked placeholder, which Android
 * simply fails to verify (links keep opening the website, nothing breaks).
 *
 * Also needs the Android app to declare an autoVerify intent filter for
 * https://www.talepopstories.com/app (and /download, /get).
 */
export const dynamic = 'force-static';

const PACKAGE = process.env.ANDROID_PACKAGE_NAME || 'com.talepopstories.app';
const FINGERPRINTS = (process.env.ANDROID_SHA256_CERT_FINGERPRINTS || 'REPLACE_WITH_PLAY_APP_SIGNING_SHA256_FINGERPRINT')
  .split(',').map((s) => s.trim()).filter(Boolean);

export function GET() {
  const body = [
    {
      relation: ['delegate_permission/common.handle_all_urls'],
      target: { namespace: 'android_app', package_name: PACKAGE, sha256_cert_fingerprints: FINGERPRINTS },
    },
  ];
  return new Response(JSON.stringify(body), {
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'public, max-age=3600' },
  });
}
