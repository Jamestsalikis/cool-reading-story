import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

/**
 * RevenueCat -> Supabase entitlement sync.
 * RevenueCat posts subscription lifecycle events here. We verify the shared
 * Authorization header, then set the user's status in user_subscriptions.
 *
 * SETUP: in the RevenueCat dashboard add a webhook to
 *   https://www.talepopstories.com/api/revenuecat/webhook
 * with an Authorization header value stored in env REVENUECAT_WEBHOOK_AUTH.
 * The RevenueCat appUserID must be set to the Supabase user id (see lib/iap.ts initIAP).
 */
export async function POST(req: NextRequest) {
  const auth = req.headers.get('authorization');
  if (!process.env.REVENUECAT_WEBHOOK_AUTH || auth !== process.env.REVENUECAT_WEBHOOK_AUTH) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const event = body?.event;
  const appUserId: string | undefined = event?.app_user_id;
  const type: string | undefined = event?.type;
  if (!appUserId || !type) return NextResponse.json({ ok: true });

  const admin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );

  const ACTIVE = ['INITIAL_PURCHASE', 'RENEWAL', 'UNCANCELLATION', 'PRODUCT_CHANGE', 'NON_RENEWING_PURCHASE'];
  const ENDED = ['EXPIRATION', 'BILLING_ISSUE'];
  // NOTE: 'CANCELLATION' = auto-renew turned off but access continues until EXPIRATION.
  // Treat as still subscribed until expiry. TODO: store current_period_end from event.

  if (ACTIVE.includes(type)) {
    await admin.from('user_subscriptions').update({ status: 'subscribed' }).eq('user_id', appUserId);
  } else if (ENDED.includes(type)) {
    await admin.from('user_subscriptions').update({ status: 'cancelled' }).eq('user_id', appUserId);
  }
  return NextResponse.json({ ok: true });
}
