'use client';

/**
 * App Store + Google Play buttons. They point at /app (the smart link) with the
 * platform forced and the current page's UTMs attached, so all the store
 * campaign logic lives in one place. Clicks send a Meta Pixel Lead event.
 */
import { useEffect, useState } from 'react';
import { trackStoreClick } from '@/lib/pixel';
import { TRACKING_KEYS } from '@/lib/storeLinks';

function hrefFor(platform: 'ios' | 'android', qs: string) {
  return `/app?platform=${platform}${qs ? '&' + qs : ''}`;
}

export function StoreButtons({ placement, size = 'md', className }: { placement: string; size?: 'md' | 'lg'; className?: string }) {
  const [qs, setQs] = useState('');
  useEffect(() => {
    const cur = new URLSearchParams(window.location.search);
    const keep = new URLSearchParams();
    for (const k of TRACKING_KEYS) { const v = cur.get(k); if (v) keep.set(k, v); }
    setQs(keep.toString());
  }, []);

  const big = size === 'lg';
  const btn: React.CSSProperties = {
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '0.6rem',
    background: '#000', color: '#fff', border: '1px solid rgba(255,255,255,0.28)', borderRadius: '14px',
    padding: big ? '0.7rem 1.1rem' : '0.55rem 1.05rem', textDecoration: 'none', minHeight: big ? 56 : 48,
    boxShadow: '0 6px 20px rgba(0,0,0,.35)', flex: big ? '1 1 0' : undefined, minWidth: big ? 0 : undefined,
  };

  return (
    <div className={className} style={{ display: 'flex', gap: '0.75rem', flexWrap: big ? 'nowrap' : 'wrap', width: big ? '100%' : undefined, maxWidth: big ? 420 : undefined }}>
      <a href={hrefFor('ios', qs)} onClick={() => trackStoreClick('app_store', placement)} aria-label="Download TalePop on the App Store" style={btn} data-store="ios">
        <svg width="22" height="22" viewBox="0 0 384 512" fill="#fff" aria-hidden="true"><path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z"/></svg>
        <span style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.15, textAlign: 'left' }}>
          <span style={{ fontSize: '0.6rem', fontWeight: 500 }}>Download on the</span>
          <span style={{ fontSize: big ? '1.1rem' : '1.05rem', fontWeight: 700, letterSpacing: '-0.01em', whiteSpace: 'nowrap' }}>App Store</span>
        </span>
      </a>
      <a href={hrefFor('android', qs)} onClick={() => trackStoreClick('google_play', placement)} aria-label="Get TalePop on Google Play" style={btn} data-store="android">
        <svg width="20" height="22" viewBox="0 0 512 512" aria-hidden="true"><polygon fill="#00D2FF" points="45,30 265,256 45,482"/><polygon fill="#00F076" points="45,30 355,200 265,256"/><polygon fill="#FF3D44" points="45,482 355,312 265,256"/><polygon fill="#FFC900" points="265,256 355,200 455,256 355,312"/></svg>
        <span style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.15, textAlign: 'left' }}>
          <span style={{ fontSize: '0.6rem', fontWeight: 500 }}>GET IT ON</span>
          <span style={{ fontSize: big ? '1.1rem' : '1.05rem', fontWeight: 700, letterSpacing: '-0.01em', whiteSpace: 'nowrap' }}>Google Play</span>
        </span>
      </a>
    </div>
  );
}
