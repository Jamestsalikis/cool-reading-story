/**
 * Meta Pixel helpers. Everything is a no-op unless NEXT_PUBLIC_META_PIXEL_ID is
 * set AND the loader in components/MetaPixel.tsx actually ran (it never runs in
 * the TalePop native app or on the signed-in app pages).
 */
type Fbq = (...args: unknown[]) => void;

export const META_PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID || '';

export function track(event: string, params?: Record<string, unknown>) {
  if (typeof window === 'undefined' || !META_PIXEL_ID) return;
  const fbq = (window as unknown as { fbq?: Fbq }).fbq;
  if (typeof fbq === 'function') fbq('track', event, params || {});
}

export function trackCustom(event: string, params?: Record<string, unknown>) {
  if (typeof window === 'undefined' || !META_PIXEL_ID) return;
  const fbq = (window as unknown as { fbq?: Fbq }).fbq;
  if (typeof fbq === 'function') fbq('trackCustom', event, params || {});
}

/** Store button click: a standard Lead plus a custom event naming the store. */
export function trackStoreClick(store: 'app_store' | 'google_play', placement: string) {
  track('Lead', { content_name: store, content_category: placement });
  trackCustom('StoreClick', { store, placement });
}
