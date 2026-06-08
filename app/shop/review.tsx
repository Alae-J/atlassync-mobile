import { useEffect, useState } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowLeft, ArrowRight, WarningCircle } from 'phosphor-react-native';
import { router } from 'expo-router';
import { useStripe, PaymentSheetError } from '@stripe/stripe-react-native';
import { Colors, Fonts, Radius, Shadows } from '../../src/constants/theme';
import { useSession } from '../../src/context/SessionContext';
import { useAuth } from '../../src/context/AuthContext';
import { sessionsApi } from '../../src/api';
import { waitForSessionStatus } from '../../src/lib/waitForSessionStatus';
import { formatPrice } from '../../src/lib/formatPrice';

export default function ReviewScreen() {
  const insets = useSafeAreaInsets();
  const { cart, refreshCart, sessionId, applyCompletedSession } = useSession();
  const { initPaymentSheet, presentPaymentSheet } = useStripe();
  const { user } = useAuth();
  const [paying, setPaying] = useState(false);
  const [paymentConfirmed, setPaymentConfirmed] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Pressing back from review should land on scan, not whatever the nested
  // Stack thinks is "previous" — depending on whether the user took the
  // search detour the stack history might point to /shop/arrive instead.
  const handleBack = () => {
    if (sessionId) {
      router.replace('/shop/scan');
    } else if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(tabs)/home');
    }
  };

  useEffect(() => {
    refreshCart().catch(() => undefined);
  }, [refreshCart]);

  const lines = cart?.items ?? [];
  const subtotal = cart?.total ?? 0;
  // Tax is computed by Stripe Tax on the PaymentIntent — the PaymentSheet
  // shows the final breakdown. Our local total is just the cart subtotal.
  const displayTotal = subtotal;

  const handlePay = async () => {
    if (!sessionId || paying || paymentConfirmed) return;
    setError(null);
    setPaying(true);
    try {
      // 1. Server creates the PaymentIntent (server-authoritative amount).
      const intent = await sessionsApi.createPaymentIntent(sessionId);

      // 2. Hand the client_secret to Stripe SDK and present the sheet.
      const init = await initPaymentSheet({
        paymentIntentClientSecret: intent.clientSecret,
        merchantDisplayName: 'AtlasSync',
        // Required for redirect-flow payment methods (3DS, iDEAL, etc.).
        returnURL: 'atlassync://stripe-redirect',
        defaultBillingDetails: { name: user?.username ?? undefined },
      });
      if (init.error) {
        console.warn('[stripe] initPaymentSheet failed', init.error);
        throw new Error(init.error.localizedMessage ?? init.error.message);
      }

      const present = await presentPaymentSheet();
      if (present.error) {
        // User dismissed the sheet — don't surface as an error. finally
        // resets the spinner so they can retry.
        if (present.error.code === PaymentSheetError.Canceled) return;
        console.warn('[stripe] presentPaymentSheet failed', present.error);
        throw new Error(present.error.localizedMessage ?? present.error.message);
      }

      // 3. Stripe has charged the card. Lock the Pay button so a slow
      //    webhook can't lead to a second charge if the user re-taps.
      setPaymentConfirmed(true);

      // 4. Wait for the webhook to mark the session COMPLETED.
      const completed = await waitForSessionStatus(sessionId, 'COMPLETED', {
        timeoutMs: 60_000,
      });
      applyCompletedSession(completed);

      // 5. Walkout — exitQr is now in SessionContext.
      router.replace('/shop/walkout');
    } catch (e: unknown) {
      if (paymentConfirmed) {
        // Charge cleared but we couldn't see COMPLETED in time. Tell the
        // user we'll finalize in the background — DO NOT re-enable Pay.
        setError(
          'Payment received. We\'re finalizing your trip — open Orders in a moment to see the receipt.',
        );
      } else {
        setError(
          e instanceof Error && e.message
            ? e.message
            : 'Payment failed. Try again.',
        );
      }
    } finally {
      setPaying(false);
    }
  };

  return (
    <View style={styles.root}>
      <LinearGradient
        colors={['rgba(200,122,58,0.08)', 'transparent']}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 0.5 }}
        style={styles.bgWash}
        pointerEvents="none"
      />

      <View style={[styles.header, { paddingTop: insets.top + 6 }]}>
        <Pressable style={styles.iconBtn} onPress={handleBack}>
          <ArrowLeft size={16} color={Colors.ink} weight="bold" />
        </Pressable>
        <Text style={styles.headerLabel}>REVIEW & PAY</Text>
        <View style={styles.iconBtnSpacer} />
      </View>

      <View style={styles.heroBlock}>
        <Text style={styles.heroTitle}>
          Looks <Text style={styles.heroItalic}>good?</Text>
        </Text>
        <Text style={styles.heroMeta}>
          {cart?.itemCount ?? lines.length} items · {lines.length === 0 ? 'cart empty' : 'tap pay to walk out'}
        </Text>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.receipt}>
          {lines.length === 0 && (
            <Text style={styles.emptyText}>No items scanned yet.</Text>
          )}
          {lines.map((line, i) => (
            <View
              key={line.productId}
              style={[styles.receiptRow, i < lines.length - 1 && styles.receiptRowDivider]}
            >
              <View style={styles.receiptThumb}>
                <LinearGradient
                  colors={[Colors.tile, Colors.tileDeep]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={StyleSheet.absoluteFill as never}
                />
                <Text style={styles.receiptEmoji}>📦</Text>
              </View>
              <View style={{ flex: 1, minWidth: 0 }}>
                <View style={styles.receiptNameRow}>
                  <Text style={styles.receiptName}>{line.productName}</Text>
                </View>
                <Text style={styles.receiptMeta}>
                  {line.quantity} × {formatPrice(line.priceAtAddition)}
                </Text>
              </View>
              <Text style={styles.receiptAmount}>
                {formatPrice(line.priceAtAddition * line.quantity)}
              </Text>
            </View>
          ))}
        </View>

        <View style={styles.totalsBlock}>
          <View style={styles.totalsRow}>
            <Text style={styles.totalsLabel}>Subtotal</Text>
            <Text style={styles.totalsAmount}>{formatPrice(subtotal)}</Text>
          </View>
          <View style={styles.totalsRow}>
            <Text style={styles.totalsLabel}>Tax</Text>
            <Text style={styles.totalsAmount}>Calculated at checkout</Text>
          </View>
        </View>

        <Pressable style={styles.forgotBtn} onPress={() => router.replace('/shop/scan')}>
          <WarningCircle size={16} color={Colors.muted} weight="regular" />
          <Text style={styles.forgotText}>Forgot something? Scan it now.</Text>
        </Pressable>
      </ScrollView>

      <View style={[styles.payBar, { paddingBottom: insets.bottom + 14, paddingTop: 8 }]}>
        {error && <Text style={styles.payError}>{error}</Text>}
        <View style={styles.payCard}>
          <View>
            <Text style={styles.payLabel}>YOU PAY</Text>
            <Text style={styles.payAmount}>{formatPrice(displayTotal)}</Text>
          </View>
          <Pressable
            style={[styles.payBtn, (paying || paymentConfirmed || lines.length === 0) && { opacity: 0.6 }]}
            disabled={paying || paymentConfirmed || lines.length === 0}
            onPress={handlePay}
          >
            <Text style={styles.payBtnText}>
              {paying ? 'Processing…' : paymentConfirmed ? 'Confirming…' : 'Pay & walk out'}
            </Text>
            {!paying && !paymentConfirmed && <ArrowRight size={14} color={Colors.ink} weight="bold" />}
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.cream },
  bgWash: { position: 'absolute', top: 0, left: 0, right: 0, height: 320 },

  header: {
    paddingHorizontal: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.inkGlassFill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconBtnSpacer: { width: 36, height: 36 },
  headerLabel: {
    fontFamily: Fonts.sansSemibold,
    fontSize: 11,
    letterSpacing: 1.5,
    color: Colors.muted,
  },

  heroBlock: { paddingHorizontal: 24, paddingTop: 14, paddingBottom: 8 },
  heroTitle: {
    fontFamily: Fonts.serif,
    fontSize: 44,
    lineHeight: 48,
    letterSpacing: -1.6,
    color: Colors.ink,
    includeFontPadding: false,
  },
  heroItalic: { fontFamily: Fonts.serifItalic, color: Colors.amber },
  heroMeta: { fontFamily: Fonts.sans, fontSize: 13, color: Colors.muted, marginTop: 6 },

  scroll: { paddingHorizontal: 24, paddingTop: 8, paddingBottom: 12 },

  receipt: {
    backgroundColor: Colors.card,
    borderRadius: Radius.xxl,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: Colors.lineFaint,
    ...Shadows.card,
  },
  receiptRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
  },
  receiptRowDivider: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.line,
    borderStyle: 'dashed',
  },
  receiptThumb: {
    width: 38,
    height: 38,
    borderRadius: 10,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  receiptEmoji: { fontSize: 20 },
  receiptNameRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  receiptName: { fontFamily: Fonts.sansMedium, fontSize: 14, color: Colors.ink },
  swapBadge: {
    backgroundColor: 'rgba(200,122,58,0.14)',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: Radius.pill,
  },
  swapBadgeText: {
    fontFamily: Fonts.sansBold,
    fontSize: 9,
    letterSpacing: 0.6,
    color: Colors.amber,
  },
  receiptMeta: { fontFamily: Fonts.sans, fontSize: 11.5, color: Colors.muted, marginTop: 2 },
  receiptAmount: {
    fontFamily: Fonts.serif,
    fontSize: 17,
    letterSpacing: -0.2,
    color: Colors.ink,
  },

  totalsBlock: { paddingHorizontal: 14, paddingTop: 14 },
  totalsRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  totalsLabel: { fontFamily: Fonts.sans, fontSize: 13, color: Colors.muted },
  totalsAmount: { fontFamily: Fonts.sans, fontSize: 13, color: Colors.ink },

  forgotBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderWidth: 1.5,
    borderColor: Colors.line,
    borderStyle: 'dashed',
    borderRadius: Radius.lg,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginTop: 12,
  },
  forgotText: { fontFamily: Fonts.sans, fontSize: 12.5, color: Colors.muted },

  payBar: { paddingHorizontal: 14 },
  payCard: {
    backgroundColor: Colors.ink,
    borderRadius: 20,
    paddingHorizontal: 18,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    ...Shadows.cta,
  },
  payLabel: {
    fontFamily: Fonts.sansSemibold,
    fontSize: 10,
    letterSpacing: 1.2,
    color: 'rgba(244,237,224,0.6)',
  },
  payAmount: {
    fontFamily: Fonts.serif,
    fontSize: 32,
    lineHeight: 34,
    letterSpacing: -0.8,
    color: Colors.cream,
    marginTop: 3,
    includeFontPadding: false,
  },
  payBtn: {
    backgroundColor: Colors.amber,
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderRadius: Radius.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    ...Shadows.amberCta,
  },
  payBtnText: { fontFamily: Fonts.sansSemibold, fontSize: 14, color: Colors.ink },
  payError: {
    fontFamily: Fonts.sansMedium,
    fontSize: 12,
    color: Colors.danger,
    textAlign: 'center',
    paddingBottom: 6,
  },
  emptyText: {
    fontFamily: Fonts.sans,
    fontSize: 13,
    color: Colors.muted,
    textAlign: 'center',
    paddingVertical: 24,
  },
});
