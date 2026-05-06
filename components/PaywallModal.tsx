'use client';

import { useState } from 'react';

type Props = {
  reason: 'free_exhausted' | 'monthly_limit' | 'no_subscription' | 'daily_limit';
  onClose: () => void;
};

export default function PaywallModal({ reason, onClose }: Props) {
  const [loading, setLoading] = useState<'monthly' | 'annual' | 'extra_book' | null>(null);

  const handleCheckout = async (plan: 'monthly' | 'annual' | 'extra_book') => {
    setLoading(plan);
    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan }),
      });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
    } catch {
      setLoading(null);
    }
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
    free_exhausted: "You've used your 3 welcome stories",
    monthly_limit: "You've reached your stories this month",
    no_subscription: 'Subscribe to start generating stories',
  };

  const subtext: Record<Exclude<Props['reason'], 'daily_limit'>, string> = {
    free_exhausted: 'Subscribe to keep generating personalised stories for your child — 1 new book every day.',
    monthly_limit: 'Your stories reset on the 1st. Subscribe to an annual plan for the best value.',
    no_subscription: 'Unlock 1 personalised bedtime story per day for A$9.99/month.',
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
        </div>

        <p style={{ fontSize: '0.75rem', color: '#C8BEAA', textAlign: 'center', marginBottom: '16px' }}>
          1 book per day included · Extra books A$0.99 each · Cancel anytime · Secure payment via Stripe
        </p>

        <button
          onClick={onClose}
          style={{ width: '100%', background: 'none', border: 'none', color: '#9B8B7A', cursor: 'pointer', fontSize: '0.875rem', padding: '8px' }}
        >
          Maybe later
        </button>
      </div>
    </div>
  );
}
