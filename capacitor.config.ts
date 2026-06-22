import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.talepopstories.app',
  appName: 'TalePop',
  // Fallback assets shown only if the remote site can't load.
  webDir: 'capacitor/www',
  server: {
    // The native shell loads the live TalePop web app.
    // To test against staging, change this to the staging URL and run `npx cap sync`.
    url: 'https://www.talepopstories.com',
    cleartext: false,
  },
  ios: {
    contentInset: 'always',
  },
  android: {},
};

export default config;
