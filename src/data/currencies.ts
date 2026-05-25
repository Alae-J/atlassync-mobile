/**
 * Currencies the app supports. ISO 4217 code is the canonical id stored
 * on `users.currency_code`. Symbol is what shows next to prices.
 *
 * Listed in regional-relevance order: target-market currencies first
 * (EGP / MAD), then other widely-used.
 */

export interface Currency {
  code: string;
  name: string;
  symbol: string;
}

export const currencies: Currency[] = [
  { code: 'EGP', name: 'Egyptian Pound',  symbol: 'E£' },
  { code: 'MAD', name: 'Moroccan Dirham', symbol: 'د.م' },
  { code: 'USD', name: 'US Dollar',       symbol: '$' },
  { code: 'EUR', name: 'Euro',            symbol: '€' },
  { code: 'GBP', name: 'British Pound',   symbol: '£' },
  { code: 'SAR', name: 'Saudi Riyal',     symbol: '﷼' },
  { code: 'AED', name: 'UAE Dirham',      symbol: 'د.إ' },
];

export const DEFAULT_CURRENCY_CODE = 'USD';

export function currencyByCode(code: string | null | undefined): Currency | undefined {
  if (!code) return undefined;
  return currencies.find((c) => c.code === code);
}

/** "USD ($)" — the display label used on the Preferences tab row. */
export function currencyLabel(code: string | null | undefined): string {
  const c = currencyByCode(code) ?? currencyByCode(DEFAULT_CURRENCY_CODE);
  return c ? `${c.code} (${c.symbol})` : '—';
}
