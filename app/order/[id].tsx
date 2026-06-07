import { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  ArrowLeft,
  CaretRight,
  DownloadSimple,
  ShareNetwork,
  ShoppingCart,
  Warning,
  X,
  Headphones,
} from 'phosphor-react-native';
import { Colors, Fonts, Radius, Shadows } from '../../src/constants/theme';
import { sessionsApi } from '../../src/api';
import { formatPrice } from '../../src/lib/formatPrice';
import type { ReceiptResponse } from '../../src/types';
import { formatTripRange } from '../../src/lib/receiptDates';
import { useAuth } from '../../src/context/AuthContext';
import { firstName } from '../../src/lib/userDisplay';
import { ProductThumb, ListPickerSheet } from '../../src/components/product';

const STORE_NAMES: Record<number, { name: string; city: string }> = {
  1: { name: 'Aldi', city: 'Mansoura' },
};

const TAX_RATE = 0.07;

export default function OrderDetailScreen() {
  const insets = useSafeAreaInsets();
  const { id, mode, helpAt } = useLocalSearchParams<{
    id: string;
    mode?: 'walkout' | 'past';
    helpAt?: string;
  }>();
  const { user } = useAuth();

  const isWalkout = mode === 'walkout';

  const [receipt, setReceipt] = useState<ReceiptResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pickerOpen, setPickerOpen] = useState(false);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    setLoading(true);
    setError(null);
    sessionsApi
      .receipt(String(id))
      .then((data) => {
        if (!cancelled) setReceipt(data);
      })
      .catch(() => {
        if (!cancelled) setError("Couldn't load this receipt.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  const totals = useMemo(() => {
    if (!receipt || !receipt.totalAmount) return null;
    const total = receipt.totalAmount;
    const subtotal = +(total / (1 + TAX_RATE)).toFixed(2);
    const tax = +(total - subtotal).toFixed(2);
    return { subtotal, tax, total };
  }, [receipt]);

  const aisleCount = useMemo(() => {
    if (!receipt) return 0;
    // Receipt line items don't carry aisle (cart-service doesn't capture it).
    // Fall back to the inventory the user actually crossed: items.length is a
    // close-enough proxy for "this many distinct lines" — when product-service
    // ships aisle data into receipts we'll wire the real number here.
    return new Set(receipt.items.map((i) => i.barcode.charAt(0))).size;
  }, [receipt]);

  if (loading) {
    return (
      <View style={[styles.root, styles.center]}>
        <ActivityIndicator color={Colors.amber} />
      </View>
    );
  }

  if (error || !receipt) {
    return (
      <View style={[styles.root, { paddingTop: insets.top + 40 }]}>
        <Pressable
          onPress={() => router.back()}
          style={[styles.floatingChip, { top: insets.top + 12, left: 18 }]}
        >
          <ArrowLeft size={16} color={Colors.ink} weight="regular" />
        </Pressable>
        <View style={[styles.center, { paddingHorizontal: 28 }]}>
          <Text style={styles.errorTitle}>
            Couldn&apos;t open <Text style={styles.errorTitleItalic}>that trip</Text>.
          </Text>
          <Text style={styles.errorHelper}>
            {error ?? 'Try again in a moment, or pull up a different one from your history.'}
          </Text>
        </View>
      </View>
    );
  }

  const isCancelled = receipt.status === 'CANCELLED';
  const storeMeta = STORE_NAMES[receipt.storeId] ?? { name: 'Store', city: '' };
  const totalDisplay = isCancelled ? 0 : receipt.totalAmount ?? 0;
  const showHelpNote = !isCancelled && !!helpAt;

  return (
    <View style={styles.root}>
      {/* Header strip — celebratory walkout, or quiet past trip */}
      {isWalkout ? (
        <WalkoutHeader
          insetsTop={insets.top}
          firstNameLabel={firstName(user) || 'there'}
          // X on the walkout receipt returns to the gate-pass screen — the
          // user dismisses to home from the walkout "Done" button, not here.
          onClose={() => {
            if (router.canGoBack()) router.back();
            else router.replace('/shop/walkout');
          }}
        />
      ) : (
        <PastHeader insetsTop={insets.top} onBack={() => router.back()} />
      )}

      <ScrollView
        contentContainerStyle={{ paddingBottom: 140 + insets.bottom }}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero */}
        <View style={[styles.hero, isWalkout && styles.heroAfterWalkout]}>
          <Text style={styles.storeName}>
            {storeMeta.name}{' '}
            {storeMeta.city ? (
              <>
                · <Text style={styles.storeCity}>{storeMeta.city}</Text>
              </>
            ) : null}
          </Text>
          <Text style={styles.metaLine}>
            {formatTripRange(receipt.createdAt, receipt.completedAt)}
          </Text>
          <Text style={styles.totalDisplay}>{formatPrice(totalDisplay)}</Text>
        </View>

        {/* Stats strip */}
        {!isCancelled && (
          <View style={styles.statsStrip}>
            <View style={[styles.statCell, { flex: 1, paddingRight: 14 }]}>
              <Text style={styles.statEyebrow}>ITEMS</Text>
              <Text style={styles.statValue}>
                {receipt.itemCount ?? 0}{' '}
                <Text style={styles.statValueSuffix}>items</Text>
              </Text>
            </View>
            <View style={styles.statDivider} />
            <View style={[styles.statCell, { flex: 1.2, paddingHorizontal: 14 }]}>
              <Text style={styles.statEyebrow}>PAYMENT</Text>
              <View style={styles.paymentRow}>
                <View style={styles.visaChip}>
                  <Text style={styles.visaChipText}>VISA</Text>
                </View>
                <Text style={styles.statValue}>·· 4287</Text>
              </View>
            </View>
            {aisleCount > 1 && (
              <>
                <View style={styles.statDivider} />
                <View style={[styles.statCell, { flex: 1, paddingLeft: 14 }]}>
                  <Text style={styles.statEyebrow}>AISLES</Text>
                  <Text style={styles.statValue}>
                    {aisleCount}{' '}
                    <Text style={styles.statValueSuffix}>covered</Text>
                  </Text>
                </View>
              </>
            )}
          </View>
        )}

        {/* Cancelled card */}
        {isCancelled && (
          <View style={{ paddingHorizontal: 22 }}>
            <View style={styles.cancelledCard}>
              <Warning size={16} color={Colors.muted} weight="regular" />
              <Text style={styles.cancelledText}>
                Session cancelled before payment. No items were charged.
              </Text>
            </View>
          </View>
        )}

        {/* Items */}
        {!isCancelled && (
          <View style={styles.itemsSection}>
            <Text style={styles.eyebrow}>ITEMS</Text>

            {showHelpNote && (
              <View style={styles.helpNote}>
                <Headphones size={13} color={Colors.amber} weight="regular" />
                <Text style={styles.helpNoteText}>You called for an associate at {helpAt}.</Text>
              </View>
            )}

            {receipt.items.length === 0 ? (
              <Text style={styles.itemsEmpty}>This trip closed with an empty cart.</Text>
            ) : (
              receipt.items.map((item, i) => (
                <ItemRow
                  key={`${item.barcode}-${i}`}
                  barcode={item.barcode}
                  productName={item.productName}
                  quantity={item.quantity}
                  unitPrice={item.unitPrice}
                  lineTotal={item.lineTotal}
                  imageUrl={item.imageUrl}
                />
              ))
            )}
          </View>
        )}

        {/* Totals */}
        {!isCancelled && totals && (
          <View style={styles.totalsBlock}>
            <TotalsRow label="Subtotal" value={totals.subtotal} />
            <TotalsRow label="Tax" value={totals.tax} />
            <View style={styles.totalsDivider} />
            <TotalsRow label="Total" value={totals.total} bold />
          </View>
        )}

        {/* Actions */}
        {!isCancelled && (
          <View style={styles.actionsSection}>
            <Text style={styles.eyebrow}>RECEIPT</Text>
            <View style={styles.actionsCard}>
              <Pressable style={[styles.actionRow, styles.actionRowDivider]}>
                <View style={styles.actionIcon}>
                  <DownloadSimple size={15} color={Colors.amber} weight="regular" />
                </View>
                <Text style={styles.actionLabel}>Download PDF receipt</Text>
                <CaretRight size={13} color={Colors.muted} weight="bold" />
              </Pressable>
              <Pressable style={styles.actionRow}>
                <View style={styles.actionIcon}>
                  <Warning size={15} color={Colors.muted} weight="regular" />
                </View>
                <Text style={[styles.actionLabel, { color: Colors.muted }]}>
                  Report a problem
                </Text>
                <CaretRight size={13} color={Colors.muted} weight="bold" />
              </Pressable>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Sticky bottom CTA */}
      <View
        pointerEvents="box-none"
        style={[styles.ctaWrap, { paddingBottom: insets.bottom + 16 }]}
      >
        <LinearGradient
          colors={['transparent', Colors.cream]}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 0.4 }}
          style={StyleSheet.absoluteFill}
        />
        {isCancelled ? (
          <Pressable style={styles.closeBtn} onPress={() => router.back()}>
            <Text style={styles.closeBtnText}>Close</Text>
          </Pressable>
        ) : (
          <Pressable style={styles.rebuyBtn} onPress={() => setPickerOpen(true)}>
            <View style={styles.rebuyLeft}>
              <ShoppingCart size={17} color={Colors.cream} weight="regular" />
              <Text style={styles.rebuyText}>Re-buy these items</Text>
            </View>
            <CaretRight size={16} color={Colors.cream} weight="bold" />
          </Pressable>
        )}
      </View>

      <ListPickerSheet
        visible={pickerOpen}
        onClose={() => setPickerOpen(false)}
        productName={`This trip · ${receipt.items.length} items`}
        productPrice={receipt.totalAmount ?? 0}
        onPickList={() => setPickerOpen(false)}
        onStartNewList={() => setPickerOpen(false)}
      />
    </View>
  );
}

// ── Header strips ─────────────────────────────────────────────────────

function WalkoutHeader({
  insetsTop,
  firstNameLabel,
  onClose,
}: {
  insetsTop: number;
  firstNameLabel: string;
  onClose: () => void;
}) {
  return (
    <View style={{ position: 'relative' }}>
      <LinearGradient
        colors={['rgba(200,122,58,0.32)', 'rgba(200,122,58,0.10)', 'transparent']}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={styles.walkoutWash}
        pointerEvents="none"
      />
      <View style={{ height: insetsTop }} />
      <View style={styles.walkoutCloseRow}>
        <Pressable onPress={onClose} style={styles.closeChip} hitSlop={10}>
          <X size={14} color={Colors.ink} weight="bold" />
        </Pressable>
      </View>
      <View style={styles.walkoutBlock}>
        <Text style={styles.walkoutEyebrow}>SHOPPING COMPLETE · GATE CLEARED</Text>
        <Text style={styles.walkoutTitle}>
          Thanks, <Text style={styles.walkoutTitleItalic}>{firstNameLabel}</Text>.
        </Text>
        <Text style={styles.walkoutHelper}>
          Your receipt is below. It&apos;s also in your inbox.
        </Text>
      </View>
    </View>
  );
}

function PastHeader({ insetsTop, onBack }: { insetsTop: number; onBack: () => void }) {
  return (
    <View>
      <View style={{ height: insetsTop }} />
      <View style={styles.pastHeaderRow}>
        <Pressable onPress={onBack} hitSlop={10} style={styles.backChip}>
          <ArrowLeft size={16} color={Colors.ink} weight="regular" />
        </Pressable>
        <Pressable hitSlop={10} style={styles.backChip}>
          <ShareNetwork size={15} color={Colors.ink} weight="regular" />
        </Pressable>
      </View>
    </View>
  );
}

// ── Bits ──────────────────────────────────────────────────────────────

function ItemRow({
  barcode,
  productName,
  quantity,
  unitPrice,
  lineTotal,
  imageUrl,
}: {
  barcode: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
  imageUrl: string | null;
}) {
  return (
    <Pressable
      onPress={() => router.push({ pathname: '/product/[barcode]', params: { barcode } })}
      style={styles.itemRow}
    >
      <ProductThumb emoji={emojiForName(productName)} imageUrl={imageUrl} size={50} />
      <View style={{ flex: 1, minWidth: 0 }}>
        <Text style={styles.itemName} numberOfLines={1}>
          {productName}
        </Text>
      </View>
      <View style={styles.itemPriceCol}>
        <Text style={styles.itemQty}>
          {quantity} × {formatPrice(unitPrice)}
        </Text>
        <Text style={styles.itemLineTotal}>{formatPrice(lineTotal)}</Text>
      </View>
    </Pressable>
  );
}

function TotalsRow({ label, value, bold }: { label: string; value: number; bold?: boolean }) {
  return (
    <View style={styles.totalsRow}>
      <Text style={[styles.totalsLabel, bold && styles.totalsLabelBold]}>{label}</Text>
      <Text style={[styles.totalsValue, bold && styles.totalsValueBold]}>{formatPrice(value)}</Text>
    </View>
  );
}

const EMOJI_MAP: Array<[string, string]> = [
  ['banana', '🍌'], ['milk', '🥛'], ['bread', '🍞'], ['egg', '🥚'],
  ['avocado', '🥑'], ['chicken', '🍗'], ['pasta', '🍝'], ['tomato', '🍅'],
  ['cheese', '🧀'], ['oil', '🫒'], ['onion', '🧅'], ['salmon', '🐟'],
  ['yogurt', '🥣'], ['apple', '🍎'], ['coffee', '☕'],
];

function emojiForName(name: string): string {
  const lower = name.toLowerCase();
  for (const [keyword, emoji] of EMOJI_MAP) {
    if (lower.includes(keyword)) return emoji;
  }
  return '📦';
}

// ── Styles ────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.cream },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  floatingChip: {
    position: 'absolute',
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255,253,248,0.85)',
    borderWidth: 1,
    borderColor: Colors.line,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
    ...Shadows.card,
  },

  // Walkout header
  walkoutWash: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 260,
  },
  walkoutCloseRow: {
    paddingHorizontal: 22,
    paddingTop: 14,
    paddingBottom: 6,
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  closeChip: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.paper,
    borderWidth: 1,
    borderColor: Colors.line,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.card,
  },
  walkoutBlock: { paddingHorizontal: 22, paddingTop: 6, paddingBottom: 24 },
  walkoutEyebrow: {
    fontFamily: Fonts.sansBold,
    fontSize: 10,
    letterSpacing: 1.6,
    color: Colors.amber,
  },
  walkoutTitle: {
    fontFamily: Fonts.serif,
    fontSize: 38,
    lineHeight: 40,
    letterSpacing: -1,
    color: Colors.ink,
    marginTop: 10,
    includeFontPadding: false,
  },
  walkoutTitleItalic: { fontFamily: Fonts.serifItalic, color: Colors.amber },
  walkoutHelper: {
    fontFamily: Fonts.sans,
    fontSize: 12.5,
    color: Colors.muted,
    marginTop: 8,
    lineHeight: 18,
    maxWidth: 280,
  },

  // Past header
  pastHeaderRow: {
    paddingHorizontal: 18,
    paddingTop: 8,
    paddingBottom: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backChip: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.paper,
    borderWidth: 1,
    borderColor: Colors.line,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.card,
  },

  // Hero
  hero: { paddingHorizontal: 22, paddingBottom: 22 },
  heroAfterWalkout: { paddingTop: 4 },
  storeName: {
    fontFamily: Fonts.serif,
    fontSize: 30,
    lineHeight: 32,
    letterSpacing: -0.7,
    color: Colors.ink,
    includeFontPadding: false,
  },
  storeCity: { fontFamily: Fonts.serifItalic },
  metaLine: {
    fontFamily: Fonts.sans,
    fontSize: 12,
    color: Colors.muted,
    marginTop: 8,
    lineHeight: 18,
  },
  totalDisplay: {
    fontFamily: Fonts.serif,
    fontSize: 68,
    lineHeight: 65,
    letterSpacing: -2.4,
    color: Colors.ink,
    marginTop: 18,
    includeFontPadding: false,
  },

  // Stats strip
  statsStrip: {
    marginHorizontal: 22,
    marginTop: 6,
    flexDirection: 'row',
    alignItems: 'stretch',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: Colors.line,
    paddingVertical: 14,
  },
  statCell: {},
  statDivider: { width: 1, backgroundColor: Colors.line },
  statEyebrow: {
    fontFamily: Fonts.sansSemibold,
    fontSize: 9.5,
    letterSpacing: 1.4,
    color: Colors.muted,
  },
  statValue: {
    fontFamily: Fonts.serif,
    fontSize: 22,
    lineHeight: 24,
    letterSpacing: -0.3,
    color: Colors.ink,
    marginTop: 4,
    includeFontPadding: false,
  },
  statValueSuffix: {
    fontFamily: Fonts.sans,
    fontSize: 13,
    color: Colors.muted,
  },
  paymentRow: { flexDirection: 'row', alignItems: 'center', gap: 7, marginTop: 4 },
  visaChip: {
    width: 26,
    height: 17,
    borderRadius: 3,
    backgroundColor: Colors.ink,
    alignItems: 'center',
    justifyContent: 'center',
  },
  visaChipText: {
    fontFamily: Fonts.sansBold,
    fontSize: 7.5,
    letterSpacing: 0.4,
    color: Colors.amber,
  },

  // Cancelled card
  cancelledCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 14,
    backgroundColor: Colors.paper,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.lineFaint,
    marginTop: 16,
  },
  cancelledText: { fontFamily: Fonts.sans, fontSize: 13, color: Colors.muted, flex: 1, lineHeight: 18 },

  // Items
  itemsSection: { paddingHorizontal: 22, paddingTop: 28 },
  eyebrow: {
    fontFamily: Fonts.sansSemibold,
    fontSize: 10,
    letterSpacing: 1.6,
    color: Colors.muted,
    marginBottom: 12,
  },
  helpNote: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
    backgroundColor: Colors.paper,
    borderRadius: Radius.md,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: Colors.lineFaint,
    marginBottom: 12,
  },
  helpNoteText: { fontFamily: Fonts.sans, fontSize: 12, color: Colors.ink, flex: 1 },
  itemsEmpty: { fontFamily: Fonts.sans, fontSize: 13, color: Colors.muted },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors.line,
  },
  itemName: {
    fontFamily: Fonts.sansMedium,
    fontSize: 14,
    color: Colors.ink,
  },
  itemChips: { flexDirection: 'row', gap: 5, marginTop: 4 },
  itemPriceCol: { alignItems: 'flex-end', gap: 2 },
  itemQty: { fontFamily: Fonts.sans, fontSize: 11.5, color: Colors.muted },
  itemLineTotal: {
    fontFamily: Fonts.serif,
    fontSize: 18,
    letterSpacing: -0.3,
    color: Colors.ink,
    includeFontPadding: false,
  },

  // Totals
  totalsBlock: {
    paddingHorizontal: 22,
    paddingTop: 22,
  },
  totalsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    paddingVertical: 5,
  },
  totalsLabel: {
    fontFamily: Fonts.sans,
    fontSize: 13,
    color: Colors.muted,
  },
  totalsLabelBold: {
    fontFamily: Fonts.sansSemibold,
    color: Colors.ink,
    fontSize: 14,
  },
  totalsValue: {
    fontFamily: Fonts.sansMedium,
    fontSize: 14,
    color: Colors.ink,
  },
  totalsValueBold: {
    fontFamily: Fonts.serif,
    fontSize: 22,
    letterSpacing: -0.3,
  },
  totalsDivider: {
    height: 1,
    backgroundColor: Colors.line,
    marginVertical: 8,
  },

  // Actions
  actionsSection: { paddingHorizontal: 22, paddingTop: 28 },
  actionsCard: {
    backgroundColor: Colors.paper,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.lineFaint,
    overflow: 'hidden',
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  actionRowDivider: { borderBottomWidth: 1, borderBottomColor: Colors.line },
  actionIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: 'rgba(200,122,58,0.10)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionLabel: { flex: 1, fontFamily: Fonts.sans, fontSize: 14, color: Colors.ink },

  // Sticky CTA
  ctaWrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 18,
    paddingTop: 24,
  },
  rebuyBtn: {
    height: 58,
    borderRadius: Radius.xl,
    backgroundColor: Colors.ink,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    ...Shadows.cta,
  },
  rebuyLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  rebuyText: { fontFamily: Fonts.sansMedium, fontSize: 15, color: Colors.cream },
  closeBtn: {
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: Colors.line,
    borderRadius: Radius.lg,
    alignItems: 'center',
    backgroundColor: Colors.paper,
  },
  closeBtnText: { fontFamily: Fonts.sansMedium, fontSize: 14, color: Colors.muted },

  // Error fallback
  errorTitle: {
    fontFamily: Fonts.serif,
    fontSize: 32,
    lineHeight: 34,
    letterSpacing: -1,
    color: Colors.ink,
    textAlign: 'center',
    includeFontPadding: false,
  },
  errorTitleItalic: { fontFamily: Fonts.serifItalic, color: Colors.amber },
  errorHelper: {
    fontFamily: Fonts.sans,
    fontSize: 13,
    color: Colors.muted,
    textAlign: 'center',
    marginTop: 12,
    maxWidth: 280,
  },
});
