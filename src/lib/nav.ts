import { router } from 'expo-router';

/**
 * Replace-style back-navigation that targets a specific destination instead
 * of letting expo-router pop the stack on its own.
 *
 * Why this exists: when a screen pushed from inside a nested navigator
 * (e.g. a tab) lives in a *different* navigator at root level
 * (`/account/*`, `/auth/verify-email`, `/search`), `router.back()` crosses
 * the navigator boundary and unwinds further than intended — it tends to
 * land on whatever the root layout fell back to (usually home). Using
 * `router.replace(destination)` instead is explicit and predictable.
 *
 * Each screen pushed from outside its own stack should use this for its
 * back affordance, naming the screen it logically belongs to. New screens
 * should keep using this pattern rather than reaching for `router.back()`.
 */
export function backTo(destination: string) {
  return () => router.replace(destination as never);
}
