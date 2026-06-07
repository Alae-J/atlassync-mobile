import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Plus, CaretRight } from 'phosphor-react-native';
import { router } from 'expo-router';
import { Colors, Fonts, Radius, Shadows, TabBarHeight } from '../../src/constants/theme';
import { savedLists, productById, type SavedList } from '../../src/data/catalog';
import { formatPrice } from '../../src/lib/formatPrice';

export default function ListsScreen() {
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.root}>
      <ScrollView
        contentContainerStyle={[
          styles.scroll,
          { paddingTop: insets.top + 12, paddingBottom: TabBarHeight + insets.bottom + 24 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.masthead}>
          <Text style={styles.eyebrow}>YOUR LISTS</Text>
          <Text style={styles.title}>
            What's <Text style={styles.titleItalic}>cooking</Text>?
          </Text>
          <Text style={styles.subtitle}>
            {savedLists.length} lists · pick one to take to the store
          </Text>
        </View>

        <Pressable style={styles.newCta} onPress={() => router.push('/list-editor')}>
          <View style={styles.newCtaLeft}>
            <View style={styles.newCtaPlus}>
              <Plus size={14} color={Colors.ink} weight="bold" />
            </View>
            <Text style={styles.newCtaText}>Start a new list</Text>
          </View>
          <CaretRight size={14} color="rgba(244,237,224,0.6)" weight="bold" />
        </Pressable>

        <View style={styles.listsCol}>
          {savedLists.map((list) => (
            <ListRow key={list.id} list={list} />
          ))}
        </View>

        <Text style={styles.footnote}>Lists never expire — they wait for you.</Text>
      </ScrollView>
    </View>
  );
}

function ListRow({ list }: { list: SavedList }) {
  const firstEmoji = list.items[0] ? productById(list.items[0])?.emoji : '🛒';
  return (
    <Pressable
      style={styles.listRow}
      onPress={() => router.push({ pathname: '/list-editor', params: { id: list.id } })}
    >
      <View style={styles.avatarWrap}>
        <Text style={styles.avatarEmoji}>{firstEmoji}</Text>
        <View style={styles.avatarBadge}>
          <Text style={styles.avatarBadgeText}>{list.count}</Text>
        </View>
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.listName}>{list.name}</Text>
        <View style={styles.metaRow}>
          <Text style={styles.metaText}>Created {list.created}</Text>
          <View style={styles.metaDot} />
          <Text style={styles.metaItalic}>{list.lastUsed}</Text>
        </View>
        <Text style={styles.estText}>est. {list.estimate != null ? formatPrice(list.estimate) : '—'}</Text>
      </View>
      <CaretRight size={14} color={Colors.muted} weight="bold" />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.background },
  scroll: { paddingHorizontal: 22 },

  masthead: { paddingTop: 8, paddingBottom: 6 },
  eyebrow: {
    fontFamily: Fonts.sansSemibold,
    fontSize: 11,
    letterSpacing: 1.6,
    color: Colors.muted,
  },
  title: {
    fontFamily: Fonts.serif,
    fontSize: 38,
    lineHeight: 42,
    letterSpacing: -1.1,
    color: Colors.ink,
    marginTop: 6,
  },
  titleItalic: { fontFamily: Fonts.serifItalic },
  subtitle: { fontFamily: Fonts.sans, fontSize: 13, color: Colors.muted, marginTop: 8 },

  newCta: {
    marginTop: 18,
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: Colors.ink,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    ...Shadows.cta,
  },
  newCtaLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  newCtaPlus: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.amber,
    alignItems: 'center',
    justifyContent: 'center',
  },
  newCtaText: { fontFamily: Fonts.sansMedium, fontSize: 14, color: Colors.cream },

  listsCol: { marginTop: 20, gap: 10 },
  listRow: {
    padding: 16,
    backgroundColor: Colors.paper,
    borderWidth: 1,
    borderColor: Colors.line,
    borderRadius: Radius.xl,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    ...Shadows.card,
  },
  avatarWrap: {
    width: 56,
    height: 56,
    borderRadius: 12,
    backgroundColor: Colors.tile,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarEmoji: { fontSize: 26 },
  avatarBadge: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    backgroundColor: Colors.ink,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: Radius.pill,
    borderWidth: 2,
    borderColor: Colors.paper,
  },
  avatarBadgeText: {
    fontFamily: Fonts.sansBold,
    fontSize: 10,
    color: Colors.cream,
  },
  listName: {
    fontFamily: Fonts.serif,
    fontSize: 22,
    lineHeight: 25,
    letterSpacing: -0.4,
    color: Colors.ink,
  },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4 },
  metaText: { fontFamily: Fonts.sans, fontSize: 11.5, color: Colors.muted },
  metaItalic: { fontFamily: Fonts.serifItalic, fontSize: 12, color: Colors.muted },
  metaDot: { width: 3, height: 3, borderRadius: 1.5, backgroundColor: Colors.muted },
  estText: { fontFamily: Fonts.sansMedium, fontSize: 12, color: Colors.ink, marginTop: 6 },

  footnote: {
    fontFamily: Fonts.serifItalic,
    fontSize: 11,
    color: Colors.muted,
    textAlign: 'center',
    marginTop: 24,
  },
});
