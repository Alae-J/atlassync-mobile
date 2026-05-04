import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowLeft, ArrowRight, WarningCircle } from 'phosphor-react-native';
import { router } from 'expo-router';
import { Colors, Fonts, Radius, Shadows } from '../../src/constants/theme';
import { productById } from '../../src/data/catalog';

interface CartLine {
  id: string;
  qty: number;
  sub?: string;
}

const cart: CartLine[] = [
  { id: 'banana', qty: 2 },
  { id: 'milk', qty: 1 },
  { id: 'avocado', qty: 4, sub: 'Organic' },
  { id: 'chicken', qty: 1 },
  { id: 'olive-oil', qty: 1 },
  { id: 'bread', qty: 1 },
  { id: 'eggs', qty: 1 },
];

const TAX_RATE = 0.0875;

export default function ReviewScreen() {
  const insets = useSafeAreaInsets();
  const subtotal = cart.reduce((sum, it) => sum + (productById(it.id)?.price ?? 0) * it.qty, 0);
  const tax = subtotal * TAX_RATE;
  const total = subtotal + tax;

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
        <Pressable style={styles.iconBtn} onPress={() => router.back()}>
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
          {cart.length} items · 1 substitution · grabbed in 18 min
        </Text>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.receipt}>
          {cart.map((line, i) => {
            const p = productById(line.id);
            if (!p) return null;
            return (
              <View
                key={line.id}
                style={[styles.receiptRow, i < cart.length - 1 && styles.receiptRowDivider]}
              >
                <View style={styles.receiptThumb}>
                  <LinearGradient
                    colors={[Colors.tile, Colors.tileDeep]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={StyleSheet.absoluteFill as never}
                  />
                  <Text style={styles.receiptEmoji}>{p.emoji}</Text>
                </View>
                <View style={{ flex: 1, minWidth: 0 }}>
                  <View style={styles.receiptNameRow}>
                    <Text style={styles.receiptName}>{p.name}</Text>
                    {line.sub && (
                      <View style={styles.swapBadge}>
                        <Text style={styles.swapBadgeText}>SWAP</Text>
                      </View>
                    )}
                  </View>
                  <Text style={styles.receiptMeta}>
                    {line.qty} × ${p.price.toFixed(2)}
                    {line.sub ? ` · ${line.sub}` : ''}
                  </Text>
                </View>
                <Text style={styles.receiptAmount}>${(p.price * line.qty).toFixed(2)}</Text>
              </View>
            );
          })}
        </View>

        <View style={styles.totalsBlock}>
          <View style={styles.totalsRow}>
            <Text style={styles.totalsLabel}>Subtotal</Text>
            <Text style={styles.totalsAmount}>${subtotal.toFixed(2)}</Text>
          </View>
          <View style={styles.totalsRow}>
            <Text style={styles.totalsLabel}>Tax (8.75%)</Text>
            <Text style={styles.totalsAmount}>${tax.toFixed(2)}</Text>
          </View>
        </View>

        <Pressable style={styles.forgotBtn}>
          <WarningCircle size={16} color={Colors.muted} weight="regular" />
          <Text style={styles.forgotText}>Forgot something? Scan it now.</Text>
        </Pressable>
      </ScrollView>

      <View style={[styles.payBar, { paddingBottom: insets.bottom + 14, paddingTop: 8 }]}>
        <View style={styles.payCard}>
          <View>
            <Text style={styles.payLabel}>YOU PAY</Text>
            <Text style={styles.payAmount}>${total.toFixed(2)}</Text>
          </View>
          <Pressable style={styles.payBtn} onPress={() => router.replace('/shop/walkout')}>
            <Text style={styles.payBtnText}>Pay & walk out</Text>
            <ArrowRight size={14} color={Colors.ink} weight="bold" />
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
});
