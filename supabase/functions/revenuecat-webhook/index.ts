// RevenueCat → Supabase entitlement sync.
//
// RevenueCat posts subscription lifecycle events here. We verify a shared
// Authorization header, then set the user's status in user_subscriptions.
// RevenueCat's app_user_id = the Supabase user id (set via initIAP appUserID),
// so events map straight back to the account.
//
// Config:
//   - RevenueCat → Integrations → Webhooks → URL = this function's URL,
//     Authorization header value = the REVENUECAT_WEBHOOK_AUTH function secret.
//   - Deploy with --no-verify-jwt (RevenueCat sends no Supabase JWT; we auth via
//     the header instead).

import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const json = (b: unknown, status = 200) =>
  new Response(JSON.stringify(b), { status, headers: { 'Content-Type': 'application/json' } })

// Shared secret used to verify RevenueCat's requests. Set REVENUECAT_WEBHOOK_AUTH
// as a function secret in production. (The deployed staging function additionally
// falls back to a known token for convenience — do NOT rely on that in prod.)
const EXPECTED = (Deno.env.get('REVENUECAT_WEBHOOK_AUTH') || '').trim()

Deno.serve(async (req: Request) => {
  if (req.method !== 'POST') return json({ error: 'method not allowed' }, 405)

  // Tolerate an optional "Bearer " prefix on the incoming Authorization header.
  const raw = (req.headers.get('Authorization') || '').trim()
  const auth = raw.replace(/^Bearer\s+/i, '')
  if (!EXPECTED || auth !== EXPECTED) {
    console.error('[rc-webhook] 401 auth mismatch — received prefix="' + raw.slice(0, 10) + '" len=' + raw.length)
    return json({ error: 'unauthorized' }, 401)
  }

  const body = await req.json().catch(() => null)
  const event = body?.event
  const appUserId: string | undefined = event?.app_user_id
  const type: string | undefined = event?.type
  console.log('[rc-webhook] event type=' + type + ' env=' + event?.environment + ' user=' + appUserId)
  if (!appUserId || !type) return json({ ok: true })

  const db = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!)

  // One-time consumables (the 99c extra book): credit a book for today instead
  // of touching subscription status. Same RPC the Stripe web webhook uses.
  const EXTRA_BOOK_PRODUCTS = ['talepop_extra_book']
  if (type === 'NON_RENEWING_PURCHASE') {
    const productId: string | undefined = event?.product_id
    if (productId && EXTRA_BOOK_PRODUCTS.includes(productId)) {
      const { data: row } = await db.from('user_subscriptions').select('user_id').eq('user_id', appUserId).maybeSingle()
      if (!row) {
        await db.from('user_subscriptions').insert({ user_id: appUserId, status: 'free', free_stories_remaining: 0, extra_books_today: 1 })
      } else {
        await db.rpc('grant_extra_book_today', { uid: appUserId })
      }
      console.log('[rc-webhook] credited extra book for ' + appUserId)
    } else {
      console.log('[rc-webhook] NON_RENEWING_PURCHASE for unhandled product ' + productId + ' — ignored')
    }
    return json({ ok: true })
  }

  // Types that mean the user currently has access.
  const ACTIVE = ['INITIAL_PURCHASE', 'RENEWAL', 'UNCANCELLATION', 'PRODUCT_CHANGE', 'SUBSCRIPTION_EXTENDED']
  // Types that mean access has ended.
  const ENDED = ['EXPIRATION', 'BILLING_ISSUE']
  // NOTE: CANCELLATION = auto-renew turned off but access continues until
  // EXPIRATION, so we leave the user subscribed until then.

  if (ACTIVE.includes(type)) {
    await db.from('user_subscriptions').upsert(
      { user_id: appUserId, status: 'subscribed' },
      { onConflict: 'user_id' },
    )
  } else if (ENDED.includes(type)) {
    await db.from('user_subscriptions').update({ status: 'cancelled' }).eq('user_id', appUserId)
  }

  return json({ ok: true })
})
