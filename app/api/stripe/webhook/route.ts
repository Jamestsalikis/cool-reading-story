import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createAdminClient } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
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

    console.log('Webhook event type:', event.type);

    const supabase = createAdminClient();

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;
      const userId = session.metadata?.supabase_user_id;
      console.log('checkout.session.completed userId:', userId, 'mode:', session.mode);

      if (session.mode === 'subscription' && userId && session.subscription) {
        const subscription = await stripe.subscriptions.retrieve(session.subscription as string);
        const periodEnd = subscription.current_period_end
          ? new Date(subscription.current_period_end * 1000).toISOString()
          : null;
        const { error } = await supabase.from('user_subscriptions').update({
          status: 'subscribed',
          stripe_subscription_id: subscription.id,
          stripe_customer_id: subscription.customer as string,
          current_period_end: periodEnd,
          updated_at: new Date().toISOString(),
        }).eq('user_id', userId);
        if (error) console.error('Webhook DB error (checkout.session.completed):', JSON.stringify(error));
        else console.log('checkout.session.completed: DB updated OK for user', userId);
      } else if (session.mode === 'payment' && session.metadata?.purchase_type === 'extra_book' && userId) {
        const { error } = await supabase.rpc('grant_extra_book_today', { uid: userId });
        if (error) console.error('Webhook DB error (extra_book):', JSON.stringify(error));
      }
    }

    if (event.type === 'customer.subscription.updated') {
      const subscription = event.data.object as Stripe.Subscription;
      const userId = subscription.metadata?.supabase_user_id;
      console.log('subscription.updated userId:', userId, 'status:', subscription.status, 'period_end:', subscription.current_period_end);

      if (userId) {
        const status = subscription.status === 'active' ? 'subscribed' : 'cancelled';
        const periodEnd = subscription.current_period_end
          ? new Date(subscription.current_period_end * 1000).toISOString()
          : null;
        console.log('Attempting DB update: status=', status, 'periodEnd=', periodEnd);
        const { error } = await supabase.from('user_subscriptions').update({
          status,
          stripe_subscription_id: subscription.id,
          current_period_end: periodEnd,
          updated_at: new Date().toISOString(),
        }).eq('user_id', userId);
        if (error) console.error('Webhook DB error (subscription.updated):', JSON.stringify(error));
        else console.log('subscription.updated: DB updated OK for user', userId);
      } else {
        console.log('subscription.updated: no userId in metadata, skipping');
      }
    }

    if (event.type === 'customer.subscription.deleted') {
      const subscription = event.data.object as Stripe.Subscription;
      const userId = subscription.metadata?.supabase_user_id;
      console.log('subscription.deleted userId:', userId);

      if (userId) {
        const { error } = await supabase.from('user_subscriptions').update({
          status: 'cancelled',
          stripe_subscription_id: null,
          current_period_end: null,
          updated_at: new Date().toISOString(),
        }).eq('user_id', userId);
        if (error) console.error('Webhook DB error (subscription.deleted):', JSON.stringify(error));
        else console.log('subscription.deleted: DB updated OK for user', userId);
      }
    }

    return NextResponse.json({ received: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    const stack = err instanceof Error ? err.stack : '';
    console.error('Webhook unhandled error:', message, stack);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
