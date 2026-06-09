import { useEffect } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { ShoppingCart, CaretRight } from 'phosphor-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Fonts, Radius } from '../../constants/theme';
import { formatPrice } from '../../lib/formatPrice';

interface Props {
  itemCount: number;
  total: number;
  /** Increments on every successful scan — triggers the amber freshness wash. */
  freshnessTick: number;
  onPress: () => void;
}

/**
 * The pressable totals strip at the bottom of the Scan screen. Tap routes to
 * Cart Review. After every successful scan the {@code freshnessTick} prop
 * increments and an amber radial wash sweeps across the strip — peripheral
 * confirmation the total moved, without resorting to numerals counting up.
 */
export function ScanTotalsStrip({ itemCount, total, freshnessTick, onPress }: Props) {
  const washOpacity = useSharedValue(0);

  useEffect(() => {
    if (freshnessTick === 0) return;
    washOpacity.value = 1;
    washOpacity.value = withTiming(0, { duration: 1600, easing: Easing.out(Easing.quad) });
  }, [freshnessTick, washOpacity]);

  const washStyle = useAnimatedStyle(() => ({ opacity: washOpacity.value }));

  return (
    <Pressable style={styles.wrap} onPress={onPress}>
      <Animated.View style={[StyleSheet.absoluteFill, washStyle]} pointerEvents="none">
        <LinearGradient
          colors={['rgba(200,122,58,0.32)', 'transparent']}
          start={{ x: 1, y: 0.5 }}
          end={{ x: 0, y: 0.5 }}
          style={StyleSheet.absoluteFill}
        />
      </Animated.View>

      <View style={styles.leftCluster}>
        <View style={styles.iconTile}>
          <ShoppingCart size={16} color={Colors.amber} weight="regular" />
        </View>
        <View>
          <Text style={styles.eyebrow}>CART</Text>
          <Text style={styles.totals}>
            {itemCount} items
            <Text style={styles.divider}>  ·  </Text>
            {formatPrice(total)}
          </Text>
        </View>
      </View>

      <View style={styles.rightCluster}>
        <Text style={styles.reviewLabel}>Review</Text>
        <CaretRight size={13} color="rgba(244,237,224,0.7)" weight="bold" />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: {
    backgroundColor: Colors.ink,
    borderRadius: Radius.xxl,
    paddingVertical: 12,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.45,
    shadowRadius: 28,
    elevation: 10,
  },
  leftCluster: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  iconTile: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  eyebrow: {
    fontFamily: Fonts.sansSemibold,
    fontSize: 10,
    letterSpacing: 1.2,
    color: 'rgba(244,237,224,0.55)',
  },
  totals: {
    fontFamily: Fonts.serif,
    fontSize: 22,
    lineHeight: 22,
    letterSpacing: -0.4,
    color: Colors.cream,
    marginTop: 3,
    includeFontPadding: false,
  },
  divider: { color: 'rgba(244,237,224,0.4)' },
  rightCluster: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  reviewLabel: {
    fontFamily: Fonts.sans,
    fontSize: 12.5,
    color: 'rgba(244,237,224,0.7)',
  },
});
