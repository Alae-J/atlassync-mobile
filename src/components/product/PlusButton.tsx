import { Pressable, StyleSheet } from 'react-native';
import { Check, Plus } from 'phosphor-react-native';
import { Colors } from '../../constants/theme';

interface Props {
  onPress?: () => void;
  /** When true: green background + check glyph. Used as the in-row "added" flicker. */
  added?: boolean;
  /** Disable taps without changing the visual (e.g. during a request). */
  disabled?: boolean;
  size?: number;
}

/**
 * The small circular "+" affordance that adds a product to cart or list from
 * a row. Flips to a green check when {@code added}. Same shape and weight as
 * the "+ Start a new list" picker glyph.
 */
export function PlusButton({ onPress, added = false, disabled = false, size = 34 }: Props) {
  return (
    <Pressable
      onPress={disabled ? undefined : onPress}
      hitSlop={8}
      style={[
        styles.button,
        { width: size, height: size, borderRadius: size / 2 },
        added ? styles.added : styles.idle,
        disabled && styles.disabled,
      ]}
    >
      {added ? (
        <Check size={size * 0.4} color={Colors.cream} weight="bold" />
      ) : (
        <Plus size={size * 0.4} color={Colors.cream} weight="bold" />
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  idle: {
    backgroundColor: Colors.ink,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.18,
    shadowRadius: 6,
    elevation: 3,
  },
  added: {
    backgroundColor: Colors.accent,
    shadowColor: Colors.accent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  disabled: { opacity: 0.5 },
});
