import { useEffect, useState } from 'react';
import { Modal, View, Text, Pressable, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { Plus } from 'phosphor-react-native';
import { router } from 'expo-router';
import { Colors, Fonts, Radius, Shadows } from '../../constants/theme';
import { listsApi } from '../../api';
import { formatPrice } from '../../lib/formatPrice';
import type { ShoppingListSummary } from '../../types';

interface Props {
  visible: boolean;
  onClose: () => void;
  /** Header context — "Olive oil · $12.99" appears under the title. */
  productName: string;
  productPrice: number;
  currencyCode?: string;
  /** Barcode of the product being added to the list. */
  barcode?: string;
  /** Fires when the user picks an existing list (legacy callback, kept for callers that don't need the add logic). */
  onPickList?: (listId: string) => void;
  /** Fires when the user taps "Start a new list". */
  onStartNewList?: () => void;
}

export function ListPickerSheet({
  visible,
  onClose,
  productName,
  productPrice,
  currencyCode = 'USD',
  barcode,
  onPickList,
  onStartNewList,
}: Props) {
  const offset = useSharedValue(600);
  const scrim = useSharedValue(0);

  const [lists, setLists] = useState<ShoppingListSummary[]>([]);
  const [listsLoading, setListsLoading] = useState(false);
  const [addingToList, setAddingToList] = useState<number | null>(null);
  const [rowError, setRowError] = useState<number | null>(null);

  // Fetch lists whenever the sheet opens.
  useEffect(() => {
    if (!visible) return;
    let cancelled = false;
    setListsLoading(true);
    setRowError(null);
    listsApi
      .list()
      .then((data) => {
        if (!cancelled) setLists(data);
      })
      .catch(() => undefined)
      .finally(() => {
        if (!cancelled) setListsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [visible]);

  useEffect(() => {
    if (visible) {
      offset.value = withSpring(0, { damping: 22, stiffness: 220 });
      scrim.value = withTiming(1, { duration: 160 });
    } else {
      offset.value = withTiming(600, { duration: 180 });
      scrim.value = withTiming(0, { duration: 140 });
    }
  }, [visible, offset, scrim]);

  const sheetStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: offset.value }],
  }));
  const scrimStyle = useAnimatedStyle(() => ({ opacity: scrim.value }));

  const currency = formatPrice(productPrice, currencyCode);

  const handlePickList = async (list: ShoppingListSummary) => {
    // Legacy path: if barcode is not provided, just fire the callback.
    if (!barcode) {
      onPickList?.(String(list.id));
      onClose();
      return;
    }

    setAddingToList(list.id);
    setRowError(null);
    try {
      const detail = await listsApi.get(list.id);
      const existing = detail.items.findIndex((item) => item.barcode === barcode);
      const newItems =
        existing >= 0
          ? detail.items.map((item, i) =>
              i === existing ? { ...item, qty: item.qty + 1 } : item,
            )
          : [...detail.items, { barcode, qty: 1 }];
      await listsApi.update(list.id, { items: newItems });
      onPickList?.(String(list.id));
      onClose();
    } catch {
      setRowError(list.id);
    } finally {
      setAddingToList(null);
    }
  };

  const handleStartNewList = () => {
    onStartNewList?.();
    onClose();
    router.push('/(tabs)/lists');
  };

  return (
    <Modal transparent visible={visible} animationType="none" onRequestClose={onClose}>
      <View style={styles.root}>
        <Animated.View style={[styles.scrim, scrimStyle]}>
          <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        </Animated.View>

        <Animated.View style={[styles.sheet, sheetStyle]}>
          <View style={styles.grabber} />
          <Text style={styles.title}>
            Add to which <Text style={styles.titleItalic}>list?</Text>
          </Text>
          <Text style={styles.subtitle}>
            {productName} · {currency}
          </Text>

          <ScrollView showsVerticalScrollIndicator={false} style={styles.scroll}>
            {listsLoading ? (
              <ActivityIndicator color={Colors.amber} style={{ marginVertical: 20 }} />
            ) : lists.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyTitle}>No lists yet</Text>
                <Pressable style={styles.createListBtn} onPress={handleStartNewList}>
                  <Plus size={13} color={Colors.ink} weight="bold" />
                  <Text style={styles.createListBtnText}>Create a list</Text>
                </Pressable>
              </View>
            ) : (
              lists.map((list) => {
                const isAdding = addingToList === list.id;
                const hasError = rowError === list.id;
                return (
                  <Pressable
                    key={list.id}
                    style={[styles.listCard, (isAdding || addingToList !== null) && styles.listCardDisabled]}
                    onPress={() => !addingToList && handlePickList(list)}
                    disabled={addingToList !== null}
                  >
                    <View style={styles.listBody}>
                      <Text style={styles.listName}>{list.name}</Text>
                      <Text style={styles.listMeta}>
                        {list.itemCount} item{list.itemCount === 1 ? '' : 's'}
                        {hasError ? ' · Failed to add — try again' : ''}
                      </Text>
                    </View>
                    <View style={[styles.addCircle, hasError && styles.addCircleError]}>
                      {isAdding ? (
                        <ActivityIndicator size="small" color={Colors.cream} />
                      ) : (
                        <Plus size={13} color={Colors.cream} weight="bold" />
                      )}
                    </View>
                  </Pressable>
                );
              })
            )}

            {lists.length > 0 && (
              <Pressable style={styles.newListBtn} onPress={handleStartNewList}>
                <View style={styles.newListIcon}>
                  <Plus size={13} color={Colors.ink} weight="bold" />
                </View>
                <Text style={styles.newListLabel}>Start a new list</Text>
              </Pressable>
            )}
          </ScrollView>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, justifyContent: 'flex-end' },
  scrim: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(21,20,15,0.45)',
  },
  sheet: {
    backgroundColor: Colors.cream,
    borderTopLeftRadius: Radius.sheetLg,
    borderTopRightRadius: Radius.sheetLg,
    paddingHorizontal: 22,
    paddingTop: 14,
    paddingBottom: 32,
    maxHeight: '78%',
    ...Shadows.raised,
  },
  grabber: {
    width: 40,
    height: 4,
    backgroundColor: Colors.line,
    borderRadius: 999,
    alignSelf: 'center',
    marginBottom: 16,
  },
  title: {
    fontFamily: Fonts.serif,
    fontSize: 26,
    lineHeight: 30,
    letterSpacing: -0.6,
    color: Colors.ink,
    includeFontPadding: false,
  },
  titleItalic: { fontFamily: Fonts.serifItalic, color: Colors.amber },
  subtitle: {
    fontFamily: Fonts.sans,
    fontSize: 12.5,
    color: Colors.muted,
    marginTop: 6,
    marginBottom: 18,
  },
  scroll: { flexGrow: 0 },
  listCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: Colors.paper,
    borderRadius: Radius.lg,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: Colors.lineFaint,
    ...Shadows.card,
  },
  listCardDisabled: { opacity: 0.6 },
  listBody: { flex: 1, minWidth: 0 },
  listName: {
    fontFamily: Fonts.serif,
    fontSize: 18,
    lineHeight: 22,
    letterSpacing: -0.3,
    color: Colors.ink,
    includeFontPadding: false,
  },
  listMeta: {
    fontFamily: Fonts.sans,
    fontSize: 11.5,
    color: Colors.muted,
    marginTop: 2,
  },
  addCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: Colors.ink,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addCircleError: {
    backgroundColor: Colors.danger,
  },
  emptyState: { paddingVertical: 24, alignItems: 'center', gap: 14 },
  emptyTitle: {
    fontFamily: Fonts.serif,
    fontSize: 18,
    color: Colors.ink,
    letterSpacing: -0.3,
  },
  createListBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.ink,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: Radius.lg,
  },
  createListBtnText: {
    fontFamily: Fonts.sansMedium,
    fontSize: 13,
    color: Colors.cream,
  },
  newListBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderWidth: 1.5,
    borderColor: Colors.line,
    borderStyle: 'dashed',
    borderRadius: Radius.lg,
    marginTop: 4,
  },
  newListIcon: {
    width: 26,
    height: 26,
    borderRadius: 8,
    backgroundColor: 'rgba(21,20,15,0.06)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  newListLabel: {
    fontFamily: Fonts.sansMedium,
    fontSize: 13,
    color: Colors.ink,
  },
});
