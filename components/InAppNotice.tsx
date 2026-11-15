'use client';

/**
 * Shown on /signup and /login inside Instagram, Facebook and other social app
 * browsers, where Google blocks "Continue with Google" (disallowed_useragent).
 * Offers: email signup (the form below stays), open this page in the real
 * browser, or get the app.
 */
import { useEffect, useState } from 'react';
import { StoreButtons } from './StoreButtons';
import { androidOpenInChromeUrl, detectInApp, type InAppName } from '@/lib/inAppBrowser';
import { isNativeApp } from '@/lib/iap';

export function useInAppBrowser(): { name: InAppName; android: boolean } {
  const [state, setState] = useState<{ name: InAppName; android: boolean }>({ name: null, android: false });
  useEffect(() => {
    if (isNativeApp()) return;
    const ua = navigator.userAgent || '';
    // ?inapp=1 lets us preview this on a normal browser.
    const forced = new URLSearchParams(window.location.search).get('inapp') === '1';
    const name = detectInApp(ua) || (forced ? 'Instagram' : null);
    setState({ name, android: /Android/i.test(ua) });
  }, []);
  return state;
}

export function InAppNotice({ name, android, action }: { name: Exclude<InAppName, null>; android: boolean; action: 'sign up' | 'sign in' }) {
  const [copied, setCopied] = useState(false);
  const [href, setHref] = useState('');
  useEffect(() => { setHref(window.location.href); }, []);

  const copy = async () => {
    try { await navigator.clipboard.writeText(window.location.href); setCopied(true); } catch { /* ignore */ }
  };

  return (
    <div className="a-note" style={{ textAlign: 'left', marginBottom: '1.1rem' }} data-testid="inapp-notice">
      <strong style={{ color: 'var(--txt)', display: 'block', marginBottom: '.35rem' }}>
        You&apos;re in the {name} browser
      </strong>
      <span>
        Google sign-in doesn&apos;t work inside {name}. {action === 'sign up' ? 'Sign up' : 'Sign in'} with your email below,
        {' '}{android ? 'open this page in Chrome' : <>tap <b>&middot;&middot;&middot;</b> then <b>Open in browser</b></>}, or get the app.
      </span>
      <div style={{ display: 'flex', gap: '.6rem', flexWrap: 'wrap', margin: '.8rem 0 .9rem' }}>
        {android && href && (
          <a className="a-btn a-oauth" href={androidOpenInChromeUrl(href)} style={{ width: 'auto', padding: '.6em 1em', textDecoration: 'none' }}>Open in Chrome</a>
        )}
        <button type="button" className="a-btn a-oauth" onClick={copy} style={{ width: 'auto', padding: '.6em 1em' }}>
          {copied ? 'Link copied' : 'Copy link'}
        </button>
      </div>
      <StoreButtons placement={`inapp_${action.replace(' ', '')}`} />
    </div>
  );
}
