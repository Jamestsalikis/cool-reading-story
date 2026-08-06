'use client';

import { useState } from 'react';
import { verifyParent } from '@/lib/parentalGate';
import { isNativeApp, purchaseSubscription, restorePurchases } from '@/lib/iap';
import { createClient } from '@/lib/supabase/client';

// After a purchase, wait for the RevenueCat webhook to flip the account to
// 'subscribed' in Supabase (usually a couple seconds), so the reloaded app
// reflects the new status. Times out gracefully.
async function waitForSubscribed(): Promise<void> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;
  for (let i = 0; i < 12; i++) {
    await new Promise((r) => setTimeout(r, 1500));
    const { data } = await supabase.from('user_subscriptions').select('status').eq('user_id', user.id).maybeSingle();
    if (data?.status === 'subscribed') return;
  }
}

type Props = {
  reason: 'free_exhausted' | 'monthly_limit' | 'no_subscription' | 'daily_limit';
  onClose: () => void;
};

export default function PaywallModal({ reason, onClose }: Props) {
  const [loading, setLoading] = useState<'monthly' | 'annual' | 'extra_book' | 'restore' | null>(null);
  const [error, setError] = useState('');

  const handleCheckout = async (plan: 'monthly' | 'annual' | 'extra_book') => {
    if (!(await verifyParent())) return;
    setError('');
    setLoading(plan);

    // Native app: subscriptions go through Apple IAP (RevenueCat).
    if (isNativeApp()) {
      if (plan === 'extra_book') {
        setError('Single extra books aren’t available in the app yet — a subscription unlocks a new story every day.');
        setLoading(null);
        return;
      }
      const result = await purchaseSubscription(plan);
      if (result.ok) {
        // Wait for the RevenueCat webhook to sync the subscription, then reload
        // from the entry point so the app re-reads the new status.
        await waitForSubscribed();
        window.location.href = '/';
        return;
      }
      if (result.cancelled) { setLoading(null); return; }
      setError(result.error || 'Purchase failed. Please try again.');
      setLoading(null);
      return;
    }

    // Web: Stripe checkout.
    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan, locale: navigator.language }),
      });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
    } catch {
      setLoading(null);
    }
  };

  const handleRestore = async () => {
    setError('');
    setLoading('restore');
    const result = await restorePurchases();
    if (result.ok) { window.location.href = '/'; return; }
    setError(result.error || 'No previous purchases found to restore.');
    setLoading(null);
  };

  // Open legal pages in the in-app browser (falls back to a new tab on the web).
  const openLegal = (url: string) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const B = (window as any)?.Capacitor?.Plugins?.Browser;
    if (B?.open) B.open({ url }); else window.open(url, '_blank');
  };

  // Daily limit — show a simpler modal with 99c option
  if (reason === 'daily_limit') {
    return (
      <div style={{
        position: 'fixed', inset: 0, zIndex: 200,
        background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(4px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px',
      }}>
        <div style={{
          background: '#FFFEF9', borderRadius: '20px', padding: '40px 32px',
          maxWidth: '420px', width: '100%',
          boxShadow: '0 24px 60px rgba(0,0,0,0.2)',
        }}>
          <div style={{ textAlign: 'center', marginBottom: '28px' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#FBF0F0', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#741515" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>
              </svg>
            </div>
            <h2 style={{ fontFamily: 'Georgia, serif', fontSize: '1.4rem', color: '#1C1614', marginBottom: '10px' }}>
              {"You've used today's book"}
            </h2>
            <p style={{ color: '#6B5E4E', fontSize: '0.9rem', lineHeight: 1.6 }}>
              Your next free book unlocks at midnight. Or grab an extra one right now for just 99¢.
            </p>
          </div>

          <button
            onClick={() => handleCheckout('extra_book')}
            disabled={!!loading}
            style={{
              width: '100%', padding: '16px 20px', borderRadius: '12px',
              border: '2px solid #741515', background: '#741515', color: '#fff',
              cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1,
              fontWeight: '700', fontSize: '1rem', marginBottom: '12px',
            }}
          >
            {loading === 'extra_book' ? 'Redirecting...' : 'Get extra book — A$0.99'}
          </button>

          {error && (
            <p style={{ fontSize: '0.8rem', color: '#B91C1C', textAlign: 'center', marginBottom: '8px' }}>{error}</p>
          )}

          <p style={{ fontSize: '0.75rem', color: '#C8BEAA', textAlign: 'center', marginBottom: '16px' }}>
            One-time payment · Unlocks 1 additional book for today
          </p>

          <button
            onClick={onClose}
            style={{ width: '100%', background: 'none', border: 'none', color: '#9B8B7A', cursor: 'pointer', fontSize: '0.875rem', padding: '8px' }}
          >
            {"I'll wait until tomorrow"}
          </button>
        </div>
      </div>
    );
  }

  // Standard subscription paywall
  const headings: Record<Exclude<Props['reason'], 'daily_limit'>, string> = {
    free_exhausted: "You've used your free story",
    monthly_limit: "You've reached your stories this month",
    no_subscription: 'Subscribe to start generating stories',
  };

  const subtext: Record<Exclude<Props['reason'], 'daily_limit'>, string> = {
    free_exhausted: 'Subscribe to unlock 1 personalised bedtime story every day — or grab a single book now for just 99¢.',
    monthly_limit: 'Your stories reset on the 1st. Subscribe to an annual plan for the best value.',
    no_subscription: 'Subscribe to unlock 1 personalised bedtime story every day — or grab a single book now for just 99¢.',
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 200,
      background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px',
    }}>
      <div style={{
        background: '#FFFEF9', borderRadius: '20px', padding: '40px 32px',
        maxWidth: '460px', width: '100%',
        boxShadow: '0 24px 60px rgba(0,0,0,0.2)',
      }}>
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#FBF0F0', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#741515" strokeWidth="2">
              <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
            </svg>
          </div>
          <h2 style={{ fontFamily: 'Georgia, serif', fontSize: '1.4rem', color: '#1C1614', marginBottom: '8px' }}>
            {headings[reason as Exclude<Props['reason'], 'daily_limit'>]}
          </h2>
          <p style={{ color: '#6B5E4E', fontSize: '0.9rem', lineHeight: 1.6 }}>
            {subtext[reason as Exclude<Props['reason'], 'daily_limit'>]}
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' }}>
          {/* Annual — highlighted */}
          <button
            onClick={() => handleCheckout('annual')}
            disabled={!!loading}
            style={{
              padding: '16px 20px', borderRadius: '12px', border: '2px solid #741515',
              background: '#741515', color: '#fff', cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.7 : 1, textAlign: 'left', position: 'relative',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <p style={{ fontWeight: '700', fontSize: '0.95rem', marginBottom: '3px' }}>
                  {loading === 'annual' ? 'Redirecting...' : 'Annual plan'}
                </p>
                <p style={{ fontSize: '0.8rem', opacity: 0.8 }}>A$95.90/year — save 20%</p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <p style={{ fontWeight: '700', fontSize: '1.1rem' }}>A$7.99</p>
                <p style={{ fontSize: '0.72rem', opacity: 0.75 }}>per month</p>
              </div>
            </div>
            <div style={{ position: 'absolute', top: '-10px', right: '12px', background: '#C4784A', color: '#fff', fontSize: '0.65rem', fontWeight: '800', padding: '3px 10px', borderRadius: '20px', letterSpacing: '0.06em' }}>
              BEST VALUE
            </div>
          </button>

          {/* Monthly */}
          <button
            onClick={() => handleCheckout('monthly')}
            disabled={!!loading}
            style={{
              padding: '16px 20px', borderRadius: '12px', border: '1.5px solid #E8E0D0',
              background: '#fff', color: '#1C1614', cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.7 : 1, textAlign: 'left',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            }}
          >
            <div>
              <p style={{ fontWeight: '600', fontSize: '0.95rem', marginBottom: '3px' }}>
                {loading === 'monthly' ? 'Redirecting...' : 'Monthly plan'}
              </p>
              <p style={{ fontSize: '0.8rem', color: '#9B8B7A' }}>Cancel anytime</p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <p style={{ fontWeight: '700', fontSize: '1.1rem' }}>A$9.99</p>
              <p style={{ fontSize: '0.72rem', color: '#9B8B7A' }}>per month</p>
            </div>
          </button>
          {/* 99c single book — only for free_exhausted and no_subscription */}
          {(reason === 'free_exhausted' || reason === 'no_subscription') && (
            <>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', margin: '4px 0' }}>
                <div style={{ flex: 1, height: '1px', background: '#F0E8DC' }} />
                <span style={{ fontSize: '0.72rem', color: '#C8BEAA' }}>or</span>
                <div style={{ flex: 1, height: '1px', background: '#F0E8DC' }} />
              </div>
              <button
                onClick={() => handleCheckout('extra_book')}
                disabled={!!loading}
                style={{
                  padding: '14px 20px', borderRadius: '12px', border: '1.5px solid #E8E0D0',
                  background: '#FFFEF9', color: '#741515', cursor: loading ? 'not-allowed' : 'pointer',
                  opacity: loading ? 0.7 : 1, width: '100%',
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                }}
              >
                <div style={{ textAlign: 'left' }}>
                  <p style={{ fontWeight: '600', fontSize: '0.9rem', marginBottom: '2px' }}>
                    {loading === 'extra_book' ? 'Redirecting...' : 'Just one book'}
                  </p>
                  <p style={{ fontSize: '0.78rem', color: '#9B8B7A' }}>One-time · no subscription</p>
                </div>
                <p style={{ fontWeight: '700', fontSize: '1rem', color: '#741515' }}>A$0.99</p>
              </button>
            </>
          )}
        </div>

        {error && (
          <p style={{ fontSize: '0.8rem', color: '#B91C1C', textAlign: 'center', marginBottom: '12px' }}>{error}</p>
        )}

        <p style={{ fontSize: '0.75rem', color: '#C8BEAA', textAlign: 'center', marginBottom: '16px' }}>
          {isNativeApp()
            ? '1 story per day included · Cancel anytime in Settings · Payment via the App Store'
            : '1 book per day included · Extra books A$0.99 each · Cancel anytime · Secure payment via Stripe'}
        </p>

        <button
          onClick={onClose}
          style={{ width: '100%', background: 'none', border: 'none', color: '#9B8B7A', cursor: 'pointer', fontSize: '0.875rem', padding: '8px' }}
        >
          Maybe later
        </button>

        {isNativeApp() && (
          <button
            onClick={handleRestore}
            disabled={!!loading}
            style={{ width: '100%', background: 'none', border: 'none', color: '#C8BEAA', cursor: loading ? 'not-allowed' : 'pointer', fontSize: '0.8rem', padding: '4px' }}
          >
            {loading === 'restore' ? 'Restoring…' : 'Restore purchases'}
          </button>
        )}

        {/* Apple requires functional Terms of Use (EULA) + Privacy Policy links on the subscription screen. */}
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '12px', marginTop: '14px' }}>
          <a
            href="https://www.talepopstories.com/terms"
            onClick={(e) => { e.preventDefault(); openLegal('https://www.talepopstories.com/terms'); }}
            style={{ color: '#9B8B7A', textDecoration: 'underline', fontSize: '0.72rem', cursor: 'pointer' }}
          >
            Terms of Use
          </a>
          <span style={{ color: '#D8CFC0', fontSize: '0.72rem' }}>·</span>
          <a
            href="https://www.talepopstories.com/privacy"
            onClick={(e) => { e.preventDefault(); openLegal('https://www.talepopstories.com/privacy'); }}
            style={{ color: '#9B8B7A', textDecoration: 'underline', fontSize: '0.72rem', cursor: 'pointer' }}
          >
            Privacy Policy
          </a>
        </div>
      </div>
    </div>
  );
}
