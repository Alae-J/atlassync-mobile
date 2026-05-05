import { Redirect } from 'expo-router';
import { View } from 'react-native';
import { useAuth } from '../src/context/AuthContext';
import { Colors } from '../src/constants/theme';

export default function Index() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) return <View style={{ flex: 1, backgroundColor: Colors.cream }} />;
  return <Redirect href={isAuthenticated ? '/(tabs)/home' : '/auth/login'} />;
}
