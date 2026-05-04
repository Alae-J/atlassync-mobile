import { View, Pressable, Text, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { House, ClipboardText, ShoppingBag, User } from 'phosphor-react-native';
import { router, usePathname } from 'expo-router';
import { Colors, Fonts, Radius, Shadows } from '../constants/theme';

export type TabKey = 'home' | 'lists' | 'orders' | 'account';

interface TabDef {
  key: TabKey;
  label: string;
  href: string;
  Icon: typeof House;
}

const TABS: TabDef[] = [
  { key: 'home', label: 'Home', href: '/(tabs)/home', Icon: House },
  { key: 'lists', label: 'Lists', href: '/(tabs)/lists', Icon: ClipboardText },
  { key: 'orders', label: 'Orders', href: '/(tabs)/orders', Icon: ShoppingBag },
  { key: 'account', label: 'Account', href: '/(tabs)/account', Icon: User },
];

interface TabBarProps {
  active: TabKey;
}

export function TabBar({ active }: TabBarProps) {
  const insets = useSafeAreaInsets();
  return (
    <View pointerEvents="box-none" style={[styles.wrap, { bottom: Math.max(insets.bottom, 12) + 4 }]}>
      <View style={styles.pill}>
        {TABS.map((tab) => {
          const isActive = tab.key === active;
          const Icon = tab.Icon;
          return (
            <Pressable
              key={tab.key}
              onPress={() => router.replace(tab.href as never)}
              style={[styles.tab, isActive && styles.tabActive]}
              android_ripple={{ color: 'rgba(200,122,58,0.18)', borderless: true }}
            >
              <Icon size={18} weight="regular" color={isActive ? Colors.amber : Colors.muted} />
              {isActive && <Text style={styles.tabLabel}>{tab.label}</Text>}
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  pill: {
    backgroundColor: Colors.paper,
    borderRadius: Radius.pill,
    padding: 6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    borderWidth: 1,
    borderColor: Colors.line,
    ...Shadows.navBar,
  },
  tab: {
    height: 44,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderRadius: Radius.pill,
  },
  tabActive: {
    paddingLeft: 12,
    paddingRight: 16,
    backgroundColor: 'rgba(200,122,58,0.14)',
  },
  tabLabel: {
    fontFamily: Fonts.sansSemibold,
    fontSize: 13,
    color: Colors.amber,
    letterSpacing: -0.1,
  },
});
