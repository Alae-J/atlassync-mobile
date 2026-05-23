import { View, Text, StyleSheet } from 'react-native';
import { Colors, Fonts } from '../../constants/theme';

interface Props {
  inStock: boolean;
  /** Compact variant for the search row — no border, smaller padding. */
  compact?: boolean;
}

/**
 * In-stock / Out-of-stock status chip. Calm tones — neither shouting good
 * news nor flagging the out-of-stock case as an error.
 */
export function StockChip({ inStock, compact = false }: Props) {
  if (inStock) {
    return (
      <View style={[styles.chip, compact ? styles.compactStock : styles.fullStock]}>
        <Text style={[styles.label, styles.labelStock, compact && styles.labelCompact]}>
          {compact ? 'In stock' : 'In stock'}
        </Text>
      </View>
    );
  }
  return (
    <View style={[styles.chip, compact ? styles.compactOos : styles.fullOos]}>
      <Text style={[styles.label, styles.labelOos, compact && styles.labelCompact]}>
        {compact ? 'Out' : 'Out of stock'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  chip: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 999,
  },
  fullStock: {
    backgroundColor: 'rgba(45,90,61,0.10)',
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  fullOos: {
    backgroundColor: Colors.dangerWash,
    borderWidth: 1,
    borderColor: Colors.dangerWashBorder,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  compactStock: { backgroundColor: 'rgba(45,90,61,0.10)' },
  compactOos: { backgroundColor: 'rgba(21,20,15,0.06)' },
  label: {
    fontFamily: Fonts.sansSemibold,
    fontSize: 11.5,
    letterSpacing: 0.2,
  },
  labelStock: { color: Colors.accent },
  labelOos: { color: Colors.danger },
  labelCompact: {
    fontSize: 10,
    letterSpacing: 0.6,
    color: Colors.muted,
  },
});
