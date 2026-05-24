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
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { ArrowLeft, ArrowRight, EnvelopeSimple } from 'phosphor-react-native';
import { Colors, Fonts, Radius, Shadows, Type } from '../../src/constants/theme';
import { useAuth } from '../../src/context/AuthContext';
import { authApi } from '../../src/api';

const CODE_LENGTH = 6;

export default function VerifyEmailScreen() {
  const insets = useSafeAreaInsets();
  const { user, applyAuthResponse } = useAuth();

  const inputRef = useRef<TextInput>(null);
  const [code, setCode] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [resending, setResending] = useState(false);
  const [resendIn, setResendIn] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  // Mint a fresh code as soon as we land here -- the user came in via "Verify now",
  // any prior code is stale.
  useEffect(() => {
    void requestCode({ silent: true });
  }, []);

  // Resend cooldown countdown.
  useEffect(() => {
    if (resendIn <= 0) return;
    const t = setInterval(() => setResendIn((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(t);
  }, [resendIn]);

  const requestCode = async ({ silent }: { silent?: boolean } = {}) => {
    if (!silent) setResending(true);
    setError(null);
    try {
      const res = await authApi.sendEmailVerification();
      setResendIn(res.resendCooldownSeconds);
      if (!silent) setInfo(`New code sent to ${user?.email ?? 'your inbox'}.`);
    } catch (e: unknown) {
      const message = extractMessage(e, 'Could not send a code. Try again in a moment.');
      if (silent) {
        setError(message);
      } else {
        setError(message);
      }
    } finally {
      if (!silent) setResending(false);
    }
  };

  const onCodeChange = (next: string) => {
    const digits = next.replace(/\D/g, '').slice(0, CODE_LENGTH);
    setCode(digits);
    setError(null);
    setInfo(null);
    if (digits.length === CODE_LENGTH) void submit(digits);
  };

  const submit = async (value: string) => {
    if (submitting) return;
    setSubmitting(true);
    try {
      const res = await authApi.verifyEmail(value);
      await applyAuthResponse(res);
      router.back();
    } catch (e: unknown) {
      setError(extractMessage(e, 'That code didn’t work. Try again.'));
      setCode('');
      inputRef.current?.focus();
    } finally {
      setSubmitting(false);
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
        onPress={() => router.back()}
        style={[styles.backBtn, { top: insets.top + 12 }]}
        hitSlop={12}
      >
        <ArrowLeft size={20} color={Colors.ink} weight="regular" />
      </Pressable>

      <View style={[styles.body, { paddingTop: insets.top + 84 }]}>
        <View style={styles.eyebrowRow}>
          <EnvelopeSimple size={14} color={Colors.amber} weight="regular" />
          <Text style={styles.eyebrowText}>Verify your email</Text>
        </View>

        <Text style={styles.hero}>
          Confirm <Text style={styles.heroItalic}>your inbox.</Text>
        </Text>
        <Text style={styles.helper}>
          We sent a {CODE_LENGTH}-digit code to{' '}
          <Text style={styles.helperStrong}>{user?.email ?? 'your email'}</Text>. Enter it
          below to finish verifying.
        </Text>

        <Pressable style={styles.codeWrap} onPress={() => inputRef.current?.focus()}>
          {cells.map((digit, i) => {
            const isFocused = i === focusIndex && !submitting;
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
          ref={inputRef}
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

        {error && <Text style={styles.errorText}>{error}</Text>}
        {!error && info && <Text style={styles.infoText}>{info}</Text>}

        <View style={styles.resendRow}>
          <Text style={styles.resendLabel}>Didn&apos;t get it?</Text>
          <Pressable
            disabled={resendIn > 0 || resending}
            onPress={() => requestCode()}
            hitSlop={8}
          >
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

        <Pressable
          disabled={code.length !== CODE_LENGTH || submitting}
          onPress={() => submit(code)}
          style={[styles.submitBtn, (code.length !== CODE_LENGTH || submitting) && styles.submitBtnDisabled]}
        >
          {submitting ? (
            <ActivityIndicator color={Colors.cream} />
          ) : (
            <>
              <Text style={styles.submitText}>Verify email</Text>
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
    const data = (err as { response?: { data?: { detail?: string; message?: string } } }).response?.data;
    if (data?.detail) return data.detail;
    if (data?.message) return data.message;
  }
  if (err instanceof Error && err.message) return err.message;
  return fallback;
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.cream },
  gradientTop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 280,
  },
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
  eyebrowText: {
    ...Type.eyebrow,
    color: Colors.amber,
  },
  hero: { ...Type.hero },
  heroItalic: { fontFamily: Fonts.serifItalic },
  helper: {
    ...Type.bodyMuted,
    marginTop: 14,
    marginBottom: 28,
  },
  helperStrong: { color: Colors.ink, fontFamily: Fonts.sansMedium },

  codeWrap: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 18,
  },
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
  cellFocused: {
    borderColor: Colors.amber,
    ...Shadows.amberCta,
  },
  cellText: {
    fontFamily: Fonts.serif,
    fontSize: 32,
    lineHeight: 36,
    color: Colors.ink,
    includeFontPadding: false,
  },
  hiddenInput: {
    position: 'absolute',
    opacity: 0,
    height: 1,
    width: 1,
  },

  errorText: {
    ...Type.bodySm,
    color: Colors.danger,
    marginBottom: 6,
  },
  infoText: {
    ...Type.bodySm,
    color: Colors.muted,
    marginBottom: 6,
  },

  resendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
    marginBottom: 24,
  },
  resendLabel: { ...Type.bodySm },
  resendCta: {
    fontFamily: Fonts.sansSemibold,
    fontSize: 12,
    color: Colors.amber,
  },
  resendCtaDisabled: { color: Colors.muted },

  submitBtn: {
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
  submitText: {
    fontFamily: Fonts.sansMedium,
    fontSize: 15,
    color: Colors.cream,
  },
});
