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
  ScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { ArrowLeft, ArrowRight, Eye, EyeSlash, ShieldCheck } from 'phosphor-react-native';
import {
  Colors,
  Fonts,
  Radius,
  Shadows,
  Type,
  NutriscoreColors,
} from '../../src/constants/theme';
import { meApi } from '../../src/api';
import { backTo } from '../../src/lib/nav';

const backToAccount = backTo('/(tabs)/account?tab=profile');

type Field = 'current' | 'next' | 'confirm';

export default function ChangePasswordScreen() {
  const insets = useSafeAreaInsets();

  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [confirm, setConfirm] = useState('');
  const [visible, setVisible] = useState<Record<Field, boolean>>({
    current: false,
    next: false,
    confirm: false,
  });
  const [focused, setFocused] = useState<Field | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const strength = computeStrength(next);
  const nextValid = next.length >= 8;
  const confirmMatches = next.length > 0 && next === confirm;
  const canSubmit =
    current.length > 0 && nextValid && confirmMatches && current !== next && !submitting;

  const submit = async () => {
    if (!canSubmit) return;
    setError(null);
    setSubmitting(true);
    try {
      await meApi.changePassword(current, next);
      backToAccount();
    } catch (e: unknown) {
      setError(extractMessage(e, 'Could not update. Try again in a moment.'));
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

      <ScrollView
        contentContainerStyle={[
          styles.body,
          { paddingTop: insets.top + 80, paddingBottom: 140 + insets.bottom },
        ]}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.eyebrowRow}>
          <ShieldCheck size={14} color={Colors.amber} weight="regular" />
          <Text style={styles.eyebrow}>SECURITY</Text>
        </View>

        <Text style={styles.hero}>
          Change your <Text style={styles.heroItalic}>password.</Text>
        </Text>

        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Current password</Text>
          <PasswordField
            value={current}
            onChangeText={setCurrent}
            visible={visible.current}
            onToggleVisible={() => setVisible((v) => ({ ...v, current: !v.current }))}
            focused={focused === 'current'}
            onFocus={() => setFocused('current')}
            onBlur={() => setFocused(null)}
            placeholder="Enter your current password"
            autoFocus
            role="current"
          />
        </View>

        <View style={styles.fieldGroup}>
          <Text style={styles.label}>New password</Text>
          <PasswordField
            value={next}
            onChangeText={setNext}
            visible={visible.next}
            onToggleVisible={() => setVisible((v) => ({ ...v, next: !v.next }))}
            focused={focused === 'next'}
            onFocus={() => setFocused('next')}
            onBlur={() => setFocused(null)}
            placeholder="At least 8 characters"
          />
          <StrengthMeter score={strength} />
        </View>

        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Confirm new password</Text>
          <PasswordField
            value={confirm}
            onChangeText={setConfirm}
            visible={visible.confirm}
            onToggleVisible={() => setVisible((v) => ({ ...v, confirm: !v.confirm }))}
            focused={focused === 'confirm'}
            onFocus={() => setFocused('confirm')}
            onBlur={() => setFocused(null)}
            placeholder="Re-enter the new password"
            onSubmitEditing={submit}
            returnKeyType="done"
          />
          {confirm.length > 0 && !confirmMatches && (
            <Text style={styles.fieldError}>Passwords don&apos;t match yet.</Text>
          )}
        </View>

        <Text style={styles.rule}>8+ characters · mix letters and numbers</Text>

        {error && <Text style={styles.errorText}>{error}</Text>}
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + 16 }]}>
        <Pressable
          onPress={submit}
          disabled={!canSubmit}
          style={[styles.saveBtn, !canSubmit && styles.saveBtnDisabled]}
        >
          {submitting ? (
            <ActivityIndicator color={Colors.cream} />
          ) : (
            <>
              <Text style={styles.saveText}>Update password</Text>
              <ArrowRight size={16} color={Colors.cream} weight="regular" />
            </>
          )}
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

function PasswordField({
  value,
  onChangeText,
  visible,
  onToggleVisible,
  focused,
  onFocus,
  onBlur,
  placeholder,
  autoFocus,
  onSubmitEditing,
  returnKeyType,
  role = 'new',
}: {
  value: string;
  onChangeText: (v: string) => void;
  visible: boolean;
  onToggleVisible: () => void;
  focused: boolean;
  onFocus: () => void;
  onBlur: () => void;
  placeholder: string;
  autoFocus?: boolean;
  onSubmitEditing?: () => void;
  returnKeyType?: 'done' | 'next';
  /** Tells iOS / Android autofill what kind of password this is.
   *  'current' for the existing-password field, 'new' for the new + confirm fields. */
  role?: 'current' | 'new';
}) {
  return (
    <View style={[styles.field, focused && styles.fieldFocused]}>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        onFocus={onFocus}
        onBlur={onBlur}
        placeholder={placeholder}
        placeholderTextColor={Colors.muted}
        autoCapitalize="none"
        autoCorrect={false}
        autoComplete={role === 'current' ? 'current-password' : 'password-new'}
        textContentType={role === 'current' ? 'password' : 'newPassword'}
        passwordRules={role === 'new' ? 'minlength: 8;' : undefined}
        secureTextEntry={!visible}
        style={styles.input}
        selectionColor={Colors.amber}
        autoFocus={autoFocus}
        onSubmitEditing={onSubmitEditing}
        returnKeyType={returnKeyType}
      />
      <Pressable onPress={onToggleVisible} hitSlop={8} style={styles.eye}>
        {visible ? (
          <EyeSlash size={18} color={Colors.muted} weight="regular" />
        ) : (
          <Eye size={18} color={Colors.muted} weight="regular" />
        )}
      </Pressable>
    </View>
  );
}

function StrengthMeter({ score }: { score: number }) {
  // score is 0..4, mapping to the nutriscore palette (D → A reads naturally
  // bad → good in a way the user already knows from Product Detail).
  const cellColors: string[] = [
    NutriscoreColors.E,
    NutriscoreColors.D,
    NutriscoreColors.C,
    NutriscoreColors.A,
  ];
  return (
    <View style={styles.meterRow}>
      {[0, 1, 2, 3].map((i) => (
        <View
          key={i}
          style={[
            styles.meterCell,
            { backgroundColor: i < score ? cellColors[i] : Colors.lineSoft },
          ]}
        />
      ))}
    </View>
  );
}

function computeStrength(pwd: string): number {
  if (pwd.length < 4) return 0;
  let score = 0;
  if (pwd.length >= 8) score++;
  if (/[A-Z]/.test(pwd) && /[a-z]/.test(pwd)) score++;
  if (/\d/.test(pwd)) score++;
  if (/[^A-Za-z0-9]/.test(pwd) && pwd.length >= 10) score++;
  return Math.min(score, 4);
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
  body: { paddingHorizontal: 26 },
  eyebrowRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  eyebrow: { ...Type.eyebrow, color: Colors.amber },
  hero: { ...Type.hero, marginBottom: 24 },
  heroItalic: { fontFamily: Fonts.serifItalic, color: Colors.amber },

  fieldGroup: { marginBottom: 18 },
  label: {
    fontFamily: Fonts.sansMedium,
    fontSize: 12,
    color: Colors.muted,
    marginBottom: 8,
    letterSpacing: 0.3,
  },
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.paper,
    borderWidth: 1,
    borderColor: Colors.line,
    borderRadius: Radius.md,
    paddingLeft: 16,
    paddingRight: 12,
    paddingVertical: 12,
    ...Shadows.card,
  },
  fieldFocused: { borderColor: Colors.amber, ...Shadows.amberCta },
  input: {
    flex: 1,
    fontFamily: Fonts.sans,
    fontSize: 16,
    color: Colors.ink,
    padding: 0,
    includeFontPadding: false,
  },
  eye: { paddingLeft: 8 },
  fieldError: { ...Type.bodySm, color: Colors.danger, marginTop: 6 },

  meterRow: { flexDirection: 'row', gap: 6, marginTop: 8 },
  meterCell: { flex: 1, height: 4, borderRadius: 2 },

  rule: {
    fontFamily: Fonts.sans,
    fontSize: 12,
    color: Colors.muted,
    marginTop: 4,
  },
  errorText: { ...Type.bodySm, color: Colors.danger, marginTop: 12 },

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
