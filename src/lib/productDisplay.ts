import type { Product } from '../types';
import type { NutriscoreGrade } from '../constants/theme';

/**
 * Render-ready projection of the backend {@link Product}. The catalog populates
 * via Open Food Facts which leaves many fields sparse — this helper normalises
 * them to safe defaults so the UI doesn't need null-guards everywhere.
 */
export interface DisplayProduct {
  id: number;
  barcode: string;
  name: string;
  brand: string | null;
  price: number;
  currencyCode: string;
  unit: string;
  emoji: string;
  aisle: number | null;
  nutriscore: NutriscoreGrade | null;
  inStock: boolean;
  dietary: string[];
  allergens: string[];
  nutrition: NutritionFacts | null;
  ingredients: string;
  about: string | null;
  rfidSecurityRequired: boolean;
}

export interface NutritionFacts {
  kcal: number;
  sugars: number;
  fats: number;
  salt: number;
}

// Best-effort emoji by lowercased keyword. Backend rarely ships imageUrl during
// dev — until a CDN is wired up, an emoji is a calmer placeholder than a grey
// square. Lookup is "any keyword matches", first hit wins.
const EMOJI_KEYWORDS: Array<[string, string]> = [
  ['banana', '🍌'], ['apple', '🍎'], ['tomato', '🍅'], ['avocado', '🥑'],
  ['onion', '🧅'], ['salmon', '🐟'], ['fish', '🐟'], ['chicken', '🍗'],
  ['beef', '🥩'], ['lamb', '🥩'], ['egg', '🥚'], ['milk', '🥛'],
  ['yogurt', '🥣'], ['cheese', '🧀'], ['bread', '🍞'], ['baguette', '🥖'],
  ['croissant', '🥐'], ['pasta', '🍝'], ['rice', '🍚'], ['cereal', '🥣'],
  ['coffee', '☕'], ['tea', '🍵'], ['oil', '🫒'], ['olive', '🫒'],
  ['chocolate', '🍫'], ['water', '💧'], ['juice', '🧃'], ['soda', '🥤'],
  ['cookie', '🍪'], ['biscuit', '🍪'], ['butter', '🧈'], ['honey', '🍯'],
  ['sugar', '🧂'], ['salt', '🧂'], ['pepper', '🌶️'], ['carrot', '🥕'],
  ['lettuce', '🥬'], ['broccoli', '🥦'], ['corn', '🌽'], ['potato', '🥔'],
  ['lemon', '🍋'], ['orange', '🍊'], ['grape', '🍇'], ['strawberry', '🍓'],
  ['pizza', '🍕'], ['burger', '🍔'],
];

function emojiFor(name: string): string {
  const haystack = name.toLowerCase();
  for (const [keyword, emoji] of EMOJI_KEYWORDS) {
    if (haystack.includes(keyword)) return emoji;
  }
  return '📦';
}

function parseGrade(raw: string | null): NutriscoreGrade | null {
  if (!raw) return null;
  const upper = raw.trim().toUpperCase();
  if (upper.length === 0) return null;
  const first = upper.charAt(0) as NutriscoreGrade;
  return 'ABCDE'.includes(first) ? first : null;
}

function numberOr(value: unknown, fallback: number): number {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string') {
    const parsed = Number.parseFloat(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return fallback;
}

function parseNutriments(raw: Record<string, unknown> | null): NutritionFacts | null {
  if (!raw) return null;
  // Open Food Facts keys vary: "energy-kcal_100g", "energy_kcal", etc.
  const kcal = numberOr(
    raw['energy-kcal_100g'] ?? raw['energy_kcal_100g'] ?? raw['energy-kcal'] ?? raw.kcal,
    NaN,
  );
  if (!Number.isFinite(kcal)) return null;
  return {
    kcal: Math.round(kcal),
    sugars: numberOr(raw['sugars_100g'] ?? raw.sugars, 0),
    fats:   numberOr(raw['fat_100g'] ?? raw.fats ?? raw.fat, 0),
    salt:   numberOr(raw['salt_100g'] ?? raw.salt, 0),
  };
}

function parseStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((v): v is string => typeof v === 'string' && v.length > 0);
}

function titleCase(value: string): string {
  const cleaned = value.replace(/^en:/, '').replace(/[-_]/g, ' ').trim();
  return cleaned.charAt(0).toUpperCase() + cleaned.slice(1).toLowerCase();
}

/**
 * Project a backend Product into the render-ready shape used by Search,
 * Product Detail, and the post-scan peek card.
 */
export function toDisplayProduct(product: Product): DisplayProduct {
  const attrs = product.attributes ?? {};
  const dietary = parseStringArray(attrs.dietary);
  const allergens = (product.allergenCodes ?? []).map(titleCase);

  const aboutFromAttr = typeof attrs.about === 'string' ? attrs.about : null;
  const aboutFallback = product.rfidSecurityRequired
    ? 'Cold-chain item — RFID tagged. Pick up at the counter on your way out.'
    : null;

  return {
    id: product.id,
    barcode: product.barcode,
    name: product.name,
    brand: product.brand,
    price: product.price,
    currencyCode: product.currencyCode,
    unit: typeof attrs.unit === 'string' ? attrs.unit : 'ea',
    emoji: emojiFor(product.name),
    aisle: product.aisleNumber,
    nutriscore: parseGrade(product.nutriscoreGrade),
    inStock: product.stockQuantity > 0,
    dietary,
    allergens,
    nutrition: parseNutriments(product.nutriments),
    ingredients: product.ingredientsText ?? '',
    about: aboutFromAttr ?? aboutFallback,
    rfidSecurityRequired: product.rfidSecurityRequired,
  };
}
