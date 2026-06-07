import { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import {
  ArrowLeft,
  ArrowRight,
  Eye,
  EyeSlash,
  Key,
} from 'phosphor-react-native';
import { Colors, Fonts, Radius, Shadows, Type } from '../../src/constants/theme';
import { authApi } from '../../src/api';
import { useAuth } from '../../src/context/AuthContext';

const CODE_LENGTH = 6;
const MIN_PASSWORD = 8;

export default function ResetPasswordScreen() {
  const insets = useSafeAreaInsets();
  const { applyAuthResponse } = useAuth();
  const params = useLocalSearchParams<{ email?: string }>();
  const email = (params.email ?? '').trim();

  const codeInputRef = useRef<TextInput>(null);

  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [focusedField, setFocusedField] = useState<'password' | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [resending, setResending] = useState(false);
  const [resendIn, setResendIn] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  // Resend cooldown countdown
  useEffect(() => {
    if (resendIn <= 0) return;
    const t = setInterval(() => setResendIn((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(t);
  }, [resendIn]);

  const codeComplete = code.length === CODE_LENGTH;
  const passwordValid = password.length >= MIN_PASSWORD;
  const canSubmit = codeComplete && passwordValid && !submitting;

  const onCodeChange = (next: string) => {
    const digits = next.replace(/\D/g, '').slice(0, CODE_LENGTH);
    setCode(digits);
    setError(null);
    setInfo(null);
  };

  const submit = async () => {
    if (!canSubmit) return;
    setError(null);
    setSubmitting(true);
    try {
      const res = await authApi.confirmPasswordReset({
        email,
        code,
        newPassword: password,
      });
      await applyAuthResponse(res);
      // Land on home, freshly authed.
      router.replace('/(tabs)/home');
    } catch (e: unknown) {
      setError(extractMessage(e, 'That code or password didn’t work. Try again.'));
      setCode('');
      setTimeout(() => codeInputRef.current?.focus(), 50);
    } finally {
      setSubmitting(false);
    }
  };

  const resend = async () => {
    if (resendIn > 0 || resending || !email) return;
    setResending(true);
    setError(null);
    try {
      const res = await authApi.requestPasswordReset(email);
      setResendIn(res.resendCooldownSeconds);
      setInfo(`New code sent to ${email}.`);
    } catch (e: unknown) {
      setError(extractMessage(e, 'Could not send a new code. Try again in a moment.'));
    } finally {
      setResending(false);
    }
  };

  const cells = Array.from({ length: CODE_LENGTH }, (_, i) => code[i] ?? '');
  const focusIndex = Math.min(code.length, CODE_LENGTH - 1);

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
        onPress={() => router.replace('/auth/forgot-password')}
        style={[styles.backBtn, { top: insets.top + 12 }]}
        hitSlop={12}
      >
        <ArrowLeft size={20} color={Colors.ink} weight="regular" />
      </Pressable>

      <ScrollView
        contentContainerStyle={[styles.body, { paddingTop: insets.top + 84, paddingBottom: 60 }]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.eyebrowRow}>
          <Key size={14} color={Colors.amber} weight="regular" />
          <Text style={styles.eyebrowText}>Reset password</Text>
        </View>

        <Text style={styles.hero}>
          Pick a <Text style={styles.heroItalic}>new one.</Text>
        </Text>
        <Text style={styles.helper}>
          Drop in the {CODE_LENGTH}-digit code we sent
          {email ? <> to <Text style={styles.helperStrong}>{email}</Text></> : <> to your inbox</>},
          then choose a new password.
        </Text>

        <Pressable style={styles.codeWrap} onPress={() => codeInputRef.current?.focus()}>
          {cells.map((digit, i) => {
            const isFocused = i === focusIndex && !submitting && !codeComplete;
            return (
              <View
                key={i}
                style={[
                  styles.cell,
                  digit && styles.cellFilled,
                  isFocused && styles.cellFocused,
                ]}
              >
                <Text style={styles.cellText}>{digit}</Text>
              </View>
            );
          })}
        </Pressable>

        <TextInput
          ref={codeInputRef}
          value={code}
          onChangeText={onCodeChange}
          keyboardType="number-pad"
          autoFocus
          maxLength={CODE_LENGTH}
          textContentType="oneTimeCode"
          autoComplete="sms-otp"
          style={styles.hiddenInput}
          editable={!submitting}
        />

        <View style={styles.resendRow}>
          <Text style={styles.resendLabel}>Didn&apos;t get it?</Text>
          <Pressable disabled={resendIn > 0 || resending} onPress={resend} hitSlop={8}>
            <Text
              style={[
                styles.resendCta,
                (resendIn > 0 || resending) && styles.resendCtaDisabled,
              ]}
            >
              {resendIn > 0 ? `Resend in ${resendIn}s` : resending ? 'Sending…' : 'Resend code'}
            </Text>
          </Pressable>
        </View>

        <Text style={styles.fieldLabel}>NEW PASSWORD</Text>
        <View style={[styles.field, focusedField === 'password' && styles.fieldFocused]}>
          <TextInput
            value={password}
            onChangeText={(v) => {
              setPassword(v);
              setError(null);
              setInfo(null);
            }}
            onFocus={() => setFocusedField('password')}
            onBlur={() => setFocusedField(null)}
            placeholder={`At least ${MIN_PASSWORD} characters`}
            placeholderTextColor={Colors.muted}
            secureTextEntry={!showPassword}
            autoCapitalize="none"
            autoCorrect={false}
            style={styles.input}
            selectionColor={Colors.amber}
            returnKeyType="done"
            onSubmitEditing={submit}
          />
          <Pressable
            onPress={() => setShowPassword((s) => !s)}
            style={styles.eyeBtn}
            hitSlop={8}
          >
            {showPassword ? (
              <EyeSlash size={18} color={Colors.muted} weight="regular" />
            ) : (
              <Eye size={18} color={Colors.muted} weight="regular" />
            )}
          </Pressable>
        </View>

        {error && <Text style={styles.errorText}>{error}</Text>}
        {!error && info && <Text style={styles.infoText}>{info}</Text>}

        <Pressable
          disabled={!canSubmit}
          onPress={submit}
          style={[styles.submitBtn, !canSubmit && styles.submitBtnDisabled]}
        >
          {submitting ? (
            <ActivityIndicator color={Colors.cream} />
          ) : (
            <>
              <Text style={styles.submitText}>Set new password</Text>
              <ArrowRight size={16} color={Colors.cream} weight="regular" />
            </>
          )}
        </Pressable>

        <Text style={styles.footnote}>
          After you reset, every other signed-in device will be kicked out.
          You stay logged in here.
        </Text>
      </ScrollView>
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
  body: { paddingHorizontal: 26 },
  eyebrowRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  eyebrowText: { ...Type.eyebrow, color: Colors.amber },
  hero: { ...Type.hero },
  heroItalic: { fontFamily: Fonts.serifItalic, color: Colors.amber },
  helper: { ...Type.bodyMuted, marginTop: 14, marginBottom: 28 },
  helperStrong: { color: Colors.ink, fontFamily: Fonts.sansMedium },

  codeWrap: { flexDirection: 'row', gap: 10, marginBottom: 8 },
  cell: {
    flex: 1,
    aspectRatio: 1,
    backgroundColor: Colors.paper,
    borderWidth: 1,
    borderColor: Colors.line,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cellFilled: { borderColor: Colors.ink },
  cellFocused: { borderColor: Colors.amber, ...Shadows.amberCta },
  cellText: {
    fontFamily: Fonts.serif,
    fontSize: 30,
    lineHeight: 34,
    color: Colors.ink,
    includeFontPadding: false,
  },
  hiddenInput: { position: 'absolute', opacity: 0, height: 1, width: 1 },

  resendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
    marginBottom: 22,
  },
  resendLabel: { ...Type.bodySm },
  resendCta: { fontFamily: Fonts.sansSemibold, fontSize: 12, color: Colors.amber },
  resendCtaDisabled: { color: Colors.muted },

  fieldLabel: {
    ...Type.eyebrow,
    color: Colors.muted,
    marginBottom: 8,
  },
  field: {
    flexDirection: 'row',
    alignItems: 'center',
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
    flex: 1,
    fontFamily: Fonts.sans,
    fontSize: 17,
    color: Colors.ink,
    padding: 0,
    includeFontPadding: false,
  },
  eyeBtn: { paddingLeft: 8 },

  errorText: { ...Type.bodySm, color: Colors.danger, marginTop: 12 },
  infoText: { ...Type.bodySm, color: Colors.muted, marginTop: 12 },

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
