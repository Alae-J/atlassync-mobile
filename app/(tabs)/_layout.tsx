import { Tabs } from 'expo-router';
import { Colors, Typography } from '../../src/constants/theme';

/**
 * Main tab navigation -- 5 tabs per design spec:
 * Cart | Scan | Map | Entry | Profile
 */
export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: Colors.charcoal,
          borderTopWidth: 0,
          height: 64,
          paddingBottom: 8,
          paddingTop: 8,
          elevation: 0,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: 0.15,
          shadowRadius: 20,
        },
        tabBarActiveTintColor: Colors.cyan,
        tabBarInactiveTintColor: Colors.textSecondary,
        tabBarLabelStyle: {
          fontFamily: 'DMSans_500Medium',
          fontSize: 11,
        },
      }}
    >
      <Tabs.Screen
        name="cart"
        options={{
          title: 'Cart',
          // Icon: ShoppingCart -- will add Phosphor icons when building real screens
        }}
      />
      <Tabs.Screen
        name="scan"
        options={{
          title: 'Scan',
          // Icon: ScanBarcode -- elevated center tab
        }}
      />
      <Tabs.Screen
        name="map"
        options={{
          title: 'Map',
          // Icon: MapTrifold
        }}
      />
      <Tabs.Screen
        name="entry"
        options={{
          title: 'Entry',
          // Icon: QrCode
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          // Icon: UserCircle
        }}
      />
    </Tabs>
  );
}
