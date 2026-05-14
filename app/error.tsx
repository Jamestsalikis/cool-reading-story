'use client';

import { useEffect } from 'react';
import * as Sentry from '@sentry/nextjs';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#FFF4E6',
        padding: '32px 20px',
        fontFamily: 'Fredoka, cursive',
        textAlign: 'center',
      }}
    >
      <div style={{ fontSize: '3rem', marginBottom: '16px' }}>📖</div>
      <h1 style={{ color: '#0D183D', fontSize: '1.75rem', marginBottom: '8px' }}>
        Oops! Something went wrong
      </h1>
      <p style={{ color: '#5E6A7A', fontSize: '1rem', maxWidth: '420px', marginBottom: '28px', lineHeight: 1.6 }}>
        We hit an unexpected snag. Your stories are safe — this is just a temporary hiccup.
      </p>
      <button
        onClick={reset}
        style={{
          background: '#FF6B35',
          color: '#fff',
          border: 'none',
          borderRadius: '12px',
          padding: '12px 28px',
          fontSize: '1rem',
          fontFamily: 'Fredoka, cursive',
          fontWeight: '600',
          cursor: 'pointer',
        }}
      >
        Try again
      </button>
      <a
        href="/dashboard"
        style={{
          marginTop: '16px',
          color: '#5E6A7A',
          fontSize: '0.875rem',
          textDecoration: 'underline',
        }}
      >
        Back to dashboard
      </a>
    </div>
  );
}
