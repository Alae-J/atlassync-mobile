import { View, Text, StyleSheet } from 'react-native';
import { Colors, Typography } from '../src/constants/theme';

/** Screen 6: Slide to Pay -- checkout confirmation */
export default function CheckoutScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Confirm Payment</Text>
      <Text style={styles.subtitle}>Order summary + slide-to-pay gesture goes here</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.charcoal, justifyContent: 'center', alignItems: 'center', padding: 24 },
  title: { ...Typography.heading1, color: Colors.textInverse },
  subtitle: { ...Typography.bodyMedium, color: Colors.textMuted, marginTop: 8, textAlign: 'center' },
});
