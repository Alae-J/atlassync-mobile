import { View, Text, StyleSheet } from 'react-native';
import { Colors, Typography } from '../../src/constants/theme';

/** Screen 5: Live Shopping Cart -- real-time updates via WebSocket */
export default function CartScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>My Cart</Text>
      <Text style={styles.subtitle}>Live cart with real-time WebSocket updates goes here</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.offWhite, justifyContent: 'center', alignItems: 'center', padding: 24 },
  title: { ...Typography.heading1, color: Colors.textPrimary },
  subtitle: { ...Typography.bodyMedium, color: Colors.textSecondary, marginTop: 8, textAlign: 'center' },
});
