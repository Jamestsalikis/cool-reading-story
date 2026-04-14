'use client';

import Link from 'next/link';
import { useState } from 'react';

export default function SignupPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle sign up logic
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#FAF7F0',
        padding: '2rem',
      }}
    >
      {/* Logo */}
      <div
        className="font-serif"
        style={{
          fontSize: '1.75rem',
          fontWeight: 600,
          color: '#741515',
          marginBottom: '2rem',
          textAlign: 'center',
        }}
      >
        Cool Reading Story
      </div>

      {/* Progress Dots */}
      <div
        style={{
          display: 'flex',
          gap: '1.5rem',
          marginBottom: '3rem',
          justifyContent: 'center',
        }}
      >
        {[1, 2, 3, 4].map((step) => (
          <div
            key={step}
            style={{
              width: '12px',
              height: '12px',
              borderRadius: '50%',
              background: step === 1 ? '#741515' : '#E8E0D0',
              transition: 'all 0.2s',
            }}
          />
        ))}
      </div>

      {/* Signup Card */}
      <div
        className="card"
        style={{
          maxWidth: '420px',
          width: '100%',
          padding: '2.5rem',
        }}
      >
        {/* Heading */}
        <h1
          className="font-serif"
          style={{
            fontSize: '1.75rem',
            fontWeight: 600,
            color: '#1A1209',
            marginBottom: '0.5rem',
            textAlign: 'center',
          }}
        >
          Begin your journey
        </h1>
        <p
          style={{
            fontSize: '0.9375rem',
            color: '#6B5E4E',
            textAlign: 'center',
            marginBottom: '2rem',
          }}
        >
          Create your account to get started
        </p>

        {/* Google OAuth Button */}
        <button
          style={{
            width: '100%',
            padding: '0.875rem 1rem',
            border: '1.5px solid #E8E0D0',
            borderRadius: '8px',
            background: 'white',
            color: '#1A1209',
            fontSize: '0.9375rem',
            fontWeight: 500,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.75rem',
            transition: 'all 0.2s',
            marginBottom: '1.5rem',
          }}
          onMouseEnter={(e) => {
            (e.currentTarget).style.background = '#FAF7F0';
            (e.currentTarget).style.borderColor = '#741515';
          }}
          onMouseLeave={(e) => {
            (e.currentTarget).style.background = 'white';
            (e.currentTarget).style.borderColor = '#E8E0D0';
          }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              fill="#4285F4"
            />
            <path
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              fill="#34A853"
            />
            <path
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              fill="#FBBC05"
            />
            <path
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              fill="#EA4335"
            />
          </svg>
          Continue with Google
        </button>

        {/* Divider */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            marginBottom: '1.5rem',
          }}
        >
          <div style={{ flex: 1, height: '1px', background: '#E8E0D0' }} />
          <span style={{ fontSize: '0.875rem', color: '#6B5E4E' }}>OR</span>
          <div style={{ flex: 1, height: '1px', background: '#E8E0D0' }} />
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          {/* Email Input */}
          <div style={{ marginBottom: '1.25rem' }}>
            <label
              htmlFor="email"
              style={{
                display: 'block',
                fontSize: '0.875rem',
                fontWeight: 500,
                color: '#1A1209',
                marginBottom: '0.5rem',
              }}
            >
              Email address
            </label>
            <input
              id="email"
              type="email"
              className="input"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          {/* Password Input */}
          <div style={{ marginBottom: '1.5rem' }}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '0.5rem',
              }}
            >
              <label
                htmlFor="password"
                style={{
                  fontSize: '0.875rem',
                  fontWeight: 500,
                  color: '#1A1209',
                }}
              >
                Password
              </label>
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  fontSize: '0.875rem',
                  background: 'transparent',
                  border: 'none',
                  color: '#741515',
                  cursor: 'pointer',
                  textDecoration: 'underline',
                }}
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              className="input"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {/* Next Step Button */}
          <button
            type="submit"
            className="btn-brand"
            style={{
              width: '100%',
              justifyContent: 'center',
              marginBottom: '1.5rem',
              cursor: 'pointer',
            }}
          >
            Next Step
          </button>
        </form>

        {/* Sign In Link */}
        <div style={{ textAlign: 'center', paddingTop: '1.5rem', borderTop: '1px solid #E8E0D0' }}>
          <p
            style={{
              fontSize: '0.9375rem',
              color: '#1A1209',
            }}
          >
            Already have an account?{' '}
            <Link
              href="/login"
              style={{
                color: '#741515',
                textDecoration: 'none',
                fontWeight: 600,
              }}
              onMouseEnter={(e) => {
                (e.currentTarget).style.textDecoration = 'underline';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget).style.textDecoration = 'none';
              }}
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>

      {/* Privacy Microcopy */}
      <p
        style={{
          fontSize: '0.75rem',
          color: '#6B5E4E',
          textAlign: 'center',
          maxWidth: '420px',
          marginTop: '2rem',
          lineHeight: '1.5',
        }}
      >
        By creating an account, you agree to our{' '}
        <a href="#" style={{ color: '#741515', textDecoration: 'none', fontWeight: 500 }}>
          Terms of Service
        </a>{' '}
        and{' '}
        <a href="#" style={{ color: '#741515', textDecoration: 'none', fontWeight: 500 }}>
          Privacy Policy
        </a>
        . We'll never share your data.
      </p>
    </div>
  );
}
