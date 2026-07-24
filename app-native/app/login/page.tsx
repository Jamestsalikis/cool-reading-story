'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signIn, signInWithGoogle, signInWithApple } from '@/lib/supabase/auth-client';
import { useRedirectIfAuthenticated } from '@/components/AuthGuard';
import { isNativeApp } from '@/lib/iap';

export default function LoginPage() {
  const router = useRouter();
  useRedirectIfAuthenticated();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [appleLoading, setAppleLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const formData = new FormData(e.currentTarget);
    const result = await signIn(formData);
    if (result?.error) {
      setError(result.error);
      setLoading(false);
    } else {
      // Client auth: navigate ourselves (the old server action redirected).
      router.replace('/dashboard');
    }
  };

  const handleGoogle = async () => {
    setGoogleLoading(true);
    setError('');
    await signInWithGoogle();
    setGoogleLoading(false);
  };

  const handleApple = async () => {
    setAppleLoading(true);
    setError('');
    const result = await signInWithApple();
    if (result?.error) {
      setError(result.error);
      setAppleLoading(false);
    } else if (result?.success) {
      // Native token sign-in completes synchronously — go to the dashboard.
      window.location.href = '/';
    } else {
      setAppleLoading(false); // cancelled
    }
  };

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
      <a href="/" style={{ textDecoration: 'none', display: 'inline-block', marginBottom: '3rem' }}>
        <img src="/mood-3.png" alt="TalePop" style={{ height: '90px', width: 'auto' }} />
      </a>

      {/* Login Card */}
      <div
        className="card"
        style={{
          maxWidth: '420px',
          width: '100%',
          padding: '2.5rem',
        }}
      >
        <h1
          className="font-serif"
          style={{
            fontSize: '1.75rem',
            fontWeight: 600,
            color: '#0D183D',
            marginBottom: '0.5rem',
            textAlign: 'center',
          }}
        >
          Welcome back
        </h1>
        <p
          style={{
            fontSize: '0.9375rem',
            color: '#5E6A7A',
            textAlign: 'center',
            marginBottom: '2rem',
          }}
        >
          Sign in to your account to continue
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
          disabled={googleLoading}
          style={{
            width: '100%',
            padding: '0.875rem 1rem',
            border: '1.5px solid #F0E4D0',
            borderRadius: '8px',
            background: 'white',
            color: '#0D183D',
            fontSize: '0.9375rem',
            fontWeight: 500,
            cursor: googleLoading ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.75rem',
            transition: 'all 0.2s',
            marginBottom: '1.5rem',
            opacity: googleLoading ? 0.7 : 1,
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

        {/* Sign in with Apple — native app only (required by App Store when Google is offered) */}
        {isNativeApp() && (
          <button
            onClick={handleApple}
            disabled={appleLoading}
            style={{
              width: '100%',
              padding: '0.875rem 1rem',
              border: 'none',
              borderRadius: '8px',
              background: 'black',
              color: 'white',
              fontSize: '0.9375rem',
              fontWeight: 500,
              cursor: appleLoading ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.6rem',
              marginBottom: '1.5rem',
              opacity: appleLoading ? 0.7 : 1,
            }}
          >
            <svg width="18" height="18" viewBox="0 0 384 512" fill="white" aria-hidden="true">
              <path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z"/>
            </svg>
            {appleLoading ? 'Signing in…' : 'Sign in with Apple'}
          </button>
        )}

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
                style={{ fontSize: '0.875rem', background: 'transparent', border: 'none', color: '#1496A6', cursor: 'pointer', textDecoration: 'underline' }}
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>
            <input
              id="password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              className="input"
              placeholder="••••••••"
              required
            />
          </div>

          <button
            type="submit"
            className="btn-brand"
            disabled={loading}
            style={{ width: '100%', justifyContent: 'center', marginBottom: '1.5rem', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1 }}
          >
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <Link href="/forgot-password" style={{ fontSize: '0.875rem', color: '#1496A6', textDecoration: 'none', fontWeight: 600 }}>
            Forgot your password?
          </Link>
        </div>

        <div style={{ textAlign: 'center', paddingTop: '1.5rem', borderTop: '1px solid #F0E4D0' }}>
          <p style={{ fontSize: '0.9375rem', color: '#0D183D' }}>
            Don&apos;t have an account?{' '}
            <Link href="/signup" style={{ color: '#FF6B35', textDecoration: 'none', fontWeight: 700 }}>
              Start free trial
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
