'use client';
import Link from 'next/link';

/** DEV PREVIEW ONLY. Index of the no-login preview routes. Not for main. */
export default function DevPreviewIndex() {
  const links = [
    ['/dev-preview/dashboard', 'Dashboard', 'Two children, five stories, a series, a subscribed account'],
    ['/dev-preview/onboarding', 'Onboarding', 'All four steps, no account created'],
  ];
  return (
    <div style={{ minHeight: '100vh', background: '#0B0D1C', color: '#F6EFE4', padding: '64px 24px',
      fontFamily: "'Nunito', system-ui, sans-serif" }}>
      <div style={{ maxWidth: '560px', margin: '0 auto' }}>
        <p style={{ color: '#FFB765', fontSize: '.78rem', fontWeight: 800, letterSpacing: '.16em',
          textTransform: 'uppercase', margin: '0 0 .6rem' }}>Dev preview</p>
        <h1 style={{ fontFamily: 'Fredoka, cursive', fontSize: '2rem', margin: '0 0 .6rem', fontWeight: 400 }}>
          Logged-in pages, no login
        </h1>
        <p style={{ color: '#B7B2C4', lineHeight: 1.6, margin: '0 0 2rem' }}>
          These render the real components against fabricated data. Nothing here reads or writes
          a database, so nothing you do on these pages touches a real account.
        </p>
        {links.map(([href, title, blurb]) => (
          <Link key={href} href={href} style={{ display: 'block', textDecoration: 'none',
            background: 'rgba(255,231,203,0.06)', borderRadius: '16px', padding: '18px 20px',
            marginBottom: '12px', boxShadow: 'inset 0 0 0 1px rgba(255,231,203,0.16)' }}>
            <span style={{ display: 'block', color: '#F6EFE4', fontWeight: 800, marginBottom: '4px' }}>{title}</span>
            <span style={{ display: 'block', color: '#B7B2C4', fontSize: '.88rem' }}>{blurb}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
