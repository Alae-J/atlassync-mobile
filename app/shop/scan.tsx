import { useCallback, useEffect, useRef, useState } from 'react';
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
import { CameraView, useCameraPermissions } from 'expo-camera';
import { X, Barcode, ArrowRight, MusicNote } from 'phosphor-react-native';
import { router } from 'expo-router';
import { Colors, Fonts } from '../../src/constants/theme';
import { productsApi } from '../../src/api';
import { useSession } from '../../src/context/SessionContext';
import { useAuth } from '../../src/context/AuthContext';
import { toDisplayProduct } from '../../src/lib/productDisplay';
import {
  ScanPeekCard,
  ScanTotalsStrip,
  determinePeek,
  type ScanPeek,
} from '../../src/components/product';

// Dev-only fallback for the simulator / web where there's no camera. Tapping
// the frame in __DEV__ fires one of these as if the camera scanned it.
const SIMULATE_BARCODES = ['1234567890', '2345678901', '3456789012'];
const UNKNOWN_FALLBACK = '5901234123457';

// User dietary + allergen preferences come from Account → Preferences;
// we read them from useAuth inside the component and pass them into
// determinePeek per scan.

// Two guardrails against the live camera firing the same scan dozens of times:
// (1) the same barcode within this window is ignored, (2) any new scan is
// ignored while a recognized peek is on screen so the user has time to react.
const DEDUPE_WINDOW_MS = 2_000;

// Barcode formats the scanner accepts. EAN-13/UPC-A cover most grocery items
// in the wild; the rest are cheap to include and useful for testing.
const BARCODE_TYPES = ['ean13', 'ean8', 'upc_a', 'upc_e', 'code128', 'qr'] as const;

export default function ScanScreen() {
  const insets = useSafeAreaInsets();
  const { sessionId, cart, refreshCart, scanItem, removeItem } = useSession();
  const { user } = useAuth();
  const userAllergens = user?.preferences.allergens ?? [];
  const userDietary = user?.preferences.dietaryPrefs ?? [];
  const [permission, requestPermission] = useCameraPermissions();

  const [scanning, setScanning] = useState(false);
  const [peek, setPeek] = useState<ScanPeek>({ kind: 'idle' });
  const [freshnessTick, setFreshnessTick] = useState(0);
  const [lastBarcode, setLastBarcode] = useState<string | null>(null);

  // Cooldown ref kept outside React state so onBarcodeScanned can read the
  // latest values without re-creating the camera handler every render.
  const lastFireRef = useRef<{ barcode: string; at: number } | null>(null);

  // Refresh the cart on mount + ask for camera permission once. Issue #9
  // will surface the not-asked / denied state with a proper CTA; for now we
  // request silently and fall back to the placeholder frame if it isn't
  // granted yet so the screen never crashes.
  useEffect(() => {
    if (sessionId) refreshCart().catch(() => undefined);
  }, [sessionId, refreshCart]);

  useEffect(() => {
    if (permission && !permission.granted && permission.canAskAgain) {
      requestPermission().catch(() => undefined);
    }
  }, [permission, requestPermission]);

  const handleScannedBarcode = useCallback(
    async (barcode: string) => {
      if (!sessionId || scanning) return;

      // Cooldown #1 — same barcode within the dedupe window. Live camera
      // would otherwise fire 30+ times/sec while the code is in view.
      const now = Date.now();
      const last = lastFireRef.current;
      if (last && last.barcode === barcode && now - last.at < DEDUPE_WINDOW_MS) {
        return;
      }

      // Cooldown #2 — already showing the user a recognized peek. Let them
      // act on it (undo / see details / wait for the drain) before piling on.
      if (peek.kind === 'normal' || peek.kind === 'allergen' || peek.kind === 'rfid') {
        return;
      }

      lastFireRef.current = { barcode, at: now };
      setScanning(true);
      setLastBarcode(barcode);

      try {
        await scanItem(barcode);
        try {
          const raw = await productsApi.byBarcode(barcode);
          const product = toDisplayProduct(raw);
          setPeek(determinePeek(product, userAllergens, userDietary));
        } catch (enrichError) {
          // Enrichment failed -- still confirm the add but keep the peek silent.
          console.warn('[scan] product enrichment failed for', barcode, enrichError);
          setPeek({ kind: 'idle' });
        }
        setFreshnessTick((t) => t + 1);
      } catch (addError) {
        // The add-to-cart call rejected. Most often: no active session, stale
        // sessionId, or cart-service couldn't reach product-service. Surface
        // the actual response so we can diagnose from Metro.
        const status = (addError as { response?: { status?: number } })?.response?.status;
        const data = (addError as { response?: { data?: unknown } })?.response?.data;
        console.warn(
          '[scan] addItem rejected — barcode=%s sessionId=%s status=%s body=%o',
          barcode,
          sessionId,
          status ?? 'no response',
          data ?? (addError instanceof Error ? addError.message : addError),
        );
        setPeek({ kind: 'unknown', barcode: barcode || UNKNOWN_FALLBACK });
      } finally {
        setScanning(false);
      }
    },
    [scanning, sessionId, scanItem, peek.kind, userAllergens, userDietary],
  );

  // Dev-mode fallback: simulator / web have no camera, so a tap on the frame
  // still triggers a scan against one of the seeded simulate barcodes.
  const simulateTap = useCallback(() => {
    if (!__DEV__) return;
    const barcode = SIMULATE_BARCODES[Math.floor(Math.random() * SIMULATE_BARCODES.length)];
    void handleScannedBarcode(barcode);
  }, [handleScannedBarcode]);

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
    lastFireRef.current = null;
  }, [lastBarcode, removeItem]);

  const handleSeeDetails = useCallback((barcode: string) => {
    setPeek({ kind: 'idle' });
    router.push({ pathname: '/product/[barcode]', params: { barcode } });
  }, []);

  const handleTryAgain = useCallback(() => {
    setPeek({ kind: 'idle' });
    lastFireRef.current = null;
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

  const cameraReady = permission?.granted === true;
  const hint = !cameraReady
    ? __DEV__
      ? 'Tap to simulate scan'
      : 'Camera unavailable'
    : scanning
      ? 'Adding…'
      : 'Aim at a barcode';

  return (
    <View style={styles.root}>
      {/* Layer 0 — fallback backdrop when there's no live camera (denied
          permission, web/simulator). Hidden behind the camera once granted. */}
      <LinearGradient
        colors={[Colors.dark, Colors.ember, Colors.dark]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      {/* Layer 1 — the camera preview itself, fullscreen behind every chrome
          element. iOS-camera style: brackets + scanline are guides on top. */}
      {cameraReady && (
        <CameraView
          style={StyleSheet.absoluteFill}
          facing="back"
          barcodeScannerSettings={{ barcodeTypes: [...BARCODE_TYPES] }}
          onBarcodeScanned={(result) => {
            if (result?.data) void handleScannedBarcode(result.data);
          }}
        />
      )}

      {/* Layer 2 — subtle dark scrims so the top bar + bottom strip stay
          legible against bright camera scenes. The middle of the screen
          (where the viewfinder lives) stays clear so the user can frame. */}
      <LinearGradient
        colors={['rgba(13,12,10,0.65)', 'rgba(13,12,10,0)']}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={styles.topScrim}
        pointerEvents="none"
      />
      <LinearGradient
        colors={['rgba(13,12,10,0)', 'rgba(13,12,10,0.75)']}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={styles.bottomScrim}
        pointerEvents="none"
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
        <Pressable style={styles.frame} onPress={simulateTap}>
          {(['tl', 'tr', 'bl', 'br'] as const).map((c) => (
            <View key={c} style={[styles.cornerBase, cornerStyles[c]]} />
          ))}

          <View style={styles.framePlaceholder} pointerEvents="none">
            {!cameraReady && (
              <Barcode size={32} color="rgba(244,237,224,0.55)" weight="thin" />
            )}
            <Text style={styles.frameHint}>{hint}</Text>
          </View>

          <Animated.View style={[styles.scanline, scanlineStyle]} pointerEvents="none">
            <LinearGradient
              colors={['transparent', Colors.amber, 'transparent']}
              start={{ x: 0, y: 0.5 }}
              end={{ x: 1, y: 0.5 }}
              style={StyleSheet.absoluteFill}
            />
          </Animated.View>
        </Pressable>

        <Pressable
          style={styles.searchEscape}
          onPress={() =>
            router.push({ pathname: '/search', params: { returnTo: '/shop/scan' } })
          }
        >
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

  // Scrims darken the very top and bottom so chrome reads against a bright
  // camera scene. Heights tuned to cover the top bar + the totals strip while
  // leaving the middle (the viewfinder) crystal-clear.
  topScrim: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 160,
  },
  bottomScrim: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 220,
  },

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
    color: 'rgba(244,237,224,0.85)',
    textShadowColor: 'rgba(0,0,0,0.45)',
    textShadowRadius: 6,
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
