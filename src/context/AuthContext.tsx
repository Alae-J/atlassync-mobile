import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { authApi, tokenStorage, setUnauthenticatedHandler, type StoredUser } from '../api';
import type { AuthResponse } from '../types';

interface AuthContextValue {
  user: StoredUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  applyAuthResponse: (response: AuthResponse) => Promise<void>;
  patchUser: (changes: Partial<StoredUser>) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<StoredUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const stored = await tokenStorage.getUser();
        if (stored) setUser(stored);
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  useEffect(() => {
    setUnauthenticatedHandler(() => setUser(null));
    return () => setUnauthenticatedHandler(null);
  }, []);

  const persist = async (response: AuthResponse) => {
    // Preserve any locally-set avatar URI across re-auth events. The backend
    // doesn't own avatars yet, so we don't blow them away when the server
    // hands us a fresh user object.
    const previous = await tokenStorage.getUser();
    const next: StoredUser = {
      userId: response.userId,
      email: response.email,
      username: response.username,
      role: response.role,
      emailVerified: response.emailVerified,
      phone: response.phone,
      avatarUri: previous?.avatarUri ?? null,
      preferences: response.preferences,
    };
    await tokenStorage.set(response.accessToken, response.refreshToken, next);
    setUser(next);
  };

  /** Patch the locally-stored user — used when avatar changes (no backend yet). */
  const patchUser = async (changes: Partial<StoredUser>) => {
    const current = await tokenStorage.getUser();
    if (!current) return;
    const merged: StoredUser = { ...current, ...changes };
    await tokenStorage.setUser(merged);
    setUser(merged);
  };

  const login = async (email: string, password: string) => {
    const res = await authApi.login({ email, password });
    await persist(res);
  };

  const register = async (email: string, username: string, password: string) => {
    const res = await authApi.register({ email, username, password });
    await persist(res);
  };

  const logout = async () => {
    const refresh = await tokenStorage.getRefresh();
    if (refresh) {
      try {
        await authApi.logout(refresh);
      } catch {
        // ignore — server may already have invalidated it
      }
    }
    await tokenStorage.clear();
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
        applyAuthResponse: persist,
        patchUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
