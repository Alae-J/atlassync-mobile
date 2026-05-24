import * as SecureStore from 'expo-secure-store';

const KEY = 'search.recent';
const MAX_ENTRIES = 8;

/**
 * Recent search persistence. SecureStore is heavier than this needs to be
 * (search history isn't a secret) but it's already a peer dependency and
 * the cost is negligible for ~8 short strings. Avoids pulling in AsyncStorage
 * just for one feature.
 */
export const recentSearches = {
  async list(): Promise<string[]> {
    const raw = await SecureStore.getItemAsync(KEY);
    if (!raw) return [];
    try {
      const parsed = JSON.parse(raw) as unknown;
      return Array.isArray(parsed)
        ? parsed.filter((s): s is string => typeof s === 'string')
        : [];
    } catch {
      return [];
    }
  },

  /**
   * Push the query to the front of the list, dedup case-insensitively, and
   * cap at {@link MAX_ENTRIES}. Trimmed/blank queries are ignored.
   */
  async push(query: string): Promise<string[]> {
    const trimmed = query.trim();
    if (trimmed.length === 0) return this.list();

    const current = await this.list();
    const lowered = trimmed.toLowerCase();
    const next = [trimmed, ...current.filter((q) => q.toLowerCase() !== lowered)].slice(
      0,
      MAX_ENTRIES,
    );
    await SecureStore.setItemAsync(KEY, JSON.stringify(next));
    return next;
  },

  async clear(): Promise<void> {
    await SecureStore.deleteItemAsync(KEY);
  },
};
