import { Stack } from 'expo-router';
import { Colors } from '../../src/constants/theme';

export default function ShopLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: Colors.cream },
        animation: 'slide_from_right',
      }}
    />
  );
}
