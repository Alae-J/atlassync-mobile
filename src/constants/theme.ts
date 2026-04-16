/**
 * AtlasSync Design System
 * Based on the design spec: docs/AtlasSync_design.md
 */

export const Colors = {
  // Backgrounds
  charcoal: '#1F2933',
  offWhite: '#F7F8FA',
  surface: '#FFFFFF',
  darkSurface: '#263040',

  // Accent Gradient
  cyan: '#00C6D4',
  violet: '#7B5EA7',

  // Semantic
  success: '#2ECC71',
  error: '#E74C3C',
  warning: '#F39C12',
  promotional: '#FF9500',

  // Text
  textPrimary: '#0D1117',
  textSecondary: '#6B7A8D',
  textInverse: '#F0F4F8',
  textMuted: '#A0AEC0',

  // Borders & Dividers
  border: '#E2E8F0',
  divider: '#E2E8F0',

  // Skeleton
  skeletonBase: '#EDF2F7',
  skeletonShimmer: '#F7FAFC',

  // Location
  userLocation: '#3B82F6',
} as const;

export const Gradients = {
  /** Primary CTA gradient: 135deg, cyan -> violet */
  primary: ['#00C6D4', '#7B5EA7'] as const,
  /** Reversed for certain effects */
  reversed: ['#7B5EA7', '#00C6D4'] as const,
} as const;

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  '2xl': 48,
  '3xl': 64,
} as const;

export const BorderRadius = {
  card: 16,
  bottomSheet: 24,
  button: 16,
  input: 12,
  pill: 999,
  qrContainer: 20,
  scanCorner: 4,
  avatar: 12,
} as const;

export const Shadows = {
  level0: {},
  level1: {
    shadowColor: '#1F2933',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  level2: {
    shadowColor: '#1F2933',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.10,
    shadowRadius: 12,
    elevation: 4,
  },
  level3: {
    shadowColor: '#1F2933',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.14,
    shadowRadius: 24,
    elevation: 8,
  },
  level4: {
    shadowColor: '#1F2933',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.20,
    shadowRadius: 40,
    elevation: 12,
  },
} as const;

export const Typography = {
  // Display / Wordmark -- Syne 700-800
  display: {
    fontFamily: 'Syne_800ExtraBold',
    fontSize: 36,
  },
  heading1: {
    fontFamily: 'Syne_700Bold',
    fontSize: 28,
  },
  heading2: {
    fontFamily: 'Syne_700Bold',
    fontSize: 22,
  },
  heading3: {
    fontFamily: 'Syne_700Bold',
    fontSize: 18,
  },

  // Body / UI -- DM Sans
  bodyLarge: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 16,
  },
  bodyMedium: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 14,
  },
  bodySmall: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 12,
  },
  label: {
    fontFamily: 'DMSans_600SemiBold',
    fontSize: 14,
  },
  labelSmall: {
    fontFamily: 'DMSans_600SemiBold',
    fontSize: 12,
  },
  button: {
    fontFamily: 'Syne_700Bold',
    fontSize: 18,
  },
  buttonSmall: {
    fontFamily: 'DMSans_600SemiBold',
    fontSize: 14,
  },

  // Numeric -- DM Mono
  priceHero: {
    fontFamily: 'DMMono_500Medium',
    fontSize: 32,
  },
  priceLarge: {
    fontFamily: 'DMMono_600SemiBold',
    fontSize: 26,
  },
  priceMedium: {
    fontFamily: 'DMMono_600SemiBold',
    fontSize: 16,
  },
  priceSmall: {
    fontFamily: 'DMMono_500Medium',
    fontSize: 14,
  },

  // Micro Labels / Badges
  badge: {
    fontFamily: 'DMSans_600SemiBold',
    fontSize: 10,
    letterSpacing: 0.8,
    textTransform: 'uppercase' as const,
  },
} as const;

export const BottomNavHeight = 64;
export const BottomBarHeight = 80;
