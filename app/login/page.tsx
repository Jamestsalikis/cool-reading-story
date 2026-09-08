'use client';

import Link from 'next/link';
import { useState } from 'react';
import { signIn, signInWithGoogle } from '@/lib/supabase/actions';
import { AuthShell, GoogleMark } from '@/components/AuthShell';

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
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
    }
  };

  const handleGoogle = async () => {
    setGoogleLoading(true);
    setError('');
    await signInWithGoogle();
    setGoogleLoading(false);
  };

  return (
    <AuthShell>
      <h1 className="a-h1">Welcome back</h1>
      <p className="a-sub">Sign in to pick up where their story left off.</p>

      {error && <div className="a-error">{error}</div>}

      <button type="button" className="a-btn a-oauth" onClick={handleGoogle} disabled={googleLoading}>
        <GoogleMark />
        {googleLoading ? 'Redirecting...' : 'Continue with Google'}
      </button>

      <div className="a-or">
        <i />
        <span>OR</span>
        <i />
      </div>

      <form onSubmit={handleSubmit}>
        <div className="a-field">
          <label className="a-label" htmlFor="email">
            Email address
          </label>
          <input
            id="email"
            name="email"
            type="email"
            className="a-input"
            placeholder="you@example.com"
            autoComplete="email"
            required
          />
        </div>

        <div className="a-field">
          <div className="a-row">
            <label className="a-label" htmlFor="password" style={{ marginBottom: 0 }}>
              Password
            </label>
            <button type="button" className="a-link" onClick={() => setShowPassword(!showPassword)}>
              {showPassword ? 'Hide' : 'Show'}
            </button>
          </div>
          <input
            id="password"
            name="password"
            type={showPassword ? 'text' : 'password'}
            className="a-input"
            placeholder="Your password"
            autoComplete="current-password"
            required
          />
        </div>

        <button type="submit" className="a-btn a-primary" disabled={loading}>
          {loading ? 'Signing in...' : 'Sign in'}
        </button>
      </form>

      <div className="a-center">
        <Link className="a-link" href="/forgot-password">
          Forgot your password?
        </Link>
      </div>

      <div className="a-foot">
        Don&apos;t have an account? <Link href="/signup">Start free</Link>
      </div>
    </AuthShell>
  );
}
