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

    console.log('[webhook] event:', event.type);

    let supabase;
    try {
      supabase = createAdminClient();
      console.log('[webhook] supabase client created');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error('[webhook] createAdminClient failed:', msg);
      return NextResponse.json({ error: 'createAdminClient failed: ' + msg }, { status: 500 });
    }

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;
      const userId = session.metadata?.supabase_user_id;
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
        if (error) console.error('[webhook] DB error (checkout):', JSON.stringify(error));
      } else if (session.mode === 'payment' && session.metadata?.purchase_type === 'extra_book' && userId) {
        const { error } = await supabase.rpc('grant_extra_book_today', { uid: userId });
        if (error) console.error('[webhook] DB error (extra_book):', JSON.stringify(error));
      }
    }

    if (event.type === 'customer.subscription.updated') {
      const subscription = event.data.object as Stripe.Subscription;
      const userId = subscription.metadata?.supabase_user_id;
      console.log('[webhook] subscription.updated userId:', userId);
      if (userId) {
        const status = subscription.status === 'active' ? 'subscribed' : 'cancelled';
        const periodEnd = subscription.current_period_end
          ? new Date(subscription.current_period_end * 1000).toISOString()
          : null;
        const { error } = await supabase.from('user_subscriptions').update({
          status,
          stripe_subscription_id: subscription.id,
          current_period_end: periodEnd,
          updated_at: new Date().toISOString(),
        }).eq('user_id', userId);
        if (error) {
          console.error('[webhook] DB error (subscription.updated):', JSON.stringify(error));
          return NextResponse.json({ error: 'DB update failed: ' + JSON.stringify(error) }, { status: 500 });
        }
        console.log('[webhook] subscription.updated: OK');
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
        if (error) console.error('[webhook] DB error (subscription.deleted):', JSON.stringify(error));
      }
    }

    return NextResponse.json({ received: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    const stack = err instanceof Error ? (err.stack ?? '') : '';
    console.error('[webhook] unhandled error:', message, stack);
    return NextResponse.json({ error: message, stack: stack.split('
').slice(0, 5) }, { status: 500 });
  }
}
