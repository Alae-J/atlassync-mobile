import { useCallback, useEffect, useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
  withSequence,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { X, Barcode, ArrowRight, MusicNote } from 'phosphor-react-native';
import { router } from 'expo-router';
import { Colors, Fonts, Radius } from '../../src/constants/theme';
import { productsApi } from '../../src/api';
import { useSession } from '../../src/context/SessionContext';
import { toDisplayProduct } from '../../src/lib/productDisplay';
import {
  ScanPeekCard,
  ScanTotalsStrip,
  determinePeek,
  type ScanPeek,
} from '../../src/components/product';

const SIMULATE_BARCODES = ['1234567890', '2345678901', '3456789012'];
const UNKNOWN_FALLBACK = '5901234123457';

const USER_DIETARY = ['Halal', 'No pork', 'Low sugar', 'No alcohol'];
const USER_ALLERGENS = ['Milk', 'Shellfish'];

export default function ScanScreen() {
  const insets = useSafeAreaInsets();
  const { sessionId, cart, refreshCart, scanItem, removeItem } = useSession();
  const [scanning, setScanning] = useState(false);
  const [peek, setPeek] = useState<ScanPeek>({ kind: 'idle' });
  const [freshnessTick, setFreshnessTick] = useState(0);
  const [lastBarcode, setLastBarcode] = useState<string | null>(null);

  useEffect(() => {
    if (sessionId) refreshCart().catch(() => undefined);
  }, [sessionId, refreshCart]);

  const simulateScan = useCallback(async () => {
    if (scanning || !sessionId) return;
    setScanning(true);
    const barcode = SIMULATE_BARCODES[Math.floor(Math.random() * SIMULATE_BARCODES.length)];
    setLastBarcode(barcode);

    try {
      await scanItem(barcode);
      try {
        const raw = await productsApi.byBarcode(barcode);
        const product = toDisplayProduct(raw);
        setPeek(determinePeek(product, USER_ALLERGENS, USER_DIETARY));
      } catch {
        // Product fetched for enrichment failed -- still confirm the add with a
        // minimal peek using whatever the cart returned.
        setPeek({ kind: 'idle' });
      }
      setFreshnessTick((t) => t + 1);
    } catch {
      setPeek({ kind: 'unknown', barcode: barcode || UNKNOWN_FALLBACK });
    } finally {
      setScanning(false);
    }
  }, [scanning, sessionId, scanItem]);

  const handleUndo = useCallback(async () => {
    if (!lastBarcode) return;
    try {
      await removeItem(lastBarcode);
      setFreshnessTick((t) => t + 1);
    } catch {
      // Best-effort — even if the remove fails, dismissing the card is correct UX.
    }
    setPeek({ kind: 'idle' });
    setLastBarcode(null);
  }, [lastBarcode, removeItem]);

  const handleSeeDetails = useCallback((barcode: string) => {
    setPeek({ kind: 'idle' });
    router.push({ pathname: '/product/[barcode]', params: { barcode } });
  }, []);

  const handleTryAgain = useCallback(() => {
    setPeek({ kind: 'idle' });
  }, []);

  const dismiss = useCallback(() => {
    setPeek({ kind: 'idle' });
  }, []);

  // Scanline animation — preserved from the original.
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

  // Pulsing dot on the SCANNING chip.
  const pulse = useSharedValue(1);
  useEffect(() => {
    pulse.value = withRepeat(
      withSequence(
        withTiming(0.35, { duration: 700, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 700, easing: Easing.inOut(Easing.ease) }),
      ),
      -1,
      false,
    );
  }, [pulse]);
  const pulseStyle = useAnimatedStyle(() => ({ opacity: pulse.value }));

  const itemCount = cart?.itemCount ?? 0;
  const total = cart?.total ?? 0;

  return (
    <View style={styles.root}>
      <LinearGradient
        colors={[Colors.dark, Colors.ember, Colors.dark]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={StyleSheet.absoluteFill}
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

        <View style={styles.scanningChip}>
          <Animated.View style={[styles.scanningDot, pulseStyle]} />
          <Text style={styles.scanningLabel}>SCANNING</Text>
        </View>

        <Pressable style={styles.iconBtn}>
          <MusicNote size={16} color={Colors.cream} weight="regular" />
        </Pressable>
      </View>

      <View style={styles.viewfinder}>
        <Pressable style={styles.frame} onPress={simulateScan}>
          {(['tl', 'tr', 'bl', 'br'] as const).map((c) => (
            <View key={c} style={[styles.cornerBase, cornerStyles[c]]} />
          ))}
          <View style={styles.framePlaceholder}>
            <Barcode size={32} color="rgba(244,237,224,0.55)" weight="thin" />
            <Text style={styles.frameHint}>
              {scanning ? 'Adding…' : 'Tap to simulate scan'}
            </Text>
          </View>
          <Animated.View style={[styles.scanline, scanlineStyle]}>
            <LinearGradient
              colors={['transparent', Colors.amber, 'transparent']}
              start={{ x: 0, y: 0.5 }}
              end={{ x: 1, y: 0.5 }}
              style={StyleSheet.absoluteFill}
            />
          </Animated.View>
        </Pressable>

        <Pressable style={styles.searchEscape} onPress={() => router.push('/search')}>
          <Text style={styles.searchEscapeText}>No barcode? Search manually</Text>
          <ArrowRight size={11} color="rgba(244,237,224,0.65)" weight="regular" />
        </Pressable>
      </View>

      <ScanPeekCard
        peek={peek}
        onDismiss={dismiss}
        onSeeDetails={handleSeeDetails}
        onUndo={handleUndo}
        onTryAgain={handleTryAgain}
      />

      <View style={[styles.totalsWrap, { paddingBottom: insets.bottom + 18 }]}>
        <ScanTotalsStrip
          itemCount={itemCount}
          total={total}
          freshnessTick={freshnessTick}
          onPress={() => router.push('/shop/review')}
        />
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
  scanningChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 999,
    backgroundColor: Colors.whiteGlassFill,
  },
  scanningDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.amber,
  },
  scanningLabel: {
    fontFamily: Fonts.sansSemibold,
    fontSize: 11,
    letterSpacing: 1,
    color: Colors.cream,
  },

  viewfinder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
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

  searchEscape: {
    marginTop: 18,
    paddingHorizontal: 6,
    paddingVertical: 4,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  searchEscapeText: {
    fontFamily: Fonts.sansMedium,
    fontSize: 12.5,
    color: 'rgba(244,237,224,0.65)',
    textDecorationLine: 'underline',
    textDecorationColor: 'rgba(244,237,224,0.25)',
  },

  totalsWrap: {
    paddingHorizontal: 14,
    paddingTop: 4,
  },
});
