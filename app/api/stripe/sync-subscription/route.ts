import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';

/**
 * Called by the dashboard on ?subscribed=true redirect.
 * Looks up the user's Stripe customer, finds their active subscription,
 * and writes it to Supabase — a reliable fallback for webhook delays.
 */
export async function POST() {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const admin = createAdminClient();
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2025-01-27.acacia' });

    // Get customer ID from Supabase
    const { data: sub } = await admin
      .from('user_subscriptions')
      .select('stripe_customer_id, status')
      .eq('user_id', user.id)
      .single();

    if (!sub?.stripe_customer_id) {
      return NextResponse.json({ synced: false, reason: 'no_customer_id' });
    }

    // Already subscribed — nothing to do
    if (sub.status === 'subscribed') {
      return NextResponse.json({ synced: true, reason: 'already_subscribed' });
    }

    // Look up active subscriptions for this customer in Stripe
    const subscriptions = await stripe.subscriptions.list({
      customer: sub.stripe_customer_id,
      status: 'active',
      limit: 1,
    });

    if (subscriptions.data.length === 0) {
      return NextResponse.json({ synced: false, reason: 'no_active_subscription' });
    }

    const subscription = subscriptions.data[0];

    // Update Supabase with confirmed subscription data
    const { error } = await admin.from('user_subscriptions').update({
      status: 'subscribed',
      stripe_subscription_id: subscription.id,
      current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
      updated_at: new Date().toISOString(),
    }).eq('user_id', user.id);

    if (error) {
      console.error('sync-subscription DB error:', error);
      return NextResponse.json({ synced: false, reason: 'db_error' }, { status: 500 });
    }

    return NextResponse.json({ synced: true, subscription_id: subscription.id });
  } catch (err) {
    console.error('sync-subscription error:', err);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}

