'use client';

import Link from 'next/link';
import { useState } from 'react';
import { signUp, signInWithGoogle } from '@/lib/supabase/actions';

export default function SignupPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [consentChecked, setConsentChecked] = useState(false);
  const [error, setError] = useState('');
  const [successEmail, setSuccessEmail] = useState('');

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

          <div style={{
            background: '#FBF8F3', border: '1px solid #F0E4D0', borderRadius: '10px',
            padding: '1rem 1.25rem', marginBottom: '2rem',
          }}>
            <p style={{ fontSize: '0.8125rem', color: '#4A3728', lineHeight: 1.6, margin: 0 }}>
              <strong>Can not find it?</strong> Check your spam or junk folder. If it still has not arrived after a few minutes, try signing up again.
            </p>
          </div>

          <Link
            href="/login"
            style={{
              display: 'inline-block', width: '100%', padding: '0.875rem',
              background: 'linear-gradient(135deg, #FF6B35, #FF8C42)',
              color: 'white', borderRadius: '8px', textDecoration: 'none',
              fontWeight: 600, fontSize: '0.9375rem', textAlign: 'center',
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
      {/* Logo */}
      <a href="/" style={{ textDecoration: 'none', display: 'inline-block', marginBottom: '2rem' }}>
        <img src="/mood-3.png" alt="TalePop" style={{ height: '90px', width: 'auto' }} />
      </a>

      {/* Progress Dots */}
      <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '3rem', justifyContent: 'center' }}>
        {[1, 2, 3, 4].map((step) => (
          <div
            key={step}
            style={{
              width: '12px',
              height: '12px',
              borderRadius: '50%',
              background: step === 1 ? '#FF6B35' : '#F0E4D0',
            }}
          />
        ))}
      </div>

      {/* Signup Card */}
      <div className="card" style={{ maxWidth: '420px', width: '100%', padding: '2.5rem' }}>
        <h1
          className="font-serif"
          style={{ fontSize: '1.75rem', fontWeight: 600, color: '#0D183D', marginBottom: '0.5rem', textAlign: 'center' }}
        >
          Begin your journey
        </h1>
        <p style={{ fontSize: '0.9375rem', color: '#5E6A7A', textAlign: 'center', marginBottom: '2rem' }}>
          Your first story is waiting.
        </p>

        {/* Error message */}
        {error && (
          <div
            style={{
              background: '#FEE2E2',
              border: '1px solid #FECACA',
              borderRadius: '8px',
              padding: '0.75rem 1rem',
              marginBottom: '1.5rem',
              fontSize: '0.875rem',
              color: '#991B1B',
            }}
          >
            {error}
          </div>
        )}

        {/* Google OAuth Button */}
        <button
          onClick={handleGoogle}
          disabled={googleLoading || !consentChecked}
          style={{
            width: '100%',
            padding: '0.875rem 1rem',
            border: '1.5px solid #F0E4D0',
            borderRadius: '8px',
            background: 'white',
            color: '#0D183D',
            fontSize: '0.9375rem',
            fontWeight: 500,
            cursor: (googleLoading || !consentChecked) ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.75rem',
            marginBottom: '1.5rem',
            opacity: (googleLoading || !consentChecked) ? 0.6 : 1,
          }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          {googleLoading ? 'Redirecting...' : 'Continue with Google'}
        </button>

        {/* Divider */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
          <div style={{ flex: 1, height: '1px', background: '#F0E4D0' }} />
          <span style={{ fontSize: '0.875rem', color: '#5E6A7A' }}>OR</span>
          <div style={{ flex: 1, height: '1px', background: '#F0E4D0' }} />
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1.25rem' }}>
            <label htmlFor="email" style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: '#0D183D', marginBottom: '0.5rem' }}>
              Email address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              className="input"
              placeholder="you@example.com"
              required
            />
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <label htmlFor="password" style={{ fontSize: '0.875rem', fontWeight: 500, color: '#0D183D' }}>
                Password
              </label>
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{ fontSize: '0.875rem', background: 'transparent', border: 'none', color: '#FF6B35', cursor: 'pointer', textDecoration: 'underline' }}
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>
            <input
              id="password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              className="input"
              placeholder="Min. 8 characters"
              minLength={8}
              required
            />
          </div>

          {/* COPPA / Age Consent */}
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', marginBottom: '1.25rem', padding: '1rem', background: '#FBF8F3', borderRadius: '8px', border: '1px solid #F0E4D0' }}>
            <input
              id="consent"
              type="checkbox"
              checked={consentChecked}
              onChange={e => setConsentChecked(e.target.checked)}
              style={{ marginTop: '2px', width: '16px', height: '16px', accentColor: '#FF6B35', flexShrink: 0, cursor: 'pointer' }}
            />
            <label htmlFor="consent" style={{ fontSize: '0.8125rem', color: '#4A3728', lineHeight: 1.5, cursor: 'pointer' }}>
              I confirm I am <strong>18 years of age or older</strong> and am the parent or legal guardian of the child I am creating a profile for. I consent to the collection and use of my child&apos;s information as described in the{' '}
              <a href="/privacy" target="_blank" rel="noopener noreferrer" style={{ color: '#FF6B35', textDecoration: 'underline' }}>Privacy Policy</a>.
            </label>
          </div>

          <button
            type="submit"
            className="btn-brand"
            disabled={loading || !consentChecked}
            style={{ width: '100%', justifyContent: 'center', marginBottom: '1.5rem', cursor: (loading || !consentChecked) ? 'not-allowed' : 'pointer', opacity: (loading || !consentChecked) ? 0.6 : 1 }}
          >
            {loading ? 'Creating account...' : 'Next Step'}
          </button>
        </form>

        <div style={{ textAlign: 'center', paddingTop: '1.5rem', borderTop: '1px solid #F0E4D0' }}>
          <p style={{ fontSize: '0.9375rem', color: '#0D183D' }}>
            Already have an account?{' '}
            <Link href="/login" style={{ color: '#FF6B35', textDecoration: 'none', fontWeight: 600 }}>
              Sign in
            </Link>
          </p>
        </div>
      </div>

      <p style={{ fontSize: '0.75rem', color: '#5E6A7A', textAlign: 'center', maxWidth: '420px', marginTop: '2rem', lineHeight: '1.5' }}>
        By creating an account, you agree to our{' '}
        <a href="/terms" style={{ color: '#FF6B35', textDecoration: 'none', fontWeight: 500 }}>Terms of Service</a>{' '}
        and{' '}
        <a href="/privacy" style={{ color: '#FF6B35', textDecoration: 'none', fontWeight: 500 }}>Privacy Policy</a>.
        We&apos;ll never share your data.
      </p>
    </div>
  );
}
