import { useEffect, useMemo, useRef } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  cancelAnimation,
  runOnJS,
  Easing,
} from 'react-native-reanimated';
import { Check, ArrowCounterClockwise, CaretRight, Warning, Wifi } from 'phosphor-react-native';
import { Colors, Fonts, Radius } from '../../constants/theme';
import type { DisplayProduct } from '../../lib/productDisplay';
import { ProductThumb } from './ProductThumb';
import { AislePill } from './AislePill';
import { NutriscoreBadge } from './NutriscoreBadge';
import { DietChip } from './DietChip';

const DRAIN_MS = 3500;

export type ScanPeek =
  | { kind: 'idle' }
  | { kind: 'normal'; product: DisplayProduct; dietHit?: string }
  | { kind: 'allergen'; product: DisplayProduct; matched: string[]; dietHit?: string }
  | { kind: 'rfid'; product: DisplayProduct; dietHit?: string }
  | { kind: 'unknown'; barcode: string };

interface Props {
  peek: ScanPeek;
  onDismiss: () => void;
  onSeeDetails: (barcode: string) => void;
  onUndo: () => void;
  onTryAgain: () => void;
}

/**
 * The peek card that rises after a scan. Four variants:
 *  - normal: thumb + name + price + chips, auto-dismiss after 3.5s
 *  - allergen: same body + red banner; LOCKED — no auto-dismiss until the
 *    user explicitly Undoes or Sees details. Static red rule instead of
 *    the draining hairline.
 *  - rfid: same body + ink-on-cream "Pick up at the counter" note; amber drain
 *  - unknown: flipped anatomy — serif "We don't carry that one." + monospace
 *    barcode + "Try again →"; auto-dismiss as normal.
 *
 * Tapping anywhere on the card pauses the drain (the card freezes in place
 * until the user acts).
 */
export function ScanPeekCard({ peek, onDismiss, onSeeDetails, onUndo, onTryAgain }: Props) {
  const offset = useSharedValue(80);
  const opacity = useSharedValue(0);
  const drain = useSharedValue(1);

  const isLocked = peek.kind === 'allergen';
  const pausedRef = useRef(false);

  useEffect(() => {
    if (peek.kind === 'idle') {
      offset.value = withTiming(80, { duration: 180 });
      opacity.value = withTiming(0, { duration: 140 });
      cancelAnimation(drain);
      drain.value = 1;
      return;
    }

    // Rise in.
    pausedRef.current = false;
    offset.value = withSpring(0, { damping: 22, stiffness: 240 });
    opacity.value = withTiming(1, { duration: 180 });

    // Drain hairline — unless allergen lock.
    if (!isLocked) {
      drain.value = 1;
      drain.value = withTiming(
        0,
        { duration: DRAIN_MS, easing: Easing.linear },
        (finished) => {
          if (finished && !pausedRef.current) runOnJS(onDismiss)();
        },
      );
    } else {
      cancelAnimation(drain);
      drain.value = 1;
    }
  }, [peek.kind, isLocked, offset, opacity, drain, onDismiss]);

  const cardStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: offset.value }],
  }));

  const drainStyle = useAnimatedStyle(() => ({
    transform: [{ scaleX: drain.value }],
  }));

  const pauseDrain = () => {
    pausedRef.current = true;
    cancelAnimation(drain);
  };

  if (peek.kind === 'idle') return null;

  if (peek.kind === 'unknown') {
    return (
      <Animated.View style={[styles.cardShell, cardStyle]} pointerEvents="box-none">
        <Pressable style={styles.card} onPress={pauseDrain}>
          <Text style={styles.eyebrowUnknown}>UNKNOWN CODE</Text>
          <Text style={styles.unknownTitle}>
            We don&apos;t carry <Text style={styles.unknownTitleItalic}>that one.</Text>
          </Text>
          <Text style={styles.barcodeDigits}>{peek.barcode}</Text>
          <View style={styles.actionRow}>
            <View style={{ flex: 1 }} />
            <Pressable
              onPress={() => {
                pauseDrain();
                onTryAgain();
              }}
              hitSlop={8}
              style={styles.detailsBtn}
            >
              <Text style={styles.detailsLabel}>Try again</Text>
              <CaretRight size={11} color={Colors.ink} weight="bold" />
            </Pressable>
          </View>
          <View style={styles.hairlineTrack}>
            <Animated.View style={[styles.hairlineFill, styles.hairlineAmber, drainStyle]} />
          </View>
        </Pressable>
      </Animated.View>
    );
  }

  // Recognized product — normal / allergen / rfid all share the same body.
  const { product, dietHit } = peek;
  const matched = peek.kind === 'allergen' ? peek.matched : [];
  const showAllergen = matched.length > 0;
  const showRfid = peek.kind === 'rfid';

  return (
    <Animated.View style={[styles.cardShell, cardStyle]} pointerEvents="box-none">
      <Pressable style={styles.card} onPress={pauseDrain}>
        <View style={styles.eyebrowRow}>
          <Check size={12} color={Colors.accent} weight="bold" />
          <Text style={styles.eyebrow}>JUST SCANNED</Text>
        </View>

        <View style={styles.productRow}>
          <ProductThumb emoji={product.emoji} size={56} />
          <View style={{ flex: 1, minWidth: 0 }}>
            <Text style={styles.productName} numberOfLines={1}>
              {product.name}
            </Text>
            {product.brand && (
              <Text style={styles.productBrand} numberOfLines={1}>
                {product.brand}
              </Text>
            )}
          </View>
          <Text style={styles.price}>${product.price.toFixed(2)}</Text>
        </View>

        {showAllergen && (
          <View style={styles.allergenBanner}>
            <Warning size={13} color={Colors.danger} weight="regular" />
            <Text style={styles.allergenText}>
              Contains{' '}
              <Text style={styles.allergenWord}>
                {matched.join(', ').toLowerCase()}
              </Text>{' '}
              — flagged in your allergens.
            </Text>
          </View>
        )}

        <View style={styles.chipStrip}>
          {product.aisle != null && <AislePill number={product.aisle} />}
          {product.nutriscore && <NutriscoreBadge grade={product.nutriscore} />}
          {dietHit && <DietChip label={dietHit} />}
        </View>

        {showRfid && (
          <View style={styles.rfidNote}>
            <View style={styles.rfidIcon}>
              <Wifi size={12} color={Colors.amber} weight="regular" />
            </View>
            <Text style={styles.rfidText}>
              <Text style={styles.rfidStrong}>RFID secured.</Text>{' '}
              Pick up at the counter on your way out.
            </Text>
          </View>
        )}

        <View style={styles.actionRow}>
          <Pressable
            onPress={() => {
              pauseDrain();
              onUndo();
            }}
            hitSlop={8}
            style={styles.undoBtn}
          >
            <ArrowCounterClockwise size={11} color={Colors.muted} weight="regular" />
            <Text style={styles.undoLabel}>Undo</Text>
          </Pressable>
          <Pressable
            onPress={() => {
              pauseDrain();
              onSeeDetails(product.barcode);
            }}
            hitSlop={8}
            style={styles.detailsBtn}
          >
            <Text style={styles.detailsLabel}>See details</Text>
            <CaretRight size={11} color={Colors.ink} weight="bold" />
          </Pressable>
        </View>

        <View style={styles.hairlineTrack}>
          {showAllergen ? (
            <View style={[styles.hairlineFill, styles.hairlineRed, { transform: [{ scaleX: 1 }] }]} />
          ) : (
            <Animated.View
              style={[
                styles.hairlineFill,
                showRfid ? styles.hairlineAmber : styles.hairlineAccent,
                drainStyle,
              ]}
            />
          )}
        </View>
      </Pressable>
    </Animated.View>
  );
}

// Helper: pick the variant based on the product data + user prefs.
export function determinePeek(
  product: DisplayProduct,
  userAllergens: string[],
  userDietary: string[],
): ScanPeek {
  const matched = product.allergens.filter((a) =>
    userAllergens.some((u) => u.toLowerCase() === a.toLowerCase()),
  );
  const dietHit = product.dietary.find((d) => userDietary.includes(d));

  if (matched.length > 0) return { kind: 'allergen', product, matched, dietHit };
  if (product.rfidSecurityRequired) return { kind: 'rfid', product, dietHit };
  return { kind: 'normal', product, dietHit };
}

const styles = StyleSheet.create({
  cardShell: { paddingHorizontal: 14, paddingBottom: 10 },
  card: {
    backgroundColor: Colors.cream,
    borderRadius: Radius.xxl,
    padding: 16,
    paddingBottom: 14,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 18 },
    shadowOpacity: 0.45,
    shadowRadius: 40,
    elevation: 12,
  },

  eyebrowRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 10 },
  eyebrow: {
    fontFamily: Fonts.sansBold,
    fontSize: 10,
    letterSpacing: 1.2,
    color: Colors.accent,
  },
  eyebrowUnknown: {
    fontFamily: Fonts.sansBold,
    fontSize: 10,
    letterSpacing: 1.4,
    color: Colors.muted,
  },
  unknownTitle: {
    fontFamily: Fonts.serif,
    fontSize: 26,
    lineHeight: 28,
    letterSpacing: -0.6,
    color: Colors.ink,
    marginTop: 6,
    includeFontPadding: false,
  },
  unknownTitleItalic: { fontFamily: Fonts.serifItalic, color: Colors.amber },
  barcodeDigits: {
    fontFamily: 'Menlo',
    fontSize: 12,
    color: Colors.muted,
    letterSpacing: 1.5,
    marginTop: 10,
  },

  productRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  productName: {
    fontFamily: Fonts.serif,
    fontSize: 22,
    lineHeight: 24,
    letterSpacing: -0.4,
    color: Colors.ink,
    includeFontPadding: false,
  },
  productBrand: {
    fontFamily: Fonts.sans,
    fontSize: 11.5,
    color: Colors.muted,
    marginTop: 2,
  },
  price: {
    fontFamily: Fonts.serif,
    fontSize: 22,
    lineHeight: 22,
    letterSpacing: -0.3,
    color: Colors.ink,
    marginTop: 3,
    includeFontPadding: false,
  },

  allergenBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    marginTop: 12,
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.dangerWashBorder,
    backgroundColor: Colors.dangerWash,
  },
  allergenText: {
    flex: 1,
    fontFamily: Fonts.sans,
    fontSize: 11.5,
    lineHeight: 16,
    color: Colors.danger,
  },
  allergenWord: { fontFamily: Fonts.sansBold },

  chipStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 12,
    flexWrap: 'wrap',
  },

  rfidNote: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
    marginTop: 12,
    backgroundColor: 'rgba(21,20,15,0.04)',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 9,
  },
  rfidIcon: {
    width: 24,
    height: 24,
    borderRadius: 7,
    backgroundColor: 'rgba(200,122,58,0.14)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  rfidText: { flex: 1, fontFamily: Fonts.sans, fontSize: 11.5, lineHeight: 16, color: Colors.ink },
  rfidStrong: { fontFamily: Fonts.sansSemibold },

  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.line,
  },
  undoBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  undoLabel: {
    fontFamily: Fonts.sansMedium,
    fontSize: 12.5,
    color: Colors.muted,
    textDecorationLine: 'underline',
  },
  detailsBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  detailsLabel: {
    fontFamily: Fonts.sansMedium,
    fontSize: 12.5,
    color: Colors.ink,
  },

  hairlineTrack: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 2,
    backgroundColor: 'rgba(21,20,15,0.06)',
    overflow: 'hidden',
  },
  hairlineFill: {
    height: '100%',
    width: '100%',
    transformOrigin: 'right',
  },
  hairlineAccent: { backgroundColor: Colors.accent },
  hairlineAmber: { backgroundColor: Colors.amber },
  hairlineRed: { backgroundColor: Colors.danger, opacity: 0.6 },
});
