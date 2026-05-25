import * as SecureStore from 'expo-secure-store';

const ACCESS_KEY = 'auth.accessToken';
const REFRESH_KEY = 'auth.refreshToken';
const USER_KEY = 'auth.user';

export interface StoredUser {
  userId: number;
  email: string;
  username: string | null;
  role: string;
  emailVerified: boolean;
  phone: string | null;
  /** Local file URI from expo-image-picker. Not yet persisted server-side. */
  avatarUri: string | null;
  preferences: UserPreferences;
}

export interface UserPreferences {
  defaultStoreId: number | null;
  currencyCode: string;
  dietaryPrefs: string[];
  allergens: string[];
  notificationPrefs: Record<string, boolean>;
}

/** Default empty preferences — used as a fallback when stored data is older
 *  than the current schema (pre-preferences logins). */
export const EMPTY_PREFERENCES: UserPreferences = {
  defaultStoreId: null,
  currencyCode: 'USD',
  dietaryPrefs: [],
  allergens: [],
  notificationPrefs: {},
};

export const tokenStorage = {
  async getAccess(): Promise<string | null> {
    return SecureStore.getItemAsync(ACCESS_KEY);
  },
  async getRefresh(): Promise<string | null> {
    return SecureStore.getItemAsync(REFRESH_KEY);
  },
  async getUser(): Promise<StoredUser | null> {
    const raw = await SecureStore.getItemAsync(USER_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as StoredUser;
    // Forward-compat for sessions stored before V6 (preferences may be missing).
    if (!parsed.preferences) parsed.preferences = { ...EMPTY_PREFERENCES };
    return parsed;
  },
  async set(access: string, refresh: string, user: StoredUser): Promise<void> {
    await Promise.all([
      SecureStore.setItemAsync(ACCESS_KEY, access),
      SecureStore.setItemAsync(REFRESH_KEY, refresh),
      SecureStore.setItemAsync(USER_KEY, JSON.stringify(user)),
    ]);
  },
  async setAccess(access: string): Promise<void> {
    await SecureStore.setItemAsync(ACCESS_KEY, access);
  },
  async setUser(user: StoredUser): Promise<void> {
    await SecureStore.setItemAsync(USER_KEY, JSON.stringify(user));
  },
  async clear(): Promise<void> {
    await Promise.all([
      SecureStore.deleteItemAsync(ACCESS_KEY),
      SecureStore.deleteItemAsync(REFRESH_KEY),
      SecureStore.deleteItemAsync(USER_KEY),
    ]);
  },
};
