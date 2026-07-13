# TalePop — Getting the iPhone app built and submitted (Mac)

Plain-English guide. You do the Xcode parts; Claude guides you and handles
App Store Connect in the browser. Nothing here touches the website or your
customers — it only builds the iPhone version of the app.

Facts you may be asked for along the way:
- App bundle ID: **com.talepopstories.app**
- App name: **TalePop**
- Apple Team: **Talepop Pty Ltd** (Team ID T937LK2FW8)
- Version: **1.0**, Build: **1**

---

## Part A — One-time setup on the Mac (about 30–40 min, mostly waiting)

1. **Install Xcode** from the Mac App Store (it's a big download). Open it once
   and click "Agree" if it asks to install components.

2. **Install two helper tools.** Open the **Terminal** app (Cmd+Space, type
   "Terminal", Enter) and paste each line, pressing Enter after each:
   ```
   xcode-select --install
   sudo gem install cocoapods
   ```
   (The second may ask for your Mac login password — typing it shows nothing,
   that's normal. If it errors, try `brew install cocoapods` instead.)

3. **Check Node is installed:** in Terminal type `node --version`. If it prints
   a number (v20 or higher) you're set. If "command not found", install from
   https://nodejs.org (the "LTS" button), then reopen Terminal.

---

## Part B — Get the code (about 5 min)

In Terminal, paste these one at a time:
```
cd ~/Documents
git clone https://github.com/Jamestsalikis/cool-reading-story.git
cd cool-reading-story
npm install
```
`npm install` takes a few minutes and prints a lot of text — that's fine.

Then create the iPhone project and sync it:
```
npx cap add ios
npx cap sync ios
```

Open Cowork on the Mac, connect the `cool-reading-story` folder as the project,
and tell Claude **"start the Mac build"** — from here Claude walks you through
each Xcode screen.

---

## Part C — Build in Xcode (Claude guides each click)

1. Open the project in Xcode:
   ```
   npx cap open ios
   ```
2. In Xcode, on the left, click the blue **App** icon at the top.
3. Go to the **Signing & Capabilities** tab.
   - Tick **Automatically manage signing**.
   - **Team:** choose **Talepop Pty Ltd**. (If it's not listed, click "Add an
     Account" and sign in with your Apple Developer Apple ID.)
4. At the very top of the Xcode window, next to the app name, click the device
   selector and choose **Any iOS Device (arm64)** (not a simulator — a real
   build needs this).
5. Menu bar: **Product → Archive**. This compiles the app (a few minutes).
6. When the **Organizer** window pops up with your archive, click
   **Distribute App → App Store Connect → Upload**, and keep clicking Next /
   accepting the defaults, then **Upload**.
7. Wait for "Upload Successful". The build then "processes" on Apple's side for
   5–30 minutes before it can be attached to the listing.

---

## Part D — Submit (Claude drives this in the browser)

Once the build finishes processing, tell Claude **"the build is uploaded"** and
Claude will, in App Store Connect:
- attach Build 1 to the version 1.0 page,
- answer the export-compliance question (standard HTTPS → exempt),
- press **Add for Review → Submit**.

Everything else on the listing (screenshots, pricing, privacy, age rating,
reviewer login) is already done.

---

## If something looks wrong
Take a screenshot and tell Claude what step you're on. The most common snags are
the Team not being selected (Part C step 3) or picking a simulator instead of
"Any iOS Device" (step 4).

## Note on purchases
This first version ships without in-app purchases switched on (your reviewer
account bypasses the paywall, so review still works). Subscriptions via Apple
in-app purchase are a fast-follow update, after the Paid Apps Agreement is
signed. A parental gate is already in the code for when purchases turn on.
