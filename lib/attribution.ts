/**
 * First-touch marketing attribution, kept in the browser until signup.
 *
 * On the first landing that carries any UTM or click id we save those params,
 * the landing page and the referrer to localStorage AND a first-party cookie
 * (tp_attr, 90 days). First touch wins: later visits do not overwrite it.
 * At signup the stored values (plus the Meta _fbp/_fbc cookies at that moment)
 * are sent with the signup and saved in the Supabase user's user_metadata, so
 * no database schema change is needed. The cookie lets the server read the
 * same data for Google sign-ups and for the /app store hand-off.
 */
import { TRACKING_KEYS } from './storeLinks';

export const ATTR_COOKIE = 'tp_attr';
const LS_KEY = 'tp_attr';
const MAX_AGE = 60 * 60 * 24 * 90;

export type Attribution = Partial<Record<(typeof TRACKING_KEYS)[number], string>> & {
  landing_page?: string;
  referrer?: string;
  first_seen?: string;
  fbp?: string;
  fbc?: string;
};

function readCookie(name: string): string | undefined {
  if (typeof document === 'undefined') return undefined;
  const m = document.cookie.match(new RegExp('(?:^|; )' + name + '=([^;]*)'));
  return m ? decodeURIComponent(m[1]) : undefined;
}

function readStored(): Attribution | null {
  try {
    const raw = localStorage.getItem(LS_KEY) || readCookie(ATTR_COOKIE);
    return raw ? (JSON.parse(raw) as Attribution) : null;
  } catch {
    return null;
  }
}

/** Call once per page load (MetaPixel does this on every marketing page). */
export function captureAttribution(): void {
  if (typeof window === 'undefined') return;
  const qs = new URLSearchParams(window.location.search);
  const found: Attribution = {};
  for (const k of TRACKING_KEYS) {
    const v = qs.get(k);
    if (v) found[k] = v.slice(0, 200);
  }
  const existing = readStored();
  // Meta's own click cookie: if the ad click brought an fbclid and the Pixel is
  // not running (no consent / no pixel id), build _fbc in Meta's documented format.
  if (found.fbclid && !readCookie('_fbc')) {
    document.cookie = `_fbc=fb.1.${Date.now()}.${found.fbclid}; Max-Age=${MAX_AGE}; Path=/; SameSite=Lax`;
  }
  if (existing || Object.keys(found).length === 0) return;
  const attr: Attribution = {
    ...found,
    landing_page: (window.location.pathname + window.location.search).slice(0, 300),
    referrer: document.referrer ? document.referrer.slice(0, 300) : undefined,
    first_seen: new Date().toISOString(),
  };
  const json = JSON.stringify(attr);
  try { localStorage.setItem(LS_KEY, json); } catch { /* private mode */ }
  document.cookie = `${ATTR_COOKIE}=${encodeURIComponent(json)}; Max-Age=${MAX_AGE}; Path=/; SameSite=Lax`;
}

/** Stored first touch plus the current Meta browser ids, for the signup. */
export function getAttribution(): Attribution {
  const a: Attribution = { ...(readStored() || {}) };
  const fbp = readCookie('_fbp');
  const fbc = readCookie('_fbc');
  if (fbp) a.fbp = fbp;
  if (fbc) a.fbc = fbc;
  return a;
}

/** Server side: keep only known keys and short strings from untrusted input. */
export function sanitizeAttribution(input: unknown): Attribution | null {
  if (!input || typeof input !== 'object') return null;
  const allowed = [...TRACKING_KEYS, 'landing_page', 'referrer', 'first_seen', 'fbp', 'fbc'];
  const out: Record<string, string> = {};
  for (const k of allowed) {
    const v = (input as Record<string, unknown>)[k];
    if (typeof v === 'string' && v) out[k] = v.slice(0, 300);
  }
  return Object.keys(out).length ? (out as Attribution) : null;
}

export function parseAttributionCookie(raw: string | undefined): Attribution | null {
  if (!raw) return null;
  try { return sanitizeAttribution(JSON.parse(decodeURIComponent(raw))); } catch { return null; }
}
