import { useCallback, useMemo, useState } from 'react';
import {
  View,
  Text,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import {
  ArrowLeft,
  ArrowRight,
  Bell,
  Lock,
  ShoppingCart,
  TrendUp,
  Envelope,
  Notebook,
} from 'phosphor-react-native';
import { Colors, Fonts, Radius, Shadows, Type } from '../../src/constants/theme';
import { useAuth } from '../../src/context/AuthContext';
import { meApi } from '../../src/api';
import { backTo } from '../../src/lib/nav';
import { NOTIFICATION_CATEGORIES, withDefaults } from '../../src/data/notifications';

const backToAccount = backTo('/(tabs)/account');

// Icon per category — looked up by category key in render. Phosphor names
// chosen for the design's intent (notebook for saved-list, trend-up for
// price drops, cart for session updates, envelope for receipts).
const CATEGORY_ICONS: Record<string, React.ComponentType<{ size: number; color: string; weight?: 'regular' | 'bold' }>> = {
  saved_list_reminders: Notebook,
  price_drops: TrendUp,
  session_updates: ShoppingCart,
  receipts: Envelope,
};

export default function NotificationsPreferenceScreen() {
  const insets = useSafeAreaInsets();
  const { user, applyAuthResponse } = useAuth();

  const initial = useMemo(
    () => withDefaults(user?.preferences.notificationPrefs ?? {}),
    [user?.preferences.notificationPrefs],
  );
  const [draft, setDraft] = useState<Record<string, boolean>>(initial);
  const [saving, setSaving] = useState(false);

  const dirty = useMemo(() => {
    return NOTIFICATION_CATEGORIES.some(
      (c) => !c.locked && draft[c.key] !== initial[c.key],
    );
  }, [draft, initial]);

  const toggle = useCallback((key: string) => {
    setDraft((d) => ({ ...d, [key]: !d[key] }));
  }, []);

  const save = async () => {
    if (!dirty || saving) return;
    setSaving(true);
    try {
      const res = await meApi.updatePreferences({ notificationPrefs: draft });
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
          <Bell size={14} color={Colors.amber} weight="regular" />
          <Text style={styles.eyebrow}>PREFERENCES</Text>
        </View>

        <Text style={styles.hero}>
          What should we <Text style={styles.heroItalic}>ping you for?</Text>
        </Text>
        <Text style={styles.helper}>
          We never send promotional spam. Each category opts in independently.
        </Text>

        <View style={styles.card}>
          {NOTIFICATION_CATEGORIES.map((cat, i) => {
            const Icon = CATEGORY_ICONS[cat.key] ?? Bell;
            const on = !!draft[cat.key];
            return (
              <View
                key={cat.key}
                style={[
                  styles.row,
                  i < NOTIFICATION_CATEGORIES.length - 1 && styles.rowDivider,
                ]}
              >
                <View style={styles.iconChip}>
                  <Icon size={16} color={Colors.amber} weight="regular" />
                </View>
                <View style={{ flex: 1, minWidth: 0, paddingRight: 8 }}>
                  <Text style={styles.name}>{cat.name}</Text>
                  <Text style={styles.helperRow}>{cat.helper}</Text>
                </View>
                <Switch
                  value={on}
                  onValueChange={() => toggle(cat.key)}
                  disabled={cat.locked}
                  trackColor={{ false: Colors.line, true: Colors.accent }}
                  thumbColor="#ffffff"
                  ios_backgroundColor={Colors.line}
                />
              </View>
            );
          })}
        </View>

        <View style={styles.footnote}>
          <Lock size={11} color={Colors.muted} weight="regular" />
          <Text style={styles.footnoteText}>
            Locked categories help us meet our service obligations.
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
  helper: { ...Type.bodyMuted, marginTop: 14, marginBottom: 22 },

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
  iconChip: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: 'rgba(200,122,58,0.10)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  name: {
    fontFamily: Fonts.sansMedium,
    fontSize: 14.5,
    color: Colors.ink,
  },
  helperRow: {
    fontFamily: Fonts.sans,
    fontSize: 12,
    lineHeight: 17,
    color: Colors.muted,
    marginTop: 3,
  },

  footnote: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    marginTop: 14,
  },
  footnoteText: {
    fontFamily: Fonts.sans,
    fontSize: 11.5,
    color: Colors.muted,
    lineHeight: 17,
  },

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
