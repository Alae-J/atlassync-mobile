import { Slot } from 'expo-router';
import { View } from 'react-native';
import { Colors } from '../../src/constants/theme';

export default function TabsLayout() {
  return (
    <View style={{ flex: 1, backgroundColor: Colors.cream }}>
      <Slot />
    </View>
  );
}
