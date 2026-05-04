import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowsLeftRight, ArrowRight } from 'phosphor-react-native';
import { router } from 'expo-router';
import { Colors, Fonts, Radius } from '../../src/constants/theme';
import { productById } from '../../src/data/catalog';

export default function SubstituteScreen() {
  const insets = useSafeAreaInsets();
  const original = productById('avocado');
  if (!original) return null;
  const sub = { name: 'Organic avocado', price: 1.79, unit: 'ea', emoji: '🥑' };
  const diff = sub.price - original.price;

  return (
    <View style={styles.root}>
      <Pressable style={styles.dimmer} onPress={() => router.back()} />

      <View style={[styles.sheet, { paddingBottom: insets.bottom + 28 }]}>
        <View style={styles.handle} />
        <View style={styles.eyebrowChip}>
          <ArrowsLeftRight size={11} color={Colors.accent} weight="bold" />
          <Text style={styles.eyebrowChipText}>SWAP IT OUT</Text>
        </View>
        <Text style={styles.title}>
          Pick a different <Text style={styles.titleItalic}>avocado</Text>.
        </Text>
        <Text style={styles.subtitle}>
          Same shelf, different choices. Pick what's actually in front of you.
        </Text>

        <View style={styles.compareRow}>
          <View style={styles.compareCard}>
            <Text style={styles.compareLabel}>ON YOUR LIST</Text>
            <View style={styles.compareThumb}>
              <LinearGradient
                colors={[Colors.tile, Colors.tileDeep]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={StyleSheet.absoluteFill as never}
              />
              <Text style={styles.compareEmoji}>{original.emoji}</Text>
            </View>
            <Text style={styles.compareName}>{original.name}</Text>
            <Text style={styles.compareMeta}>
              ${original.price.toFixed(2)}/{original.unit}
            </Text>
          </View>
          <View style={styles.arrow}>
            <ArrowRight size={20} color={Colors.muted} weight="regular" />
          </View>
          <View style={[styles.compareCard, styles.compareCardActive]}>
            <View style={styles.justScannedBadge}>
              <Text style={styles.justScannedText}>JUST SCANNED</Text>
            </View>
            <Text style={[styles.compareLabel, { color: Colors.accent }]}>SWAP TO</Text>
            <View style={styles.compareThumb}>
              <LinearGradient
                colors={[Colors.tile, Colors.tileDeep]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={StyleSheet.absoluteFill as never}
              />
              <Text style={styles.compareEmoji}>{sub.emoji}</Text>
            </View>
            <Text style={styles.compareName}>{sub.name}</Text>
            <Text style={styles.compareMeta}>
              ${sub.price.toFixed(2)}/{sub.unit}{' '}
              <Text style={styles.compareDelta}>+${diff.toFixed(2)}</Text>
            </Text>
          </View>
        </View>

        <Pressable style={styles.primaryBtn} onPress={() => router.back()}>
          <Text style={styles.primaryBtnText}>Swap & add to cart</Text>
        </Pressable>
        <View style={styles.secondaryRow}>
          <Pressable style={styles.secondaryBtn} onPress={() => router.back()}>
            <Text style={styles.secondaryBtnText}>Add both</Text>
          </Pressable>
          <Pressable style={styles.secondaryBtn} onPress={() => router.back()}>
            <Text style={[styles.secondaryBtnText, { color: Colors.muted }]}>Cancel</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, justifyContent: 'flex-end' },
  dimmer: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.55)' },

  sheet: {
    backgroundColor: Colors.cream,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 24,
    paddingTop: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -16 },
    shadowOpacity: 0.55,
    shadowRadius: 40,
    elevation: 16,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.line,
    alignSelf: 'center',
    marginBottom: 16,
  },

  eyebrowChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: Radius.pill,
    backgroundColor: 'rgba(45,90,61,0.10)',
    marginBottom: 14,
  },
  eyebrowChipText: {
    fontFamily: Fonts.sansBold,
    fontSize: 10,
    letterSpacing: 1.2,
    color: Colors.accent,
  },

  title: {
    fontFamily: Fonts.serif,
    fontSize: 36,
    lineHeight: 40,
    letterSpacing: -1.1,
    color: Colors.ink,
    marginBottom: 6,
    includeFontPadding: false,
  },
  titleItalic: { fontFamily: Fonts.serifItalic, color: Colors.amber },
  subtitle: {
    fontFamily: Fonts.sans,
    fontSize: 13,
    color: Colors.muted,
    marginBottom: 22,
    lineHeight: 19.5,
  },

  compareRow: { flexDirection: 'row', gap: 10, marginBottom: 18, alignItems: 'stretch' },
  compareCard: {
    flex: 1,
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.lineFaint,
  },
  compareCardActive: {
    flex: 1.05,
    borderWidth: 1,
    borderColor: 'rgba(45,90,61,0.20)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
  },
  justScannedBadge: {
    position: 'absolute',
    top: -8,
    right: 12,
    backgroundColor: Colors.accent,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Radius.pill,
  },
  justScannedText: {
    fontFamily: Fonts.sansBold,
    fontSize: 9,
    letterSpacing: 0.8,
    color: Colors.cream,
  },
  compareLabel: {
    fontFamily: Fonts.sansSemibold,
    fontSize: 9.5,
    letterSpacing: 1.2,
    color: Colors.muted,
    marginBottom: 8,
  },
  compareThumb: {
    width: 48,
    height: 48,
    borderRadius: 12,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  compareEmoji: { fontSize: 26 },
  compareName: { fontFamily: Fonts.sansMedium, fontSize: 13, color: Colors.ink },
  compareMeta: { fontFamily: Fonts.sans, fontSize: 11.5, color: Colors.muted, marginTop: 3 },
  compareDelta: { fontFamily: Fonts.sansSemibold, color: Colors.amber },
  arrow: { alignSelf: 'center' },

  primaryBtn: {
    height: 54,
    borderRadius: 14,
    backgroundColor: Colors.ink,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 6,
  },
  primaryBtnText: { fontFamily: Fonts.sansMedium, fontSize: 15, color: Colors.cream },
  secondaryRow: { flexDirection: 'row', gap: 8 },
  secondaryBtn: {
    flex: 1,
    height: 46,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.line,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryBtnText: { fontFamily: Fonts.sansMedium, fontSize: 13, color: Colors.ink },
});
