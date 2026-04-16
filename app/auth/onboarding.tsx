import { View, Text, StyleSheet } from 'react-native';
import { Colors, Typography } from '../../src/constants/theme';

/** Screen 1: Splash / Onboarding -- 3-slide carousel */
export default function OnboardingScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Onboarding</Text>
      <Text style={styles.subtitle}>3-slide carousel goes here</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.charcoal, justifyContent: 'center', alignItems: 'center' },
  title: { ...Typography.heading1, color: Colors.textInverse },
  subtitle: { ...Typography.bodyMedium, color: Colors.textMuted, marginTop: 8 },
});
