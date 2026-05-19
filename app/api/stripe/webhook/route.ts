import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createAdminClient } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';

// Stripe's newer API versions move current_period_end to items[0]
function getPeriodEnd(sub: Stripe.Subscription): string | null {
  const root = sub.current_period_end;
  if (root) return new Date(root * 1000).toISOString();
  const item = sub.items?.data?.[0];
  if (item && (item as any).current_period_end) {
    return new Date((item as any).current_period_end * 1000).toISOString();
  }
  return null;
}

export async function POST(request: Request) {
  let event: Stripe.Event;

  try {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
      apiVersion: '2025-01-27.acacia',
    });
    const body = await request.text();
    const sig = request.headers.get('stripe-signature') as string;
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET as string);
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    console.error('[webhook] signature/init error:', msg);
    return NextResponse.json({ error: msg }, { status: 400 });
  }

  console.log('[webhook] received:', event.type);

  try {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
      apiVersion: '2025-01-27.acacia',
    });
    const supabase = createAdminClient();

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.CheckoutSession;
      const userId = session.metadata?.supabase_user_id;

      if (session.mode === 'subscription' && userId && session.subscription) {
        const sub = await stripe.subscriptions.retrieve(session.subscription as string);
        const { error } = await supabase.from('user_subscriptions').update({
          status: 'subscribed',
          stripe_subscription_id: sub.id,
          stripe_customer_id: sub.customer as string,
          current_period_end: getPeriodEnd(sub),
          updated_at: new Date().toISOString(),
        }).eq('user_id', userId);
        if (error) console.error('[webhook] DB error (checkout):', error.message);
        else console.log('[webhook] checkout OK for user', userId);
      } else if (session.mode === 'payment' && session.metadata?.purchase_type === 'extra_book' && userId) {
        const { error } = await supabase.rpc('grant_extra_book_today', { uid: userId });
        if (error) console.error('[webhook] DB error (extra_book):', error.message);
      }
    }

    if (event.type === 'customer.subscription.updated') {
      const sub = event.data.object as Stripe.Subscription;
      const userId = sub.metadata?.supabase_user_id;
      console.log('[webhook] subscription.updated — userId:', userId, 'status:', sub.status);

      if (userId) {
        const status = sub.status === 'active' ? 'subscribed' : 'cancelled';
        const { error } = await supabase.from('user_subscriptions').update({
          status,
          stripe_subscription_id: sub.id,
          current_period_end: getPeriodEnd(sub),
          updated_at: new Date().toISOString(),
        }).eq('user_id', userId);
        if (error) console.error('[webhook] DB error (sub.updated):', error.message);
        else console.log('[webhook] sub.updated OK for user', userId);
      }
    }

    if (event.type === 'customer.subscription.deleted') {
      const sub = event.data.object as Stripe.Subscription;
      const userId = sub.metadata?.supabase_user_id;
      console.log('[webhook] subscription.deleted — userId:', userId);

      if (userId) {
        const { error } = await supabase.from('user_subscriptions').update({
          status: 'cancelled',
          stripe_subscription_id: null,
          current_period_end: null,
          updated_at: new Date().toISOString(),
        }).eq('user_id', userId);
        if (error) console.error('[webhook] DB error (sub.deleted):', error.message);
        else console.log('[webhook] sub.deleted OK for user', userId);
      }
    }
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    const stack = err instanceof Error ? err.stack : '';
    console.error('[webhook] unhandled error:', msg, stack);
    return NextResponse.json({ error: msg }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
