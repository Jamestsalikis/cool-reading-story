import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createAdminClient } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2025-01-27.acacia' });
  const body = await request.text();
  const sig = request.headers.get('stripe-signature')!;

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (err) {
    console.error('Webhook signature error:', err);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  // Use service-role client — webhook has no user session, anon key is blocked by RLS
  const supabase = createAdminClient();

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.CheckoutSession;
    const userId = session.metadata?.supabase_user_id;

    if (session.mode === 'subscription' && userId && session.subscription) {
      const subscription = await stripe.subscriptions.retrieve(session.subscription as string);
      const { error } = await supabase.from('user_subscriptions').update({
        status: 'subscribed',
        stripe_subscription_id: subscription.id,
        stripe_customer_id: subscription.customer as string,
        current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
        updated_at: new Date().toISOString(),
      }).eq('user_id', userId);
      if (error) console.error('Webhook DB error (checkout.session.completed):', error);
    } else if (session.mode === 'payment' && session.metadata?.purchase_type === 'extra_book' && userId) {
      await supabase.rpc('grant_extra_book_today', { uid: userId });
    }
  }

  if (event.type === 'customer.subscription.updated') {
    const subscription = event.data.object as Stripe.Subscription;
    const userId = subscription.metadata?.supabase_user_id;
    if (userId) {
      const status = subscription.status === 'active' ? 'subscribed' : 'cancelled';
      const { error } = await supabase.from('user_subscriptions').update({
        status,
        stripe_subscription_id: subscription.id,
        current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
        updated_at: new Date().toISOString(),
      }).eq('user_id', userId);
      if (error) console.error('Webhook DB error (subscription.updated):', error);
    }
  }

  if (event.type === 'customer.subscription.deleted') {
    const subscription = event.data.object as Stripe.Subscription;
    const userId = subscription.metadata?.supabase_user_id;
    if (userId) {
      const { error } = await supabase.from('user_subscriptions').update({
        status: 'cancelled',
        stripe_subscription_id: null,
        current_period_end: null,
        updated_at: new Date().toISOString(),
      }).eq('user_id', userId);
      if (error) console.error('Webhook DB error (subscription.deleted):', error);
    }
  }

  return NextResponse.json({ received: true });
}

