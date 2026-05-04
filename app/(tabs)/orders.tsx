import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ShoppingBag } from 'phosphor-react-native';
import { Colors, Fonts, Radius, Shadows, TabBarHeight } from '../../src/constants/theme';
import { TabBar } from '../../src/components/TabBar';

const orders = [
  { date: 'Last Saturday', total: 42.18, items: 12, store: 'Aldi · Mansoura' },
  { date: 'Apr 24', total: 28.5, items: 8, store: 'Marina Foods' },
  { date: 'Apr 17', total: 51.3, items: 15, store: 'Aldi · Mansoura' },
  { date: 'Apr 12', total: 19.99, items: 4, store: 'Marina Foods' },
];

export default function OrdersScreen() {
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
          <Text style={styles.eyebrow}>YOUR ORDERS</Text>
          <Text style={styles.title}>
            Recent <Text style={styles.titleItalic}>shops</Text>
          </Text>
          <Text style={styles.subtitle}>
            {orders.length} orders this month · receipts archived automatically
          </Text>
        </View>

        <View style={styles.list}>
          {orders.map((order, i) => (
            <View key={i} style={styles.row}>
              <View style={styles.icon}>
                <ShoppingBag size={16} color={Colors.muted} weight="regular" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.rowDate}>{order.date}</Text>
                <Text style={styles.rowMeta}>
                  {order.store} · {order.items} items
                </Text>
              </View>
              <Text style={styles.rowAmount}>${order.total.toFixed(2)}</Text>
            </View>
          ))}
        </View>
      </ScrollView>

      <TabBar active="orders" />
    </View>
  );
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
