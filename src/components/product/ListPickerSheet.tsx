import { useEffect } from 'react';
import { Modal, View, Text, Pressable, StyleSheet, ScrollView } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { Plus } from 'phosphor-react-native';
import { Colors, Fonts, Radius, Shadows } from '../../constants/theme';
import { savedLists, productById } from '../../data/catalog';

interface Props {
  visible: boolean;
  onClose: () => void;
  /** Header context — "Olive oil · $12.99" appears under the title. */
  productName: string;
  productPrice: number;
  currencyCode?: string;
  /** Fires when the user picks an existing list. */
  onPickList: (listId: string) => void;
  /** Fires when the user taps "Start a new list". */
  onStartNewList: () => void;
}

/**
 * "Add to which list?" half-sheet. Rises from the bottom over a blurred scrim
 * whenever a "+" tap fires while the user has no active shopping session.
 * Backed by the static {@code savedLists} catalog for now — once lists CRUD
 * lands on the backend this swaps to a live fetch.
 */
export function ListPickerSheet({
  visible,
  onClose,
  productName,
  productPrice,
  currencyCode = 'USD',
  onPickList,
  onStartNewList,
}: Props) {
  const offset = useSharedValue(600);
  const scrim = useSharedValue(0);

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

  const currency = formatCurrency(productPrice, currencyCode);

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
            {savedLists.map((list) => (
              <Pressable
                key={list.id}
                style={styles.listCard}
                onPress={() => onPickList(list.id)}
              >
                <View style={styles.emojiStack}>
                  {list.items.slice(0, 3).map((id) => {
                    const product = productById(id);
                    return (
                      <View key={id} style={styles.emojiTile}>
                        <Text style={styles.emoji}>{product?.emoji ?? '📦'}</Text>
                      </View>
                    );
                  })}
                </View>
                <View style={styles.listBody}>
                  <Text style={styles.listName}>{list.name}</Text>
                  <Text style={styles.listMeta}>
                    {list.count} items · {list.lastUsed}
                  </Text>
                </View>
                <View style={styles.addCircle}>
                  <Plus size={13} color={Colors.cream} weight="bold" />
                </View>
              </Pressable>
            ))}

            <Pressable style={styles.newListBtn} onPress={onStartNewList}>
              <View style={styles.newListIcon}>
                <Plus size={13} color={Colors.ink} weight="bold" />
              </View>
              <Text style={styles.newListLabel}>Start a new list</Text>
            </Pressable>
          </ScrollView>
        </Animated.View>
      </View>
    </Modal>
  );
}

function formatCurrency(amount: number, code: string): string {
  const symbol = code === 'USD' ? '$' : code === 'EUR' ? '€' : code === 'EGP' ? 'EGP ' : `${code} `;
  return `${symbol}${amount.toFixed(2)}`;
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
  emojiStack: { flexDirection: 'row', gap: 2 },
  emojiTile: {
    width: 30,
    height: 30,
    borderRadius: 8,
    backgroundColor: Colors.tile,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emoji: { fontSize: 16, includeFontPadding: false },
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
