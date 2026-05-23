import { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Pressable, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { ShoppingBag } from 'phosphor-react-native';
import { Colors, Fonts, Radius, Shadows, TabBarHeight } from '../../src/constants/theme';
import { sessionsApi } from '../../src/api';
import type { SessionHistoryItem } from '../../src/types';
import { formatShortDate } from '../../src/lib/receiptDates';

const STORE_NAMES: Record<number, string> = { 1: 'Aldi · Mansoura' };

export default function OrdersScreen() {
  const insets = useSafeAreaInsets();
  const [history, setHistory] = useState<SessionHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    sessionsApi
      .history()
      .then((rows) => {
        if (!cancelled) setHistory(rows);
      })
      .catch(() => {
        if (!cancelled) setHistory([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

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
          <Text style={styles.eyebrow}>YOUR ORDERS</Text>
          <Text style={styles.title}>
            Recent <Text style={styles.titleItalic}>shops</Text>
          </Text>
          <Text style={styles.subtitle}>
            {history.length === 0 && !loading
              ? 'No trips yet — your first one will land here.'
              : `${history.length} trip${history.length === 1 ? '' : 's'} · receipts archived automatically`}
          </Text>
        </View>

        {loading ? (
          <View style={styles.spinner}>
            <ActivityIndicator color={Colors.amber} />
          </View>
        ) : (
          <View style={styles.list}>
            {history.map((order) => (
              <Pressable
                key={order.sessionId}
                style={styles.row}
                onPress={() =>
                  router.push({ pathname: '/order/[id]', params: { id: order.sessionId } })
                }
              >
                <View style={styles.icon}>
                  <ShoppingBag size={16} color={Colors.muted} weight="regular" />
                </View>
                <View style={{ flex: 1, minWidth: 0 }}>
                  <Text style={styles.rowDate}>{formatShortDate(order.createdAt)}</Text>
                  <Text style={styles.rowMeta} numberOfLines={1}>
                    {STORE_NAMES[order.storeId] ?? `Store ${order.storeId}`}
                    {order.itemCount ? ` · ${order.itemCount} items` : ''}
                    {order.status !== 'COMPLETED' ? ` · ${labelFor(order.status)}` : ''}
                  </Text>
                </View>
                <Text style={styles.rowAmount}>
                  ${(order.totalAmount ?? 0).toFixed(2)}
                </Text>
              </Pressable>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

function labelFor(status: string): string {
  switch (status) {
    case 'CANCELLED':
      return 'cancelled';
    case 'CREATED':
    case 'ACTIVE':
      return 'in progress';
    case 'PAYING':
      return 'paying';
    default:
      return status.toLowerCase();
  }
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.background },
  scroll: { paddingHorizontal: 22 },

  masthead: { paddingTop: 8, paddingBottom: 18 },
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
    includeFontPadding: false,
  },
  titleItalic: { fontFamily: Fonts.serifItalic },
  subtitle: { fontFamily: Fonts.sans, fontSize: 13, color: Colors.muted, marginTop: 8 },

  spinner: { paddingVertical: 36, alignItems: 'center' },

  list: { gap: 8 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: Colors.paper,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.lineFaint,
    ...Shadows.card,
  },
  icon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: Colors.cream,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowDate: { fontFamily: Fonts.sansMedium, fontSize: 13.5, color: Colors.ink },
  rowMeta: { fontFamily: Fonts.sans, fontSize: 11.5, color: Colors.muted, marginTop: 2 },
  rowAmount: { fontFamily: Fonts.serif, fontSize: 18, letterSpacing: -0.3, color: Colors.ink },
});
