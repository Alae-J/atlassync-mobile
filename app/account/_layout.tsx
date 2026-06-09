import { Stack } from 'expo-router';
import { Colors } from '../../src/constants/theme';

export default function AccountLayout() {
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
