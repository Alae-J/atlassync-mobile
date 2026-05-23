import { View, Text, StyleSheet } from 'react-native';
import { Colors, Fonts } from '../../constants/theme';

interface Props {
  label: string;
  /** Matched against the user's preferences — show inverted ink + check. */
  matched?: boolean;
}

/**
 * Small dietary tag chip. The "matched" tone is inverted ink with a check
 * (the loud variant — tags the user explicitly cares about). The unmatched
 * tone is a quiet outline, used only on Product Detail to round out the
 * chip row when the matched count is thin.
 */
export function DietChip({ label, matched = true }: Props) {
  return (
    <View style={[styles.chip, matched ? styles.matched : styles.unmatched]}>
      {matched && <Text style={styles.check}>✓</Text>}
      <Text style={[styles.label, matched ? styles.labelMatched : styles.labelUnmatched]}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 999,
  },
  matched: { backgroundColor: Colors.ink },
  unmatched: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: Colors.line,
  },
  check: {
    fontSize: 9,
    color: Colors.cream,
    marginRight: -1,
  },
  label: {
    fontFamily: Fonts.sansSemibold,
    fontSize: 10,
    letterSpacing: 0.3,
  },
  labelMatched: { color: Colors.cream },
  labelUnmatched: { color: Colors.muted },
});
