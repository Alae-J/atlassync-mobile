import axios, { AxiosError, type AxiosInstance, type InternalAxiosRequestConfig } from 'axios';
import { API_BASE_URL, Endpoints } from '../constants/api';
import { tokenStorage } from './storage';

interface RetriableConfig extends InternalAxiosRequestConfig {
  _retried?: boolean;
}

interface RefreshResponse {
  accessToken: string;
  refreshToken: string;
  userId: number;
  email: string;
  username: string | null;
  role: string;
  emailVerified: boolean;
  phone: string | null;
  preferences: {
    defaultStoreId: number | null;
    currencyCode: string;
    dietaryPrefs: string[];
    allergens: string[];
    notificationPrefs: Record<string, boolean>;
  };
}

let onUnauthenticated: (() => void) | null = null;

export function setUnauthenticatedHandler(fn: (() => void) | null): void {
  onUnauthenticated = fn;
}

export const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 12000,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use(async (config) => {
  const token = await tokenStorage.getAccess();
  if (token) config.headers.set('Authorization', `Bearer ${token}`);
  return config;
});

let refreshInFlight: Promise<string | null> | null = null;

async function refreshAccessToken(): Promise<string | null> {
  if (refreshInFlight) return refreshInFlight;

  refreshInFlight = (async () => {
    try {
      const refreshToken = await tokenStorage.getRefresh();
      if (!refreshToken) return null;
      const { data } = await axios.post<RefreshResponse>(
        `${API_BASE_URL}${Endpoints.auth.refresh}`,
        { refreshToken },
        { headers: { 'Content-Type': 'application/json' } },
      );
      const existingUser = await tokenStorage.getUser();
      await tokenStorage.set(data.accessToken, data.refreshToken, {
        userId: data.userId,
        email: data.email,
        username: data.username,
        role: data.role,
        emailVerified: data.emailVerified,
        phone: data.phone,
        // avatarUri lives purely on-device for now; preserve across refresh.
        avatarUri: existingUser?.avatarUri ?? null,
        preferences: data.preferences,
      });
      return data.accessToken;
    } catch {
      await tokenStorage.clear();
      onUnauthenticated?.();
      return null;
    } finally {
      refreshInFlight = null;
    }
  })();

  return refreshInFlight;
}

api.interceptors.response.use(
  (res) => res,
  async (error: AxiosError) => {
    const original = error.config as RetriableConfig | undefined;
    const status = error.response?.status;

    if (status === 401 && original && !original._retried) {
      original._retried = true;
      const fresh = await refreshAccessToken();
      if (fresh) {
        original.headers?.set('Authorization', `Bearer ${fresh}`);
        return api(original);
      }
    }

    return Promise.reject(error);
  },
);
