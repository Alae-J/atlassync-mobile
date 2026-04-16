import { View, Text, StyleSheet } from 'react-native';
import { Colors, Typography } from '../../src/constants/theme';

/** Screen 7: In-Store Map / Navigation -- store floor plan with route */
export default function MapScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Store Map</Text>
      <Text style={styles.subtitle}>Store floor plan with shopping route goes here</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.offWhite, justifyContent: 'center', alignItems: 'center', padding: 24 },
  title: { ...Typography.heading1, color: Colors.textPrimary },
  subtitle: { ...Typography.bodyMedium, color: Colors.textSecondary, marginTop: 8, textAlign: 'center' },
});
