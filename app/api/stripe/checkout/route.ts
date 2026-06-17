import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@/lib/supabase/server';
import { parseBody, checkoutSchema } from '@/lib/validation';
import { currencyFromCountry, AMOUNTS } from '@/lib/pricing';

export const dynamic = 'force-dynamic';

function getStripe() {
  return new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2025-01-27.acacia' });
}

// Map locale â currency. Defaults to AUD.
function currencyFromLocale(locale: string): 'aud' | 'usd' | 'cad' {
  const lower = locale.toLowerCase();
  if (lower === 'en-us' || lower.startsWith('en-us')) return 'usd';
  if (lower === 'en-ca' || lower.startsWith('en-ca') || lower === 'fr-ca') return 'cad';
  return 'aud';
}

// Price IDs per currency
const PRICE_IDS: Record<string, { monthly: string; annual: string }> = {
  aud: {
    monthly: process.env.STRIPE_PRICE_MONTHLY!,
    annual:  process.env.STRIPE_PRICE_ANNUAL!,
  },
  usd: {
    monthly: process.env.STRIPE_PRICE_MONTHLY_USD!,
    annual:  process.env.STRIPE_PRICE_ANNUAL_USD!,
  },
  cad: {
    monthly: process.env.STRIPE_PRICE_MONTHLY_CAD!,
    annual:  process.env.STRIPE_PRICE_ANNUAL_CAD!,
  },
};

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { plan, locale, continue_story_id } = await parseBody(request, checkoutSchema);

    if (!process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json({ error: 'Stripe not configured' }, { status: 500 });
    }

    // Currency follows the visitor's country (matches the landing page), with
    // browser locale as a fallback when the geo header is missing.
    const ipCountry = request.headers.get('x-vercel-ip-country');
    const currency = ipCountry ? currencyFromCountry(ipCountry) : currencyFromLocale(locale);
    const stripe = getStripe();

    // Get or create Stripe customer
    const { data: sub } = await supabase
      .from('user_subscriptions')
      .select('stripe_customer_id, status')
      .eq('user_id', user.id)
      .single();

    let customerId = sub?.stripe_customer_id;
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: { supabase_user_id: user.id },
      });
      customerId = customer.id;
      await supabase
        .from('user_subscriptions')
        .update({ stripe_customer_id: customerId })
        .eq('user_id', user.id);
    }

    // One-time 99c extra book purchase â currency-aware
    if (plan === 'extra_book') {
      const session = await stripe.checkout.sessions.create({
        customer: customerId,
        mode: 'payment',
        payment_method_types: ['card'],
        line_items: [
          {
            price_data: {
              currency,
              product_data: {
                name: 'Extra Book',
                description: 'One additional story book for today',
              },
              unit_amount: (sub?.status === 'subscribed' || sub?.status === 'admin') ? 50 : 99, // 50c for subscribers, 99c otherwise
            },
            quantity: 1,
          },
        ],
        success_url: continue_story_id
          ? `${process.env.NEXT_PUBLIC_SITE_URL}/stories/${continue_story_id}?continue=1`
          : `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard?extra_book=true`,
        cancel_url: continue_story_id
          ? `${process.env.NEXT_PUBLIC_SITE_URL}/stories/${continue_story_id}`
          : `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard`,
        metadata: { supabase_user_id: user.id, purchase_type: 'extra_book' },
      });
      return NextResponse.json({ url: session.url });
    }


    // $3.99/month recurring extra child slot
    if (plan === 'extra_child') {
      const session = await stripe.checkout.sessions.create({
        customer: customerId,
        mode: 'subscription',
        payment_method_types: ['card'],
        line_items: [
          {
            price_data: {
              currency,
              product_data: {
                name: 'Extra Child',
                description: 'Add one additional child profile ($3.99/month)',
              },
              unit_amount: AMOUNTS[currency].extraChild,
              recurring: { interval: 'month' },
            },
            quantity: 1,
          },
        ],
        success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard?extra_child=true`,
        cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard`,
        metadata: { supabase_user_id: user.id, purchase_type: 'extra_child' },
        subscription_data: { metadata: { supabase_user_id: user.id, purchase_type: 'extra_child' } },
      });
      return NextResponse.json({ url: session.url });
    }

    // Subscription plans â pick price ID for user's currency
    const prices = PRICE_IDS[currency] || PRICE_IDS['aud'];
    const priceId = plan === 'annual' ? prices.annual : prices.monthly;

    if (!priceId) {
      return NextResponse.json({ error: 'Stripe price not configured' }, { status: 500 });
    }

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [{ price_data: { currency, product_data: { name: plan === 'annual' ? 'TalePop Annual' : 'TalePop Monthly' }, unit_amount: AMOUNTS[currency][plan === 'annual' ? 'annual' : 'monthly'], recurring: { interval: plan === 'annual' ? 'year' : 'month' } }, quantity: 1 }],
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard?subscribed=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard?cancelled=true`,
      metadata: { supabase_user_id: user.id },
      subscription_data: { metadata: { supabase_user_id: user.id } },
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    if (err instanceof Response) return err;

    console.error('Stripe checkout error:', err);
    return NextResponse.json({ error: 'Failed to create checkout session' }, { status: 500 });
  }
}
