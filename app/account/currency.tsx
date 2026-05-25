import { useState } from 'react';
import { View, Text, Pressable, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowLeft, Check, CurrencyCircleDollar } from 'phosphor-react-native';
import { Colors, Fonts, Radius, Shadows, Type } from '../../src/constants/theme';
import { useAuth } from '../../src/context/AuthContext';
import { meApi } from '../../src/api';
import { backTo } from '../../src/lib/nav';
import { currencies } from '../../src/data/currencies';

const backToAccount = backTo('/(tabs)/account');

export default function CurrencyPreferenceScreen() {
  const insets = useSafeAreaInsets();
  const { user, applyAuthResponse } = useAuth();
  const [submittingCode, setSubmittingCode] = useState<string | null>(null);

  const currentCode = user?.preferences.currencyCode ?? 'USD';

  const pick = async (code: string) => {
    if (submittingCode !== null) return;
    setSubmittingCode(code);
    try {
      const res = await meApi.updatePreferences({ currencyCode: code });
      await applyAuthResponse(res);
      backToAccount();
    } catch {
      setSubmittingCode(null);
    }
  };

  return (
    <View style={styles.root}>
      <LinearGradient
        colors={['rgba(200,122,58,0.10)', 'transparent']}
        style={styles.bgWash}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 0.5 }}
      />

      <Pressable
        onPress={backToAccount}
        style={[styles.backBtn, { top: insets.top + 12 }]}
        hitSlop={10}
      >
        <ArrowLeft size={18} color={Colors.ink} weight="regular" />
      </Pressable>

      <ScrollView
        contentContainerStyle={[styles.body, { paddingTop: insets.top + 80 }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.eyebrowRow}>
          <CurrencyCircleDollar size={14} color={Colors.amber} weight="regular" />
          <Text style={styles.eyebrow}>PREFERENCES</Text>
        </View>

        <Text style={styles.hero}>
          Show prices in <Text style={styles.heroItalic}>which currency?</Text>
        </Text>

        <View style={styles.card}>
          {currencies.map((c, i) => {
            const selected = c.code === currentCode;
            const busy = submittingCode === c.code;
            return (
              <Pressable
                key={c.code}
                onPress={() => pick(c.code)}
                style={[styles.row, i < currencies.length - 1 && styles.rowDivider]}
              >
                <View style={styles.symbolChip}>
                  <Text
                    style={[
                      styles.symbol,
                      c.symbol.length > 1 && styles.symbolSmall,
                    ]}
                  >
                    {c.symbol}
                  </Text>
                </View>
                <View style={{ flex: 1, minWidth: 0 }}>
                  <Text style={styles.name}>
                    {c.name} · <Text style={styles.nameCode}>{c.code}</Text>
                  </Text>
                </View>
                {busy ? (
                  <ActivityIndicator color={Colors.accent} />
                ) : selected ? (
                  <View style={styles.checkChip}>
                    <Check size={12} color={Colors.cream} weight="bold" />
                  </View>
                ) : null}
              </Pressable>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.cream },
  bgWash: { position: 'absolute', top: 0, left: 0, right: 0, height: 280 },
  backBtn: {
    position: 'absolute',
    left: 18,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.paper,
    borderWidth: 1,
    borderColor: Colors.line,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
    ...Shadows.card,
  },
  body: { paddingHorizontal: 26, paddingBottom: 40 },
  eyebrowRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  eyebrow: { ...Type.eyebrow, color: Colors.amber },
  hero: { ...Type.hero, marginBottom: 24 },
  heroItalic: { fontFamily: Fonts.serifItalic, color: Colors.amber },

  card: {
    backgroundColor: Colors.paper,
    borderRadius: Radius.xl,
    borderWidth: 1,
    borderColor: Colors.lineFaint,
    paddingHorizontal: 18,
    ...Shadows.card,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingVertical: 13,
  },
  rowDivider: { borderBottomWidth: 1, borderBottomColor: Colors.line },
  symbolChip: {
    width: 36,
    height: 24,
    borderRadius: 6,
    backgroundColor: Colors.tile,
    borderWidth: 1,
    borderColor: Colors.lineFaint,
    alignItems: 'center',
    justifyContent: 'center',
  },
  symbol: {
    fontFamily: Fonts.serif,
    fontSize: 18,
    color: Colors.ink,
    letterSpacing: -0.3,
    includeFontPadding: false,
  },
  symbolSmall: { fontSize: 13 },
  name: { fontFamily: Fonts.sansMedium, fontSize: 14.5, color: Colors.ink },
  nameCode: { fontFamily: Fonts.sans, color: Colors.muted },
  checkChip: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: Colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
