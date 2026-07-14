'use client';

import Link from 'next/link';
import { useState } from 'react';
import { signUp, signInWithGoogle, resendVerificationEmail } from '@/lib/supabase/auth-client';
import { useRedirectIfAuthenticated } from '@/components/AuthGuard';

export default function SignupPage() {
  useRedirectIfAuthenticated();
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
        setResendCooldown(prev => {
          if (prev <= 1) { clearInterval(timer); return 0; }
          return prev - 1;
        });
      }, 1000);
    }
  };

  // --- Success state: email verification pending ---
  if (successEmail) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#FFF4E6',
          padding: '2rem',
        }}
      >
        <a href="/" style={{ textDecoration: 'none', display: 'inline-block', marginBottom: '2rem' }}>
          <img src="/mood-3.png" alt="TalePop" style={{ height: '90px', width: 'auto' }} />
        </a>

        <div className="card" style={{ maxWidth: '460px', width: '100%', padding: '2.5rem', textAlign: 'center' }}>
          {/* Envelope icon */}
          <div style={{
            width: '72px', height: '72px', borderRadius: '50%',
            background: 'linear-gradient(135deg, #FF6B35, #FF8C42)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 1.5rem',
            boxShadow: '0 8px 24px rgba(255,107,53,0.3)',
          }}>
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
              <polyline points="22,6 12,13 2,6"/>
            </svg>
          </div>

          <h1
            className="font-serif"
            style={{ fontSize: '1.75rem', fontWeight: 600, color: '#0D183D', marginBottom: '0.75rem' }}
          >
            Check your inbox!
          </h1>

          <p style={{ fontSize: '0.9375rem', color: '#5E6A7A', marginBottom: '0.5rem', lineHeight: 1.6 }}>
            We sent a verification link to
          </p>
          <p style={{ fontSize: '1rem', fontWeight: 700, color: '#FF6B35', marginBottom: '1.5rem' }}>
            {successEmail}
          </p>

          <p style={{ fontSize: '0.9375rem', color: '#5E6A7A', lineHeight: 1.6, marginBottom: '2rem' }}>
            Click the link in the email to verify your account and get started. It may take a minute or two to arrive.
          </p>

          {/* Resend section */}
          <div style={{
            background: '#FBF8F3', border: '1px solid #F0E4D0', borderRadius: '10px',
            padding: '1rem 1.25rem', marginBottom: '2rem',
          }}>
            <p style={{ fontSize: '0.8125rem', color: '#4A3728', lineHeight: 1.6, margin: '0 0 0.75rem' }}>
              <strong>Can not find it?</strong> Check your spam or junk folder.
            </p>
            {resendSent && !resendError && (
              <p style={{ fontSize: '0.8125rem', color: '#16a34a', margin: '0 0 0.5rem' }}>
                Email resent — check your inbox.
              </p>
            )}
            {resendError && (
              <p style={{ fontSize: '0.8125rem', color: '#dc2626', margin: '0 0 0.5rem' }}>
                {resendError}
              </p>
            )}
            <button
              onClick={handleResend}
              disabled={resendLoading || resendCooldown > 0}
              style={{
                background: 'none',
                border: '1px solid #FF6B35',
                borderRadius: '6px',
                color: resendCooldown > 0 ? '#9CA3AF' : '#FF6B35',
                cursor: resendCooldown > 0 ? 'not-allowed' : 'pointer',
                fontSize: '0.8125rem',
                fontWeight: 600,
                padding: '0.5rem 1rem',
                width: '100%',
              }}
            >
              {resendLoading
                ? 'Sending...'
                : resendCooldown > 0
                ? `Resend available in ${resendCooldown}s`
                : 'Resend verification email'}
            </button>
          </div>

          <Link
            href="/login"
            style={{
              display: 'inline-block', width: '100%', padding: '0.875rem',
              background: 'linear-gradient(135deg, #FF6B35, #FF8C42)',
              color: 'white', borderRadius: '8px', fontWeight: 600,
              fontSize: '0.9375rem', textDecoration: 'none', textAlign: 'center',
            }}
          >
            Back to sign in
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#FFF4E6',
        padding: '2rem',
      }}
    >
      <a href="/" style={{ textDecoration: 'none', display: 'inline-block', marginBottom: '2rem' }}>
        <img src="/mood-3.png" alt="TalePop" style={{ height: '90px', width: 'auto' }} />
      </a>

      <div className="card" style={{ maxWidth: '460px', width: '100%', padding: '2.5rem' }}>
        <h1
          className="font-serif"
          style={{ textAlign: 'center', fontSize: '1.75rem', fontWeight: 600, color: '#0D183D', marginBottom: '0.25rem' }}
        >
          Begin your journey
        </h1>
        <p style={{ textAlign: 'center', color: '#5E6A7A', marginBottom: '1.75rem', fontSize: '0.9375rem' }}>
          Your first story is waiting.
        </p>

        {/* Google */}
        <button
          onClick={handleGoogle}
          disabled={!consentChecked || googleLoading}
          style={{
            width: '100%', padding: '0.875rem',
            background: consentChecked ? '#FFFFFF' : '#F3F4F6',
            border: '1px solid #E5E7EB', borderRadius: '8px',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
            cursor: consentChecked ? 'pointer' : 'not-allowed',
            fontWeight: 500, fontSize: '0.9375rem', color: '#374151',
            marginBottom: '1.25rem',
          }}
        >
          <svg width="18" height="18" viewBox="0 0 48 48">
            <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
            <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
            <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
            <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.35-8.16 2.35-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
          </svg>
          {googleLoading ? 'Redirecting...' : 'Continue with Google'}
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
          <div style={{ flex: 1, height: '1px', background: '#E5E7EB' }} />
          <span style={{ fontSize: '0.8125rem', color: '#9CA3AF' }}>OR</span>
          <div style={{ flex: 1, height: '1px', background: '#E5E7EB' }} />
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: '#374151', marginBottom: '0.375rem' }}>
              Email address
            </label>
            <input
              type="email"
              name="email"
              required
              placeholder="you@example.com"
              style={{
                width: '100%', padding: '0.75rem 1rem',
                border: '1px solid #E5E7EB', borderRadius: '8px',
                fontSize: '0.9375rem', color: '#111827',
                boxSizing: 'border-box',
              }}
            />
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', fontWeight: 500, color: '#374151', marginBottom: '0.375rem' }}>
              Password
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{ background: 'none', border: 'none', color: '#FF6B35', cursor: 'pointer', fontSize: '0.875rem', fontWeight: 500 }}
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </label>
            <input
              type={showPassword ? 'text' : 'password'}
              name="password"
              required
              minLength={6}
              placeholder="At least 6 characters"
              style={{
                width: '100%', padding: '0.75rem 1rem',
                border: '1px solid #E5E7EB', borderRadius: '8px',
                fontSize: '0.9375rem', color: '#111827',
                boxSizing: 'border-box',
              }}
            />
          </div>

          {/* Consent checkbox */}
          <div style={{
            background: '#FBF8F3', border: '1px solid #F0E4D0', borderRadius: '8px',
            padding: '0.875rem 1rem', marginBottom: '1.25rem',
            display: 'flex', alignItems: 'flex-start', gap: '0.75rem',
          }}>
            <input
              type="checkbox"
              id="consent"
              checked={consentChecked}
              onChange={e => setConsentChecked(e.target.checked)}
              style={{ marginTop: '2px', accentColor: '#FF6B35', width: '16px', height: '16px', flexShrink: 0 }}
            />
            <label htmlFor="consent" style={{ fontSize: '0.8125rem', color: '#4A3728', lineHeight: 1.5, cursor: 'pointer' }}>
              I confirm I am <strong>18 years of age or older</strong> and am the parent or legal guardian of the child I am creating a profile for. I consent to the collection and use of my child&apos;s information as described in the{' '}
              <Link href="/privacy" style={{ color: '#FF6B35' }}>Privacy Policy</Link>.
            </label>
          </div>

          {error && (
            <p style={{ color: '#dc2626', fontSize: '0.875rem', marginBottom: '0.75rem', textAlign: 'center' }}>
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading || !consentChecked}
            style={{
              width: '100%', padding: '0.875rem',
              background: consentChecked ? 'linear-gradient(135deg, #FF6B35, #FF8C42)' : '#E5E7EB',
              color: consentChecked ? 'white' : '#9CA3AF',
              border: 'none', borderRadius: '8px', cursor: consentChecked ? 'pointer' : 'not-allowed',
              fontWeight: 600, fontSize: '0.9375rem',
            }}
          >
            {loading ? 'Creating account...' : 'Next Step'}
          </button>
        </form>

        <p style={{ textAlign: 'center', fontSize: '0.875rem', color: '#6B7280', marginTop: '1.25rem' }}>
          Already have an account?{' '}
          <Link href="/login" style={{ color: '#FF6B35', fontWeight: 600 }}>Sign in</Link>
        </p>
      </div>

      <p style={{ marginTop: '1.5rem', fontSize: '0.75rem', color: '#9CA3AF', textAlign: 'center', maxWidth: '400px' }}>
        By creating an account, you agree to our{' '}
        <Link href="/terms" style={{ color: '#FF6B35' }}>Terms of Service</Link>
        {' '}and{' '}
        <Link href="/privacy" style={{ color: '#FF6B35' }}>Privacy Policy</Link>.
        We&apos;ll never share your data.
      </p>
    </div>
  );
}
