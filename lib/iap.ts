'use client';
/**
 * In-app purchase routing for the native app.
 *
 * Billing model:
 *  - US users: keep Stripe (web checkout / in-app link-out) — allowed in the US storefront.
 *  - AU + CA users in the NATIVE app: must use store in-app purchase (Apple IAP / Google
 *    Play Billing), routed through RevenueCat.
 *  - All web users: always Stripe.
 *
 * SETUP REQUIRED before this is functional (see TalePop-RevenueCat-Setup.md):
 *  - RevenueCat project with the Apple + Google apps connected
 *  - Store subscription products created and grouped into a RevenueCat "offering"
 *  - Public SDK keys in NEXT_PUBLIC_REVENUECAT_IOS_KEY / NEXT_PUBLIC_REVENUECAT_ANDROID_KEY
 */

export function isNativeApp(): boolean {
  return typeof window !== 'undefined' && !!(window as { Capacitor?: unknown }).Capacitor;
}

// Regions where in-app digital purchases must go through the store's billing.
const IAP_REGIONS = ['AU', 'CA'];

export function shouldUseInAppPurchase(countryCode: string | undefined): boolean {
  return isNativeApp() && !!countryCode && IAP_REGIONS.includes(countryCode.toUpperCase());
}

/** Configure RevenueCat once on app start. No-op on web. */
export async function initIAP(_supabaseUserId: string): Promise<void> {
  if (!isNativeApp()) return;
  // const { Purchases } = await import('@revenuecat/purchases-capacitor');
  // const platform = (window as any).Capacitor.getPlatform();
  // const apiKey = platform === 'ios'
  //   ? process.env.NEXT_PUBLIC_REVENUECAT_IOS_KEY!
  //   : process.env.NEXT_PUBLIC_REVENUECAT_ANDROID_KEY!;
  // await Purchases.configure({ apiKey, appUserID: _supabaseUserId });
  // TODO: enable once RevenueCat keys + products exist.
}

/** Purchase a subscription via RevenueCat. The RevenueCat webhook updates Supabase. */
export async function purchaseSubscription(_plan: 'monthly' | 'annual'): Promise<{ ok: boolean; error?: string }> {
  if (!isNativeApp()) return { ok: false, error: 'not native' };
  // const { Purchases } = await import('@revenuecat/purchases-capacitor');
  // const offerings = await Purchases.getOfferings();
  // const pkg = offerings.current?.availablePackages.find(p => p.identifier.includes(_plan));
  // if (!pkg) return { ok: false, error: 'no offering' };
  // await Purchases.purchasePackage({ aPackage: pkg });
  // return { ok: true };
  return { ok: false, error: 'IAP not yet configured' };
}
