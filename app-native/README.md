# TalePop — Native App (`app-native/`)

This is the **native app** front end: a self-contained Next.js project that
builds a fully static bundle shipped inside the Capacitor iOS/Android app. It is
**separate from the website** (the Next.js app at the repo root).

They share one Supabase backend (same database, auth, storage, edge functions),
so a user's account, stories, images, and subscription are the same whether they
use the app or the website.

---

## ⚠️ The one rule: edit BOTH when you change a shared screen

The app and the website are now **two separate copies** of the screens. There is
no shared code between them. That means:

> **If you change a screen that exists in both (dashboard, reader, onboarding,
> login, signup, forgot-password), you must make the change in BOTH places:**
> - Website: repo root — `app/`, `lib/`, `components/`
> - App: this folder — `app-native/app/`, `app-native/lib/`, `app-native/components/`

If you only change one, the app and website will drift apart (e.g. a fix on the
web won't appear in the app). This duplication was a deliberate choice: it
guarantees that working on the app can never break the website.

**Things that live in ONLY one place** (no need to duplicate):
- Website-only: marketing pages, `/api/*` routes, `middleware.ts`, Stripe web
  billing, the daily-stories cron, SEO (sitemap/robots/icon).
- App-only: this folder, `supabase/functions/app-generate`, `scripts/build-cap.sh`,
  `capacitor.config.ts`, the native `ios/` project.

---

## How the app differs from the website

Same screens and look, but the plumbing differs (because the app has no Next.js
server):

| | Website (root) | App (`app-native/`) |
|---|---|---|
| Auth | server actions (`lib/supabase/actions.ts`) | client auth (`lib/supabase/auth-client.ts`) |
| Route protection | `middleware.ts` (server) | `<AuthGuard>` (client) |
| Child create/edit | server action | client (`lib/supabase/child-client.ts`) |
| Story generation | Next `/api/*` routes | `app-generate` edge function (`lib/generation-client.ts`) |
| Reader URL | `/stories/[id]` | `/story?id=` (static) |
| Build | `next build` (server, on Vercel) | `output: export` (static) → `capacitor/www` |

Same **behavior** in both: free user's first book per child = curated sample
story (no AI); then the paywall; later books use AI.

---

## Build & run

Always build via the script from the repo root (it targets this project):

```bash
./scripts/build-cap.sh            # builds app-native → capacitor/www
npx cap sync ios && npx cap run ios     # needs a Mac with full Xcode
# Android: npx cap sync android && npx cap run android
```

**Node version:** the build must run on **Node 20 or 22** (LTS). Node 24/25 have a
broken `localStorage` global that crashes `supabase-js` during prerender. The
build script prefers `/opt/homebrew/opt/node@22`; if you're on Node 24+, install
node@22 (`brew install node@22`).

### Point the app at a server instead of the bundle (for testing)
`capacitor.config.ts` serves the local bundle by default. To test against a
running server instead:
```bash
CAP_SERVER_URL=http://<your-LAN-ip>:3000 npx cap sync ios   # local dev server
CAP_SERVER_URL=https://www.talepopstories.com/dashboard npx cap sync ios  # live site
```

---

## Structure

```
app-native/
  app/
    page.tsx            # launch splash → routes to /dashboard or /login
    login, signup, forgot-password, onboarding, dashboard, story/
    layout.tsx, globals.css   # globals.css includes safe-area (--safe-*) handling
  lib/
    supabase/{client, auth-client, child-client}.ts
    generation-client.ts       # calls the app-generate edge function
    sample-stories/{index,client}.ts + 276 templates (bundled as lazy chunks)
    content-filter, iap, parentalGate, pricing, useIsMobile
  components/{AuthGuard, StoryReader, FeedbackModal, PaywallModal}.tsx
  next.config.ts, tsconfig.json, package.json
```

**Symlinks (not committed except `public`):** `node_modules` → `../node_modules`,
`.env.local` → `../.env.local`, `public` → `../public`. The build script
recreates the first two if missing. Because deps are shared via symlink, run
`npm install` at the **repo root**, not here.

---

## Backend: `app-generate` edge function

Story generation goes to `supabase/functions/app-generate` (repo root), which
authenticates the user's JWT, enforces the paywall + daily limits with the
service role, builds the prompt, and hands off to `generate-story-text` (which
also fires image generation). It needs these **function secrets** set in the
Supabase dashboard (Edge Functions → Manage secrets):
- `ANTHROPIC_API_KEY`
- `REPLICATE_API_TOKEN`

(`SUPABASE_URL` / `SUPABASE_ANON_KEY` / `SUPABASE_SERVICE_ROLE_KEY` are injected
automatically.)

---

## Not done yet
- **In-app purchases (RevenueCat):** the subscribe / "buy next chapter" buttons
  still call the Stripe `/api` routes, which don't exist in the bundle — they
  no-op in the app until RevenueCat is wired (`lib/iap.ts` is stubbed).
- **Security lockdown:** `supabase/migrations/0001_app_security_lockdown.sql`
  (revoke client-callable entitlement RPCs, etc.) is written but not yet applied.
- **iOS build/submission** must be done on a Mac in Xcode.
