import { DEFAULT_CURRENCY_CODE } from '../data/currencies';

const PREFIX_SYMBOLS: Record<string, string> = {
  USD: '$',
  EUR: '€',
  GBP: '£',
};

const POSTFIX_LABELS: Record<string, string> = {
  MAD: 'MAD',
  EGP: 'EGP',
  SAR: 'SAR',
  AED: 'AED',
};

/**
 * Render a money amount with the right currency mark. MAD/EGP/SAR/AED render
 * postfix ("12.50 MAD") — that's how it reads on Moroccan receipts. USD/EUR/GBP
 * stay prefix ("$12.50"). Anything unknown falls back to a "CODE 12.50" postfix.
 *
 * @param amount  numeric amount
 * @param code    ISO currency code; falls back to DEFAULT_CURRENCY_CODE
 */
export function formatPrice(amount: number, code?: string | null): string {
  const normalised = (code || DEFAULT_CURRENCY_CODE).toUpperCase();
  const value = amount.toFixed(2);

  const prefix = PREFIX_SYMBOLS[normalised];
  if (prefix) return `${prefix}${value}`;

  const postfix = POSTFIX_LABELS[normalised] ?? normalised;
  return `${value} ${postfix}`;
}
