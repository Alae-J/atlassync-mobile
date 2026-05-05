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
    const next: StoredUser = {
      userId: response.userId,
      email: response.email,
      role: response.role,
    };
    await tokenStorage.set(response.accessToken, response.refreshToken, next);
    setUser(next);
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
