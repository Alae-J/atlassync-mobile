import { useCallback, useState, type ReactNode } from 'react';
import {
  ActionSheetIOS,
  Alert,
  Image,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '../../src/context/AuthContext';
import {
  CaretRight,
  User as UserIcon,
  Phone,
  Envelope,
  ShieldCheck,
  Image as ImageIcon,
  CreditCard,
  Receipt,
  DownloadSimple,
  MapPin,
  Bell,
  Globe,
  CurrencyDollar,
  Prohibit,
  Warning,
  Lock,
  Link,
  Question,
  Info,
  Plus,
} from 'phosphor-react-native';
import { Colors, Fonts, Radius, Shadows, TabBarHeight } from '../../src/constants/theme';
import { displayName, splitName } from '../../src/lib/userDisplay';
import { storeLabel } from '../../src/data/stores';
import { currencyLabel } from '../../src/data/currencies';
import { countOn as countNotifsOn } from '../../src/data/notifications';

type AccountTab = 'profile' | 'payments' | 'preferences' | 'help';

const TABS: { key: AccountTab; label: string }[] = [
  { key: 'profile', label: 'Profile' },
  { key: 'payments', label: 'Payments' },
  { key: 'preferences', label: 'Preferences' },
  { key: 'help', label: 'Help' },
];

function isAccountTab(value: unknown): value is AccountTab {
  return value === 'profile' || value === 'payments' || value === 'preferences' || value === 'help';
}

export default function AccountScreen() {
  const insets = useSafeAreaInsets();
  const { user, patchUser } = useAuth();
  // Initial tab is sourced from the URL (?tab=preferences) so back-nav from
  // a sub-screen (e.g. /account/dietary → /(tabs)/account?tab=preferences)
  // lands the user on the tab they came from instead of resetting to profile.
  const { tab: tabParam } = useLocalSearchParams<{ tab?: string }>();
  const [active, setActive] = useState<AccountTab>(
    isAccountTab(tabParam) ? tabParam : 'profile',
  );
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  const switchTab = useCallback((next: AccountTab) => {
    setActive(next);
    // Keep the URL in sync so a future back-nav restores this same tab.
    router.setParams({ tab: next });
  }, []);

  const [first, last] = splitName(user);
  const initial = (first[0] ?? '?').toUpperCase();
  const subtitle = user?.email ?? '';
  const avatarUri = user?.avatarUri ?? null;

  const handleAvatarTap = useCallback(() => {
    if (uploadingAvatar) return;
    openPhotoMenu({
      hasPhoto: !!avatarUri,
      onTakePhoto: () => pickPhoto('camera', setUploadingAvatar, patchUser),
      onChoosePhoto: () => pickPhoto('library', setUploadingAvatar, patchUser),
      onRemovePhoto: () => void patchUser({ avatarUri: null }),
    });
  }, [avatarUri, uploadingAvatar, patchUser]);

  return (
    <View style={styles.root}>
      <View style={[styles.fixedHeader, { paddingTop: insets.top + 12 }]}>
        <View style={styles.avatarRow}>
          <Pressable
            onPress={handleAvatarTap}
            disabled={uploadingAvatar}
            style={styles.avatarPress}
          >
            {avatarUri ? (
              <Image
                source={{ uri: avatarUri }}
                style={[styles.avatar, uploadingAvatar && styles.avatarBusy]}
              />
            ) : (
              <LinearGradient
                colors={[Colors.amber, Colors.amberDeep]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={[styles.avatar, uploadingAvatar && styles.avatarBusy]}
              >
                <Text style={styles.avatarLetter}>{initial}</Text>
              </LinearGradient>
            )}
            {uploadingAvatar && <View style={styles.avatarRing} />}
          </Pressable>
          <View style={{ flex: 1, minWidth: 0 }}>
            <Text style={styles.avatarName}>
              {first}
              {last ? <> <Text style={styles.avatarNameItalic}>{last}</Text></> : null}
            </Text>
            <Text style={styles.avatarPhone}>{subtitle}</Text>
          </View>
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabStrip}
        >
          {TABS.map((tab) => {
            const isActive = active === tab.key;
            return (
              <Pressable
                key={tab.key}
                onPress={() => switchTab(tab.key)}
                style={styles.tabBtn}
              >
                <Text style={[styles.tabLabel, isActive && styles.tabLabelActive]}>
                  {tab.label}
                </Text>
                {isActive && <View style={styles.tabUnderline} />}
              </Pressable>
            );
          })}
        </ScrollView>
        <View style={styles.tabStripDivider} />
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={[
          styles.scroll,
          { paddingTop: insets.top + 168, paddingBottom: TabBarHeight + insets.bottom + 24 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {active === 'profile' && <ProfileTab />}
        {active === 'payments' && <PaymentsTab />}
        {active === 'preferences' && <PreferencesTab />}
        {active === 'help' && <HelpTab />}
      </ScrollView>
    </View>
  );
}

function ProfileTab() {
  const { user, logout, patchUser } = useAuth();
  const [first, last] = splitName(user);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const hasPhoto = !!user?.avatarUri;

  const handleSignOut = async () => {
    await logout();
    router.replace('/auth/login');
  };
  const handlePhotoTap = () => {
    if (uploadingPhoto) return;
    openPhotoMenu({
      hasPhoto,
      onTakePhoto: () => pickPhoto('camera', setUploadingPhoto, patchUser),
      onChoosePhoto: () => pickPhoto('library', setUploadingPhoto, patchUser),
      onRemovePhoto: () => void patchUser({ avatarUri: null }),
    });
  };
  return (
    <>
      <View style={styles.section}>
        <View style={styles.loyaltyCard}>
          <LinearGradient
            colors={['rgba(200,122,58,0.22)', 'transparent']}
            start={{ x: 1, y: 0 }}
            end={{ x: 0.5, y: 0.5 }}
            style={StyleSheet.absoluteFill as never}
          />
          <View style={styles.loyaltyTopRow}>
            <View>
              <Text style={styles.loyaltyEyebrow}>PHYGITAL · MEMBER</Text>
              <Text style={styles.loyaltyName}>
                {first}
                {last ? <> <Text style={styles.loyaltyNameItalic}>{last}</Text></> : null}
              </Text>
            </View>
            <View style={styles.tierBadge}>
              <Text style={styles.tierBadgeText}>GOLD</Text>
            </View>
          </View>
          <View style={styles.loyaltyBottom}>
            <View>
              <Text style={styles.loyaltyEyebrowSm}>POINTS</Text>
              <Text style={styles.loyaltyPoints}>2,840</Text>
              <Text style={styles.loyaltyToNext}>
                160 to <Text style={styles.loyaltyToNextItalic}>Platinum</Text>
              </Text>
            </View>
            <View style={styles.barChart}>
              {[3, 5, 2, 4, 3, 5, 2, 3, 4, 2, 5, 3, 4, 2, 3, 5, 2, 4, 3, 4].map((h, i) => (
                <View
                  key={i}
                  style={[
                    styles.barChartTick,
                    {
                      width: i % 3 === 0 ? 2 : 1.5,
                      height: 18 + h * 1.5,
                    },
                  ]}
                />
              ))}
            </View>
          </View>
        </View>
      </View>

      <SectionHeader eyebrow="IDENTITY" title="Personal" italicWord="details" />
      <Card>
        <Row
          icon={<UserIcon size={16} color={Colors.amber} weight="regular" />}
          label="Full name"
          value={displayName(user)}
          onPress={() => router.push('/account/edit-name')}
        />
        <Row
          icon={<Phone size={16} color={Colors.amber} weight="regular" />}
          label="Phone number"
          value={user?.phone ?? 'Not set'}
          onPress={() => router.push('/account/phone')}
        />
        <EmailRow user={user} />
        <Row
          icon={<ShieldCheck size={16} color={Colors.amber} weight="regular" />}
          label="Password"
          value="Change"
          onPress={() => router.push('/account/change-password')}
        />
        <Row
          icon={<ImageIcon size={16} color={Colors.amber} weight="regular" />}
          label="Profile photo"
          value={uploadingPhoto ? 'Uploading…' : hasPhoto ? 'Edit' : 'Upload'}
          onPress={handlePhotoTap}
          last
        />
      </Card>

      <SectionHeader eyebrow="THIS MONTH" title="Spent" italicWord="$248.40" />
      <View style={styles.budgetCard}>
        <View style={styles.budgetTopRow}>
          <Text style={styles.budgetCaption}>6 trips · $41/trip avg</Text>
          <Text style={styles.budgetCaption}>
            Budget <Text style={styles.budgetCaptionStrong}>$400</Text>
          </Text>
        </View>
        <View style={styles.budgetTrack}>
          <View style={styles.budgetFill} />
        </View>
        <Text style={styles.budgetFooter}>62% of budget · $151.60 left</Text>
      </View>

      <SectionHeader eyebrow="DIET" title="Tastes &" italicWord="dislikes" />
      <View style={styles.chipCard}>
        {(user?.preferences?.dietaryPrefs ?? []).map((label) => (
          <View key={label} style={[styles.chip, styles.chipActive]}>
            <Text style={styles.chipCheck}>✓</Text>
            <Text style={[styles.chipText, styles.chipTextActive]}>{label}</Text>
          </View>
        ))}
        <Pressable
          style={[styles.chip, styles.chipInactive]}
          onPress={() => router.push('/account/dietary')}
        >
          <Text style={[styles.chipText, styles.chipTextInactive]}>+ Manage</Text>
        </Pressable>
      </View>

      <View style={[styles.section, { paddingTop: 28 }]}>
        <Pressable style={styles.signOut} onPress={handleSignOut}>
          <Text style={styles.signOutText}>Sign out</Text>
        </Pressable>
      </View>
    </>
  );
}

function PaymentsTab() {
  return (
    <>
      <SectionHeader eyebrow="PAYMENT METHODS" title="How you" italicWord="pay" />
      <View style={styles.paymentsCard}>
        <View style={[styles.paymentRow, styles.paymentRowDefault]}>
          <View style={[styles.cardChip, { backgroundColor: Colors.ink }]}>
            <Text style={[styles.cardChipText, { color: Colors.amber }]}>VISA</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.paymentLine}>·· ·· 4287</Text>
            <Text style={styles.paymentMeta}>Default · Expires 09/28</Text>
          </View>
          <View style={styles.defaultBadge}>
            <Text style={styles.defaultBadgeText}>DEFAULT</Text>
          </View>
        </View>
        <View style={styles.paymentRow}>
          <View style={[styles.cardChip, { backgroundColor: '#e60000' }]}>
            <Text style={[styles.cardChipText, { color: '#fff', fontSize: 9 }]}>VF Cash</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.paymentLine}>+20 ··· 4287</Text>
            <Text style={styles.paymentMeta}>Vodafone Cash wallet</Text>
          </View>
        </View>
        <View style={[styles.paymentRow, styles.paymentRowLast]}>
          <View style={[styles.cardChip, { backgroundColor: Colors.ink }]}>
            <Text style={[styles.cardChipText, { color: Colors.cream }]}></Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.paymentLine}>Apple Pay</Text>
            <Text style={styles.paymentMeta}>Connected</Text>
          </View>
        </View>
        <Pressable style={styles.addPaymentBtn}>
          <Plus size={14} color={Colors.amber} weight="bold" />
          <Text style={styles.addPaymentText}>Add payment method</Text>
        </Pressable>
      </View>

      <SectionHeader eyebrow="BILLING" title="Receipts &" italicWord="exports" />
      <Card>
        <Row icon={<Receipt size={16} color={Colors.amber} weight="regular" />} label="Receipts archive" value="42" />
        <Row icon={<DownloadSimple size={16} color={Colors.amber} weight="regular" />} label="Export statements" last />
      </Card>
    </>
  );
}

function PreferencesTab() {
  const { user } = useAuth();
  const prefs = user?.preferences;
  const notifOn = countNotifsOn(prefs?.notificationPrefs ?? {});
  const dietaryCount = prefs?.dietaryPrefs.length ?? 0;
  const allergenCount = prefs?.allergens.length ?? 0;

  return (
    <>
      <SectionHeader eyebrow="PREFERENCES" title="Set the" italicWord="defaults" />
      <Card>
        <Row
          icon={<MapPin size={16} color={Colors.amber} weight="regular" />}
          label="Default store"
          value={storeLabel(prefs?.defaultStoreId)}
          onPress={() => router.push('/account/store')}
        />
        <Row
          icon={<CurrencyDollar size={16} color={Colors.amber} weight="regular" />}
          label="Currency"
          value={currencyLabel(prefs?.currencyCode)}
          onPress={() => router.push('/account/currency')}
        />
        <DeferredRow
          icon={<Globe size={16} color={Colors.muted} weight="regular" />}
          label="Language"
          value="Coming soon"
        />
        <Row
          icon={<Bell size={16} color={Colors.amber} weight="regular" />}
          label="Notifications"
          value={`${notifOn} categor${notifOn === 1 ? 'y' : 'ies'} on`}
          onPress={() => router.push('/account/notifications')}
          last
        />
      </Card>

      <SectionHeader eyebrow="DIET" title="Restrictions &" italicWord="allergens" />
      <Card>
        <Row
          icon={<Prohibit size={16} color={Colors.amber} weight="regular" />}
          label="Dietary restrictions"
          value={dietaryCount === 0 ? 'None' : `${dietaryCount} active`}
          onPress={() => router.push('/account/dietary')}
        />
        <Row
          icon={<Warning size={16} color={Colors.amber} weight="regular" />}
          label="Allergens"
          value={allergenCount === 0 ? 'None' : `${allergenCount} flagged`}
          onPress={() => router.push('/account/allergens')}
          last
        />
      </Card>
    </>
  );
}

function DeferredRow({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: string;
}) {
  return (
    <View style={[styles.row, styles.rowDivider, styles.deferredRow]}>
      <View style={[styles.rowIcon, styles.deferredIcon]}>{icon}</View>
      <Text style={[styles.rowLabel, styles.deferredText]}>{label}</Text>
      <Text style={[styles.rowValue, styles.deferredText]}>{value}</Text>
    </View>
  );
}

function HelpTab() {
  return (
    <>
      <SectionHeader eyebrow="HELP & TRUST" title="The" italicWord="boring stuff" />
      <Card>
        <Row icon={<Lock size={16} color={Colors.amber} weight="regular" />} label="Privacy & data" />
        <Row icon={<Link size={16} color={Colors.amber} weight="regular" />} label="Linked accounts" value="2" />
        <Row icon={<Question size={16} color={Colors.amber} weight="regular" />} label="Help & support" />
        <Row icon={<Info size={16} color={Colors.amber} weight="regular" />} label="About Phygital" value="v1.0.4" last />
      </Card>

      <View style={styles.section}>
        <Pressable style={styles.contactBtn}>
          <Text style={styles.contactBtnText}>Contact support</Text>
        </Pressable>
      </View>
    </>
  );
}

function SectionHeader({ eyebrow, title, italicWord }: { eyebrow: string; title: string; italicWord: string }) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionEyebrow}>{eyebrow}</Text>
      <Text style={styles.sectionTitle}>
        {title} <Text style={styles.sectionTitleItalic}>{italicWord}</Text>
      </Text>
    </View>
  );
}

function Card({ children }: { children: ReactNode }) {
  return <View style={styles.card}>{children}</View>;
}

interface RowProps {
  icon: ReactNode;
  label: string;
  value?: string;
  last?: boolean;
  onPress?: () => void;
}

function Row({ icon, label, value, last, onPress }: RowProps) {
  return (
    <Pressable style={[styles.row, !last && styles.rowDivider]} onPress={onPress}>
      <View style={styles.rowIcon}>{icon}</View>
      <Text style={styles.rowLabel}>{label}</Text>
      {value && <Text style={styles.rowValue}>{value}</Text>}
      <CaretRight size={14} color={Colors.muted} weight="bold" />
    </Pressable>
  );
}

function EmailRow({ user }: { user: ReturnType<typeof useAuth>['user'] }) {
  const verified = !!user?.emailVerified;
  return (
    <Pressable
      onPress={verified ? undefined : () => router.push('/auth/verify-email')}
      style={[styles.row, styles.rowDivider]}
    >
      <View style={styles.rowIcon}>
        <Envelope size={16} color={Colors.amber} weight="regular" />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.rowLabel}>{user?.email ?? 'Not set'}</Text>
        <View style={styles.emailStatusRow}>
          <View style={[styles.statusDot, verified ? styles.statusDotOk : styles.statusDotWarn]} />
          <Text style={[styles.emailStatus, verified ? styles.emailStatusOk : styles.emailStatusWarn]}>
            {verified ? 'Verified' : 'Unverified · Verify now'}
          </Text>
        </View>
      </View>
      {!verified && <CaretRight size={14} color={Colors.amber} weight="bold" />}
    </Pressable>
  );
}

// ── Photo picker plumbing ────────────────────────────────────────────
// expo-image-picker handles the native bits; we just choose between the
// camera and library, get back a URI, and patch it onto the local user
// record. Backend upload is a follow-up — the URI lives on-device only.

type PhotoSource = 'camera' | 'library';

async function pickPhoto(
  source: PhotoSource,
  setBusy: (b: boolean) => void,
  patchUser: (changes: { avatarUri: string | null }) => Promise<void>,
) {
  try {
    setBusy(true);
    const perm =
      source === 'camera'
        ? await ImagePicker.requestCameraPermissionsAsync()
        : await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert(
        source === 'camera' ? 'Camera access needed' : 'Photo access needed',
        'Enable access in Settings to pick a profile photo.',
      );
      return;
    }
    const result =
      source === 'camera'
        ? await ImagePicker.launchCameraAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.85,
          })
        : await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.85,
          });
    if (result.canceled) return;
    const uri = result.assets?.[0]?.uri;
    if (!uri) return;
    await patchUser({ avatarUri: uri });
  } finally {
    setBusy(false);
  }
}

function openPhotoMenu({
  hasPhoto,
  onTakePhoto,
  onChoosePhoto,
  onRemovePhoto,
}: {
  hasPhoto: boolean;
  onTakePhoto: () => void;
  onChoosePhoto: () => void;
  onRemovePhoto: () => void;
}) {
  if (Platform.OS === 'ios') {
    const options = hasPhoto
      ? ['Take photo', 'Choose from library', 'Remove photo', 'Cancel']
      : ['Take photo', 'Choose from library', 'Cancel'];
    ActionSheetIOS.showActionSheetWithOptions(
      {
        options,
        cancelButtonIndex: options.length - 1,
        destructiveButtonIndex: hasPhoto ? 2 : undefined,
      },
      (idx) => {
        if (idx === 0) onTakePhoto();
        else if (idx === 1) onChoosePhoto();
        else if (idx === 2 && hasPhoto) onRemovePhoto();
      },
    );
    return;
  }

  // Android / web fallback — Alert with up to three buttons.
  const buttons: { text: string; onPress?: () => void; style?: 'cancel' | 'destructive' }[] = [
    { text: 'Take photo', onPress: onTakePhoto },
    { text: 'Choose from library', onPress: onChoosePhoto },
  ];
  if (hasPhoto) {
    buttons.push({ text: 'Remove photo', onPress: onRemovePhoto, style: 'destructive' });
  }
  buttons.push({ text: 'Cancel', style: 'cancel' });
  Alert.alert('Profile photo', undefined, buttons);
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.background },

  fixedHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 5,
    backgroundColor: Colors.background,
  },
  avatarRow: {
    paddingHorizontal: 22,
    paddingBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  avatarPress: { width: 48, height: 48, alignItems: 'center', justifyContent: 'center' },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.amberCta,
  },
  avatarBusy: { opacity: 0.6 },
  avatarRing: {
    position: 'absolute',
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 2,
    borderColor: Colors.amber,
    borderTopColor: 'transparent',
  },
  avatarLetter: {
    fontFamily: Fonts.serif,
    fontSize: 24,
    color: Colors.cream,
    letterSpacing: -1,
    includeFontPadding: false,
  },
  avatarName: {
    fontFamily: Fonts.serif,
    fontSize: 24,
    lineHeight: 26,
    letterSpacing: -0.6,
    color: Colors.ink,
    includeFontPadding: false,
  },
  avatarNameItalic: { fontFamily: Fonts.serifItalic },
  avatarPhone: { fontFamily: Fonts.sans, fontSize: 11.5, color: Colors.muted, marginTop: 3 },

  tabStrip: { paddingHorizontal: 22, gap: 4 },
  tabBtn: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    position: 'relative',
  },
  tabLabel: { fontFamily: Fonts.sansMedium, fontSize: 13.5, color: Colors.muted },
  tabLabelActive: { fontFamily: Fonts.sansSemibold, color: Colors.amber },
  tabUnderline: {
    position: 'absolute',
    bottom: -1,
    left: 14,
    right: 14,
    height: 2,
    backgroundColor: Colors.amber,
    borderRadius: 1,
  },
  tabStripDivider: { height: 1, backgroundColor: Colors.line },

  scroll: { paddingHorizontal: 22 },

  section: { marginTop: 6 },
  sectionHeader: { marginTop: 24 },
  sectionEyebrow: {
    fontFamily: Fonts.sansSemibold,
    fontSize: 10,
    letterSpacing: 1.6,
    color: Colors.muted,
    marginBottom: 6,
  },
  sectionTitle: {
    fontFamily: Fonts.serif,
    fontSize: 26,
    lineHeight: 30,
    letterSpacing: -0.6,
    color: Colors.ink,
    marginBottom: 14,
    includeFontPadding: false,
  },
  sectionTitleItalic: { fontFamily: Fonts.serifItalic },

  card: {
    backgroundColor: Colors.paper,
    borderWidth: 1,
    borderColor: Colors.line,
    borderRadius: Radius.lg,
    paddingHorizontal: 18,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingVertical: 14,
  },
  rowDivider: { borderBottomWidth: 1, borderBottomColor: Colors.line },
  rowIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: 'rgba(200,122,58,0.10)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowLabel: { flex: 1, fontFamily: Fonts.sans, fontSize: 14.5, color: Colors.ink },
  rowValue: { fontFamily: Fonts.sans, fontSize: 13, color: Colors.muted },

  // Deferred row — Language sits in this state until i18n lands.
  // Keeps the same solid 1px hairline as the rest of the rows (RN's
  // `borderStyle: dashed` on a 1px bottom-only border doesn't render on
  // iOS), just muted via opacity + colour swaps.
  deferredRow: { opacity: 0.78 },
  deferredIcon: { backgroundColor: 'rgba(21,20,15,0.05)' },
  deferredText: { color: Colors.muted },

  emailStatusRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 3 },
  statusDot: { width: 6, height: 6, borderRadius: 3 },
  statusDotOk: { backgroundColor: Colors.accent },
  statusDotWarn: { backgroundColor: Colors.amber },
  emailStatus: { fontFamily: Fonts.sansMedium, fontSize: 11.5 },
  emailStatusOk: { color: Colors.accent },
  emailStatusWarn: { color: Colors.amber },

  loyaltyCard: {
    backgroundColor: Colors.ink,
    borderRadius: Radius.xxl,
    padding: 22,
    overflow: 'hidden',
    ...Shadows.cta,
  },
  loyaltyTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  loyaltyEyebrow: {
    fontFamily: Fonts.sansSemibold,
    fontSize: 10,
    letterSpacing: 1.6,
    color: 'rgba(244,237,224,0.6)',
  },
  loyaltyEyebrowSm: {
    fontFamily: Fonts.sansSemibold,
    fontSize: 10,
    letterSpacing: 1.6,
    color: 'rgba(244,237,224,0.55)',
  },
  loyaltyName: {
    fontFamily: Fonts.serif,
    fontSize: 26,
    lineHeight: 32,
    letterSpacing: -0.6,
    color: Colors.cream,
    marginTop: 6,
    includeFontPadding: false,
  },
  loyaltyNameItalic: { fontFamily: Fonts.serifItalic, opacity: 0.85 },
  tierBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    backgroundColor: 'rgba(244,237,224,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(244,237,224,0.15)',
    borderRadius: 8,
  },
  tierBadgeText: {
    fontFamily: Fonts.sansSemibold,
    fontSize: 10,
    letterSpacing: 1,
    color: Colors.cream,
  },
  loyaltyBottom: {
    marginTop: 18,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  loyaltyPoints: {
    fontFamily: Fonts.serif,
    fontSize: 36,
    lineHeight: 38,
    letterSpacing: -0.8,
    color: Colors.cream,
    marginTop: 4,
    includeFontPadding: false,
  },
  loyaltyToNext: { fontFamily: Fonts.sans, fontSize: 11, color: 'rgba(244,237,224,0.65)', marginTop: 4 },
  loyaltyToNextItalic: { fontFamily: Fonts.serifItalic },
  barChart: { flexDirection: 'row', alignItems: 'flex-end', gap: 1.5, height: 36 },
  barChartTick: { backgroundColor: Colors.cream },

  budgetCard: {
    backgroundColor: Colors.paper,
    borderWidth: 1,
    borderColor: Colors.line,
    borderRadius: Radius.lg,
    padding: 14,
  },
  budgetTopRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  budgetCaption: { fontFamily: Fonts.sans, fontSize: 12, color: Colors.muted },
  budgetCaptionStrong: { fontFamily: Fonts.sansSemibold, color: Colors.ink },
  budgetTrack: {
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.lineSoft,
    overflow: 'hidden',
  },
  budgetFill: { width: '62%', height: '100%', backgroundColor: Colors.accent, borderRadius: 4 },
  budgetFooter: { fontFamily: Fonts.sans, fontSize: 11, color: Colors.muted, marginTop: 6 },

  chipCard: {
    backgroundColor: Colors.paper,
    borderWidth: 1,
    borderColor: Colors.line,
    borderRadius: Radius.lg,
    padding: 14,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: Radius.pill,
  },
  chipActive: { backgroundColor: Colors.ink },
  chipInactive: { backgroundColor: 'transparent', borderWidth: 1, borderColor: Colors.line },
  chipCheck: { color: Colors.cream, fontSize: 12, marginRight: -2 },
  chipText: { fontFamily: Fonts.sansMedium, fontSize: 12 },
  chipTextActive: { color: Colors.cream },
  chipTextInactive: { color: Colors.muted },

  signOut: {
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: Colors.line,
    borderRadius: 12,
    alignItems: 'center',
  },
  signOutText: { fontFamily: Fonts.sansMedium, fontSize: 13.5, color: Colors.danger },

  paymentsCard: {
    backgroundColor: Colors.paper,
    borderWidth: 1,
    borderColor: Colors.line,
    borderRadius: Radius.xl,
    overflow: 'hidden',
  },
  paymentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: Colors.line,
  },
  paymentRowDefault: { backgroundColor: 'rgba(45,90,61,0.04)' },
  paymentRowLast: { borderBottomWidth: 0 },
  cardChip: {
    width: 44,
    height: 30,
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardChipText: { fontFamily: Fonts.sansBold, fontSize: 11 },
  paymentLine: { fontFamily: Fonts.sansMedium, fontSize: 14, color: Colors.ink },
  paymentMeta: { fontFamily: Fonts.sans, fontSize: 11, color: Colors.muted, marginTop: 2 },
  defaultBadge: {
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 4,
    backgroundColor: Colors.accent,
  },
  defaultBadgeText: {
    fontFamily: Fonts.sansBold,
    fontSize: 9,
    letterSpacing: 1,
    color: Colors.cream,
  },
  addPaymentBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderTopWidth: 1,
    borderTopColor: Colors.line,
  },
  addPaymentText: { fontFamily: Fonts.sansMedium, fontSize: 13, color: Colors.amber },

  contactBtn: {
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: Colors.line,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 22,
  },
  contactBtnText: { fontFamily: Fonts.sansMedium, fontSize: 13.5, color: Colors.muted },
});
