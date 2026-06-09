import { useCallback, useState } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet, ActivityIndicator, RefreshControl } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from 'expo-router';
import { Plus, CaretRight } from 'phosphor-react-native';
import { router } from 'expo-router';
import { Colors, Fonts, Radius, Shadows, TabBarHeight } from '../../src/constants/theme';
import { listsApi } from '../../src/api';
import { formatPrice } from '../../src/lib/formatPrice';
import { formatRelativeUpdated } from '../../src/lib/formatRelativeUpdated';
import type { ShoppingListSummary } from '../../src/types';

export default function ListsScreen() {
  const insets = useSafeAreaInsets();
  const [lists, setLists] = useState<ShoppingListSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [creating, setCreating] = useState(false);

  const fetchLists = useCallback(async (showRefresh = false) => {
    if (showRefresh) setRefreshing(true);
    else setLoading(true);
    try {
      const data = await listsApi.list();
      setLists(data);
    } catch {
      // leave current list in place on error
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchLists();
    }, [fetchLists]),
  );

  const handleNewList = async () => {
    if (creating) return;
    setCreating(true);
    try {
      const created = await listsApi.create({ name: 'New list', items: [] });
      router.push({ pathname: '/list-editor', params: { id: String(created.id) } });
    } catch {
      // silently fail — user stays on lists screen
    } finally {
      setCreating(false);
    }
  };

  return (
    <View style={styles.root}>
      <ScrollView
        contentContainerStyle={[
          styles.scroll,
          { paddingTop: insets.top + 12, paddingBottom: TabBarHeight + insets.bottom + 24 },
        ]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => fetchLists(true)}
            tintColor={Colors.amber}
          />
        }
      >
        <View style={styles.masthead}>
          <Text style={styles.eyebrow}>YOUR LISTS</Text>
          <Text style={styles.title}>
            What's <Text style={styles.titleItalic}>cooking</Text>?
          </Text>
          <Text style={styles.subtitle}>
            {loading ? 'Loading…' : `${lists.length} list${lists.length === 1 ? '' : 's'} · pick one to take to the store`}
          </Text>
        </View>

        <Pressable style={[styles.newCta, creating && styles.newCtaDisabled]} onPress={handleNewList} disabled={creating}>
          <View style={styles.newCtaLeft}>
            <View style={styles.newCtaPlus}>
              {creating
                ? <ActivityIndicator size="small" color={Colors.ink} />
                : <Plus size={14} color={Colors.ink} weight="bold" />
              }
            </View>
            <Text style={styles.newCtaText}>Start a new list</Text>
          </View>
          <CaretRight size={14} color="rgba(244,237,224,0.6)" weight="bold" />
        </Pressable>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator color={Colors.amber} />
          </View>
        ) : lists.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyTitle}>No lists yet</Text>
            <Text style={styles.emptyBody}>Tap "Start a new list" to create your first shopping list.</Text>
          </View>
        ) : (
          <View style={styles.listsCol}>
            {lists.map((list) => (
              <ListRow key={list.id} list={list} />
            ))}
          </View>
        )}

        <Text style={styles.footnote}>Lists never expire — they wait for you.</Text>
      </ScrollView>
    </View>
  );
}

function ListRow({ list }: { list: ShoppingListSummary }) {
  return (
    <Pressable
      style={styles.listRow}
      onPress={() => router.push({ pathname: '/list-editor', params: { id: String(list.id) } })}
    >
      <View style={styles.avatarWrap}>
        <Text style={styles.avatarEmoji}>🛒</Text>
        <View style={styles.avatarBadge}>
          <Text style={styles.avatarBadgeText}>{list.itemCount}</Text>
        </View>
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.listName}>{list.name}</Text>
        <View style={styles.metaRow}>
          <Text style={styles.metaText}>Updated {formatRelativeUpdated(list.updatedAt)}</Text>
        </View>
        {list.totalEstimate != null && (
          <Text style={styles.estText}>est. {formatPrice(list.totalEstimate)}</Text>
        )}
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
  newCtaDisabled: { opacity: 0.6 },
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

  loadingContainer: { paddingVertical: 60, alignItems: 'center' },
  emptyContainer: { paddingVertical: 40, alignItems: 'center', paddingHorizontal: 16 },
  emptyTitle: {
    fontFamily: Fonts.serif,
    fontSize: 22,
    letterSpacing: -0.4,
    color: Colors.ink,
    marginBottom: 8,
  },
  emptyBody: {
    fontFamily: Fonts.sans,
    fontSize: 13,
    color: Colors.muted,
    textAlign: 'center',
    lineHeight: 20,
  },

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
  estText: { fontFamily: Fonts.sansMedium, fontSize: 12, color: Colors.ink, marginTop: 6 },

  footnote: {
    fontFamily: Fonts.serifItalic,
    fontSize: 11,
    color: Colors.muted,
    textAlign: 'center',
    marginTop: 24,
  },
});
