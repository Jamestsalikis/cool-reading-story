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

Deno.serve(async (req: Request) => {
  if (req.method !== 'POST') return json({ error: 'method not allowed' }, 405)

  const expected = Deno.env.get('REVENUECAT_WEBHOOK_AUTH')
  const auth = req.headers.get('Authorization')
  if (!expected || auth !== expected) return json({ error: 'unauthorized' }, 401)

  const body = await req.json().catch(() => null)
  const event = body?.event
  const appUserId: string | undefined = event?.app_user_id
  const type: string | undefined = event?.type
  if (!appUserId || !type) return json({ ok: true })

  const db = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!)

  // Types that mean the user currently has access.
  const ACTIVE = ['INITIAL_PURCHASE', 'RENEWAL', 'UNCANCELLATION', 'PRODUCT_CHANGE', 'NON_RENEWING_PURCHASE', 'SUBSCRIPTION_EXTENDED']
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
