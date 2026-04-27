import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@/lib/supabase/server';

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

  const supabase = await createClient();

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.CheckoutSession;
    const userId = session.metadata?.supabase_user_id;
    if (userId && session.subscription) {
      const subscription = await stripe.subscriptions.retrieve(session.subscription as string);
      await supabase.from('user_subscriptions').update({
        status: 'subscribed',
        stripe_subscription_id: subscription.id,
        current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
        updated_at: new Date().toISOString(),
      }).eq('user_id', userId);
    }
  }

  if (event.type === 'customer.subscription.updated') {
    const subscription = event.data.object as Stripe.Subscription;
    const userId = subscription.metadata?.supabase_user_id;
    if (userId) {
      const status = subscription.status === 'active' ? 'subscribed' : 'cancelled';
      await supabase.from('user_subscriptions').update({
        status,
        current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
        updated_at: new Date().toISOString(),
      }).eq('user_id', userId);
    }
  }

  if (event.type === 'customer.subscription.deleted') {
    const subscription = event.data.object as Stripe.Subscription;
    const userId = subscription.metadata?.supabase_user_id;
    if (userId) {
      await supabase.from('user_subscriptions').update({
        status: 'cancelled',
        stripe_subscription_id: null,
        current_period_end: null,
        updated_at: new Date().toISOString(),
      }).eq('user_id', userId);
    }
  }

  return NextResponse.json({ received: true });
}
