import { Slot, usePathname } from 'expo-router';
import { View } from 'react-native';
import { Colors } from '../../src/constants/theme';
import { TabBar, type TabKey } from '../../src/components/TabBar';

const PATH_TO_TAB: { match: string; key: TabKey }[] = [
  { match: '/lists', key: 'lists' },
  { match: '/orders', key: 'orders' },
  { match: '/account', key: 'account' },
  { match: '/home', key: 'home' },
];

function activeFromPath(pathname: string): TabKey {
  return PATH_TO_TAB.find((p) => pathname.includes(p.match))?.key ?? 'home';
}

export default function TabsLayout() {
  const pathname = usePathname();
  const active = activeFromPath(pathname);

  return (
    <View style={{ flex: 1, backgroundColor: Colors.cream }}>
      <Slot />
      <TabBar active={active} />
    </View>
  );
}
