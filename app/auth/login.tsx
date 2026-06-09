import { useEffect, useRef, useState } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet, KeyboardAvoidingView, Platform, NativeSyntheticEvent, TextInputKeyPressEventData } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { router } from 'expo-router';
import {
  ArrowLeft,
  ArrowRight,
  CaretDown,
  Check,
  Eye,
  EyeSlash,
  Lock,
  Question,
  WifiHigh,
} from 'phosphor-react-native';
import { Colors, Fonts, Radius, Shadows, Type } from '../../src/constants/theme';
import { useAuth } from '../../src/context/AuthContext';

type Mode = 'phone' | 'email';
type Step = 'input' | 'otp' | 'success';

const formatPhone = (raw: string) => {
  const d = raw.replace(/\D/g, '').slice(0, 10);
  if (d.length < 4) return d;
  if (d.length < 7) return `${d.slice(0, 3)} ${d.slice(3)}`;
  return `${d.slice(0, 3)} ${d.slice(3, 6)} ${d.slice(6)}`;
};

export default function LoginScreen() {
  const insets = useSafeAreaInsets();
  const { login } = useAuth();

  const [mode, setMode] = useState<Mode>('email');
  const [step, setStep] = useState<Step>('input');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [focused, setFocused] = useState<'phone' | 'email' | 'password' | null>(null);
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const otpRefs = useRef<(TextInput | null)[]>([]);

  // Slow vertical float for the bank card peek — matches the design's 6s ease.
  const cardFloat = useSharedValue(0);
  useEffect(() => {
    cardFloat.value = withRepeat(
      withTiming(-8, { duration: 3000, easing: Easing.inOut(Easing.ease) }),
      -1,
      true,
    );
  }, [cardFloat]);
  const bankCardStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: '6deg' }, { translateY: cardFloat.value }],
  }));

  const phoneValid = phone.replace(/\D/g, '').length >= 8;
  const emailValid = email.includes('@') && password.length >= 4;
  const canSubmit = mode === 'phone' ? phoneValid : emailValid;

  const submit = async () => {
    if (!canSubmit || loading) return;
    setError(null);
    setLoading(true);
    try {
      if (mode === 'phone') {
        // Phone+OTP backend not implemented yet — see backend issue #1.
        await new Promise((r) => setTimeout(r, 600));
        setStep('otp');
        setTimeout(() => otpRefs.current[0]?.focus(), 80);
      } else {
        await login(email.trim(), password);
        setStep('success');
      }
    } catch (e: unknown) {
      const message =
        e && typeof e === 'object' && 'response' in e
          ? ((e as { response?: { data?: { message?: string } } }).response?.data?.message ??
              'Sign in failed. Check your credentials.')
          : 'Network error. Try again.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const onOtpChange = (i: number, val: string) => {
    const d = val.replace(/\D/g, '').slice(-1);
    const next = [...otp];
    next[i] = d;
    setOtp(next);
    if (d && i < 5) otpRefs.current[i + 1]?.focus();
    if (next.every((x) => x !== '') && i === 5) {
      setLoading(true);
      setTimeout(() => {
        setLoading(false);
        setStep('success');
      }, 800);
    }
  };

  const onOtpKey = (i: number, e: NativeSyntheticEvent<TextInputKeyPressEventData>) => {
    if (e.nativeEvent.key === 'Backspace' && !otp[i] && i > 0) {
      otpRefs.current[i - 1]?.focus();
    }
  };

  const switchMode = (next: Mode) => {
    if (next === mode) return;
    setMode(next);
    setStep('input');
    setOtp(['', '', '', '', '', '']);
  };

  const goBack = () => {
    setStep('input');
    setOtp(['', '', '', '', '', '']);
  };

  useEffect(() => {
    if (step !== 'success') return;
    const t = setTimeout(() => router.replace('/(tabs)/home'), 1100);
    return () => clearTimeout(t);
  }, [step]);

  return (
    <View style={styles.root}>
      <LinearGradient
        colors={['rgba(200,122,58,0.10)', 'transparent']}
        style={[styles.gradientTop]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 0.5 }}
      />
      <LinearGradient
        colors={['transparent', 'rgba(45,90,61,0.08)']}
        style={styles.gradientBottom}
        start={{ x: 0.4, y: 0.4 }}
        end={{ x: 1, y: 1 }}
      />

      <View style={[styles.topRow, { paddingTop: insets.top + 10 }]}>
        {step === 'otp' ? (
          <Pressable onPress={goBack} style={styles.backChip} hitSlop={8}>
            <ArrowLeft size={16} color={Colors.ink} weight="bold" />
          </Pressable>
        ) : (
          <View style={styles.brandLockup}>
            <View style={styles.monoTile}>
              <Text style={styles.monoLetter}>P</Text>
            </View>
            <Text style={styles.wordmark}>PHYGITAL</Text>
          </View>
        )}
        <Pressable style={styles.helpPill} hitSlop={8} onPress={() => {}}>
          <Question size={13} color={Colors.muted} weight="regular" />
          <Text style={styles.helpLabel}>Help</Text>
        </Pressable>
      </View>

      <View style={styles.heroWrap}>
        <Text style={styles.heroLine}>Shop</Text>
        <Text style={[styles.heroLine, styles.heroItalic]}>without</Text>
        <Text style={styles.heroLine}>waiting.</Text>
      </View>

      {step === 'input' && (
        <View
          style={[styles.bankCardLayer, { top: insets.top + 80 }]}
          pointerEvents="none"
        >
          {/* Ghost card behind for stacked depth */}
          <View style={styles.ghostCard} />

          {/* Main bank card — floating, rotated */}
          <Animated.View style={[styles.bankCardOuter, bankCardStyle]}>
            <LinearGradient
              colors={['#21412e', '#2f5c40', '#16301f']}
              locations={[0, 0.48, 1]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.bankCard}
            >
              {/* Top: issuer + "débit" */}
              <View style={styles.cardTopRow}>
                <View>
                  <Text style={styles.cardPhygital}>Phygital</Text>
                  <Text style={styles.cardSubLabel}>BANK · MAROC</Text>
                </View>
                <Text style={styles.cardDébit}>débit</Text>
              </View>

              {/* Chip + contactless icon */}
              <View style={styles.cardChipRow}>
                <LinearGradient
                  colors={['#f1d79a', '#d4ad62', '#a8842f']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.cardChip}
                >
                  <View style={styles.chipLineVert} />
                  <View style={[styles.chipLineH, { top: '34%' }]} />
                  <View style={[styles.chipLineH, { top: '66%' }]} />
                  <View style={styles.chipCenter} />
                </LinearGradient>
                <WifiHigh size={17} color={Colors.cream} weight="thin" />
              </View>

              {/* 16-digit card number */}
              <View style={styles.cardNumberRow}>
                <Text style={styles.cardDigits}>4127</Text>
                <Text style={styles.cardDigits}>8842</Text>
                <Text style={styles.cardDigits}>0096</Text>
                <Text style={styles.cardDigits}>4892</Text>
              </View>

              {/* Bottom: VALID THRU + name + Mastercard mark */}
              <View style={styles.cardBottomRow}>
                <View style={styles.cardBottomLeft}>
                  <View>
                    <Text style={styles.cardValidLabel}>VALID THRU</Text>
                    <Text style={styles.cardValidValue}>09/28</Text>
                  </View>
                  <Text style={styles.cardHolderName}>Y. EL AMRANI</Text>
                </View>
                <View style={styles.masterMark}>
                  <View style={[styles.masterCircle, styles.masterRed]} />
                  <View style={[styles.masterCircle, styles.masterOrange]} />
                </View>
              </View>
            </LinearGradient>
          </Animated.View>
        </View>
      )}

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.sheetWrap}
      >
        <View style={[styles.sheet, { paddingBottom: insets.bottom + 24 }]}>
          {step === 'input' && (
            <>
              <View style={styles.toggle}>
                <View style={[styles.toggleThumb, mode === 'email' && styles.toggleThumbRight]} />
                {(['phone', 'email'] as const).map((k) => (
                  <Pressable key={k} onPress={() => switchMode(k)} style={styles.toggleBtn}>
                    <Text style={[styles.toggleLabel, mode === k && styles.toggleLabelActive]}>
                      {k === 'phone' ? 'Phone' : 'Email'}
                    </Text>
                  </Pressable>
                ))}
              </View>

              {mode === 'phone' ? (
                <>
                  <Text style={styles.helper}>We'll send a 6-digit code to verify it's you.</Text>
                  <View style={[styles.field, focused === 'phone' && styles.fieldFocused]}>
                    <View style={styles.cc}>
                      <Text style={styles.ccFlag}>🇺🇸</Text>
                      <Text style={styles.ccDial}>+1</Text>
                      <CaretDown size={10} color={Colors.ink} weight="bold" style={styles.ccCaret} />
                    </View>
                    <TextInput
                      keyboardType="phone-pad"
                      placeholder="555 123 4567"
                      placeholderTextColor={Colors.muted}
                      value={formatPhone(phone)}
                      onChangeText={setPhone}
                      onFocus={() => setFocused('phone')}
                      onBlur={() => setFocused(null)}
                      style={styles.input}
                      maxLength={12}
                    />
                  </View>
                </>
              ) : (
                <>
                  <View style={[styles.fieldStacked, focused === 'email' && styles.fieldFocused]}>
                    <TextInput
                      keyboardType="email-address"
                      autoCapitalize="none"
                      autoCorrect={false}
                      autoComplete="email"
                      textContentType="emailAddress"
                      placeholder="Email address"
                      placeholderTextColor={Colors.muted}
                      value={email}
                      onChangeText={setEmail}
                      onFocus={() => setFocused('email')}
                      onBlur={() => setFocused(null)}
                      style={styles.inputStacked}
                    />
                  </View>
                  <View style={[styles.fieldStacked, focused === 'password' && styles.fieldFocused, { marginTop: 8 }]}>
                    <TextInput
                      secureTextEntry={!showPassword}
                      autoCapitalize="none"
                      autoCorrect={false}
                      autoComplete="current-password"
                      textContentType="password"
                      placeholder="Password"
                      placeholderTextColor={Colors.muted}
                      value={password}
                      onChangeText={setPassword}
                      onFocus={() => setFocused('password')}
                      onBlur={() => setFocused(null)}
                      style={styles.inputStacked}
                    />
                    <Pressable onPress={() => setShowPassword((v) => !v)} style={styles.eyeBtn}>
                      {showPassword ? (
                        <EyeSlash size={18} color={Colors.muted} weight="regular" />
                      ) : (
                        <Eye size={18} color={Colors.muted} weight="regular" />
                      )}
                    </Pressable>
                  </View>
                  <Pressable
                    style={styles.forgotBtn}
                    onPress={() => router.push('/auth/forgot-password')}
                    hitSlop={8}
                  >
                    <Text style={styles.forgotText}>Forgot password?</Text>
                  </Pressable>
                </>
              )}

              <Pressable
                onPress={submit}
                disabled={!canSubmit || loading}
                style={[styles.submit, !canSubmit && styles.submitDisabled]}
              >
                <Text style={styles.submitText}>
                  {loading ? 'Working…' : mode === 'phone' ? 'Send code' : 'Sign in'}
                </Text>
                {!loading && <ArrowRight size={16} color={Colors.cream} weight="bold" />}
              </Pressable>

              {error && <Text style={styles.errorText}>{error}</Text>}

              <View style={styles.trustRow}>
                <Lock size={13} color={Colors.muted} weight="regular" />
                <Text style={styles.trustText}>Encrypted end-to-end. We never sell your data.</Text>
              </View>

              <View style={styles.divider} />
              <Pressable onPress={() => router.push('/auth/register')}>
                <Text style={styles.signupText}>
                  First time here? <Text style={styles.signupLink}>Create an account →</Text>
                </Text>
              </Pressable>
            </>
          )}

          {step === 'otp' && (
            <>
              <Text style={styles.otpTitle}>Check your messages</Text>
              <Text style={styles.otpHelper}>
                Code sent to <Text style={styles.otpHelperStrong}>+1 {formatPhone(phone)}</Text>
              </Text>
              <View style={styles.otpRow}>
                {otp.map((d, i) => (
                  <TextInput
                    key={i}
                    ref={(el) => {
                      otpRefs.current[i] = el;
                    }}
                    keyboardType="number-pad"
                    maxLength={1}
                    value={d}
                    onChangeText={(v) => onOtpChange(i, v)}
                    onKeyPress={(e) => onOtpKey(i, e)}
                    style={[styles.otpBox, d ? styles.otpBoxFilled : null]}
                  />
                ))}
              </View>
              <View style={styles.resendRow}>
                <Text style={styles.bodyMuted}>Didn't get it?</Text>
                <Pressable>
                  <Text style={styles.resendBtn}>Resend in 28s</Text>
                </Pressable>
              </View>
              {loading && (
                <View style={styles.verifyingRow}>
                  <Text style={styles.bodyMuted}>Verifying…</Text>
                </View>
              )}
            </>
          )}

          {step === 'success' && (
            <View style={styles.successWrap}>
              <View style={styles.successBadge}>
                <Check size={30} color={Colors.cream} weight="bold" />
              </View>
              <Text style={styles.successTitle}>
                Welcome <Text style={styles.successItalic}>in</Text>.
              </Text>
              <Text style={styles.bodyMuted}>Loading your shopping session…</Text>
            </View>
          )}
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.cream, overflow: 'hidden' },
  gradientTop: { position: 'absolute', top: 0, left: 0, right: 0, height: 360 },
  gradientBottom: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 320 },

  topRow: {
    paddingHorizontal: 22,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backChip: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(21,20,15,0.06)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandLockup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  monoTile: {
    width: 36,
    height: 36,
    borderRadius: 11,
    backgroundColor: Colors.ink,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.22,
    shadowRadius: 14,
    elevation: 4,
  },
  monoLetter: {
    fontFamily: Fonts.serifItalic,
    fontSize: 23,
    lineHeight: 23,
    color: Colors.cream,
    includeFontPadding: false,
  },
  wordmark: {
    fontFamily: Fonts.sansSemibold,
    fontSize: 13.5,
    letterSpacing: 1.6,
    color: Colors.ink,
  },
  helpPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    height: 34,
    paddingHorizontal: 14,
    borderRadius: 999,
    backgroundColor: 'rgba(21,20,15,0.05)',
  },
  helpLabel: {
    fontFamily: Fonts.sansMedium,
    fontSize: 12.5,
    color: Colors.muted,
  },

  heroWrap: { paddingHorizontal: 28, marginTop: 36, maxWidth: 280 },
  heroLine: {
    fontFamily: Fonts.serif,
    fontSize: 68,
    lineHeight: 72,
    letterSpacing: -2.4,
    color: Colors.ink,
    includeFontPadding: false,
  },
  heroItalic: { fontFamily: Fonts.serifItalic, color: Colors.amber },

  // Floating bank card layer — anchored top-right, peeks behind the hero.
  bankCardLayer: {
    position: 'absolute',
    right: -20,
    width: 252,
    height: 168,
  },
  ghostCard: {
    position: 'absolute',
    top: 22,
    right: 22,
    width: 232,
    height: 146,
    borderRadius: 16,
    backgroundColor: 'rgba(21,20,15,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(21,20,15,0.05)',
    transform: [{ rotate: '2deg' }],
  },
  bankCardOuter: {
    position: 'absolute',
    top: 2,
    right: 0,
    width: 232,
    height: 146,
    borderRadius: 16,
    shadowColor: '#122616',
    shadowOffset: { width: 0, height: 26 },
    shadowOpacity: 0.5,
    shadowRadius: 44,
    elevation: 14,
  },
  bankCard: {
    flex: 1,
    borderRadius: 16,
    padding: 15,
    paddingHorizontal: 17,
    overflow: 'hidden',
    justifyContent: 'space-between',
  },
  cardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  cardPhygital: {
    fontFamily: Fonts.serifItalic,
    fontSize: 16,
    color: Colors.cream,
    lineHeight: 16,
    includeFontPadding: false,
  },
  cardSubLabel: {
    fontFamily: Fonts.sansSemibold,
    fontSize: 6,
    letterSpacing: 2,
    color: 'rgba(244,237,224,0.62)',
    marginTop: 3,
  },
  cardDébit: {
    fontFamily: Fonts.serifItalic,
    fontSize: 9,
    letterSpacing: 1,
    color: 'rgba(244,237,224,0.85)',
  },
  cardChipRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
    marginTop: -2,
  },
  cardChip: {
    width: 33,
    height: 25,
    borderRadius: 5,
    overflow: 'hidden',
    position: 'relative',
  },
  chipLineVert: {
    position: 'absolute',
    left: '50%',
    top: 0,
    bottom: 0,
    width: 1,
    marginLeft: -0.5,
    backgroundColor: 'rgba(90,60,10,0.4)',
  },
  chipLineH: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: 'rgba(90,60,10,0.4)',
  },
  chipCenter: {
    position: 'absolute',
    top: '30%',
    left: '38%',
    right: '38%',
    bottom: '30%',
    borderWidth: 1,
    borderColor: 'rgba(90,60,10,0.4)',
    borderRadius: 2,
  },
  cardNumberRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cardDigits: {
    fontFamily: Platform.select({ ios: 'Menlo', android: 'monospace', default: 'monospace' }),
    fontSize: 14.5,
    letterSpacing: 1.2,
    color: '#f5efe1',
    fontWeight: '500',
    textShadowColor: 'rgba(0,0,0,0.35)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 0,
  },
  cardBottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  cardBottomLeft: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 14,
  },
  cardValidLabel: {
    fontFamily: Fonts.sansSemibold,
    fontSize: 5.5,
    letterSpacing: 1,
    color: 'rgba(244,237,224,0.55)',
  },
  cardValidValue: {
    fontFamily: Platform.select({ ios: 'Menlo', android: 'monospace', default: 'monospace' }),
    fontSize: 9.5,
    letterSpacing: 1,
    color: 'rgba(244,237,224,0.92)',
    marginTop: 1,
  },
  cardHolderName: {
    fontFamily: Fonts.sansMedium,
    fontSize: 9.5,
    letterSpacing: 0.6,
    color: 'rgba(244,237,224,0.92)',
  },
  // Two overlapping circles: Mastercard mark.
  masterMark: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  masterCircle: {
    width: 17,
    height: 17,
    borderRadius: 999,
  },
  masterRed: {
    backgroundColor: '#eb001b',
  },
  masterOrange: {
    backgroundColor: '#f79e1b',
    opacity: 0.75,
    marginLeft: -7,
  },

  sheetWrap: { marginTop: 'auto' },
  sheet: {
    paddingHorizontal: 24,
    paddingTop: 20,
    backgroundColor: Colors.paperGlassFill,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderTopWidth: 1,
    borderTopColor: Colors.line,
  },

  toggle: {
    flexDirection: 'row',
    backgroundColor: Colors.lineSoft,
    borderRadius: 11,
    padding: 3,
    marginBottom: 16,
    position: 'relative',
  },
  toggleThumb: {
    position: 'absolute',
    top: 3,
    bottom: 3,
    left: 3,
    width: '50%',
    backgroundColor: Colors.paper,
    borderRadius: 8,
    ...Shadows.card,
  },
  toggleThumbRight: { left: '50%' },
  toggleBtn: { flex: 1, height: 34, alignItems: 'center', justifyContent: 'center' },
  toggleLabel: { fontFamily: Fonts.sansMedium, fontSize: 13, color: Colors.muted },
  toggleLabelActive: { color: Colors.ink },

  helper: { ...Type.bodySm, marginBottom: 10 },

  field: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: Colors.line,
    borderRadius: 14,
    height: 54,
    overflow: 'hidden',
  },
  fieldStacked: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: Colors.line,
    borderRadius: 14,
    height: 54,
  },
  fieldFocused: { borderColor: Colors.ink },
  cc: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    height: '100%',
    borderRightWidth: 1,
    borderRightColor: Colors.line,
    gap: 6,
  },
  ccFlag: { fontSize: 18 },
  ccDial: { fontFamily: Fonts.sansMedium, fontSize: 15, color: Colors.ink },
  ccCaret: { marginLeft: 2, opacity: 0.4 },
  input: {
    flex: 1,
    height: '100%',
    paddingHorizontal: 14,
    fontFamily: Fonts.sans,
    fontSize: 16,
    color: Colors.ink,
    letterSpacing: 0.3,
  },
  inputStacked: {
    flex: 1,
    height: '100%',
    paddingHorizontal: 16,
    fontFamily: Fonts.sans,
    fontSize: 15.5,
    color: Colors.ink,
  },
  eyeBtn: { paddingHorizontal: 16, height: '100%', alignItems: 'center', justifyContent: 'center' },

  forgotBtn: { marginTop: 10, alignSelf: 'flex-end' },
  forgotText: {
    fontFamily: Fonts.sansMedium,
    fontSize: 12.5,
    color: Colors.ink,
    textDecorationLine: 'underline',
  },

  submit: {
    marginTop: 14,
    height: 54,
    borderRadius: 14,
    backgroundColor: Colors.ink,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 10,
    ...Shadows.cta,
  },
  submitDisabled: { backgroundColor: '#d8d2c5', shadowOpacity: 0 },
  submitText: { fontFamily: Fonts.sansMedium, fontSize: 15.5, color: Colors.cream },
  errorText: { fontFamily: Fonts.sansMedium, fontSize: 12, color: Colors.danger, marginTop: 10, textAlign: 'center' },

  trustRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 16 },
  trustText: { fontFamily: Fonts.sans, fontSize: 11.5, color: Colors.muted },

  divider: {
    marginTop: 16,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: Colors.line,
    borderStyle: 'dashed',
  },
  signupText: {
    fontFamily: Fonts.sans,
    fontSize: 13,
    color: Colors.muted,
    textAlign: 'center',
  },
  signupLink: { fontFamily: Fonts.sansMedium, color: Colors.ink },

  otpTitle: { fontFamily: Fonts.sansMedium, fontSize: 18, color: Colors.ink, marginBottom: 4 },
  otpHelper: { fontFamily: Fonts.sans, fontSize: 13, color: Colors.muted, marginBottom: 22, lineHeight: 19.5 },
  otpHelperStrong: { fontFamily: Fonts.sansMedium, color: Colors.ink },
  otpRow: { flexDirection: 'row', gap: 8, marginBottom: 18 },
  otpBox: {
    flex: 1,
    height: 56,
    textAlign: 'center',
    fontFamily: Fonts.serif,
    fontSize: 24,
    color: Colors.ink,
    backgroundColor: '#fff',
    borderWidth: 1.5,
    borderColor: Colors.line,
    borderRadius: 12,
  },
  otpBoxFilled: { borderColor: Colors.ink },
  resendRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  bodyMuted: { fontFamily: Fonts.sans, fontSize: 13, color: Colors.muted },
  resendBtn: {
    fontFamily: Fonts.sansMedium,
    fontSize: 13,
    color: Colors.ink,
    textDecorationLine: 'underline',
  },
  verifyingRow: { marginTop: 22, alignItems: 'center', justifyContent: 'center' },

  successWrap: { paddingVertical: 20, alignItems: 'center', justifyContent: 'center' },
  successBadge: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.cta,
  },
  successTitle: {
    marginTop: 16,
    fontFamily: Fonts.serif,
    fontSize: 28,
    color: Colors.ink,
    letterSpacing: -0.5,
  },
  successItalic: { fontFamily: Fonts.serifItalic, color: Colors.amber },
});
