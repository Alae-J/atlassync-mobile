/**
 * Allergen tags the user can flag. Mirrors the EU's 14 declared allergens
 * plus a couple of widely-recognised extras. Order is influenced by how
 * common the allergy is — Milk, Eggs, Gluten first.
 *
 * Surfaced as red AllergenChip toggles on the Allergens screen, and as
 * red banner / ingredient highlights on Product Detail + the scan peek.
 */
export const ALLERGEN_TAGS = [
  'Milk',
  'Eggs',
  'Gluten',
  'Wheat',
  'Soy',
  'Fish',
  'Shellfish',
  'Crustaceans',
  'Molluscs',
  'Peanuts',
  'Tree nuts',
  'Sesame',
  'Mustard',
  'Celery',
  'Sulphites',
  'Lupin',
] as const;

export type AllergenTag = (typeof ALLERGEN_TAGS)[number];
