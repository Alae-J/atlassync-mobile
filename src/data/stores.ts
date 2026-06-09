/**
 * Static list of stores the app supports. The backend stores only an id
 * (`users.default_store_id`); the labels + distances live here for now.
 *
 * Distance + hours are placeholders — wire to geolocation + a real
 * `/api/stores` endpoint when those exist. The display label is what
 * shows on Home's "Closest" pill and on the Preferences tab.
 */

export interface Store {
  id: number;
  name: string;
  city: string;
  /** Display-only — replace with real distance from device geo later. */
  distance: string;
  /** Display-only — replace with live hours from the backend later. */
  hours: string;
}

export const stores: Store[] = [
  { id: 1, name: 'Aldi', city: 'Mansoura',   distance: '1.2 km', hours: 'open until 11 PM' },
  { id: 2, name: 'Aldi', city: 'Heliopolis', distance: '8.4 km', hours: 'open until 10 PM' },
  { id: 3, name: 'Aldi', city: 'Talkha',     distance: '5.6 km', hours: 'closes at 9 PM' },
];

export const DEFAULT_STORE_ID = 1;

export function storeById(id: number | null | undefined): Store | undefined {
  if (id == null) return undefined;
  return stores.find((s) => s.id === id);
}

/** "Aldi · Mansoura" — the display label used on Home and Preferences. */
export function storeLabel(id: number | null | undefined): string {
  const s = storeById(id) ?? storeById(DEFAULT_STORE_ID);
  return s ? `${s.name} · ${s.city}` : '—';
}
