import { useCallback, useEffect, useRef } from 'react';
import { View, Pressable, StyleSheet, type LayoutChangeEvent } from 'react-native';
import Animated, {
  FadeIn,
  FadeOut,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { House, ClipboardText, ShoppingBag, User } from 'phosphor-react-native';
import { router } from 'expo-router';
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

const SPRING = { damping: 22, stiffness: 220, mass: 0.55 };
const ICON_FADE_MS = 240;

interface TabBarProps {
  active: TabKey;
}

export function TabBar({ active }: TabBarProps) {
  const insets = useSafeAreaInsets();

  const layoutsRef = useRef<Map<TabKey, { x: number; width: number }>>(new Map());
  const indicatorX = useSharedValue(0);
  const indicatorW = useSharedValue(0);
  const seededRef = useRef(false);

  useEffect(() => {
    const lay = layoutsRef.current.get(active);
    if (!lay) return;
    if (!seededRef.current) {
      indicatorX.value = lay.x;
      indicatorW.value = lay.width;
      seededRef.current = true;
    } else {
      indicatorX.value = withSpring(lay.x, SPRING);
      indicatorW.value = withSpring(lay.width, SPRING);
    }
  }, [active, indicatorX, indicatorW]);

  const reportLayout = useCallback(
    (key: TabKey, x: number, width: number) => {
      const prev = layoutsRef.current.get(key);
      layoutsRef.current.set(key, { x, width });
      if (key !== active) return;
      if (!seededRef.current) {
        indicatorX.value = x;
        indicatorW.value = width;
        seededRef.current = true;
        return;
      }
      if (!prev || prev.x !== x || prev.width !== width) {
        indicatorX.value = withSpring(x, SPRING);
        indicatorW.value = withSpring(width, SPRING);
      }
    },
    [active, indicatorX, indicatorW],
  );

  const indicatorStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: indicatorX.value }],
    width: indicatorW.value,
  }));

  return (
    <View pointerEvents="box-none" style={[styles.wrap, { bottom: Math.max(insets.bottom, 12) + 4 }]}>
      <View style={styles.pill}>
        <Animated.View pointerEvents="none" style={[styles.indicator, indicatorStyle]} />
        {TABS.map((tab) => (
          <TabButton
            key={tab.key}
            tab={tab}
            isActive={tab.key === active}
            onPress={() => router.replace(tab.href as never)}
            onLayout={reportLayout}
          />
        ))}
      </View>
    </View>
  );
}

interface TabButtonProps {
  tab: TabDef;
  isActive: boolean;
  onPress: () => void;
  onLayout: (key: TabKey, x: number, width: number) => void;
}

function TabButton({ tab, isActive, onPress, onLayout }: TabButtonProps) {
  const colorProgress = useSharedValue(isActive ? 1 : 0);

  useEffect(() => {
    colorProgress.value = withTiming(isActive ? 1 : 0, { duration: ICON_FADE_MS });
  }, [isActive, colorProgress]);

  const activeIconStyle = useAnimatedStyle(() => ({ opacity: colorProgress.value }));

  const handleLayout = (e: LayoutChangeEvent) => {
    const { x, width } = e.nativeEvent.layout;
    onLayout(tab.key, x, width);
  };

  const Icon = tab.Icon;

  return (
    <Pressable
      onPress={onPress}
      onLayout={handleLayout}
      style={[styles.tab, isActive && styles.tabActive]}
      android_ripple={{ color: 'rgba(200,122,58,0.18)', borderless: true }}
    >
      <View style={styles.iconWrap}>
        <Icon size={18} weight="regular" color={Colors.muted} />
        <Animated.View
          pointerEvents="none"
          style={[StyleSheet.absoluteFill, styles.iconWrap, activeIconStyle]}
        >
          <Icon size={18} weight="regular" color={Colors.amber} />
        </Animated.View>
      </View>
      {isActive && (
        <Animated.Text
          entering={FadeIn.duration(220).delay(80)}
          exiting={FadeOut.duration(120)}
          style={styles.tabLabel}
        >
          {tab.label}
        </Animated.Text>
      )}
    </Pressable>
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
  indicator: {
    position: 'absolute',
    top: 6,
    bottom: 6,
    left: 0,
    backgroundColor: 'rgba(200,122,58,0.14)',
    borderRadius: Radius.pill,
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
    paddingRight: 16,
  },
  iconWrap: {
    width: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabLabel: {
    fontFamily: Fonts.sansSemibold,
    fontSize: 13,
    color: Colors.amber,
    letterSpacing: -0.1,
  },
});
