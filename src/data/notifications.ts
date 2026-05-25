/**
 * Notification categories surfaced on the Notifications preferences screen.
 * Stored as `users.notification_prefs` JSONB — a flat key → on/off map.
 *
 * "Receipts" is locked: legal/service-obligation, always on. The Switch
 * still renders but doesn't react to taps.
 */

export interface NotificationCategory {
  key: string;
  name: string;
  helper: string;
  /** Defaults applied when the user opens the screen for the first time. */
  defaultOn: boolean;
  /** Locked categories can't be turned off — Receipts, today. */
  locked?: boolean;
}

export const NOTIFICATION_CATEGORIES: NotificationCategory[] = [
  {
    key: 'saved_list_reminders',
    name: 'Saved-list reminders',
    helper: 'When a list of yours has aged 2+ weeks without a shop',
    defaultOn: true,
  },
  {
    key: 'price_drops',
    name: 'Price drops',
    helper: 'When something on your saved lists drops in price',
    defaultOn: true,
  },
  {
    key: 'session_updates',
    name: 'Session updates',
    helper: 'Cart-totals nudges and "forgot to scan" pings while you shop',
    defaultOn: false,
  },
  {
    key: 'receipts',
    name: 'Receipts',
    helper:
      "Always on — you'll always get a copy of your purchase by email and in-app",
    defaultOn: true,
    locked: true,
  },
];

/** Merge stored prefs with defaults so unset categories still render correctly. */
export function withDefaults(prefs: Record<string, boolean>): Record<string, boolean> {
  const merged: Record<string, boolean> = {};
  NOTIFICATION_CATEGORIES.forEach((cat) => {
    merged[cat.key] = cat.locked
      ? true
      : prefs[cat.key] !== undefined
        ? prefs[cat.key]
        : cat.defaultOn;
  });
  return merged;
}

/** Count categories currently on, used for the row's "3 categories on" subtitle. */
export function countOn(prefs: Record<string, boolean>): number {
  const merged = withDefaults(prefs);
  return Object.values(merged).filter(Boolean).length;
}
