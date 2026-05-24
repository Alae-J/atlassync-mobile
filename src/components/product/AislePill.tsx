import { View, Text, StyleSheet } from 'react-native';
import { MapPin } from 'phosphor-react-native';
import { Colors, Fonts } from '../../constants/theme';

interface Props {
  number: number;
  /** Add a small map-pin glyph to the left of the number. */
  withIcon?: boolean;
}

/**
 * "AISLE N" tracked pill in the accent green wash. Shared by every surface
 * that lists products — Search rows, Product Detail, scan peek, order rows.
 */
export function AislePill({ number, withIcon = false }: Props) {
  return (
    <View style={styles.pill}>
      {withIcon && <MapPin size={10} color={Colors.accent} weight="fill" />}
      <Text style={styles.label}>AISLE {number}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(45,90,61,0.10)',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 999,
  },
  label: {
    fontFamily: Fonts.sansBold,
    fontSize: 10,
    letterSpacing: 1,
    color: Colors.accent,
  },
});
