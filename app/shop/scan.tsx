import { useEffect } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { X, ShoppingBag, Check, Barcode } from 'phosphor-react-native';
import { router } from 'expo-router';
import { Colors, Fonts, Radius } from '../../src/constants/theme';
import { productById } from '../../src/data/catalog';

const remainingIds = ['milk', 'avocado', 'chicken', 'olive-oil', 'bread', 'eggs'];
const capturedIds = ['banana'];

export default function ScanScreen() {
  const insets = useSafeAreaInsets();

  const scanProgress = useSharedValue(0);
  useEffect(() => {
    scanProgress.value = withRepeat(
      withTiming(1, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
      -1,
      true,
    );
  }, [scanProgress]);

  const scanlineStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: -90 + scanProgress.value * 180 }],
    opacity: 0.4 + scanProgress.value * 0.6,
  }));

  const justScanned = productById('banana');
  const totalSoFar = capturedIds.reduce((s, id) => s + (productById(id)?.price ?? 0), 0);

  return (
    <View style={styles.root}>
      <LinearGradient
        colors={[Colors.dark, Colors.ember, Colors.dark]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={StyleSheet.absoluteFill as never}
      />
      <LinearGradient
        colors={['rgba(200,122,58,0.18)', 'transparent']}
        start={{ x: 0.5, y: 0.45 }}
        end={{ x: 0.5, y: 1 }}
        style={styles.glowAmber}
      />
      <LinearGradient
        colors={['rgba(45,90,61,0.18)', 'transparent']}
        start={{ x: 0.3, y: 0.3 }}
        end={{ x: 1, y: 1 }}
        style={styles.glowGreen}
      />

      <View style={[styles.topBar, { paddingTop: insets.top + 6 }]}>
        <Pressable style={styles.iconBtn} onPress={() => router.back()}>
          <X size={16} color={Colors.cream} weight="bold" />
        </Pressable>
        <View style={styles.cartPill}>
          <Text style={styles.cartLabel}>CART</Text>
          <Text style={styles.cartAmount}>${totalSoFar.toFixed(2)}</Text>
        </View>
        <Pressable style={styles.iconBtn}>
          <ShoppingBag size={16} color={Colors.cream} weight="regular" />
        </Pressable>
      </View>

      <View style={styles.viewfinder}>
        <View style={styles.frame}>
          {(['tl', 'tr', 'bl', 'br'] as const).map((c) => (
            <View key={c} style={[styles.cornerBase, cornerStyles[c]]} />
          ))}
          <View style={styles.framePlaceholder}>
            <Barcode size={32} color="rgba(244,237,224,0.55)" weight="thin" />
            <Text style={styles.frameHint}>Aim at a barcode</Text>
          </View>
          <Animated.View style={[styles.scanline, scanlineStyle]}>
            <LinearGradient
              colors={['transparent', Colors.amber, 'transparent']}
              start={{ x: 0, y: 0.5 }}
              end={{ x: 1, y: 0.5 }}
              style={StyleSheet.absoluteFill as never}
            />
          </Animated.View>
        </View>
      </View>

      {justScanned && (
        <Pressable style={styles.toast} onPress={() => router.push('/shop/substitute')}>
          <View style={styles.toastThumb}>
            <LinearGradient
              colors={[Colors.tile, Colors.tileDeep]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={StyleSheet.absoluteFill as never}
            />
            <Text style={styles.toastEmoji}>{justScanned.emoji}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <View style={styles.toastTopRow}>
              <Check size={12} color={Colors.accent} weight="bold" />
              <Text style={styles.toastEyebrow}>ADDED TO CART</Text>
            </View>
            <Text style={styles.toastName}>{justScanned.name}</Text>
            <Text style={styles.toastMeta}>
              ${justScanned.price.toFixed(2)}/{justScanned.unit}
            </Text>
          </View>
          <Pressable>
            <Text style={styles.undoText}>Undo</Text>
          </Pressable>
        </Pressable>
      )}

      <View style={[styles.peekSheet, { paddingBottom: insets.bottom + 22 }]}>
        <View style={styles.handle} />
        <View style={styles.peekHeader}>
          <Text style={styles.peekTitle}>Still to grab</Text>
          <Text style={styles.peekCount}>
            {remainingIds.length} left · 1 done
          </Text>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.peekRow}>
          {remainingIds.map((id) => {
            const p = productById(id);
            if (!p) return null;
            return (
              <View key={id} style={styles.peekTile}>
                <View style={styles.peekTileEmoji}>
                  <LinearGradient
                    colors={[Colors.tile, Colors.tileDeep]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={StyleSheet.absoluteFill as never}
                  />
                  <Text style={styles.peekEmojiText}>{p.emoji}</Text>
                </View>
                <Text style={styles.peekName} numberOfLines={1}>{p.name.split(' ')[0]}</Text>
              </View>
            );
          })}
        </ScrollView>
        <Pressable style={styles.peekCta} onPress={() => router.push('/shop/review')}>
          <Text style={styles.peekCtaText}>Review & checkout</Text>
        </Pressable>
      </View>
    </View>
  );
}

const cornerSize = 38;
const cornerStyles = {
  tl: { top: 0, left: 0, borderTopWidth: 3, borderLeftWidth: 3, borderTopLeftRadius: 8 },
  tr: { top: 0, right: 0, borderTopWidth: 3, borderRightWidth: 3, borderTopRightRadius: 8 },
  bl: { bottom: 0, left: 0, borderBottomWidth: 3, borderLeftWidth: 3, borderBottomLeftRadius: 8 },
  br: { bottom: 0, right: 0, borderBottomWidth: 3, borderRightWidth: 3, borderBottomRightRadius: 8 },
} as const;

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.dark },
  glowAmber: { position: 'absolute', top: '15%', left: '15%', right: '15%', height: 360 },
  glowGreen: { position: 'absolute', top: '20%', left: 0, width: 320, height: 280 },

  topBar: {
    paddingHorizontal: 18,
    paddingBottom: 6,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  iconBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: Colors.whiteGlassFill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cartPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: Radius.pill,
    backgroundColor: Colors.whiteGlassFill,
  },
  cartLabel: {
    fontFamily: Fonts.sansSemibold,
    fontSize: 9.5,
    letterSpacing: 1.2,
    color: 'rgba(244,237,224,0.65)',
  },
  cartAmount: {
    fontFamily: Fonts.serif,
    fontSize: 18,
    letterSpacing: -0.2,
    color: Colors.cream,
  },

  viewfinder: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  frame: { width: 240, height: 240 },
  cornerBase: {
    position: 'absolute',
    width: cornerSize,
    height: cornerSize,
    borderColor: Colors.cream,
  },
  framePlaceholder: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  frameHint: {
    fontFamily: Fonts.sans,
    fontSize: 11.5,
    letterSpacing: 0.8,
    color: 'rgba(244,237,224,0.55)',
  },
  scanline: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: '50%',
    height: 2,
  },

  toast: {
    marginHorizontal: 16,
    marginBottom: 12,
    backgroundColor: Colors.cream,
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 18 },
    shadowOpacity: 0.45,
    shadowRadius: 40,
    elevation: 10,
  },
  toastThumb: {
    width: 44,
    height: 44,
    borderRadius: 12,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  toastEmoji: { fontSize: 22 },
  toastTopRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  toastEyebrow: {
    fontFamily: Fonts.sansBold,
    fontSize: 10,
    letterSpacing: 1.2,
    color: Colors.accent,
  },
  toastName: { fontFamily: Fonts.sansMedium, fontSize: 14, color: Colors.ink, marginTop: 2 },
  toastMeta: { fontFamily: Fonts.sans, fontSize: 11.5, color: Colors.muted },
  undoText: { fontFamily: Fonts.sansMedium, fontSize: 12, color: Colors.muted, paddingHorizontal: 8 },

  peekSheet: {
    backgroundColor: Colors.cream,
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    paddingHorizontal: 22,
    paddingTop: 10,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(21,20,15,0.18)',
    alignSelf: 'center',
    marginBottom: 12,
  },
  peekHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: 10,
  },
  peekTitle: { fontFamily: Fonts.serif, fontSize: 22, letterSpacing: -0.4, color: Colors.ink },
  peekCount: { fontFamily: Fonts.sans, fontSize: 12, color: Colors.muted },
  peekRow: { gap: 8 },
  peekTile: {
    width: 76,
    backgroundColor: Colors.card,
    borderRadius: 14,
    paddingHorizontal: 10,
    paddingTop: 8,
    paddingBottom: 10,
    alignItems: 'center',
    gap: 4,
    borderWidth: 1,
    borderColor: Colors.lineFaint,
  },
  peekTileEmoji: {
    width: 44,
    height: 44,
    borderRadius: 10,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  peekEmojiText: { fontSize: 22 },
  peekName: {
    fontFamily: Fonts.sansMedium,
    fontSize: 10.5,
    color: Colors.ink,
    width: '100%',
    textAlign: 'center',
  },
  peekCta: {
    marginTop: 14,
    height: 50,
    borderRadius: 14,
    backgroundColor: Colors.ink,
    alignItems: 'center',
    justifyContent: 'center',
  },
  peekCtaText: { fontFamily: Fonts.sansMedium, fontSize: 14, color: Colors.cream },
});
