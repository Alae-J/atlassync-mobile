import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import * as SecureStore from 'expo-secure-store';
import type { User, AuthResponse } from '../types';

interface AuthContextType {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadStoredAuth();
  }, []);

  async function loadStoredAuth() {
    try {
      const token = await SecureStore.getItemAsync('accessToken');
      const userData = await SecureStore.getItemAsync('user');
      if (token && userData) {
        setAccessToken(token);
        setUser(JSON.parse(userData));
      }
    } catch {
      // No stored auth
    } finally {
      setIsLoading(false);
    }
  }

  async function storeAuth(response: AuthResponse) {
    const userData: User = { userId: response.userId, email: response.email, role: response.role };
    await SecureStore.setItemAsync('accessToken', response.accessToken);
    await SecureStore.setItemAsync('refreshToken', response.refreshToken);
    await SecureStore.setItemAsync('user', JSON.stringify(userData));
    setAccessToken(response.accessToken);
    setUser(userData);
  }

  async function login(email: string, password: string) {
    // TODO: Call auth API -- will wire up when building the actual login screen
    throw new Error('Not implemented yet');
  }

  async function register(email: string, username: string, password: string) {
    // TODO: Call auth API -- will wire up when building the actual register screen
    throw new Error('Not implemented yet');
  }

  async function logout() {
    await SecureStore.deleteItemAsync('accessToken');
    await SecureStore.deleteItemAsync('refreshToken');
    await SecureStore.deleteItemAsync('user');
    setAccessToken(null);
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{
      user,
      accessToken,
      isAuthenticated: !!accessToken,
      isLoading,
      login,
      register,
      logout,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
