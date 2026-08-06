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
 *
 * IMPORTANT: we talk to the RevenueCat Capacitor plugin via the RAW global
 * (window.Capacitor.Plugins.Purchases), NOT `await import(...)`. In the bundled
 * static export running under capacitor://localhost, the dynamic import of
 * '@revenuecat/purchases-capacitor' never resolves (chunk load hangs), which left
 * the SDK unconfigured and every getOfferings()/purchase spinning forever. The
 * raw plugin object is registered natively at launch and is always available.
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

function platform(): string {
  return (window as any).Capacitor?.getPlatform?.() ?? 'web';
}

/** The RevenueCat Capacitor plugin, straight off the global bridge (no dynamic import). */
function rc(): any {
  const P = (window as any).Capacitor?.Plugins?.Purchases;
  if (!P) throw new Error('[iap] RevenueCat native plugin not available');
  return P;
}

/** Race a promise against a timeout so a hung native call surfaces instead of spinning forever. */
function withTimeout<T>(p: Promise<T>, ms: number, label: string): Promise<T> {
  return Promise.race([
    p,
    new Promise<T>((_, reject) => setTimeout(() => reject(new Error(`${label} timed out after ${ms}ms`)), ms)),
  ]);
}

let configurePromise: Promise<void> | null = null;
let configuredUser: string | null = null;

/** Configure RevenueCat exactly once (single-flight). Safe to call from anywhere before a store call. */
function ensureConfigured(appUserID?: string): Promise<void> {
  if (!isNativeApp()) return Promise.resolve();
  if (!configurePromise) {
    configurePromise = (async () => {
      const Purchases = rc();
      try { await Purchases.setLogLevel({ level: 'DEBUG' as any }); } catch { /* older plugin */ }
      const apiKey = platform() === 'ios'
        ? (process.env.NEXT_PUBLIC_REVENUECAT_IOS_KEY ?? '')
        : (process.env.NEXT_PUBLIC_REVENUECAT_ANDROID_KEY ?? '');
      if (!apiKey) throw new Error('[iap] RevenueCat API key missing from bundle');
      await Purchases.configure(appUserID ? { apiKey, appUserID } : { apiKey });
      configuredUser = appUserID ?? null;
      console.log('[iap] RevenueCat configured' + (appUserID ? ' for ' + appUserID : ' (anonymous)'));
    })();
  }
  return configurePromise;
}

/** Configure RevenueCat and tie it to the Supabase user id. No-op on web. */
export async function initIAP(supabaseUserId: string): Promise<void> {
  if (!isNativeApp() || !supabaseUserId) return;
  try {
    await ensureConfigured(supabaseUserId);
    // If configure ran anonymously (or for a different user), align the RC identity.
    if (configuredUser !== supabaseUserId) {
      try {
        await rc().logIn({ appUserID: supabaseUserId });
        configuredUser = supabaseUserId;
        console.log('[iap] logIn() OK for user ' + supabaseUserId);
      } catch (e) {
        console.error('[iap] logIn failed', e);
      }
    }
  } catch (e) {
    console.error('[iap] init failed', e);
  }
}

export type Plan = 'monthly' | 'annual';
export type PurchaseResult = { ok: boolean; cancelled?: boolean; error?: string };

// One-time 99c extra book (consumable). Must match the App Store Connect
// product id and the product check in supabase/functions/revenuecat-webhook.
const EXTRA_BOOK_PRODUCT_ID = 'talepop_extra_book';

/** Buy a single extra book (consumable, 99c one-time purchase). */
export async function purchaseExtraBook(): Promise<PurchaseResult> {
  if (!isNativeApp()) return { ok: false, error: 'In-app purchases are only available in the app.' };
  try {
    await ensureConfigured();
    const Purchases = rc();
    console.log('[iap] getProducts() ' + EXTRA_BOOK_PRODUCT_ID);
    const res: any = await withTimeout(
      Purchases.getProducts({ productIdentifiers: [EXTRA_BOOK_PRODUCT_ID], type: 'NON_SUBSCRIPTION' }),
      20000, 'getProducts',
    );
    const product = (res?.products ?? [])[0];
    if (!product) return { ok: false, error: 'The single book option is unavailable right now. Please try again later.' };
    console.log('[iap] purchaseStoreProduct() ' + (product.identifier ?? EXTRA_BOOK_PRODUCT_ID));
    await withTimeout(Purchases.purchaseStoreProduct({ product }), 180000, 'purchaseStoreProduct');
    // Consumables don't grant an entitlement — the RevenueCat webhook credits
    // extra_books_today in Supabase. Reaching here without a throw = purchased.
    console.log('[iap] extra book purchase done');
    return { ok: true };
  } catch (e) {
    console.error('[iap] purchaseExtraBook error', e);
    const err = e as any;
    if (err?.userCancelled === true || err?.code === '1' || /cancel/i.test(err?.message ?? '')) {
      return { ok: false, cancelled: true };
    }
    return { ok: false, error: err?.message ?? 'Purchase failed. Please try again.' };
  }
}

/** Buy the monthly or annual subscription. */
export async function purchaseSubscription(plan: Plan): Promise<PurchaseResult> {
  if (!isNativeApp()) return { ok: false, error: 'In-app purchases are only available in the app.' };
  try {
    await ensureConfigured();
    const Purchases = rc();
    console.log('[iap] getOfferings() start');
    const offerings: any = await withTimeout(Purchases.getOfferings(), 20000, 'getOfferings');
    const current = offerings?.current;
    console.log('[iap] offerings: current=' + (current?.identifier ?? 'NULL')
      + ' packages=' + (current?.availablePackages ?? []).map((p: any) => p.identifier + '→' + (p.product?.identifier ?? '?')).join(', '));
    if (!current) return { ok: false, error: 'No subscriptions available right now. Please try again later.' };
    const pkg = plan === 'annual' ? current.annual : current.monthly;
    if (!pkg) return { ok: false, error: `The ${plan} plan is unavailable right now.` };
    console.log('[iap] purchasePackage() ' + pkg.identifier);
    const result: any = await withTimeout(Purchases.purchasePackage({ aPackage: pkg }), 180000, 'purchasePackage');
    const active = result?.customerInfo?.entitlements?.active ?? {};
    console.log('[iap] purchase done, active entitlements=' + Object.keys(active).join(','));
    return { ok: !!active[ENTITLEMENT] };
  } catch (e) {
    console.error('[iap] purchaseSubscription error', e);
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
    await ensureConfigured();
    const info = await rc().restorePurchases();
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
    await ensureConfigured();
    const info = await rc().getCustomerInfo();
    return !!info?.customerInfo?.entitlements?.active?.[ENTITLEMENT];
  } catch {
    return false;
  }
}
