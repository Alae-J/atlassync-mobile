import { useEffect } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Check } from 'phosphor-react-native';
import { router } from 'expo-router';
import QRCode from 'react-native-qrcode-svg';
import { Colors, Fonts, Radius, Shadows } from '../../src/constants/theme';
import { useSession } from '../../src/context/SessionContext';

export default function WalkoutScreen() {
  const insets = useSafeAreaInsets();
  const { sessionId, validateExit, cart, exitQr, reset } = useSession();

  useEffect(() => {
    validateExit().catch(() => undefined);
  }, [validateExit]);

  const handleDone = () => {
    reset();
    router.replace('/(tabs)/home');
  };

  const handleReceipt = () => {
    if (!sessionId) return;
    router.push({ pathname: '/order/[id]', params: { id: sessionId, mode: 'walkout' } });
  };

  const total = cart?.total ?? 0;
  const itemCount = cart?.itemCount ?? 0;

  return (
    <View style={styles.root}>
      <LinearGradient
        colors={['rgba(45,90,61,0.16)', 'transparent']}
        start={{ x: 0.5, y: 0.1 }}
        end={{ x: 0.5, y: 0.5 }}
        style={styles.glowTop}
        pointerEvents="none"
      />
      <LinearGradient
        colors={['transparent', 'rgba(200,122,58,0.12)']}
        start={{ x: 0.5, y: 0.4 }}
        end={{ x: 0.5, y: 1 }}
        style={styles.glowBottom}
        pointerEvents="none"
      />

      <View style={[styles.headerRow, { paddingTop: insets.top + 12 }]}>
        <View style={styles.spacer} />
        <Pressable style={styles.receiptBtn} onPress={handleReceipt}>
          <Text style={styles.receiptBtnText}>Receipt</Text>
        </Pressable>
      </View>

      <View style={styles.center}>
        <View style={styles.medallionRing} />
        <LinearGradient
          colors={[Colors.accent, Colors.accentDeep]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.medallion}
        >
          <Check size={56} color={Colors.cream} weight="bold" />
        </LinearGradient>

        <Text style={styles.eyebrow}>PAID · ALL DONE</Text>
        <Text style={styles.titleLine}>Saturday haul,</Text>
        <Text style={[styles.titleLine, styles.titleItalic]}>handled.</Text>
        <Text style={styles.subtitle}>
          Walk out the front. We've already let the gate know you're good.
        </Text>

        <View style={styles.ticket}>
          <View style={[styles.ticketPerf, styles.ticketPerfLeft]} />
          <View style={[styles.ticketPerf, styles.ticketPerfRight]} />
          <View style={styles.ticketTopRow}>
            <Text style={styles.ticketLabel}>GATE PASS</Text>
            <Text style={styles.ticketLabel}>SCAN AT EXIT</Text>
          </View>
          <View style={styles.qrWrap}>
            {exitQr ? (
              <QRCode
                value={exitQr.correlationId}
                size={148}
                backgroundColor={Colors.cream}
                color={Colors.ink}
              />
            ) : (
              <View style={[styles.qrFallback, { width: 148, height: 148 }]} />
            )}
          </View>
          <Text style={styles.ticketCode} numberOfLines={1}>
            {exitQr ? exitQr.correlationId.slice(0, 8).toUpperCase() : '— · —'}
          </Text>
          <View style={styles.ticketBottomRow}>
            <Text style={styles.ticketBottomText}>{itemCount} items</Text>
            <Text style={styles.ticketBottomText}>
              Total <Text style={styles.ticketBottomStrong}>${total.toFixed(2)}</Text>
            </Text>
          </View>
        </View>
      </View>

      <View style={[styles.footer, { paddingBottom: insets.bottom + 24 }]}>
        <Pressable style={styles.doneBtn} onPress={handleDone}>
          <Text style={styles.doneBtnText}>Done</Text>
        </Pressable>
        <Pressable style={styles.saveBtn}>
          <Text style={styles.saveBtnText}>Save haul to lists</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.cream },
  glowTop: { position: 'absolute', top: 0, left: 0, right: 0, height: 480 },
  glowBottom: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 360 },

  headerRow: {
    paddingHorizontal: 24,
    paddingBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  spacer: { width: 36 },
  receiptBtn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: Radius.pill,
    backgroundColor: Colors.inkGlassFill,
  },
  receiptBtnText: { fontFamily: Fonts.sansMedium, fontSize: 12, color: Colors.ink },

  center: { flex: 1, alignItems: 'center', paddingHorizontal: 24, paddingTop: 20 },
  medallionRing: {
    position: 'absolute',
    top: 10,
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 2,
    borderColor: 'rgba(45,90,61,0.20)',
  },
  medallion: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    ...Shadows.cta,
  },
  eyebrow: {
    fontFamily: Fonts.sansSemibold,
    fontSize: 11,
    letterSpacing: 1.5,
    color: Colors.muted,
    marginBottom: 10,
  },
  titleLine: {
    fontFamily: Fonts.serif,
    fontSize: 48,
    lineHeight: 50,
    letterSpacing: -1.6,
    color: Colors.ink,
    textAlign: 'center',
    includeFontPadding: false,
  },
  titleItalic: { fontFamily: Fonts.serifItalic, color: Colors.amber },
  subtitle: {
    fontFamily: Fonts.sans,
    fontSize: 13,
    color: Colors.muted,
    textAlign: 'center',
    marginTop: 12,
    lineHeight: 19.5,
    maxWidth: 280,
  },

  ticket: {
    marginTop: 28,
    width: '100%',
    backgroundColor: Colors.ink,
    borderRadius: 22,
    paddingHorizontal: 20,
    paddingVertical: 18,
    overflow: 'hidden',
    ...Shadows.cta,
  },
  ticketPerf: {
    position: 'absolute',
    top: '50%',
    width: 16,
    height: 16,
    backgroundColor: Colors.cream,
    borderRadius: 8,
    marginTop: -8,
  },
  ticketPerfLeft: { left: -8 },
  ticketPerfRight: { right: -8 },
  ticketTopRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  ticketLabel: {
    fontFamily: Fonts.sansSemibold,
    fontSize: 10,
    letterSpacing: 1.2,
    color: 'rgba(244,237,224,0.6)',
  },
  ticketCode: {
    fontFamily: 'Menlo',
    fontSize: 12,
    letterSpacing: 2,
    color: 'rgba(244,237,224,0.55)',
    textAlign: 'center',
    marginTop: 10,
    marginBottom: 6,
    includeFontPadding: false,
  },
  qrWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.cream,
    padding: 10,
    borderRadius: 12,
    alignSelf: 'center',
    marginBottom: 4,
  },
  qrFallback: {
    backgroundColor: 'rgba(244,237,224,0.15)',
    borderRadius: 8,
  },
  ticketBottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 14,
  },
  ticketBottomText: {
    fontFamily: Fonts.sans,
    fontSize: 11,
    color: 'rgba(244,237,224,0.7)',
  },
  ticketBottomStrong: { fontFamily: Fonts.sansSemibold, color: Colors.cream },

  footer: { paddingHorizontal: 24, paddingTop: 16, gap: 8 },
  doneBtn: {
    height: 54,
    borderRadius: Radius.lg,
    backgroundColor: Colors.ink,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.cta,
  },
  doneBtnText: { fontFamily: Fonts.sansMedium, fontSize: 15, color: Colors.cream },
  saveBtn: { height: 44, alignItems: 'center', justifyContent: 'center' },
  saveBtnText: { fontFamily: Fonts.sansMedium, fontSize: 13, color: Colors.muted },
});
