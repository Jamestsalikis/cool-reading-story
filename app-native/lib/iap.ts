'use client';
/**
 * In-app purchases (RevenueCat) for the native app.
 *
 * Subscriptions (monthly / annual) go through Apple IAP via RevenueCat. The
 * RevenueCat webhook syncs the "premium" entitlement into Supabase
 * user_subscriptions (server-authoritative), so the app + edge function agree on
 * who is subscribed. The web always uses Stripe (handled elsewhere).
 *
 * RevenueCat is configured with appUserID = the Supabase user id, so a purchase
 * maps straight back to the account.
 */

/* eslint-disable @typescript-eslint/no-explicit-any */

export function isNativeApp(): boolean {
  return typeof window !== 'undefined' && !!(window as { Capacitor?: unknown }).Capacitor;
}

// Regions where in-app digital purchases must go through store billing.
const IAP_REGIONS = ['AU', 'CA'];
export function shouldUseInAppPurchase(countryCode: string | undefined): boolean {
  return isNativeApp() && !!countryCode && IAP_REGIONS.includes(countryCode.toUpperCase());
}

// The RevenueCat entitlement identifier that grants premium.
const ENTITLEMENT = 'premium';

let configuredFor: string | null = null;

async function rc(): Promise<any> {
  const mod = await import('@revenuecat/purchases-capacitor');
  return mod.Purchases;
}

function platform(): string {
  return (window as any).Capacitor?.getPlatform?.() ?? 'web';
}

/** Configure RevenueCat once, tied to the Supabase user id. No-op on web. */
export async function initIAP(supabaseUserId: string): Promise<void> {
  if (!isNativeApp() || !supabaseUserId || configuredFor === supabaseUserId) return;
  try {
    const Purchases = await rc();
    const apiKey = platform() === 'ios'
      ? (process.env.NEXT_PUBLIC_REVENUECAT_IOS_KEY ?? '')
      : (process.env.NEXT_PUBLIC_REVENUECAT_ANDROID_KEY ?? '');
    if (!apiKey) return;
    if (configuredFor === null) {
      await Purchases.configure({ apiKey, appUserID: supabaseUserId });
    } else {
      await Purchases.logIn({ appUserID: supabaseUserId });
    }
    configuredFor = supabaseUserId;
  } catch (e) {
    console.error('[iap] init failed', e);
  }
}

export type Plan = 'monthly' | 'annual';
export type PurchaseResult = { ok: boolean; cancelled?: boolean; error?: string };

/** Buy the monthly or annual subscription. */
export async function purchaseSubscription(plan: Plan): Promise<PurchaseResult> {
  if (!isNativeApp()) return { ok: false, error: 'In-app purchases are only available in the app.' };
  try {
    const Purchases = await rc();
    const offerings = await Purchases.getOfferings();
    const current = offerings?.current;
    if (!current) return { ok: false, error: 'No subscriptions available right now. Please try again later.' };
    const pkg = plan === 'annual' ? current.annual : current.monthly;
    if (!pkg) return { ok: false, error: `The ${plan} plan is unavailable right now.` };
    const result = await Purchases.purchasePackage({ aPackage: pkg });
    const active = result?.customerInfo?.entitlements?.active ?? {};
    return { ok: !!active[ENTITLEMENT] };
  } catch (e) {
    const err = e as any;
    if (err?.userCancelled === true || err?.code === '1' || /cancel/i.test(err?.message ?? '')) {
      return { ok: false, cancelled: true };
    }
    return { ok: false, error: err?.message ?? 'Purchase failed. Please try again.' };
  }
}

/** Restore previous purchases (the App Store requires a Restore option somewhere). */
export async function restorePurchases(): Promise<PurchaseResult> {
  if (!isNativeApp()) return { ok: false, error: 'not native' };
  try {
    const Purchases = await rc();
    const info = await Purchases.restorePurchases();
    const active = info?.customerInfo?.entitlements?.active ?? {};
    return { ok: !!active[ENTITLEMENT] };
  } catch (e) {
    return { ok: false, error: (e as any)?.message ?? 'Restore failed.' };
  }
}

/** True if the store currently reports the premium entitlement as active. */
export async function hasActiveEntitlement(): Promise<boolean> {
  if (!isNativeApp()) return false;
  try {
    const Purchases = await rc();
    const info = await Purchases.getCustomerInfo();
    return !!info?.customerInfo?.entitlements?.active?.[ENTITLEMENT];
  } catch {
    return false;
  }
}
