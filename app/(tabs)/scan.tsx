import { View, Text, StyleSheet } from 'react-native';
import { Colors, Typography } from '../../src/constants/theme';

/** Screen 4: Barcode Scanner -- camera viewfinder with product info bottom sheet */
export default function ScanScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Scan Item</Text>
      <Text style={styles.subtitle}>Camera viewfinder with barcode scanning goes here</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.charcoal, justifyContent: 'center', alignItems: 'center', padding: 24 },
  title: { ...Typography.heading1, color: Colors.textInverse },
  subtitle: { ...Typography.bodyMedium, color: Colors.textMuted, marginTop: 8, textAlign: 'center' },
});
