import type { CapacitorConfig } from '@capacitor/cli';

// The native app serves its OWN bundled front end from webDir (produced by
// `./scripts/build-cap.sh`) — no remote website, no browser chrome.
//
// For testing you can point the app at a running server instead of the bundle:
//   CAP_SERVER_URL=https://www.talepopstories.com/dashboard npx cap sync   # remote
//   CAP_SERVER_URL=http://192.168.0.52:3000 npx cap sync                    # LAN dev server
// Leave CAP_SERVER_URL unset for the real, fully-bundled app.
const serverUrl = process.env.CAP_SERVER_URL;

const config: CapacitorConfig = {
  appId: 'com.talepopstories.app',
  appName: 'TalePop',
  webDir: 'capacitor/www',
  ...(serverUrl
    ? { server: { url: serverUrl, cleartext: serverUrl.startsWith('http://') } }
    : {}),
  ios: {
    // Full-bleed webview; safe areas are handled in CSS via env(safe-area-inset-*).
    contentInset: 'never',
  },
  android: {},
};

export default config;
