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
import { ArrowLeft, ArrowRight, EnvelopeSimple } from 'phosphor-react-native';
import { Colors, Fonts, Radius, Shadows, Type } from '../../src/constants/theme';
import { authApi } from '../../src/api';

export default function ForgotPasswordScreen() {
  const insets = useSafeAreaInsets();

  const [email, setEmail] = useState('');
  const [focused, setFocused] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const trimmed = email.trim();
  const valid = trimmed.includes('@') && trimmed.length >= 5;
  const canSubmit = valid && !submitting;

  const submit = async () => {
    if (!canSubmit) return;
    setError(null);
    setSubmitting(true);
    try {
      await authApi.requestPasswordReset(trimmed);
      // Non-revealing: we always advance, regardless of whether the email exists.
      router.replace({
        pathname: '/auth/reset-password',
        params: { email: trimmed },
      });
    } catch (e: unknown) {
      setError(extractMessage(e, 'Could not send a code. Try again in a moment.'));
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
        style={styles.gradientTop}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 0.5 }}
      />

      <Pressable
        onPress={() => router.back()}
        style={[styles.backBtn, { top: insets.top + 12 }]}
        hitSlop={12}
      >
        <ArrowLeft size={20} color={Colors.ink} weight="regular" />
      </Pressable>

      <View style={[styles.body, { paddingTop: insets.top + 84 }]}>
        <View style={styles.eyebrowRow}>
          <EnvelopeSimple size={14} color={Colors.amber} weight="regular" />
          <Text style={styles.eyebrowText}>Forgot your password</Text>
        </View>

        <Text style={styles.hero}>
          No <Text style={styles.heroItalic}>worries.</Text>
        </Text>
        <Text style={styles.helper}>
          Pop in the email you signed up with — we&apos;ll send a 6-digit code
          you can use to set a new password.
        </Text>

        <View style={[styles.field, focused && styles.fieldFocused]}>
          <TextInput
            value={email}
            onChangeText={setEmail}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            placeholder="you@example.com"
            placeholderTextColor={Colors.muted}
            autoCapitalize="none"
            autoCorrect={false}
            autoComplete="email"
            textContentType="emailAddress"
            keyboardType="email-address"
            style={styles.input}
            selectionColor={Colors.amber}
            autoFocus
            returnKeyType="send"
            onSubmitEditing={submit}
          />
        </View>

        {error && <Text style={styles.errorText}>{error}</Text>}

        <Pressable
          onPress={submit}
          disabled={!canSubmit}
          style={[styles.submitBtn, !canSubmit && styles.submitBtnDisabled]}
        >
          {submitting ? (
            <ActivityIndicator color={Colors.cream} />
          ) : (
            <>
              <Text style={styles.submitText}>Send reset code</Text>
              <ArrowRight size={16} color={Colors.cream} weight="regular" />
            </>
          )}
        </Pressable>

        <Text style={styles.footnote}>
          If the email isn&apos;t on file, you won&apos;t hear back — that&apos;s
          on purpose. We don&apos;t leak which addresses are registered.
        </Text>
      </View>
    </KeyboardAvoidingView>
  );
}

function extractMessage(err: unknown, fallback: string): string {
  if (err && typeof err === 'object' && 'response' in err) {
    const data = (err as { response?: { data?: { detail?: string; message?: string } } }).response?.data;
    if (data?.detail) return data.detail;
    if (data?.message) return data.message;
  }
  if (err instanceof Error && err.message) return err.message;
  return fallback;
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.cream },
  gradientTop: { position: 'absolute', top: 0, left: 0, right: 0, height: 280 },
  backBtn: {
    position: 'absolute',
    left: 18,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.paper,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.line,
    zIndex: 10,
  },
  body: { flex: 1, paddingHorizontal: 26 },
  eyebrowRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  eyebrowText: { ...Type.eyebrow, color: Colors.amber },
  hero: { ...Type.hero },
  heroItalic: { fontFamily: Fonts.serifItalic, color: Colors.amber },
  helper: { ...Type.bodyMuted, marginTop: 14, marginBottom: 28 },
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
    fontSize: 17,
    color: Colors.ink,
    padding: 0,
    includeFontPadding: false,
  },
  errorText: { ...Type.bodySm, color: Colors.danger, marginTop: 12 },
  submitBtn: {
    marginTop: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: Colors.ink,
    paddingVertical: 16,
    borderRadius: Radius.lg,
    ...Shadows.cta,
  },
  submitBtnDisabled: { opacity: 0.5 },
  submitText: { fontFamily: Fonts.sansMedium, fontSize: 15, color: Colors.cream },
  footnote: {
    ...Type.bodySm,
    color: Colors.muted,
    marginTop: 20,
    lineHeight: 19,
  },
});
