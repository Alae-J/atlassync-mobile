import { View, Text, StyleSheet } from 'react-native';
import { Colors, Typography } from '../src/constants/theme';

/** Screen 8: Payment Success / Receipt */
export default function SuccessScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>You're all set!</Text>
      <Text style={styles.subtitle}>Payment success animation + receipt card goes here</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.charcoal, justifyContent: 'center', alignItems: 'center', padding: 24 },
  title: { ...Typography.heading1, color: Colors.textInverse },
  subtitle: { ...Typography.bodyMedium, color: Colors.textMuted, marginTop: 8, textAlign: 'center' },
});
