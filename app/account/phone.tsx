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
import { ArrowLeft, ArrowRight, Phone } from 'phosphor-react-native';
import { Colors, Fonts, Radius, Shadows, Type } from '../../src/constants/theme';
import { useAuth } from '../../src/context/AuthContext';
import { meApi } from '../../src/api';
import { backTo } from '../../src/lib/nav';
import { CountryPickerSheet } from '../../src/components/CountryPickerSheet';
import { DEFAULT_COUNTRY, type Country } from '../../src/data/countries';

const backToAccount = backTo('/(tabs)/account');

const CODE_LENGTH = 6;

export default function PhoneScreen() {
  const insets = useSafeAreaInsets();
  const { user, applyAuthResponse } = useAuth();
  const codeInputRef = useRef<TextInput>(null);

  const [step, setStep] = useState<'number' | 'verify'>('number');

  // Step A — enter number
  const [country, setCountry] = useState<Country>(DEFAULT_COUNTRY);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [local, setLocal] = useState('');
  const [sending, setSending] = useState(false);
  const dialCode = country.dialCode;

  // Step B — verify code
  const [code, setCode] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [resendIn, setResendIn] = useState(0);

  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  const fullPhone = `${dialCode}${local.replace(/^0+/, '')}`;
  const phoneValid = /^\+?[0-9]{8,15}$/.test(fullPhone);

  useEffect(() => {
    if (step !== 'verify') return;
    if (resendIn <= 0) return;
    const t = setInterval(() => setResendIn((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(t);
  }, [step, resendIn]);

  const sendCode = async ({ silent }: { silent?: boolean } = {}) => {
    if (!phoneValid) return;
    if (!silent) setSending(true);
    setError(null);
    try {
      const res = await meApi.requestPhoneCode(fullPhone);
      setResendIn(res.resendCooldownSeconds);
      setStep('verify');
      if (!silent) setInfo(`Code sent to ${fullPhone}.`);
      setTimeout(() => codeInputRef.current?.focus(), 60);
    } catch (e: unknown) {
      setError(extractMessage(e, 'Could not send a code. Try again in a moment.'));
    } finally {
      if (!silent) setSending(false);
    }
  };

  const onCodeChange = (next: string) => {
    const digits = next.replace(/\D/g, '').slice(0, CODE_LENGTH);
    setCode(digits);
    setError(null);
    setInfo(null);
    if (digits.length === CODE_LENGTH) void verify(digits);
  };

  const verify = async (value: string) => {
    if (verifying) return;
    setVerifying(true);
    try {
      const res = await meApi.verifyPhone(fullPhone, value);
      await applyAuthResponse(res);
      backToAccount();
    } catch (e: unknown) {
      setError(extractMessage(e, 'That code didn’t work. Try again.'));
      setCode('');
      codeInputRef.current?.focus();
    } finally {
      setVerifying(false);
    }
  };

  // ── Renders ────────────────────────────────────────────────────────
  if (step === 'verify') {
    const cells = Array.from({ length: CODE_LENGTH }, (_, i) => code[i] ?? '');
    const focusIndex = Math.min(code.length, CODE_LENGTH - 1);

    return (
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.root}
      >
        <Backdrop />

        <Pressable
          onPress={() => setStep('number')}
          style={[styles.backBtn, { top: insets.top + 12 }]}
          hitSlop={10}
        >
          <ArrowLeft size={18} color={Colors.ink} weight="regular" />
        </Pressable>

        <View style={[styles.body, { paddingTop: insets.top + 80 }]}>
          <View style={styles.eyebrowRow}>
            <Phone size={14} color={Colors.amber} weight="regular" />
            <Text style={styles.eyebrow}>STEP 2 · CONFIRM</Text>
          </View>

          <Text style={styles.hero}>
            Check your <Text style={styles.heroItalic}>texts.</Text>
          </Text>
          <Text style={styles.helper}>
            We sent a {CODE_LENGTH}-digit code to{' '}
            <Text style={styles.helperStrong}>{fullPhone}</Text>.
          </Text>
          <Pressable onPress={() => setStep('number')} hitSlop={6}>
            <Text style={styles.editLink}>Wrong number? Edit</Text>
          </Pressable>

          <Pressable style={styles.codeWrap} onPress={() => codeInputRef.current?.focus()}>
            {cells.map((digit, i) => {
              const isFocused = i === focusIndex && !verifying;
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
            editable={!verifying}
          />

          {error && <Text style={styles.errorText}>{error}</Text>}
          {!error && info && <Text style={styles.infoText}>{info}</Text>}

          <View style={styles.resendRow}>
            <Text style={styles.resendLabel}>Didn&apos;t get it?</Text>
            <Pressable
              disabled={resendIn > 0 || sending}
              onPress={() => sendCode()}
              hitSlop={8}
            >
              <Text
                style={[
                  styles.resendCta,
                  (resendIn > 0 || sending) && styles.resendCtaDisabled,
                ]}
              >
                {resendIn > 0 ? `Resend in ${resendIn}s` : sending ? 'Sending…' : 'Resend code'}
              </Text>
            </Pressable>
          </View>
        </View>

        <View style={[styles.footer, { paddingBottom: insets.bottom + 16 }]}>
          <Pressable
            disabled={code.length !== CODE_LENGTH || verifying}
            onPress={() => verify(code)}
            style={[
              styles.primaryBtn,
              (code.length !== CODE_LENGTH || verifying) && styles.primaryBtnDisabled,
            ]}
          >
            {verifying ? (
              <ActivityIndicator color={Colors.cream} />
            ) : (
              <>
                <Text style={styles.primaryBtnText}>Verify</Text>
                <ArrowRight size={16} color={Colors.cream} weight="regular" />
              </>
            )}
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    );
  }

  // ── Step A — enter number ──────────────────────────────────────────
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.root}
    >
      <Backdrop />

      <Pressable
        onPress={backToAccount}
        style={[styles.backBtn, { top: insets.top + 12 }]}
        hitSlop={10}
      >
        <ArrowLeft size={18} color={Colors.ink} weight="regular" />
      </Pressable>

      <View style={[styles.body, { paddingTop: insets.top + 80 }]}>
        <View style={styles.eyebrowRow}>
          <Phone size={14} color={Colors.amber} weight="regular" />
          <Text style={styles.eyebrow}>PERSONAL DETAILS</Text>
        </View>

        <Text style={styles.hero}>
          What&apos;s your <Text style={styles.heroItalic}>number?</Text>
        </Text>
        <Text style={styles.helper}>We&apos;ll text you a six-digit code to confirm.</Text>

        <View style={styles.phoneRow}>
          <Pressable
            style={styles.dialChip}
            onPress={() => setPickerOpen(true)}
            hitSlop={6}
          >
            <Text style={styles.flag}>{country.flag}</Text>
            <Text style={styles.dialText}>{dialCode}</Text>
            <Text style={styles.dialCaret}>▾</Text>
          </Pressable>
          <View style={styles.numberField}>
            <TextInput
              value={local}
              onChangeText={(v) => setLocal(v.replace(/\D/g, ''))}
              placeholder="6 12 34 56 78"
              placeholderTextColor={Colors.muted}
              keyboardType="phone-pad"
              style={styles.numberInput}
              selectionColor={Colors.amber}
              autoFocus
              maxLength={12}
            />
          </View>
        </View>

        {user?.phone && (
          <Text style={styles.previous}>
            current: <Text style={styles.previousStrong}>{user.phone}</Text>
          </Text>
        )}

        {error && <Text style={styles.errorText}>{error}</Text>}
      </View>

      <View style={[styles.footer, { paddingBottom: insets.bottom + 16 }]}>
        <Pressable
          disabled={!phoneValid || sending}
          onPress={() => sendCode()}
          style={[
            styles.primaryBtn,
            (!phoneValid || sending) && styles.primaryBtnDisabled,
          ]}
        >
          {sending ? (
            <ActivityIndicator color={Colors.cream} />
          ) : (
            <>
              <Text style={styles.primaryBtnText}>Send code</Text>
              <ArrowRight size={16} color={Colors.cream} weight="regular" />
            </>
          )}
        </Pressable>
      </View>

      <CountryPickerSheet
        visible={pickerOpen}
        onClose={() => setPickerOpen(false)}
        selectedCode={country.code}
        onPick={setCountry}
      />
    </KeyboardAvoidingView>
  );
}

function Backdrop() {
  return (
    <LinearGradient
      colors={['rgba(200,122,58,0.10)', 'transparent']}
      style={styles.bgWash}
      start={{ x: 0.5, y: 0 }}
      end={{ x: 0.5, y: 0.5 }}
    />
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
  helper: { ...Type.bodyMuted, marginTop: 14 },
  helperStrong: { color: Colors.ink, fontFamily: Fonts.sansMedium },
  editLink: {
    fontFamily: Fonts.sansMedium,
    fontSize: 12.5,
    color: Colors.amber,
    marginTop: 6,
    marginBottom: 22,
  },

  phoneRow: { flexDirection: 'row', gap: 8, marginTop: 22 },
  dialChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    backgroundColor: Colors.paper,
    borderWidth: 1,
    borderColor: Colors.line,
    borderRadius: Radius.md,
    paddingHorizontal: 12,
    paddingVertical: 12,
    ...Shadows.card,
  },
  flag: { fontSize: 20, includeFontPadding: false },
  dialText: {
    fontFamily: Fonts.sansSemibold,
    fontSize: 16,
    color: Colors.ink,
    letterSpacing: 0.2,
  },
  dialCaret: {
    fontSize: 11,
    color: Colors.muted,
    marginLeft: -2,
  },
  numberField: {
    flex: 1,
    backgroundColor: Colors.paper,
    borderWidth: 1,
    borderColor: Colors.line,
    borderRadius: Radius.md,
    paddingHorizontal: 16,
    paddingVertical: 12,
    ...Shadows.card,
  },
  numberInput: {
    fontFamily: Fonts.sans,
    fontSize: 18,
    color: Colors.ink,
    padding: 0,
    letterSpacing: 1.5,
    includeFontPadding: false,
  },
  previous: { ...Type.bodySm, marginTop: 14 },
  previousStrong: { color: Colors.ink, fontFamily: Fonts.sansMedium },

  codeWrap: { flexDirection: 'row', gap: 10, marginTop: 28, marginBottom: 18 },
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
    fontSize: 32,
    lineHeight: 36,
    color: Colors.ink,
    includeFontPadding: false,
  },
  hiddenInput: { position: 'absolute', opacity: 0, height: 1, width: 1 },

  errorText: { ...Type.bodySm, color: Colors.danger, marginTop: 6 },
  infoText: { ...Type.bodySm, color: Colors.muted, marginTop: 6 },

  resendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 6,
    marginBottom: 24,
  },
  resendLabel: { ...Type.bodySm },
  resendCta: { fontFamily: Fonts.sansSemibold, fontSize: 12, color: Colors.amber },
  resendCtaDisabled: { color: Colors.muted },

  footer: { paddingHorizontal: 18, paddingTop: 16 },
  primaryBtn: {
    height: 56,
    borderRadius: Radius.lg,
    backgroundColor: Colors.ink,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    ...Shadows.cta,
  },
  primaryBtnDisabled: { opacity: 0.5 },
  primaryBtnText: { fontFamily: Fonts.sansMedium, fontSize: 15, color: Colors.cream },
});
