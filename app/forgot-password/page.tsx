'use client';

import { useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback?type=recovery`,
    });
    if (error) {
      setError(error.message);
    } else {
      setSent(true);
    }
    setLoading(false);
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#FAF9F6', padding: '2rem' }}>
      <div className="font-serif" style={{ fontSize: '1.5rem', fontWeight: 600, color: '#741515', marginBottom: '2.5rem' }}>
        Cool Reading Story
      </div>
      <div style={{ maxWidth: '400px', width: '100%', background: '#fff', border: '1px solid #E8E3DC', borderRadius: '16px', padding: '2.5rem' }}>
        {sent ? (
          <div style={{ textAlign: 'center' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#E6F4EC', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#2D7A3A" strokeWidth="2"><path d="M20 6L9 17l-5-5"/></svg>
            </div>
            <h1 className="font-serif" style={{ fontSize: '1.4rem', color: '#1C1614', marginBottom: '0.75rem' }}>Check your email</h1>
            <p style={{ color: '#6B5E4E', fontSize: '0.9rem', lineHeight: 1.6, marginBottom: '1.5rem' }}>
              We sent a password reset link to <strong>{email}</strong>. Check your inbox and follow the link.
            </p>
            <Link href="/login" style={{ color: '#741515', textDecoration: 'none', fontWeight: '600', fontSize: '0.9rem' }}>Back to sign in</Link>
          </div>
        ) : (
          <>
            <h1 className="font-serif" style={{ fontSize: '1.6rem', color: '#1C1614', marginBottom: '0.5rem', textAlign: 'center' }}>Reset your password</h1>
            <p style={{ color: '#6B5E4E', fontSize: '0.875rem', textAlign: 'center', marginBottom: '2rem' }}>
              Enter your email and we'll send you a reset link.
            </p>
            {error && <div style={{ background: '#FEE2E2', borderRadius: '8px', padding: '0.75rem', marginBottom: '1.25rem', fontSize: '0.875rem', color: '#991B1B' }}>{error}</div>}
            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: '#1C1614', marginBottom: '0.5rem' }}>Email address</label>
                <input type="email" className="input" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} required style={{ width: '100%' }} />
              </div>
              <button type="submit" className="btn-brand" disabled={loading} style={{ width: '100%', justifyContent: 'center', opacity: loading ? 0.7 : 1, cursor: loading ? 'not-allowed' : 'pointer' }}>
                {loading ? 'Sending...' : 'Send reset link'}
              </button>
            </form>
            <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
              <Link href="/login" style={{ color: '#741515', textDecoration: 'none', fontSize: '0.875rem', fontWeight: 500 }}>Back to sign in</Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
