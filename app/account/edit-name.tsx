import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { ArrowLeft, ArrowRight, UserCircle } from 'phosphor-react-native';
import { Colors, Fonts, Radius, Shadows, Type } from '../../src/constants/theme';
import { useAuth } from '../../src/context/AuthContext';
import { meApi } from '../../src/api';
import { backTo } from '../../src/lib/nav';

const backToAccount = backTo('/(tabs)/account');

export default function EditNameScreen() {
  const insets = useSafeAreaInsets();
  const { user, applyAuthResponse } = useAuth();

  const previous = user?.username ?? '';
  const [value, setValue] = useState(previous);
  const [focused, setFocused] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const trimmed = value.trim();
  const changed = trimmed.length > 0 && trimmed !== previous;
  // Names get spaces, apostrophes, hyphens, accented letters. Permissive
  // length window — we're not validating slug-style handles, we're saving
  // how the receipt and gate-greeting read.
  const valid = trimmed.length >= 2 && trimmed.length <= 60;
  const canSave = changed && valid && !submitting;

  const submit = async () => {
    if (!canSave) return;
    setError(null);
    setSubmitting(true);
    try {
      const res = await meApi.updateUsername(trimmed);
      await applyAuthResponse(res);
      backToAccount();
    } catch (e: unknown) {
      setError(extractMessage(e, 'Could not save. Try again in a moment.'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.root}
    >
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

      <View style={[styles.body, { paddingTop: insets.top + 80 }]}>
        <View style={styles.eyebrowRow}>
          <UserCircle size={14} color={Colors.amber} weight="regular" />
          <Text style={styles.eyebrow}>PERSONAL DETAILS</Text>
        </View>

        <Text style={styles.hero}>
          Update your <Text style={styles.heroItalic}>name.</Text>
        </Text>
        <Text style={styles.helper}>
          Shown on receipts and at the gate. You can change this any time.
        </Text>

        <View style={[styles.field, focused && styles.fieldFocused]}>
          <TextInput
            value={value}
            onChangeText={setValue}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            placeholder="e.g. adam"
            placeholderTextColor={Colors.muted}
            autoCapitalize="none"
            autoCorrect={false}
            style={styles.input}
            selectionColor={Colors.amber}
            autoFocus
            returnKeyType="done"
            onSubmitEditing={submit}
            maxLength={30}
          />
        </View>

        {previous.length > 0 && (
          <Text style={styles.previous}>
            previous: <Text style={styles.previousStrong}>{previous}</Text>
          </Text>
        )}

        {error && <Text style={styles.errorText}>{error}</Text>}
      </View>

      <View style={[styles.footer, { paddingBottom: insets.bottom + 16 }]}>
        <Pressable
          onPress={submit}
          disabled={!canSave}
          style={[styles.saveBtn, !canSave && styles.saveBtnDisabled]}
        >
          {submitting ? (
            <ActivityIndicator color={Colors.cream} />
          ) : (
            <>
              <Text style={styles.saveText}>Save changes</Text>
              <ArrowRight size={16} color={Colors.cream} weight="regular" />
            </>
          )}
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

function extractMessage(err: unknown, fallback: string): string {
  if (err && typeof err === 'object' && 'response' in err) {
    const data = (err as { response?: { data?: { detail?: string; message?: string } } }).response
      ?.data;
    if (data?.detail) return data.detail;
    if (data?.message) return data.message;
  }
  if (err instanceof Error && err.message) return err.message;
  return fallback;
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
  body: { flex: 1, paddingHorizontal: 26 },
  eyebrowRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  eyebrow: { ...Type.eyebrow, color: Colors.amber },
  hero: { ...Type.hero },
  heroItalic: { fontFamily: Fonts.serifItalic, color: Colors.amber },
  helper: { ...Type.bodyMuted, marginTop: 14, marginBottom: 32 },
  field: {
    backgroundColor: Colors.paper,
    borderWidth: 1,
    borderColor: Colors.line,
    borderRadius: Radius.md,
    paddingHorizontal: 16,
    paddingVertical: 12,
    ...Shadows.card,
  },
  fieldFocused: { borderColor: Colors.amber, ...Shadows.amberCta },
  input: {
    fontFamily: Fonts.sans,
    fontSize: 18,
    color: Colors.ink,
    padding: 0,
    includeFontPadding: false,
  },
  previous: {
    ...Type.bodySm,
    marginTop: 10,
  },
  previousStrong: { color: Colors.ink, fontFamily: Fonts.sansMedium },
  errorText: { ...Type.bodySm, color: Colors.danger, marginTop: 12 },

  footer: {
    paddingHorizontal: 18,
    paddingTop: 16,
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
