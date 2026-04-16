import { View, Text, StyleSheet } from 'react-native';
import { Colors, Typography } from '../../src/constants/theme';

/** Screen 2 (tab 2): Register form */
export default function RegisterScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.logo}>AtlasSync</Text>
      </View>
      <View style={styles.card}>
        <Text style={styles.title}>Register</Text>
        <Text style={styles.subtitle}>Create Account form goes here</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.offWhite },
  header: { height: 100, backgroundColor: Colors.charcoal, justifyContent: 'center', alignItems: 'center' },
  logo: { ...Typography.heading2, color: Colors.textInverse },
  card: { flex: 1, backgroundColor: Colors.surface, borderTopLeftRadius: 24, borderTopRightRadius: 24, marginTop: -24, padding: 24, alignItems: 'center', justifyContent: 'center' },
  title: { ...Typography.heading1, color: Colors.textPrimary },
  subtitle: { ...Typography.bodyMedium, color: Colors.textSecondary, marginTop: 8 },
});
