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
}

export const tokenStorage = {
  async getAccess(): Promise<string | null> {
    return SecureStore.getItemAsync(ACCESS_KEY);
  },
  async getRefresh(): Promise<string | null> {
    return SecureStore.getItemAsync(REFRESH_KEY);
  },
  async getUser(): Promise<StoredUser | null> {
    const raw = await SecureStore.getItemAsync(USER_KEY);
    return raw ? (JSON.parse(raw) as StoredUser) : null;
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
