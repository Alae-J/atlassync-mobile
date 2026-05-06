import type { StoredUser } from '../api/storage';

/**
 * Best human-readable label for a user. Prefers an explicit username (set during
 * registration), falls back to the email-local-part (everything before {@code @}),
 * lightly title-cased.
 */
export function displayName(user: StoredUser | null): string {
  if (!user) return 'there';
  if (user.username && user.username.trim()) {
    return titleCase(user.username.trim()) || user.username.trim();
  }
  const local = user.email.split('@')[0];
  return titleCase(local) || 'there';
}

/** First whitespace/-/_/. -separated token of the display name. */
export function firstName(user: StoredUser | null): string {
  return displayName(user).split(/[\s_\-.]+/)[0];
}

/** Splits the display name into first + rest. */
export function splitName(user: StoredUser | null): [string, string] {
  const parts = displayName(user).split(/[\s_\-.]+/);
  return [parts[0], parts.slice(1).join(' ')];
}

function titleCase(input: string): string {
  if (!input) return input;
  return input
    .split(/[\s_\-.]+/)
    .filter(Boolean)
    .map((p) => p[0].toUpperCase() + p.slice(1))
    .join(' ');
}
