/**
 * Dietary preference tags surfaced on the chip cloud + as DietChip badges
 * on Product Detail / Search rows. Order matters: shown left-to-right,
 * top-to-bottom — Halal lives first because the primary market is Muslim.
 */
export const DIETARY_TAGS = [
  'Halal',
  'No pork',
  'No alcohol',
  'Vegetarian',
  'Vegan',
  'Pescatarian',
  'Gluten-free',
  'Lactose-free',
  'Low sugar',
  'Low sodium',
  'Keto',
  'Sugar-free',
  'Organic only',
  'Locally sourced',
] as const;

export type DietaryTag = (typeof DIETARY_TAGS)[number];
