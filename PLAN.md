# TalePop — Web-Wrapper → Native App Conversion Plan

**Goal:** Turn the current Capacitor web-wrapper (which just loads
`https://www.talepopstories.com/dashboard` in a webview) into a real,
self-contained native app whose authenticated screens are **bundled inside the
app** and talk **directly to Supabase** (auth, data) and **directly to the
Supabase Edge Functions** (story generation) — with **no Next.js server,
middleware, or API routes in the mobile path**, proper safe-area handling, and
native in-app purchases via RevenueCat.

The existing Next.js site stays on Vercel for marketing, SEO, privacy/terms, the
daily-stories cron, Stripe web billing, and webhooks. **App and website share the
same Supabase backend.**

> **Status: PLAN ONLY. No code has been changed. Nothing below is executed until
> you approve.**

---

## 1. The core problem (and the core decision)

The current app is a thin shell: `capacitor.config.ts` sets
`server.url = https://www.talepopstories.com/dashboard`, so the OS webview loads
the live website. That's why it "feels like a website": browser behaviour, and
no `env(safe-area-inset-*)` anywhere in the CSS, so the reader's fixed bottom nav
sits under the home indicator.

**Good news from the audit:** almost all the hard work is already done in a
mobile-friendly way.

- **Every authenticated screen is already a client component** (`'use client'`).
  The dashboard is even rendered `dynamic(..., { ssr: false })` — it's already an
  SPA.
- **The dashboard and reader already read Supabase directly from the browser**
  (`supabase.from('stories')…`, `supabase.auth.getUser()`), not via the server.

**The three things that still bind the app to a Next.js server:**

1. **Auth** — login/signup/onboarding call **server actions**
   (`lib/supabase/actions.ts`, `lib/supabase/child-actions.ts`, marked
   `'use server'`), and route protection is done in **`middleware.ts`** (runs on
   the server only).
2. **Story generation & billing** — the client calls **Next.js API routes**
   (`/api/generate-story`, `/api/generate-sequel`, `/api/generate-image`,
   `/api/poll-image`, `/api/stripe/*`). These routes do auth + paywall + prompt
   building, then call the edge function **passing server-only secrets in the
   request body** (`SUPABASE_SERVICE_ROLE_KEY`, `ANTHROPIC_API_KEY`,
   `REPLICATE_API_TOKEN`).
3. **OAuth / email-verification redirects** point at the web
   `${SITE_URL}/auth/callback` and are handled by a server route.

**Central architectural decision:** the paywall + generation orchestration that
lives in the Next.js API routes must move **into the Supabase Edge Functions**,
which must (a) authenticate the caller with their **user JWT** (not a service
key), and (b) hold `ANTHROPIC_API_KEY` / `REPLICATE_API_TOKEN` /
`SERVICE_ROLE_KEY` as **Supabase function secrets** — never shipped in the app
bundle. The bundled app then calls the edge functions directly. The Next.js API
routes stay in place for the website.

---

## 2. Route-by-route audit

Legend — **Bundle?** = ships inside the native app. **Server dep** = what ties it
to a Next.js server today. **Conversion** = what it becomes for the app build.

### Authenticated screens (these get bundled)

| Route | Client? | Server dependency today | Conversion for the app |
|---|---|---|---|
| `app/login/page.tsx` (+layout) | ✅ | `signIn`, `signInWithGoogle` server actions | Call `supabase.auth.signInWithPassword` / `signInWithOAuth` directly from the client |
| `app/signup/page.tsx` (+layout) | ✅ | `signUp`, `resendVerificationEmail` server actions | Client `supabase.auth.signUp` / `resend`; native deep-link email redirect |
| `app/forgot-password/page.tsx` (+layout) | ✅ | (client) password reset | Client `supabase.auth.resetPasswordForEmail`; verify redirect target |
| `app/onboarding/page.tsx` | ✅ | `createChild` server action + `POST /api/generate-story` | Client child insert (RLS) + direct edge-function call |
| `app/dashboard/page.tsx` → `DashboardWrapper` → `DashboardContent.tsx` | ✅ (`ssr:false`) | Direct Supabase reads ✅ already; `/api/generate-story`, `/api/generate-sequel`, `/api/generate-image`, `/api/poll-image`, `/api/stripe/*`, `/api/stripe/sync-subscription` | Reads unchanged; generation → edge fn; billing → RevenueCat on native |
| `app/stories/[id]/page.tsx` | ✅ | Direct Supabase reads+poll ✅; `/api/generate-sequel`, `/api/stripe/checkout` | Generation → edge fn; billing → RevenueCat. **Dynamic route needs rework for static export (see §4.3)** |

### Website-only routes (stay on Vercel, NOT bundled)

| Route | Why it stays on the web |
|---|---|
| `app/page.tsx` (landing, calls `/api/geo`) | Marketing/SEO |
| `app/privacy/page.tsx`, `app/terms/page.tsx` | Server components; legal/SEO. (App can deep-link to these URLs.) |
| `app/admin/page.tsx` | Admin console — web only |
| `app/auth/callback/route.ts` | OAuth/email code exchange for **web**; native uses deep-link handling instead |
| `app/error.tsx`, `app/icon.tsx`, `app/robots.ts`, `app/sitemap.ts`, `app/favicon.ico` | Next.js/SEO infra |

### API routes (all stay on Vercel; mobile path bypasses them)

`account/delete`, `admin/backfill-images`, `cron/daily-stories`, `generate-image`,
`generate-sequel`, `generate-story`, `geo`, `health`, `poll-image`,
`revenuecat/webhook`, `stripe/{checkout,portal,sync-subscription,webhook}`,
`trigger-images`.

- **Keep on Vercel** for the website and for server-to-server work: the RevenueCat
  webhook, Stripe webhooks, and the daily-stories cron **must** remain server-side.
- **The mobile app does not call any of these.** Generation is replaced by direct
  edge-function calls; billing by RevenueCat; account deletion needs a small edge
  function (or keep as a link-out to the web).

### Server-only modules

| Module | Role | Plan |
|---|---|---|
| `middleware.ts` | Route guards + session refresh (server) | Not present in the app build; replaced by a **client `AuthGuard`** |
| `lib/supabase/server.ts` | Cookie-based SSR client | Web only; app uses `lib/supabase/client.ts` |
| `lib/supabase/actions.ts` (`'use server'`) | Auth actions | Web keeps; app uses client auth wrappers |
| `lib/supabase/child-actions.ts` (`'use server'`) | `createChild/updateChild/getChildren` | Port to a client-callable module (RLS-guarded) |
| `lib/supabase/story-actions.ts` (`'use server'`) | Story reads/favourite | Appears unused by the client screens (they query inline). Confirm, then leave web-only |
| `lib/subscription.ts` | Paywall counters | **Port into the edge function** (source of truth for generation) |
| `lib/story-prompt.ts`, `lib/sample-stories/server.ts`, `lib/validation.ts`, `lib/content-filter.ts` | Prompt building, sample lookup, validation | Prompt building + sample lookup move into the edge function; content-filter already client-safe |
| `lib/iap.ts` | RevenueCat routing (currently **stubbed/commented out**) | Wire up in the IAP phase |
| `lib/parentalGate.tsx` | Made-for-Kids parental gate | Already client; reuse before IAP |

### Edge functions (become the app's generation backend)

| Function | Today | Needs |
|---|---|---|
| `supabase/functions/generate-story-text` | Receives prompt **and secrets** in the body from the trusted Vercel route; inserts placeholder; generates text+images in background | **Verify caller JWT**; read secrets from **function secrets**; port paywall + prompt building + sample-story shortcut so the client can call it directly and safely |
| `supabase/functions/generate-story-images` | Image generation | Same hardening; secrets server-side; JWT auth |

---

## 3. Target architecture

```
        ┌──────────────────────────── Native app (Capacitor) ────────────────────────────┐
        │  Bundled static SPA (webDir), no browser chrome, safe-area aware                │
        │                                                                                 │
        │   login / signup / onboarding / dashboard / reader                              │
        │        │                         │                         │                    │
        │        │ supabase-js (anon key + │ direct fetch w/ user    │ RevenueCat plugin  │
        │        ▼ user JWT)               ▼ JWT                     ▼ (native IAP)        │
        └────────┼─────────────────────────┼─────────────────────────┼───────────────────┘
                 │                          │                         │
                 ▼                          ▼                         ▼
        Supabase Auth + DB (RLS)   Supabase Edge Functions     App Store / Play Billing
        profiles, children,        generate-story-text,               │
        stories, user_subscriptions  generate-story-images            ▼
                 ▲                    (secrets held server-side)  RevenueCat  ──webhook──►  Vercel /api/revenuecat/webhook ──► Supabase
                 │
   Website (Vercel, unchanged): marketing, privacy/terms, Stripe web billing,
   Stripe/RevenueCat webhooks, daily-stories cron — same Supabase backend.
```

**Security invariant:** the app bundle ships only the Supabase **anon** key and
RevenueCat **public** SDK keys. Every privileged operation is authorised by the
user's JWT and enforced by **RLS** (data) or by the **edge function** (generation
+ paywall). No service-role key, Anthropic key, Replicate token, or Stripe secret
ever leaves the server.

---

## 4. Key risks / blockers to settle early

**4.1 Secrets currently flow through the client-reachable path.**
`/api/generate-story` passes `SUPABASE_SERVICE_ROLE_KEY`, `ANTHROPIC_API_KEY`,
`REPLICATE_API_TOKEN` in the edge-function request body. That is safe only because
a trusted Vercel server calls it. For direct app calls, the edge function must own
those secrets and authenticate the user. **This is the largest single work item
(Phase 4).**

**4.2 Row Level Security must be airtight.** The app reads/writes Supabase directly
with the anon key + user JWT, so RLS is the *only* thing stopping user A from
reading user B's children/stories/subscription. The current webview uses the same
direct-read pattern, so policies likely exist — but this must be **audited and
proven** (Phase 3) before we rely on it as the sole gate.

**4.3 Static export vs. the dynamic reader route.** A Capacitor `webDir` is static
files. Next.js `output: 'export'` cannot serve a truly dynamic `/stories/[id]`
route (no server to resolve unknown IDs), and it **refuses to build if API routes
or server actions are present**. Two consequences:
  - The reader must read its id from a query string/hash (e.g. `/story?id=…`) for
    the app build, or we pre-render a shell. (Phase 5.)
  - The app build must exclude `app/api/**`, `middleware.ts`, and server actions
    from the export. Proposed mechanism: a `BUILD_TARGET=capacitor` flag +
    build script that swaps in an export-only `next.config` and temporarily
    relocates server-only files. **We prove this in a Phase 0 spike** before
    committing to it, because it's the riskiest structural assumption.

**4.4 Native auth redirects.** Email/password login returns a session inline (easy).
**Google OAuth** and **email-verification links** currently redirect to the web
`/auth/callback`; in the app they must round-trip through a custom URL scheme /
universal link and be completed with a deep-link listener. Requires adding
`@capacitor/app` (+ likely `@capacitor/browser`), which are **not yet installed**.

**4.5 Store billing rules.** `lib/iap.ts` already encodes the intent (AU/CA native
users → store IAP via RevenueCat; US + all web → Stripe) but the RevenueCat calls
are commented out and no offerings/keys exist yet. Apple/Google will reject digital
goods bought via Stripe inside the app for most regions — RevenueCat wiring is
release-blocking for iOS (Phase 6).

---

## 5. Phase-by-phase plan

Each phase ends with: a green `npm run build` (web), exactly what to test in the
browser, how to run on a simulator (`npx cap sync` → `npx cap run ios` /
`npx cap run android`), and a commit. **I stop and wait for your confirmation
after every phase. I never push to `main` without telling you.** iOS
archive/build is Mac-only — where a phase needs it, I'll give you the exact Xcode
steps to run on your Mac.

### Phase 0 — De-risking spike (½ day)
Prove the two riskiest assumptions before real work:
- A `BUILD_TARGET=capacitor` static export that excludes `app/api/**` +
  `middleware.ts` actually builds and produces `webDir` files.
- Capacitor can serve that bundle locally (temporarily point `webDir` at the
  export, no `server.url`) and it loads in the iOS simulator / Android emulator.

**Deliverable:** a throwaway proof + a written go/no-go on the export approach (vs.
fallback options). **Test:** app opens to a bundled placeholder, offline, no
browser bar.

### Phase 1 — Safe areas + native shell polish (½ day)  ← quick, visible win
- Add `env(safe-area-inset-*)` handling in `app/globals.css` and to the reader's
  fixed top bar + bottom nav and the dashboard bars. (`viewportFit: 'cover'` is
  already set in `app/layout.tsx`.)
- Add StatusBar / Keyboard Capacitor config for native feel.

**Test now, even against the current remote build:** `npx cap sync` → run on
simulator; confirm the reader's Back/Next buttons and page dots clear the home
indicator and notch in portrait + landscape.

### Phase 2 — Client-side auth + guard (1 day)
- Add client auth wrappers (`signInWithPassword`, `signUp`, `resend`,
  `signInWithOAuth`, `resetPasswordForEmail`, `signOut`) and switch login/signup/
  forgot-password to them **behind the app build** (web keeps server actions).
- Add a client `AuthGuard` that replaces `middleware.ts` for protected screens
  (redirect to `/login` when no session; bounce authed users away from login).
- Add native deep-link handling for OAuth + email verification
  (`@capacitor/app` listener + Supabase redirect URL config).

**Test:** browser — sign in/out, protected-route redirects, Google OAuth, signup
+ verification, password reset. Simulator — email/password end-to-end; OAuth
returns into the app.

### Phase 3 — Client-side data actions + RLS audit (½–1 day)
- Port `createChild` / `updateChild` / `getChildren` to a client-callable module
  used by onboarding + dashboard (web can keep the server actions).
- **Audit and, if needed, harden RLS** on `children`, `stories`,
  `user_subscriptions`, `admin_emails`, `feedback` (and Storage buckets for
  images). Prove user isolation with a second test account.

**Test:** create/edit a child and confirm the row is scoped to the user; attempt
cross-account reads and confirm they're blocked.

### RLS audit results (Phase 3, staging `odttjvcphckewtmjpebc`)

RLS is enabled on all public tables and **data isolation is correct** — every
policy on `children`, `stories`, `profiles`, `feedback`, and `user_subscriptions`
(reads) is scoped by `auth.uid()`. The audit surfaced a **paywall-bypass class**
that only becomes exploitable once the app talks to Supabase directly (the web
app never exposed it). These are fixed in Phase 4 as a security batch:

1. **[HIGH] Entitlement RPCs are client-callable.** `grant_extra_book_today`,
   `increment_extra_child_slots`, `decrement_extra_child_slots`,
   `decrement_free_stories`, `increment_stories_today`,
   `increment_stories_this_month` are `SECURITY DEFINER` and `EXECUTE`-able by
   `authenticated`/`anon`. A user could self-grant paid books/child-slots or
   reset quotas. → Revoke EXECUTE from anon/authenticated once the edge function
   (service role) is the sole caller. (Can't revoke earlier — the current web
   `/api/generate-story` calls them via the user session.)
2. **[HIGH] `user_subscriptions` UPDATE is not column-restricted.** A client
   could set its own `status='subscribed'`. Only `has_seen_tour` is a legit
   client write. → Column-level GRANT for `has_seen_tour`; edge function writes
   status/counters via service role. Also add a server-side check (DB trigger or
   edge fn) for the free-child limit currently enforced only in `child-client.ts`.
3. **[MED] Storage `story-images` writes open to any authenticated user**
   (INSERT/UPDATE not path-scoped). → Restrict writes to service role.
4. **[LOW] Public bucket allows listing** all files. → Drop the broad listing
   SELECT policy (object URLs still work).
5. **[LOW] Leaked-password protection disabled** (Auth setting) — enable in the
   Supabase dashboard.

### Phase 4 — Harden edge functions for direct client calls (2–3 days)  ← biggest
- Move `ANTHROPIC_API_KEY`, `REPLICATE_API_TOKEN`, `SERVICE_ROLE_KEY` into
  **Supabase function secrets**; stop accepting them in the request body.
- Add **JWT verification** in the edge functions (identify the user from the
  `Authorization` header).
- Port paywall (`lib/subscription.ts`), prompt building (`lib/story-prompt.ts`),
  the sample-story shortcut, and validation into the edge function so it is the
  self-contained, safe source of truth.
- Add a client `generation` lib that calls `generate-story-text` /
  `generate-story-images` directly (story, sequel, and per-page image + poll),
  used by dashboard + reader **in the app build**. Web keeps the API routes.

**Test:** browser (staging edge fns) — generate a first (sample) story, an
AI story, a sequel; images populate; paywall/daily limits behave. Simulator —
same, hitting the deployed edge functions with no Next server involved.

### Phase 5 — Reader routing for static export (½–1 day)
- Give the reader an app-friendly route that carries the id without a server
  (`/story?id=…` or hash), keeping `/stories/[id]` for the web. Update all
  in-app navigations (`router.push`, `Link`) accordingly.

**Test:** open a book, navigate pages, favourite, end-of-book CTA, "next chapter",
Back-to-library — all inside the bundled app.

### Phase 6 — RevenueCat in-app purchases (1–2 days)
- Implement `lib/iap.ts` for real (configure, offerings, `purchasePackage`,
  restore) behind the existing region routing (AU/CA native → IAP; US/web →
  Stripe).
- Reuse the existing parental gate before purchase. Confirm the RevenueCat →
  `/api/revenuecat/webhook` → Supabase `user_subscriptions` path.
- Replace the reader/dashboard Stripe `checkout`/`portal` calls with IAP on native.

**Test:** Android emulator with a Play Billing test account (subscribe, extra
book, restore; webhook flips `user_subscriptions`). iOS IAP requires a sandbox
tester on a real device / TestFlight (Mac) — I'll give you the steps.

### Phase 7 — Serve locally + toggle + ship prep (½ day)
- Switch `capacitor.config.ts` to serve from `webDir` (remove `server.url`), with
  an easy env toggle (`CAP_SERVER_URL`) to point back at staging for testing.
- Final `npx cap sync`; Android run/build here.
- Hand off the Mac/Xcode iOS archive steps (you already have
  `MAC-BUILD-RUNBOOK.md` / `IOS-BUILD-BEGINNER-GUIDE.md`; I'll reconcile them).

**Test:** fully offline-bundled app on both platforms; flip the toggle to staging
and back.

---

## 6. Rough effort

| Phase | Effort |
|---|---|
| 0 — Spike | ½ day |
| 1 — Safe areas | ½ day |
| 2 — Client auth + guard | 1 day |
| 3 — Client data + RLS | ½–1 day |
| 4 — Edge-function hardening | 2–3 days |
| 5 — Reader routing | ½–1 day |
| 6 — RevenueCat IAP | 1–2 days |
| 7 — Local serve + ship prep | ½ day |
| **Total** | **~6.5–9.5 days** |

The critical path and the real risk both live in **Phase 4** (plus the **Phase 0**
export spike). Everything else is mechanical.

---

## 7. Decisions locked in

- **Bundle approach (§4.3):** the **Phase 0 spike decides.** I run the export
  proof first and come back with a go/no-go on build-flag vs. dedicated SPA.
- **Who runs the app:** **in-session** — I run `cap sync` / `cap run ios` /
  `cap run android` on this Mac and iterate directly.
- **Staging:** **approved** — I may deploy the hardened edge functions to staging
  (`odttjvcphckewtmjpebc`) in Phase 4 and point the app at it for all testing.
- **RevenueCat:** **partially configured** — Phase 6 begins with an audit of
  what exists (apps/products/offering/keys) and fills the gaps.

## 7b. Still to confirm (not blocking Phase 0)

1. **Account deletion in-app** (Apple requires it): small new edge function, or
   link out to the web account page? — decide by Phase 6.
2. **Bundled screen set:** confirm the app bundles login, signup, forgot-password,
   onboarding, dashboard, reader — with admin, landing, privacy, terms staying
   web-only (privacy/terms deep-linked to the site).

---

*Ready to start Phase 0 (de-risking spike) on your go-ahead.*
