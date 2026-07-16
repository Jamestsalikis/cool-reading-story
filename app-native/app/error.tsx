'use client';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
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
      {error?.message && (
        <p style={{ color: '#9CA3AF', fontSize: '0.75rem', maxWidth: '420px', marginBottom: '16px', fontFamily: 'monospace', background: '#f3f4f6', padding: '8px 12px', borderRadius: '8px', wordBreak: 'break-all' }}>
          {error.message}
        </p>
      )}
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
