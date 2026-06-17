import { NextRequest, NextResponse } from 'next/server';
import { currencyFromCountry, DISPLAY } from '@/lib/pricing';

export const dynamic = 'force-dynamic';

// Returns the visitor's country + the currency/prices to display.
// Country comes from Vercel's geolocation header (set automatically in prod).
export async function GET(request: NextRequest) {
  const country = request.headers.get('x-vercel-ip-country');
  const currency = currencyFromCountry(country);
  return NextResponse.json({ country: country || null, currency, display: DISPLAY[currency] });
}
