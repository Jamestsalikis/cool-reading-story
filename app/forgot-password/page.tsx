'use client';

import { useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { AuthShell } from '@/components/AuthShell';

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
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/callback?type=recovery`,
      });
      if (error) {
        setError(error.message || 'Unable to send reset link. Please try again.');
      } else {
        setSent(true);
      }
    } catch {
      setError('Something went wrong. Please try again.');
    }
    setLoading(false);
  };

  return (
    <AuthShell>
      {sent ? (
        <div style={{ textAlign: 'center' }}>
          <div className="a-tick">
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#45BFCB" strokeWidth="2.4">
              <path d="M20 6L9 17l-5-5" />
            </svg>
          </div>
          <h1 className="a-h1">Check your email</h1>
          <p className="a-sub">
            We sent a password reset link to <strong style={{ color: 'var(--txt)' }}>{email}</strong>.
            Open it and you can set a new one.
          </p>
          <Link className="a-btn a-oauth" href="/login" style={{ textDecoration: 'none' }}>
            Back to sign in
          </Link>
        </div>
      ) : (
        <>
          <h1 className="a-h1">Reset your password</h1>
          <p className="a-sub">Enter your email and we will send you a reset link.</p>

          {error && <div className="a-error">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="a-field">
              <label className="a-label" htmlFor="reset-email">
                Email address
              </label>
              <input
                id="reset-email"
                type="email"
                className="a-input"
                placeholder="you@example.com"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <button type="submit" className="a-btn a-primary" disabled={loading}>
              {loading ? 'Sending...' : 'Send reset link'}
            </button>
          </form>

          <div className="a-foot">
            Remembered it? <Link href="/login">Back to sign in</Link>
          </div>
        </>
      )}
    </AuthShell>
  );
}
