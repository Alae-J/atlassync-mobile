import { Redirect } from 'expo-router';
import { useAuth } from '../src/context/AuthContext';

/**
 * Root index -- redirects based on auth state.
 * Authenticated -> main tabs
 * Not authenticated -> auth flow
 */
export default function Index() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) return null;

  if (isAuthenticated) {
    return <Redirect href="/(tabs)/cart" />;
  }

  return <Redirect href="/auth/login" />;
}
