import { useState } from 'react';
import { View, Text, Pressable, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowLeft, Check, MapPin } from 'phosphor-react-native';
import { Colors, Fonts, Radius, Shadows, Type } from '../../src/constants/theme';
import { useAuth } from '../../src/context/AuthContext';
import { meApi } from '../../src/api';
import { backTo } from '../../src/lib/nav';
import { stores } from '../../src/data/stores';

const backToAccount = backTo('/(tabs)/account');

export default function StorePreferenceScreen() {
  const insets = useSafeAreaInsets();
  const { user, applyAuthResponse } = useAuth();
  const [submittingId, setSubmittingId] = useState<number | null>(null);

  const currentId = user?.preferences.defaultStoreId ?? null;

  const pick = async (id: number) => {
    if (submittingId !== null) return;
    setSubmittingId(id);
    try {
      const res = await meApi.updatePreferences({ defaultStoreId: id });
      await applyAuthResponse(res);
      backToAccount();
    } catch {
      setSubmittingId(null);
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
          <MapPin size={14} color={Colors.amber} weight="regular" />
          <Text style={styles.eyebrow}>PREFERENCES</Text>
        </View>

        <Text style={styles.hero}>
          Where do you mostly <Text style={styles.heroItalic}>shop?</Text>
        </Text>

        <View style={styles.card}>
          {stores.map((store, i) => {
            const selected = store.id === currentId;
            const busy = submittingId === store.id;
            return (
              <Pressable
                key={store.id}
                onPress={() => pick(store.id)}
                style={[styles.row, i < stores.length - 1 && styles.rowDivider]}
              >
                <View style={styles.thumb}>
                  <LinearGradient
                    colors={[Colors.tile, Colors.tileDeep]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={StyleSheet.absoluteFill}
                  />
                  <MapPin size={22} color={Colors.amber} weight="regular" />
                </View>
                <View style={{ flex: 1, minWidth: 0 }}>
                  <Text style={styles.name}>
                    {store.name} · <Text style={styles.nameCity}>{store.city}</Text>
                  </Text>
                  <Text style={styles.meta}>
                    {store.distance} · {store.hours}
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
    paddingVertical: 14,
  },
  rowDivider: { borderBottomWidth: 1, borderBottomColor: Colors.line },
  thumb: {
    width: 46,
    height: 46,
    borderRadius: 12,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.lineFaint,
  },
  name: { fontFamily: Fonts.sansMedium, fontSize: 14.5, color: Colors.ink },
  nameCity: { fontFamily: Fonts.sansSemibold },
  meta: { fontFamily: Fonts.sans, fontSize: 12, color: Colors.muted, marginTop: 3 },
  checkChip: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: Colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
