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
    >
      <Stack.Screen name="arrive" />
      <Stack.Screen name="scan" />
      <Stack.Screen name="review" />
      <Stack.Screen name="walkout" />
      <Stack.Screen
        name="substitute"
        options={{
          presentation: 'transparentModal',
          animation: 'fade',
          contentStyle: { backgroundColor: 'transparent' },
        }}
      />
    </Stack>
  );
}
