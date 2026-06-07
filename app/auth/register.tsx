import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { ArrowLeft, ArrowRight, Eye, EyeSlash, Lock } from 'phosphor-react-native';
import { Colors, Fonts, Radius, Shadows } from '../../src/constants/theme';
import { useAuth } from '../../src/context/AuthContext';

type Field = 'email' | 'username' | 'password';

export default function RegisterScreen() {
  const insets = useSafeAreaInsets();
  const { register } = useAuth();

  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [focused, setFocused] = useState<Field | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  const usernameValid = /^[a-zA-Z0-9_.-]{3,30}$/.test(username.trim());
  const passwordValid = password.length >= 8;
  const canSubmit = emailValid && usernameValid && passwordValid;

  const submit = async () => {
    if (!canSubmit || loading) return;
    setError(null);
    setLoading(true);
    try {
      await register(email.trim().toLowerCase(), username.trim(), password);
      router.replace('/(tabs)/home');
    } catch (e: unknown) {
      setError(extractMessage(e, 'Could not create your account. Try again.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.root}>
      <LinearGradient
        colors={['rgba(200,122,58,0.10)', 'transparent']}
        style={styles.gradientTop}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 0.5 }}
      />
      <LinearGradient
        colors={['transparent', 'rgba(45,90,61,0.08)']}
        style={styles.gradientBottom}
        start={{ x: 0.4, y: 0.4 }}
        end={{ x: 1, y: 1 }}
      />

      <View style={[styles.topRow, { paddingTop: insets.top + 14 }]}>
        <Pressable onPress={() => router.back()} style={styles.iconBtn}>
          <ArrowLeft size={16} color={Colors.ink} weight="bold" />
        </Pressable>
        <View style={styles.brand}>
          <View style={styles.brandDot} />
          <Text style={styles.brandLabel}>PHYGITAL</Text>
        </View>
        <View style={styles.iconBtnSpacer} />
      </View>

      <View style={styles.heroWrap}>
        <Text style={styles.heroLine}>Welcome</Text>
        <Text style={[styles.heroLine, styles.heroItalic]}>in.</Text>
      </View>

      <LinearGradient
        colors={[Colors.accent, Colors.accentDeep]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.loyaltyPeek}
      >
        <View style={styles.loyaltyTopRow}>
          <Text style={styles.loyaltyMonogram}>P</Text>
          <Text style={styles.loyaltyMember}>NEW MEMBER</Text>
        </View>
        <LinearGradient
          colors={['#d4b075', '#a88550']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.loyaltyChip}
        />
        <Text style={styles.loyaltyNumber}>•••• ••••</Text>
      </LinearGradient>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.sheetWrap}
      >
        <ScrollView
          contentContainerStyle={[styles.sheet, { paddingBottom: insets.bottom + 24 }]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.helper}>It takes a minute. We'll never sell your data.</Text>

          <View style={[styles.field, focused === 'email' && styles.fieldFocused]}>
            <TextInput
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              placeholder="Email address"
              placeholderTextColor={Colors.muted}
              value={email}
              onChangeText={setEmail}
              onFocus={() => setFocused('email')}
              onBlur={() => setFocused(null)}
              style={styles.input}
            />
          </View>

          <View style={[styles.field, focused === 'username' && styles.fieldFocused, { marginTop: 8 }]}>
            <TextInput
              autoCapitalize="none"
              autoCorrect={false}
              placeholder="Username"
              placeholderTextColor={Colors.muted}
              value={username}
              onChangeText={setUsername}
              onFocus={() => setFocused('username')}
              onBlur={() => setFocused(null)}
              style={styles.input}
              maxLength={30}
            />
          </View>

          <View style={[styles.field, focused === 'password' && styles.fieldFocused, { marginTop: 8 }]}>
            <TextInput
              secureTextEntry={!showPassword}
              placeholder="Password (min. 8 characters)"
              placeholderTextColor={Colors.muted}
              value={password}
              onChangeText={setPassword}
              onFocus={() => setFocused('password')}
              onBlur={() => setFocused(null)}
              style={styles.input}
            />
            <Pressable onPress={() => setShowPassword((v) => !v)} style={styles.eyeBtn}>
              {showPassword
                ? <EyeSlash size={18} color={Colors.muted} weight="regular" />
                : <Eye size={18} color={Colors.muted} weight="regular" />}
            </Pressable>
          </View>

          <Pressable
            onPress={submit}
            disabled={!canSubmit || loading}
            style={[styles.submit, !canSubmit && styles.submitDisabled]}
          >
            <Text style={styles.submitText}>{loading ? 'Working…' : 'Create account'}</Text>
            {!loading && <ArrowRight size={16} color={Colors.cream} weight="bold" />}
          </Pressable>

          {error && <Text style={styles.errorText}>{error}</Text>}

          <View style={styles.trustRow}>
            <Lock size={13} color={Colors.muted} weight="regular" />
            <Text style={styles.trustText}>Encrypted end-to-end. We never sell your data.</Text>
          </View>

          <View style={styles.divider} />
          <Pressable onPress={() => router.replace('/auth/login')}>
            <Text style={styles.footerText}>
              Already have an account? <Text style={styles.footerLink}>Sign in →</Text>
            </Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const extractMessage = (e: unknown, fallback: string): string =>
  e && typeof e === 'object' && 'response' in e
    ? ((e as { response?: { data?: { detail?: string; message?: string } } }).response?.data?.detail ??
        (e as { response?: { data?: { message?: string } } }).response?.data?.message ??
        fallback)
    : fallback;

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.cream, overflow: 'hidden' },
  gradientTop: { position: 'absolute', top: 0, left: 0, right: 0, height: 360 },
  gradientBottom: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 320 },

  topRow: {
    paddingHorizontal: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: Radius.pill,
    backgroundColor: Colors.inkGlassFill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconBtnSpacer: { width: 36, height: 36 },
  brand: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  brandDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: Colors.accent },
  brandLabel: {
    fontFamily: Fonts.sansSemibold,
    fontSize: 11,
    letterSpacing: 1.5,
    color: Colors.muted,
  },

  heroWrap: { paddingHorizontal: 28, marginTop: 36, maxWidth: 320 },
  heroLine: {
    fontFamily: Fonts.serif,
    fontSize: 68,
    lineHeight: 72,
    letterSpacing: -2.4,
    color: Colors.ink,
    includeFontPadding: false,
  },
  heroItalic: { fontFamily: Fonts.serifItalic, color: Colors.amber },

  loyaltyPeek: {
    position: 'absolute',
    top: 360,
    right: -36,
    width: 170,
    height: 104,
    borderRadius: 14,
    padding: 14,
    transform: [{ rotate: '8deg' }],
    ...Shadows.loyalty,
  },
  loyaltyTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  loyaltyMonogram: { fontFamily: Fonts.serifItalic, fontSize: 18, color: Colors.cream },
  loyaltyMember: {
    fontFamily: Fonts.sansSemibold,
    fontSize: 8,
    letterSpacing: 1,
    color: 'rgba(244,237,224,0.7)',
  },
  loyaltyChip: { width: 28, height: 22, borderRadius: 4, marginTop: 12 },
  loyaltyNumber: {
    fontFamily: Fonts.sansMedium,
    fontSize: 10,
    letterSpacing: 1.5,
    color: 'rgba(244,237,224,0.85)',
    marginTop: 12,
  },

  sheetWrap: { marginTop: 'auto' },
  sheet: {
    paddingHorizontal: 24,
    paddingTop: 22,
    backgroundColor: Colors.paperGlassFill,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderTopWidth: 1,
    borderTopColor: Colors.line,
  },

  helper: {
    fontFamily: Fonts.sans,
    fontSize: 12.5,
    color: Colors.muted,
    marginBottom: 12,
    lineHeight: 18.75,
  },

  field: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: Colors.line,
    borderRadius: 14,
    height: 54,
  },
  fieldFocused: { borderColor: Colors.ink },
  input: {
    flex: 1,
    height: '100%',
    paddingHorizontal: 16,
    fontFamily: Fonts.sans,
    fontSize: 15.5,
    color: Colors.ink,
  },
  eyeBtn: { paddingHorizontal: 16, height: '100%', alignItems: 'center', justifyContent: 'center' },

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
  errorText: {
    fontFamily: Fonts.sansMedium,
    fontSize: 12,
    color: Colors.danger,
    marginTop: 10,
    textAlign: 'center',
  },

  trustRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 16 },
  trustText: { fontFamily: Fonts.sans, fontSize: 11.5, color: Colors.muted },

  divider: {
    marginTop: 16,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: Colors.line,
    borderStyle: 'dashed',
  },
  footerText: {
    fontFamily: Fonts.sans,
    fontSize: 13,
    color: Colors.muted,
    textAlign: 'center',
  },
  footerLink: { fontFamily: Fonts.sansMedium, color: Colors.ink },
});
