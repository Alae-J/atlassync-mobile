import { useCallback, useMemo, useState } from 'react';
import {
  View,
  Text,
  Pressable,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowLeft, ArrowRight, Warning } from 'phosphor-react-native';
import { Colors, Fonts, Radius, Shadows, Type } from '../../src/constants/theme';
import { useAuth } from '../../src/context/AuthContext';
import { meApi } from '../../src/api';
import { backTo } from '../../src/lib/nav';
import { ALLERGEN_TAGS } from '../../src/data/allergens';

const backToAccount = backTo('/(tabs)/account?tab=preferences');

export default function AllergensPreferenceScreen() {
  const insets = useSafeAreaInsets();
  const { user, applyAuthResponse } = useAuth();

  const initial = useMemo(
    () => user?.preferences.allergens ?? [],
    [user?.preferences.allergens],
  );
  const [flagged, setFlagged] = useState<string[]>(initial);
  const [saving, setSaving] = useState(false);

  const dirty = useMemo(() => {
    if (flagged.length !== initial.length) return true;
    return flagged.some((t) => !initial.includes(t));
  }, [flagged, initial]);

  const toggle = useCallback((tag: string) => {
    setFlagged((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag],
    );
  }, []);

  const save = async () => {
    if (!dirty || saving) return;
    setSaving(true);
    try {
      const res = await meApi.updatePreferences({ allergens: flagged });
      await applyAuthResponse(res);
      backToAccount();
    } finally {
      setSaving(false);
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
        contentContainerStyle={[
          styles.body,
          { paddingTop: insets.top + 80, paddingBottom: 140 + insets.bottom },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.eyebrowRow}>
          <Warning size={14} color={Colors.amber} weight="regular" />
          <Text style={styles.eyebrow}>DIET · FLAGGED ALLERGENS</Text>
        </View>

        <Text style={styles.hero}>
          Anything you can&apos;t <Text style={styles.heroItalic}>touch?</Text>
        </Text>
        <Text style={styles.helper}>
          Items containing any of these get a red banner on Product Detail and
          lock the scan peek until you confirm.
        </Text>

        <View style={styles.cloud}>
          {ALLERGEN_TAGS.map((tag) => {
            const on = flagged.includes(tag);
            return (
              <Pressable
                key={tag}
                onPress={() => toggle(tag)}
                style={[styles.chip, on ? styles.chipOn : styles.chipOff]}
              >
                {on && <Warning size={11} color={Colors.danger} weight="regular" />}
                <Text style={[styles.chipText, on ? styles.chipTextOn : styles.chipTextOff]}>
                  {tag}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <View style={styles.footnote}>
          <View style={styles.footnoteDot} />
          <Text style={styles.footnoteText}>
            {flagged.length} flagged · tap to toggle
          </Text>
        </View>
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + 16 }]}>
        <Pressable
          onPress={save}
          disabled={!dirty || saving}
          style={[styles.saveBtn, (!dirty || saving) && styles.saveBtnDisabled]}
        >
          {saving ? (
            <ActivityIndicator color={Colors.cream} />
          ) : (
            <>
              <Text style={styles.saveText}>Save preferences</Text>
              <ArrowRight size={16} color={Colors.cream} weight="regular" />
            </>
          )}
        </Pressable>
      </View>
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
  body: { paddingHorizontal: 26 },
  eyebrowRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  eyebrow: { ...Type.eyebrow, color: Colors.amber },
  hero: { ...Type.hero },
  heroItalic: { fontFamily: Fonts.serifItalic, color: Colors.amber },
  helper: { ...Type.bodyMuted, marginTop: 14, marginBottom: 24 },

  cloud: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 13,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
  },
  chipOn: {
    backgroundColor: Colors.dangerWash,
    borderColor: Colors.dangerWashBorder,
  },
  chipOff: { backgroundColor: 'transparent', borderColor: Colors.line },
  chipText: { fontFamily: Fonts.sansMedium, fontSize: 12.5 },
  chipTextOn: { color: Colors.danger },
  chipTextOff: { color: Colors.muted },

  footnote: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    marginTop: 18,
  },
  footnoteDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: Colors.danger },
  footnoteText: { fontFamily: Fonts.sans, fontSize: 11.5, color: Colors.muted },

  footer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 18,
    paddingTop: 16,
    backgroundColor: Colors.cream,
  },
  saveBtn: {
    height: 56,
    borderRadius: Radius.lg,
    backgroundColor: Colors.ink,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    ...Shadows.cta,
  },
  saveBtnDisabled: { opacity: 0.5 },
  saveText: { fontFamily: Fonts.sansMedium, fontSize: 15, color: Colors.cream },
});
