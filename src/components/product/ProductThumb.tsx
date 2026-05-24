import { View, Text, StyleSheet, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Radius } from '../../constants/theme';

interface Props {
  emoji: string;
  imageUrl?: string | null;
  /** Edge length in pixels. Defaults to 56 (search-row size). */
  size?: number;
  /** Corner radius. Defaults to scale with size. */
  radius?: number;
}

/**
 * The cream-gradient product tile used as the visual anchor on Search rows,
 * Product Detail hero, the post-scan peek card, and order receipts. When an
 * imageUrl is present it wins; otherwise the emoji centred on the cream tile.
 */
export function ProductThumb({ emoji, imageUrl, size = 56, radius }: Props) {
  const cornerRadius = radius ?? Math.max(8, Math.round(size * 0.25));
  return (
    <View
      style={[
        styles.wrap,
        { width: size, height: size, borderRadius: cornerRadius },
      ]}
    >
      <LinearGradient
        colors={[Colors.tile, Colors.tileDeep]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[StyleSheet.absoluteFill, { borderRadius: cornerRadius }]}
      />
      {imageUrl ? (
        <Image source={{ uri: imageUrl }} style={styles.image} resizeMode="contain" />
      ) : (
        <Text style={[styles.emoji, { fontSize: Math.round(size * 0.55) }]}>
          {emoji}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.lineFaint,
  },
  image: { width: '100%', height: '100%' },
  emoji: { includeFontPadding: false },
});
