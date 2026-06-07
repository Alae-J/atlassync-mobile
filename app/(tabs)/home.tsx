import { useEffect, useState } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Bell, MapPin, ArrowRight, QrCode, Plus, CaretRight, ShoppingBag, EnvelopeSimple, MagnifyingGlass } from 'phosphor-react-native';
import { router } from 'expo-router';
import { Colors, Fonts, Radius, Shadows, TabBarHeight } from '../../src/constants/theme';
import { savedLists, productById } from '../../src/data/catalog';
import { useAuth } from '../../src/context/AuthContext';
import { firstName } from '../../src/lib/userDisplay';
import { sessionsApi } from '../../src/api';
import type { SessionHistoryItem } from '../../src/types';
import { formatShortDate } from '../../src/lib/receiptDates';
import { formatPrice } from '../../src/lib/formatPrice';

type HeroState = 'default' | 'active';

const heroState: HeroState = 'default';

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const greetingName = firstName(user);

  const [recentShops, setRecentShops] = useState<SessionHistoryItem[]>([]);
  useEffect(() => {
    let cancelled = false;
    sessionsApi
      .history(3)
      .then((rows) => {
        if (!cancelled) setRecentShops(rows);
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <View style={styles.root}>
      <LinearGradient
        colors={['rgba(200,122,58,0.06)', 'transparent']}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 0.5 }}
        style={styles.bgWash}
        pointerEvents="none"
      />

      <ScrollView
        contentContainerStyle={[
          styles.scroll,
          { paddingTop: insets.top + 8, paddingBottom: TabBarHeight + insets.bottom + 24 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.greetingRow}>
          <View>
            <Text style={styles.eyebrow}>SATURDAY · 4 MAY</Text>
            <Text style={styles.greeting}>
              Hi, <Text style={styles.greetingItalic}>{greetingName}</Text>.
            </Text>
          </View>
          <View style={styles.headerActions}>
            <Pressable style={styles.headerChip} onPress={() => router.push('/search')}>
              <MagnifyingGlass size={16} color={Colors.ink} weight="regular" />
            </Pressable>
            <Pressable style={styles.headerChip}>
              <Bell size={16} color={Colors.ink} weight="regular" />
              <View style={styles.bellDot} />
            </Pressable>
          </View>
        </View>

        <View style={styles.storePill}>
          <MapPin size={11} color={Colors.accent} weight="fill" />
          <Text style={styles.storePillMuted}>Closest:</Text>
          <Text style={styles.storePillStrong}>Aldi · Mansoura</Text>
          <Text style={styles.storePillMuted}>· 1.2 km</Text>
        </View>

        {heroState === 'default' ? (
          user?.emailVerified ? <HeroDefault /> : <HeroVerifyEmail email={user?.email ?? null} />
        ) : (
          <HeroActive />
        )}

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>
              Your <Text style={styles.sectionTitleItalic}>lists</Text>
            </Text>
            <Pressable style={styles.sectionLink} onPress={() => router.push('/(tabs)/lists')}>
              <Text style={styles.sectionLinkText}>See all</Text>
              <CaretRight size={11} color={Colors.muted} weight="bold" />
            </Pressable>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.railRow}
          >
            {savedLists.map((list, i) => (
              <Pressable
                key={list.id}
                style={styles.listCard}
                onPress={() => router.push({ pathname: '/list-editor', params: { id: list.id } })}
              >
                {i === 0 ? (
                  <LinearGradient
                    colors={[Colors.tile, Colors.tileDeep]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={StyleSheet.absoluteFill as never}
                  />
                ) : (
                  <View style={[StyleSheet.absoluteFill, { backgroundColor: Colors.card }]} />
                )}
                <View style={styles.listEmojis}>
                  {list.items.slice(0, 4).map((id) => (
                    <View key={id} style={styles.emojiTile}>
                      <Text style={styles.emojiText}>{productById(id)?.emoji}</Text>
                    </View>
                  ))}
                </View>
                <Text style={styles.listName}>{list.name}</Text>
                <Text style={styles.listMeta}>
                  {list.count} items · {list.lastUsed}
                </Text>
              </Pressable>
            ))}
            <Pressable
              style={styles.newListCard}
              onPress={() => router.push('/list-editor')}
            >
              <View style={styles.newListIcon}>
                <Plus size={14} color={Colors.ink} weight="bold" />
              </View>
              <Text style={styles.newListLabel}>New list</Text>
            </Pressable>
          </ScrollView>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>
              Recent <Text style={styles.sectionTitleItalic}>shops</Text>
            </Text>
            <Pressable style={styles.sectionLink} onPress={() => router.push('/(tabs)/orders')}>
              <Text style={styles.sectionLinkText}>See all</Text>
              <CaretRight size={11} color={Colors.muted} weight="bold" />
            </Pressable>
          </View>
          <View>
            {recentShops.map((shop) => (
              <Pressable
                key={shop.sessionId}
                style={styles.shopRow}
                onPress={() =>
                  router.push({ pathname: '/order/[id]', params: { id: shop.sessionId } })
                }
              >
                <View style={styles.shopIcon}>
                  <ShoppingBag size={14} color={Colors.muted} weight="regular" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.shopDate}>{formatShortDate(shop.createdAt)}</Text>
                  <Text style={styles.shopMeta}>{shop.itemCount ?? 0} items</Text>
                </View>
                <Text style={styles.shopAmount}>{formatPrice(shop.totalAmount ?? 0)}</Text>
              </Pressable>
            ))}
            {recentShops.length === 0 && (
              <Text style={styles.shopEmpty}>No trips yet. Your first receipt lands here.</Text>
            )}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

function HeroDefault() {
  return (
    <View style={styles.heroDefault}>
      <LinearGradient
        colors={['rgba(200,122,58,0.18)', 'transparent']}
        start={{ x: 1, y: 0 }}
        end={{ x: 0.4, y: 0.6 }}
        style={StyleSheet.absoluteFill as never}
      />
      <Text style={styles.heroEyebrow}>QUICK START</Text>
      <Text style={styles.heroTitle}>Start a</Text>
      <Text style={[styles.heroTitle, styles.heroTitleItalic]}>shopping session.</Text>
      <Text style={styles.heroDesc}>Show your QR at the gate. Skip the line on the way out.</Text>
      <Pressable style={styles.heroCta} onPress={() => router.push('/shop/arrive')}>
        <QrCode size={16} color={Colors.ink} weight="regular" />
        <Text style={styles.heroCtaText}>Get my QR</Text>
      </Pressable>
    </View>
  );
}

function HeroVerifyEmail({ email }: { email: string | null }) {
  return (
    <View style={styles.heroDefault}>
      <LinearGradient
        colors={['rgba(200,122,58,0.18)', 'transparent']}
        start={{ x: 1, y: 0 }}
        end={{ x: 0.4, y: 0.6 }}
        style={StyleSheet.absoluteFill as never}
      />
      <Text style={styles.heroEyebrow}>ONE STEP LEFT</Text>
      <Text style={styles.heroTitle}>Verify your</Text>
      <Text style={[styles.heroTitle, styles.heroTitleItalic]}>email first.</Text>
      <Text style={styles.heroDesc}>
        Sessions unlock once {email ?? 'your email'} is confirmed. Takes about ten seconds.
      </Text>
      <Pressable style={styles.heroCta} onPress={() => router.push('/auth/verify-email')}>
        <EnvelopeSimple size={16} color={Colors.ink} weight="regular" />
        <Text style={styles.heroCtaText}>Verify now</Text>
      </Pressable>
    </View>
  );
}

function HeroActive() {
  return (
    <View style={styles.heroActiveWrap}>
      <LinearGradient
        colors={[Colors.accentDeep, Colors.accent]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill as never}
      />
      <Text style={styles.heroActiveEyebrow}>SHOPPING NOW</Text>
      <Text style={styles.heroActiveTitle}>
        Aldi · <Text style={styles.heroActiveTitleItalic}>Mansoura</Text>
      </Text>
      <Text style={styles.heroActiveSub}>Started 14 minutes ago</Text>
      <View style={styles.statsRow}>
        <View>
          <Text style={styles.statsLabel}>SCANNED</Text>
          <Text style={styles.statsValue}>7 items</Text>
        </View>
        <View style={styles.statsDivider} />
        <View>
          <Text style={styles.statsLabel}>RUNNING</Text>
          <Text style={styles.statsValue}>$23.40</Text>
        </View>
      </View>
      <Pressable style={styles.resumeBtn} onPress={() => router.push('/shop/scan')}>
        <Text style={styles.resumeBtnText}>Resume session</Text>
        <ArrowRight size={14} color={Colors.ink} weight="bold" />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.cream },
  bgWash: { position: 'absolute', top: 0, left: 0, right: 0, height: 280 },
  scroll: { paddingHorizontal: 22 },

  greetingRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  eyebrow: {
    fontFamily: Fonts.sansSemibold,
    fontSize: 11,
    letterSpacing: 1.4,
    color: Colors.muted,
  },
  greeting: {
    fontFamily: Fonts.serif,
    fontSize: 30,
    lineHeight: 35,
    letterSpacing: -0.8,
    color: Colors.ink,
    marginTop: 6,
  },
  greetingItalic: { fontFamily: Fonts.serifItalic, color: Colors.amber },
  headerActions: { flexDirection: 'row', gap: 8 },
  headerChip: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.line,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.card,
  },
  bellDot: {
    position: 'absolute',
    top: 8,
    right: 9,
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: Colors.amber,
    borderWidth: 2,
    borderColor: Colors.card,
  },

  storePill: {
    marginTop: 16,
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.line,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: Radius.pill,
  },
  storePillMuted: { fontFamily: Fonts.sans, fontSize: 12, color: Colors.muted },
  storePillStrong: { fontFamily: Fonts.sansMedium, fontSize: 12, color: Colors.ink },

  heroDefault: {
    marginTop: 24,
    backgroundColor: Colors.ink,
    borderRadius: 22,
    padding: 22,
    overflow: 'hidden',
    ...Shadows.cta,
  },
  heroEyebrow: {
    fontFamily: Fonts.sansSemibold,
    fontSize: 11,
    letterSpacing: 1.4,
    color: 'rgba(244,237,224,0.6)',
  },
  heroTitle: {
    fontFamily: Fonts.serif,
    fontSize: 36,
    lineHeight: 40,
    letterSpacing: -1,
    color: Colors.cream,
    marginTop: 8,
  },
  heroTitleItalic: { fontFamily: Fonts.serifItalic, color: Colors.amber, marginTop: 0 },
  heroDesc: {
    fontFamily: Fonts.sans,
    fontSize: 12.5,
    color: 'rgba(244,237,224,0.7)',
    marginTop: 10,
    lineHeight: 17.5,
    maxWidth: 220,
  },
  heroCta: {
    marginTop: 18,
    height: 50,
    borderRadius: 12,
    backgroundColor: Colors.amber,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    ...Shadows.amberCta,
  },
  heroCtaText: { fontFamily: Fonts.sansSemibold, fontSize: 14.5, color: Colors.ink },

  heroActiveWrap: {
    marginTop: 24,
    borderRadius: 22,
    padding: 22,
    overflow: 'hidden',
    ...Shadows.cta,
  },
  heroActiveEyebrow: {
    fontFamily: Fonts.sansSemibold,
    fontSize: 11,
    letterSpacing: 1.4,
    color: 'rgba(244,237,224,0.7)',
  },
  heroActiveTitle: {
    fontFamily: Fonts.serif,
    fontSize: 36,
    lineHeight: 40,
    letterSpacing: -1,
    color: Colors.cream,
    marginTop: 6,
  },
  heroActiveTitleItalic: { fontFamily: Fonts.serifItalic },
  heroActiveSub: {
    fontFamily: Fonts.sans,
    fontSize: 12,
    color: 'rgba(244,237,224,0.65)',
    marginTop: 6,
  },
  statsRow: { flexDirection: 'row', gap: 16, marginTop: 16, alignItems: 'center' },
  statsLabel: {
    fontFamily: Fonts.sansSemibold,
    fontSize: 10,
    letterSpacing: 1,
    color: 'rgba(244,237,224,0.6)',
  },
  statsValue: { fontFamily: Fonts.serif, fontSize: 24, color: Colors.cream, marginTop: 2 },
  statsDivider: { width: 1, alignSelf: 'stretch', backgroundColor: 'rgba(255,255,255,0.18)' },
  resumeBtn: {
    marginTop: 18,
    height: 46,
    borderRadius: 12,
    backgroundColor: Colors.cream,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    ...Shadows.card,
  },
  resumeBtnText: { fontFamily: Fonts.sansSemibold, fontSize: 14, color: Colors.ink },

  section: { marginTop: 26 },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: 12,
  },
  sectionTitle: { fontFamily: Fonts.serif, fontSize: 22, letterSpacing: -0.4, color: Colors.ink },
  sectionTitleItalic: { fontFamily: Fonts.serifItalic },
  sectionLink: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  sectionLinkText: { fontFamily: Fonts.sansMedium, fontSize: 12, color: Colors.muted },

  railRow: { gap: 10, paddingRight: 22 },
  listCard: {
    width: 180,
    minHeight: 124,
    borderRadius: 16,
    padding: 14,
    overflow: 'hidden',
    ...Shadows.card,
  },
  listEmojis: { flexDirection: 'row', gap: 3, marginBottom: 12 },
  emojiTile: {
    width: 26,
    height: 26,
    borderRadius: 7,
    backgroundColor: 'rgba(255,255,255,0.7)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emojiText: { fontSize: 14 },
  listName: {
    fontFamily: Fonts.serif,
    fontSize: 18,
    lineHeight: 20,
    letterSpacing: -0.3,
    color: Colors.ink,
  },
  listMeta: { fontFamily: Fonts.sans, fontSize: 11.5, color: Colors.muted, marginTop: 6 },
  newListCard: {
    width: 130,
    minHeight: 124,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1.5,
    borderColor: Colors.line,
    borderStyle: 'dashed',
    justifyContent: 'space-between',
  },
  newListIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.line,
    alignItems: 'center',
    justifyContent: 'center',
  },
  newListLabel: { fontFamily: Fonts.sansMedium, fontSize: 13, color: Colors.ink },

  shopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: Colors.card,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: Colors.lineFaint,
  },
  shopIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: Colors.cream,
    alignItems: 'center',
    justifyContent: 'center',
  },
  shopDate: { fontFamily: Fonts.sansMedium, fontSize: 13.5, color: Colors.ink },
  shopEmpty: {
    fontFamily: Fonts.sans,
    fontSize: 12.5,
    color: Colors.muted,
    paddingVertical: 14,
  },
  shopMeta: { fontFamily: Fonts.sans, fontSize: 11.5, color: Colors.muted, marginTop: 2 },
  shopAmount: { fontFamily: Fonts.serif, fontSize: 18, letterSpacing: -0.3, color: Colors.ink },
});
