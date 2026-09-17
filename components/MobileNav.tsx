'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';

export type NavItem = { href: string; label: string };

/**
 * The header menu for narrow screens.
 *
 * The site before the 2026 redesign had a hamburger on mobile carrying How it
 * works, Pricing, Sign in and Start for free. The redesign replaced the header
 * with .nav-links and hid most of it below 640px without putting anything in
 * its place, so on a phone the only header control left was Start free and
 * returning customers had no visible way to sign in. This restores that.
 *
 * Self-contained: its own styles travel with it, so it works on the homepage
 * and on the shared chrome without either having to know about it.
 */
export function MobileNav({ items, signInHref = '/login', ctaHref = '/signup', ctaLabel = 'Start free', showBelow = 640, showCta = true }: {
  items: NavItem[];
  signInHref?: string;
  ctaHref?: string;
  ctaLabel?: string;
  /** width under which the menu appears; match it to where the host nav hides */
  showBelow?: 640 | 980;
  /** false when the header still shows its own call to action beside the button */
  showCta?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    const onDown = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('keydown', onKey);
    document.addEventListener('mousedown', onDown);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('mousedown', onDown);
    };
  }, [open]);

  return (
    <div className={showBelow === 980 ? 'mnav mnav--lg' : 'mnav'} ref={wrapRef}>
      <style>{CSS}</style>
      <button
        type="button"
        className="mnav-btn"
        aria-label={open ? 'Close menu' : 'Open menu'}
        aria-expanded={open}
        aria-controls="mnav-panel"
        onClick={() => setOpen(v => !v)}
      >
        {open ? (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
            <line x1="5" y1="5" x2="19" y2="19" /><line x1="19" y1="5" x2="5" y2="19" />
          </svg>
        ) : (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
            <line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        )}
      </button>

      <div id="mnav-panel" className="mnav-panel" hidden={!open}>
        {items.map(i => (
          <Link key={i.href} href={i.href} onClick={() => setOpen(false)}>{i.label}</Link>
        ))}
        <Link href={signInHref} onClick={() => setOpen(false)}>Sign in</Link>
        {showCta && (
          <Link className="mnav-cta" href={ctaHref} onClick={() => setOpen(false)}>{ctaLabel}</Link>
        )}
      </div>
    </div>
  );
}

const CSS = `
.mnav{display:none;position:relative;margin-left:8px}
@media(max-width:640px){.mnav{display:block}}
@media(max-width:980px){.mnav--lg{display:block}}
.mnav-btn{display:flex;align-items:center;justify-content:center;
  width:44px;height:44px;padding:0;border:0;border-radius:12px;cursor:pointer;
  background:rgba(255,231,203,.07);color:#FFB765}
.mnav-btn:hover{background:rgba(255,231,203,.13)}
.mnav-btn:focus-visible{outline:2px solid #FFB765;outline-offset:2px}

.mnav-panel{position:absolute;right:0;top:calc(100% + 10px);z-index:60;
  display:flex;flex-direction:column;gap:2px;min-width:216px;padding:10px;
  border-radius:18px;
  background:linear-gradient(168deg,rgba(38,44,74,.97),rgba(15,18,36,.99));
  backdrop-filter:blur(30px) saturate(150%);
  box-shadow:inset 0 0 0 1px rgba(255,231,203,.14),0 18px 44px rgba(4,6,16,.55)}
.mnav-panel[hidden]{display:none}
.mnav-panel a{display:block;padding:11px 13px;border-radius:11px;
  color:#F6EFE4;text-decoration:none;font-weight:700;font-size:.95rem}
.mnav-panel a:hover{background:rgba(255,231,203,.09)}
.mnav-panel a:focus-visible{outline:2px solid #FFB765;outline-offset:-2px}
.mnav-panel a.mnav-cta{margin-top:6px;text-align:center;color:#3A1B06;
  background:linear-gradient(180deg,#FFDCA8,#E8913A)}
.mnav-panel a.mnav-cta:hover{background:linear-gradient(180deg,#FFE4BC,#F09B41)}
`;
