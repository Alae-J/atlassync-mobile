import { useState } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowLeft, ArrowRight, Plus, Camera } from 'phosphor-react-native';
import { router } from 'expo-router';
import { Colors, Fonts, Radius, Shadows } from '../../src/constants/theme';
import { savedLists, productById } from '../../src/data/catalog';
import { useSession } from '../../src/context/SessionContext';
import { gateApi } from '../../src/api';

export default function ArriveScreen() {
  const insets = useSafeAreaInsets();
  const { startSession, isStarting } = useSession();
  const [selected, setSelected] = useState<string>(savedLists[0].id);
  const [error, setError] = useState<string | null>(null);

  const beginScanning = async () => {
    if (isStarting) return;
    setError(null);
    try {
      // Mint the session, then immediately call gate-entry with the issued
      // QR to flip it CREATED → ACTIVE. In a real store a fixed gate scanner
      // does this on the user's behalf; in dev/testing without a gate, the
      // mobile app fakes the scan against its own QR.
      const res = await startSession();
      await gateApi.entry({ correlationId: res.entryQr.correlationId });
      router.push('/shop/scan');
    } catch {
      setError('Could not start a session. Try again.');
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
        <Pressable style={styles.iconBtn} onPress={() => router.back()}>
          <ArrowLeft size={16} color={Colors.ink} weight="bold" />
        </Pressable>
        <Text style={styles.headerLabel}>IN-STORE</Text>
        <View style={styles.iconBtnSpacer} />
      </View>

      <View style={styles.heroBlock}>
        <Text style={styles.eyebrow}>◉ DETECTED · YOU'RE AT</Text>
        <Text style={styles.heroTitle}>
          Marina <Text style={styles.heroItalic}>Foods.</Text>
        </Text>
        <Text style={styles.heroSub}>412 Chestnut St · open until 10pm</Text>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.sectionLabel}>HOW DO YOU WANT TO SHOP?</Text>

        {savedLists.map((list) => {
          const total = list.items.reduce((sum, id) => sum + (productById(id)?.price ?? 0), 0);
          const isSelected = selected === list.id;
          return (
            <Pressable
              key={list.id}
              onPress={() => setSelected(list.id)}
              style={[styles.listOption, isSelected && styles.listOptionSelected]}
            >
              <View style={[styles.radio, isSelected && styles.radioSelected]} />
              <View style={{ flex: 1, minWidth: 0 }}>
                <Text style={styles.listName}>{list.name}</Text>
                <View style={styles.listMetaRow}>
                  <Text style={styles.listMeta}>{list.items.length} items</Text>
                  <Text style={styles.listMetaDot}>·</Text>
                  <Text style={styles.listMeta}>~${total.toFixed(2)}</Text>
                  <Text style={styles.listMetaDot}>·</Text>
                  <Text style={styles.listMeta}>used {list.lastUsed}</Text>
                </View>
              </View>
              <View style={styles.previewEmojis}>
                {list.items.slice(0, 3).map((id) => (
                  <View key={id} style={styles.previewEmoji}>
                    <LinearGradient
                      colors={[Colors.tile, Colors.tileDeep]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={StyleSheet.absoluteFill as never}
                    />
                    <Text style={styles.previewEmojiText}>{productById(id)?.emoji}</Text>
                  </View>
                ))}
              </View>
            </Pressable>
          );
        })}

        <View style={styles.dividerRow}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerLabel}>OR</Text>
          <View style={styles.dividerLine} />
        </View>

        <View style={styles.altRow}>
          <Pressable
            style={styles.altBtn}
            onPress={() => router.push({ pathname: '/list-editor', params: { from: 'shop-arrive' } })}
          >
            <View style={styles.altIcon}>
              <Plus size={14} color={Colors.ink} weight="bold" />
            </View>
            <Text style={styles.altTitle}>New list</Text>
            <Text style={styles.altDesc}>Build it on the fly as you shop.</Text>
          </Pressable>
          <Pressable style={styles.altBtn} onPress={beginScanning}>
            <View style={styles.altIcon}>
              <Camera size={14} color={Colors.ink} weight="regular" />
            </View>
            <Text style={styles.altTitle}>No list</Text>
            <Text style={styles.altDesc}>Just scan as you go. Freestyle.</Text>
          </Pressable>
        </View>
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + 24 }]}>
        {error && <Text style={styles.errorLine}>{error}</Text>}
        <Pressable style={[styles.cta, isStarting && { opacity: 0.6 }]} disabled={isStarting} onPress={beginScanning}>
          <View style={styles.ctaLeft}>
            <Camera size={18} color={Colors.cream} weight="regular" />
            <Text style={styles.ctaText}>{isStarting ? 'Opening gate…' : 'Start scanning'}</Text>
          </View>
          <ArrowRight size={16} color={Colors.cream} weight="bold" />
        </Pressable>
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
    paddingBottom: 6,
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

  heroBlock: { paddingHorizontal: 24, paddingVertical: 16 },
  eyebrow: {
    fontFamily: Fonts.sansSemibold,
    fontSize: 11,
    letterSpacing: 1.5,
    color: Colors.muted,
    marginBottom: 6,
  },
  heroTitle: {
    fontFamily: Fonts.serif,
    fontSize: 44,
    lineHeight: 48,
    letterSpacing: -1.6,
    color: Colors.ink,
    includeFontPadding: false,
  },
  heroItalic: { fontFamily: Fonts.serifItalic, color: Colors.amber },
  heroSub: { fontFamily: Fonts.sans, fontSize: 12.5, color: Colors.muted, marginTop: 6 },

  scroll: { paddingHorizontal: 24, paddingBottom: 12 },

  sectionLabel: {
    fontFamily: Fonts.sansSemibold,
    fontSize: 11,
    letterSpacing: 1.5,
    color: Colors.muted,
    marginBottom: 10,
  },

  listOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: Colors.line,
    borderRadius: Radius.xl,
    marginBottom: 8,
  },
  listOptionSelected: {
    backgroundColor: Colors.card,
    borderColor: 'rgba(45,90,61,0.5)',
    borderWidth: 1.5,
    ...Shadows.card,
  },
  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1.5,
    borderColor: Colors.line,
  },
  radioSelected: {
    borderWidth: 6,
    borderColor: Colors.accent,
    backgroundColor: Colors.cream,
  },
  listName: {
    fontFamily: Fonts.serif,
    fontSize: 20,
    lineHeight: 22,
    letterSpacing: -0.4,
    color: Colors.ink,
  },
  listMetaRow: { flexDirection: 'row', gap: 6, marginTop: 3, flexWrap: 'wrap' },
  listMeta: { fontFamily: Fonts.sans, fontSize: 11.5, color: Colors.muted },
  listMetaDot: { color: Colors.muted, opacity: 0.5 },
  previewEmojis: { flexDirection: 'row', gap: 2 },
  previewEmoji: {
    width: 26,
    height: 26,
    borderRadius: 7,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  previewEmojiText: { fontSize: 14 },

  dividerRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 14 },
  dividerLine: { flex: 1, height: 1, backgroundColor: Colors.line },
  dividerLabel: {
    fontFamily: Fonts.sansSemibold,
    fontSize: 10,
    letterSpacing: 1.4,
    color: Colors.muted,
  },

  altRow: { flexDirection: 'row', gap: 8 },
  altBtn: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: Colors.line,
    borderStyle: 'dashed',
    borderRadius: Radius.lg,
    paddingHorizontal: 12,
    paddingVertical: 14,
    gap: 6,
  },
  altIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: Colors.inkGlassFill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  altTitle: { fontFamily: Fonts.sansMedium, fontSize: 13, color: Colors.ink },
  altDesc: { fontFamily: Fonts.sans, fontSize: 11, color: Colors.muted, lineHeight: 15 },

  footer: { paddingHorizontal: 24, paddingTop: 8 },
  cta: {
    height: 58,
    borderRadius: Radius.xl,
    backgroundColor: Colors.ink,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    ...Shadows.cta,
  },
  ctaLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  ctaText: { fontFamily: Fonts.sansMedium, fontSize: 15, color: Colors.cream },
  errorLine: {
    fontFamily: Fonts.sansMedium,
    fontSize: 12,
    color: Colors.danger,
    textAlign: 'center',
    marginBottom: 8,
  },
});
