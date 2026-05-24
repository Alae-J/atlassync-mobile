/**
 * Cross-references a product's allergens against the user's flagged list and
 * marks any overlap. Used by the Product Detail allergen banner and the
 * in-ingredient highlighting; shared so the matching logic can't drift between
 * surfaces.
 */
export function matchedAllergens(
  productAllergens: string[],
  userAllergens: string[],
): string[] {
  const flagged = new Set(userAllergens.map((a) => a.toLowerCase()));
  return productAllergens.filter((a) => flagged.has(a.toLowerCase()));
}

/**
 * Splits an ingredients string into segments. Each segment is either plain
 * text or a {@code highlight: true} hit on one of the user's flagged
 * allergens. The Detail screen wraps highlights in a soft-red wash.
 */
export interface IngredientSegment {
  text: string;
  highlight: boolean;
}

export function highlightIngredients(
  ingredients: string,
  flaggedAllergens: string[],
): IngredientSegment[] {
  if (!ingredients) return [];
  if (flaggedAllergens.length === 0) return [{ text: ingredients, highlight: false }];

  const escaped = flaggedAllergens
    .map((a) => a.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
    .join('|');
  const pattern = new RegExp(`(${escaped})`, 'ig');
  const parts = ingredients.split(pattern);

  return parts
    .filter((segment) => segment.length > 0)
    .map((segment) => ({
      text: segment,
      highlight: pattern.test(segment) && (pattern.lastIndex = 0, true),
    }));
}
