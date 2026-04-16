import { View, Text, StyleSheet } from 'react-native';
import { Colors, Typography } from '../../src/constants/theme';

/** Screen 3: QR Code Display -- entry/exit gate pass */
export default function EntryScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Entry Pass</Text>
      <Text style={styles.subtitle}>QR code for gate entry/exit goes here</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.charcoal, justifyContent: 'center', alignItems: 'center', padding: 24 },
  title: { ...Typography.heading1, color: Colors.textInverse },
  subtitle: { ...Typography.bodyMedium, color: Colors.textMuted, marginTop: 8, textAlign: 'center' },
});
