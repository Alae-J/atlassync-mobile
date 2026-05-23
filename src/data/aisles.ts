/**
 * Static taxonomy for the "Browse by aisle" rail on the Search screen.
 *
 * Aisle numbers line up with the {@code aisleNumber} column on the backend
 * product table, so tapping an entry can pre-filter the catalog. "Halal counter"
 * is the named alias for the meat aisle — reflects how Egyptian users talk
 * about it, surfaced from the design handoff.
 */
export interface AisleEntry {
  number: number;
  name: string;
  subtitle: string;
}

export const aisles: AisleEntry[] = [
  { number: 1,  name: 'Produce',       subtitle: 'Fruits & vegetables' },
  { number: 5,  name: 'Dairy',         subtitle: 'Milk, cheese, yogurt' },
  { number: 8,  name: 'Bakery',        subtitle: 'Bread & pastries' },
  { number: 9,  name: 'Pantry',        subtitle: 'Oils, pasta, grains' },
  { number: 11, name: 'Seafood',       subtitle: 'Fresh fish counter' },
  { number: 12, name: 'Halal counter', subtitle: 'Meat & poultry' },
];
