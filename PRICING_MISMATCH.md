# Pricing mismatch (for James to decide)

No amounts were changed on this branch. This lists every place a price is defined or shown,
so one set of numbers can be chosen and applied everywhere. Line numbers are as of branch
`staging/site-fixes-2026-10-29`.

## Summary of the conflict

| Item | Landing page (talepopstories.com) | Web paywall (PaywallModal) | Stripe checkout (what is charged on web) |
|---|---|---|---|
| Monthly | $9.99 / month | A$9.99 / month | 999 cents (9.99) |
| Annual | $99 / year (saves $20.88) | A$95.90 / year, shown as A$7.99 / month, "save 20%" | 9900 cents (99.00) |
| Extra book (subscriber) | 50¢ | A$0.99 | 50 cents |
| Extra book (not subscribed) | 99¢ (FAQ only) | A$0.99 / 99¢ | 99 cents |
| Extra child | $3.99 / month | not shown | 399 cents (3.99) |
| Currency label | plain "$" on the cards (now "A$" for AUD, see below), footer says "Prices shown in AUD" | "A$" | currency picked from visitor country (AUD default, USD for US, CAD for CA) |

So the web paywall's annual price (A$95.90) and subscriber extra-book price (A$0.99) do not
match either the landing page or what Stripe actually charges (A$99.00 and 50c).
The native iOS/Android in-app prices come from App Store Connect / Google Play via RevenueCat
(`lib/iap.ts`), not from this repo, so they could not be checked here.

## Where each price lives

### Single source (landing + Stripe)
- `lib/pricing.ts:45` AUD display: symbol `A$` (was `$`), monthly `9.99`, annual `99`, extraChild `3.99`, monthlyPerStory `33¢`, annualPerStory `24¢`, annualSaving `20.88`
- `lib/pricing.ts:46` CAD display: symbol `$`, monthly `9.99`, annual `99`, extraChild `3.99`, `33¢`, `24¢`, saving `20.88`
- `lib/pricing.ts:47` USD display: symbol `$`, monthly `6.99`, annual `69`, extraChild `3.99`, `23¢`, `19¢`, saving `14.88`
- `lib/pricing.ts:52` AUD Stripe amounts (cents): monthly `999`, annual `9900`, extraChild `399`
- `lib/pricing.ts:53` CAD Stripe amounts: `999`, `9900`, `399`
- `lib/pricing.ts:54` USD Stripe amounts: `699`, `6900`, `399`
- `app/api/geo/route.ts` returns `DISPLAY[currency]` to the landing page by visitor country

### Landing page (`app/page.tsx`)
- `:318` FAQ answer: extra stories `99¢` each, `50¢` when subscribed
- `:366`, `:373` JSON-LD offers: `DISPLAY.aud.monthly` / `DISPLAY.aud.annual`, priceCurrency `AUD`
- `:1000` monthly card: `{symbol}{monthly} per month`
- `:1006` monthly card: "Extra books half price at 50¢" (hard-coded)
- `:1007`, `:1022` "Additional children {symbol}{extraChild} each"
- `:1015` annual card: `{symbol}{annual} billed yearly · saves {symbol}{annualSaving}`
- `:1021` annual card: "Same 50¢ extra books" (hard-coded)
- `:1102` footer: "Prices shown in AUD" / "Also available in USD and CAD" (static, shown to US/CA visitors too)
- `components/SiteChrome.tsx:221` same footer text on other pages

### Web paywall (`components/PaywallModal.tsx`, all hard-coded)
- `:53` "grab an extra one right now for just 99¢"
- `:67` button "Get extra book — A$0.99"
- `:93`, `:95` "grab a single book now for just 99¢"
- `:139` annual "A$95.90/year — save 20%"
- `:142` annual "A$7.99" per month
- `:169` monthly "A$9.99" per month
- `:197` extra book "A$0.99"
- `:204` "Extra books A$0.99 each"

### Other app screens (hard-coded)
- `app/dashboard/DashboardContent.tsx:1063` "grab an extra one now for 99¢"
- `app/dashboard/DashboardContent.tsx:1200` "Add child $3.99/mo"
- `app/dashboard/DashboardContent.tsx:1329` "Subscribe - from A$9.99/month"
- `app/stories/[id]/page.tsx:705`, `:713` "Unlock the next chapter now for 99¢" / "Next chapter 99¢"

### Stripe checkout (`app/api/stripe/checkout/route.ts`)
- `:24`–`:33` Stripe Price IDs from env vars `STRIPE_PRICE_MONTHLY`, `STRIPE_PRICE_ANNUAL` (+ `_USD`, `_CAD`); the subscription line at `:146` actually uses inline `AMOUNTS` from `lib/pricing.ts`
- `:89` extra book `unit_amount`: `50` for subscribers/admin, `99` otherwise, in the visitor's currency
- `:118` description text "($3.99/month)"; `:120` extra child `AMOUNTS[currency].extraChild`

## Suggested fix once a price is chosen
Make `PaywallModal.tsx`, the dashboard and story screens read from `lib/pricing.ts` (like the
landing page does) instead of hard-coded strings, and set the App Store / Play prices to match.
