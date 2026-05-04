import { useEffect } from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
import Animated, {
  FadeIn,
  FadeOut,
  LinearTransition,
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
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

const PILL_TRANSITION = LinearTransition.springify().damping(22).stiffness(220).mass(0.55);
const TINT_DURATION = 240;
const ACTIVE_BG = 'rgba(200,122,58,0.14)';
const INACTIVE_BG = 'rgba(200,122,58,0)';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface TabBarProps {
  active: TabKey;
}

export function TabBar({ active }: TabBarProps) {
  const insets = useSafeAreaInsets();
  return (
    <View pointerEvents="box-none" style={[styles.wrap, { bottom: Math.max(insets.bottom, 12) + 4 }]}>
      <View style={styles.pill}>
        {TABS.map((tab) => (
          <TabButton
            key={tab.key}
            tab={tab}
            isActive={tab.key === active}
            onPress={() => router.replace(tab.href as never)}
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
}

function TabButton({ tab, isActive, onPress }: TabButtonProps) {
  const progress = useSharedValue(isActive ? 1 : 0);

  useEffect(() => {
    progress.value = withTiming(isActive ? 1 : 0, { duration: TINT_DURATION });
  }, [isActive, progress]);

  const tintStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(progress.value, [0, 1], [INACTIVE_BG, ACTIVE_BG]),
  }));

  const activeIconStyle = useAnimatedStyle(() => ({
    opacity: progress.value,
  }));

  const Icon = tab.Icon;

  return (
    <AnimatedPressable
      onPress={onPress}
      layout={PILL_TRANSITION}
      style={[styles.tab, isActive && styles.tabActive, tintStyle]}
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
          entering={FadeIn.duration(180).delay(60)}
          exiting={FadeOut.duration(120)}
          style={styles.tabLabel}
        >
          {tab.label}
        </Animated.Text>
      )}
    </AnimatedPressable>
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
