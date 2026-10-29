// Single source of truth for TalePop pricing and currency selection.
// Currency is chosen from the visitor's country (Vercel's x-vercel-ip-country
// header) so what people SEE on the landing page matches what they are CHARGED
// at checkout.

export type Currency = 'aud' | 'usd' | 'cad';

// Map a 2-letter ISO country code to a currency. Anyone outside US/CA defaults
// to AUD (our home market and historical default).
export function currencyFromCountry(country?: string | null): Currency {
  switch ((country || '').toUpperCase()) {
    case 'US':
      return 'usd';
    case 'CA':
      return 'cad';
    case 'AU':
      return 'aud';
    default:
      return 'aud';
  }
}

// Fallback when country is unknown: derive currency from a browser locale.
export function currencyFromLocale(locale?: string | null): Currency {
  const l = (locale || '').toLowerCase();
  if (l === 'en-us' || l.startsWith('en-us')) return 'usd';
  if (l === 'en-ca' || l.startsWith('en-ca') || l === 'fr-ca') return 'cad';
  return 'aud';
}

// Display strings for the landing page. Symbol kept as "$" to match the
// existing design; the differing numbers do the work.
export interface PriceDisplay {
  symbol: string;
  monthly: string; // monthly price, e.g. "9.99"
  annual: string; // annual price, e.g. "99"
  extraChild: string; // additional child per month, e.g. "3.99"
  monthlyPerStory: string; // headline per-story figure on monthly plan
  annualPerStory: string; // headline per-story figure on annual plan
  annualSaving: string; // yearly saving vs paying monthly, e.g. "20.88"
}

export const DISPLAY: Record<Currency, PriceDisplay> = {
  aud: { symbol: '$', monthly: '9.99', annual: '99', extraChild: '3.99', monthlyPerStory: '33¢', annualPerStory: '24¢', annualSaving: '20.88' },
  cad: { symbol: '$', monthly: '9.99', annual: '99', extraChild: '3.99', monthlyPerStory: '33¢', annualPerStory: '24¢', annualSaving: '20.88' },
  usd: { symbol: '$', monthly: '6.99', annual: '69', extraChild: '3.99', monthlyPerStory: '23¢', annualPerStory: '19¢', annualSaving: '14.88' },
};

// Stripe amounts in minor units (cents). Source of truth for checkout.
export const AMOUNTS: Record<Currency, { monthly: number; annual: number; extraChild: number }> = {
  aud: { monthly: 999, annual: 9900, extraChild: 399 },
  cad: { monthly: 999, annual: 9900, extraChild: 399 },
  usd: { monthly: 699, annual: 6900, extraChild: 399 },
};
