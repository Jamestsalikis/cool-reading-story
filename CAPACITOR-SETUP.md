# TalePop — Capacitor App Build Runbook (run on your Mac)

This turns the TalePop web app into installable iOS and Android apps. The native
shell loads the live site (https://www.talepopstories.com) and adds native
capabilities. You run these steps on your Mac; Claude prepared the config.

App identifier (bundle ID): **com.talepopstories.app**
App name: **TalePop**
(If you want a different bundle ID, change `appId` in `capacitor.config.ts` BEFORE the first build. It is painful to change after store registration.)

---

## 1. Prerequisites (one-time)

- **Xcode** — install from the Mac App Store (large download). Open it once to accept the licence.
- **CocoaPods** — in Terminal: `sudo gem install cocoapods` (or `brew install cocoapods`).
- **Android Studio** — https://developer.android.com/studio (only needed for the Android build).
- **Node 20+** — you already have this.

## 2. Get this branch

```
git clone https://github.com/Jamestsalikis/cool-reading-story.git
cd cool-reading-story
git checkout capacitor-setup
npm install
```

## 3. Install Capacitor

```
npm install @capacitor/core @capacitor/cli @capacitor/ios @capacitor/android
```

`capacitor.config.ts` is already in the repo, so you do NOT need `npx cap init`.

## 4. Create the native projects

```
npx cap add ios
npx cap add android
npx cap sync
```

This creates `/ios` and `/android` folders (the native app projects).

## 5. Run on iPhone (simulator or device)

```
npx cap open ios
```

In Xcode:
- Select the **App** target → **Signing & Capabilities** → set your **Team**
  (this needs your Apple Developer account; the free personal team works for a
  simulator/device test).
- Pick a simulator (e.g. iPhone 15) or your plugged-in iPhone at the top.
- Press the ▶ Run button.

The app launches and loads TalePop. Test portrait, landscape, the reader, sign-in.

## 6. Run on Android

```
npx cap open android
```

In Android Studio: let it sync Gradle, pick an emulator or device, press Run.

---

## Notes / what comes next

- **To point the app at staging** while testing: change `server.url` in
  `capacitor.config.ts` to the staging URL, then `npx cap sync` and re-run.
- **App Store review risk:** Apple can reject an app that is "just a website"
  (Guideline 4.2). Before submitting we add genuine native features — push
  notifications and native in-app purchase (for AU/CA billing) — which clears
  that bar. That is the next work item after you confirm the app runs.
- **Whenever the web app changes**, you do NOT need to rebuild the native app —
  it loads the live site. You only rebuild the native app when native config or
  plugins change.
- App icons and splash screens get set later as part of store assets.

## If something breaks

- iOS build fails on pods: `cd ios/App && pod install`, then reopen Xcode.
- Tell Claude the exact error and it will help debug.
