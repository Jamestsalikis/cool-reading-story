'use client';

import Link from 'next/link';
import { useState } from 'react';
import { signUp, signInWithGoogle, resendVerificationEmail } from '@/lib/supabase/actions';
import { AuthShell, GoogleMark } from '@/components/AuthShell';

export default function SignupPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [consentChecked, setConsentChecked] = useState(false);
  const [error, setError] = useState('');
  const [successEmail, setSuccessEmail] = useState('');
  const [resendLoading, setResendLoading] = useState(false);
  const [resendSent, setResendSent] = useState(false);
  const [resendError, setResendError] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const formData = new FormData(e.currentTarget);
    const result = await signUp(formData);
    if (result?.error) {
      setError(result.error);
      setLoading(false);
    } else if (result?.success) {
      setSuccessEmail(result.email || '');
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    if (!consentChecked) return;
    setGoogleLoading(true);
    setError('');
    await signInWithGoogle();
    setGoogleLoading(false);
  };

  const handleResend = async () => {
    if (resendLoading || resendCooldown > 0) return;
    setResendLoading(true);
    setResendError('');
    const result = await resendVerificationEmail(successEmail);
    setResendLoading(false);
    if (result?.error) {
      setResendError(result.error);
    } else {
      setResendSent(true);
      // 60-second cooldown
      setResendCooldown(60);
      const timer = setInterval(() => {
        setResendCooldown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
  };

  // --- Success state: email verification pending ---
  if (successEmail) {
    return (
      <AuthShell>
        <div style={{ textAlign: 'center' }}>
          <div className="a-tick">
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#45BFCB" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
              <polyline points="22,6 12,13 2,6" />
            </svg>
          </div>

          <h1 className="a-h1">Check your inbox</h1>
          <p className="a-sub" style={{ marginBottom: '.4rem' }}>
            We sent a verification link to
          </p>
          <p style={{ fontWeight: 800, color: 'var(--amber)', margin: '0 0 1.3rem', wordBreak: 'break-all' }}>
            {successEmail}
          </p>
          <p className="a-sub">
            Click the link in the email to verify your account and get started. It may take a
            minute or two to arrive.
          </p>

          <div className="a-note" style={{ textAlign: 'left' }}>
            <strong style={{ color: 'var(--txt)' }}>Cannot find it?</strong> Check your spam or junk
            folder.
          </div>

          {resendSent && !resendError && (
            <p style={{ fontSize: '.85rem', color: 'var(--teal)', margin: '0 0 .8rem' }}>
              Email resent, check your inbox.
            </p>
          )}
          {resendError && <div className="a-error">{resendError}</div>}

          <button
            type="button"
            className="a-btn a-oauth"
            onClick={handleResend}
            disabled={resendLoading || resendCooldown > 0}
            style={{ marginBottom: '1rem' }}
          >
            {resendLoading
              ? 'Sending...'
              : resendCooldown > 0
                ? `Resend available in ${resendCooldown}s`
                : 'Resend verification email'}
          </button>

          <Link className="a-btn a-primary" href="/login" style={{ textDecoration: 'none' }}>
            Back to sign in
          </Link>
        </div>
      </AuthShell>
    );
  }

  return (
    <AuthShell>
      <h1 className="a-h1">Begin their story</h1>
      <p className="a-sub">Their first personalised story book is free.</p>

      <button
        type="button"
        className="a-btn a-oauth"
        onClick={handleGoogle}
        disabled={!consentChecked || googleLoading}
      >
        <GoogleMark />
        {googleLoading ? 'Redirecting...' : 'Continue with Google'}
      </button>
      {!consentChecked && (
        <p style={{ fontSize: '.8rem', color: 'var(--txt-mute)', textAlign: 'center', margin: '.7rem 0 0' }}>
          Tick the confirmation below to continue.
        </p>
      )}

      <div className="a-or">
        <i />
        <span>OR</span>
        <i />
      </div>

      <form onSubmit={handleSubmit}>
        <div className="a-field">
          <label className="a-label" htmlFor="signup-email">
            Email address
          </label>
          <input
            id="signup-email"
            type="email"
            name="email"
            className="a-input"
            placeholder="you@example.com"
            autoComplete="email"
            required
          />
        </div>

        <div className="a-field">
          <div className="a-row">
            <label className="a-label" htmlFor="signup-password" style={{ marginBottom: 0 }}>
              Password
            </label>
            <button type="button" className="a-link" onClick={() => setShowPassword(!showPassword)}>
              {showPassword ? 'Hide' : 'Show'}
            </button>
          </div>
          <input
            id="signup-password"
            type={showPassword ? 'text' : 'password'}
            name="password"
            className="a-input"
            placeholder="At least 6 characters"
            autoComplete="new-password"
            minLength={6}
            required
          />
        </div>

        <label className="a-consent" htmlFor="consent">
          <input
            type="checkbox"
            id="consent"
            checked={consentChecked}
            onChange={(e) => setConsentChecked(e.target.checked)}
          />
          <span>
            I confirm I am <strong>18 years of age or older</strong> and am the parent or legal
            guardian of the child I am creating a profile for. I consent to the collection and use
            of my child&apos;s information as described in the{' '}
            <Link href="/privacy">Privacy Policy</Link>.
          </span>
        </label>

        {error && <div className="a-error">{error}</div>}

        <button type="submit" className="a-btn a-primary" disabled={loading || !consentChecked}>
          {loading ? 'Creating account...' : 'Next Step'}
        </button>
      </form>

      <div className="a-foot">
        Already have an account? <Link href="/login">Sign in</Link>
      </div>

      <p style={{ fontSize: '.78rem', color: 'var(--txt-mute)', textAlign: 'center', lineHeight: 1.6, marginTop: '1.2rem', marginBottom: 0 }}>
        By creating an account you agree to our{' '}
        <Link href="/terms" style={{ color: 'var(--amber)' }}>Terms of Service</Link> and{' '}
        <Link href="/privacy" style={{ color: 'var(--amber)' }}>Privacy Policy</Link>. We will never
        share your data.
      </p>
    </AuthShell>
  );
}
