import type { TextStyle } from 'react-native';

export const Colors = {
  ink: '#15140f',
  cream: '#f4ede0',
  paper: '#fffdf8',
  card: '#fffaf0',
  background: '#f0eee9',
  accent: '#2d5a3d',
  accentDeep: '#1f3d2a',
  amber: '#c87a3a',
  amberDeep: '#a8542a',
  muted: '#7a7163',
  line: 'rgba(21,20,15,0.10)',
  lineSoft: 'rgba(21,20,15,0.06)',
  lineFaint: 'rgba(21,20,15,0.04)',
  inkGlassFill: 'rgba(21,20,15,0.06)',
  whiteGlassFill: 'rgba(255,255,255,0.10)',
  paperGlassFill: 'rgba(255,253,248,0.7)',
  scrim: 'rgba(21,20,15,0.45)',
  dark: '#0d0c0a',
  ember: '#1a1614',
  shadowInk: 'rgba(20,15,5,0.18)',
  shadowSoft: 'rgba(20,15,5,0.05)',
  danger: '#b84537',
  dangerWash: 'rgba(184,69,55,0.10)',
  dangerWashBorder: 'rgba(184,69,55,0.20)',
  tile: '#fdf3e0',
  tileDeep: '#f5e6cc',
} as const;

/**
 * Nutriscore A–E palette. Matches the Phygital design export — graded from a
 * confident green (A) through olive (B), warm amber (C/D) to a calmer danger-red
 * (E). Used by the chip badge in search rows and the big card on Product Detail.
 */
export const NutriscoreColors = {
  A: '#3d6e4a',
  B: '#7a9b3d',
  C: '#c89538',
  D: '#c8723a',
  E: '#b84537',
} as const;

export type NutriscoreGrade = keyof typeof NutriscoreColors;

export const Fonts = {
  sans: 'Geist_400Regular',
  sansMedium: 'Geist_500Medium',
  sansSemibold: 'Geist_600SemiBold',
  sansBold: 'Geist_700Bold',
  serif: 'InstrumentSerif_400Regular',
  serifItalic: 'InstrumentSerif_400Regular_Italic',
} as const;

type Style = TextStyle;

export const Type = {
  display: { fontFamily: Fonts.serif, fontSize: 68, lineHeight: 64, letterSpacing: -2.4, color: Colors.ink } as Style,
  heroLg: { fontFamily: Fonts.serif, fontSize: 48, lineHeight: 46, letterSpacing: -1.6, color: Colors.ink } as Style,
  hero: { fontFamily: Fonts.serif, fontSize: 44, lineHeight: 42, letterSpacing: -1.6, color: Colors.ink } as Style,
  h1: { fontFamily: Fonts.serif, fontSize: 38, lineHeight: 42, letterSpacing: -1.1, color: Colors.ink } as Style,
  h2: { fontFamily: Fonts.serif, fontSize: 30, lineHeight: 35, letterSpacing: -0.8, color: Colors.ink } as Style,
  h3: { fontFamily: Fonts.serif, fontSize: 26, lineHeight: 30, letterSpacing: -0.6, color: Colors.ink } as Style,
  h4: { fontFamily: Fonts.serif, fontSize: 22, lineHeight: 26, letterSpacing: -0.4, color: Colors.ink } as Style,
  serifNumeric: { fontFamily: Fonts.serif, fontSize: 24, lineHeight: 28, letterSpacing: -0.3, color: Colors.ink } as Style,
  body: { fontFamily: Fonts.sans, fontSize: 14, lineHeight: 21, color: Colors.ink } as Style,
  bodyMuted: { fontFamily: Fonts.sans, fontSize: 13, lineHeight: 19.5, color: Colors.muted } as Style,
  bodySm: { fontFamily: Fonts.sans, fontSize: 12, lineHeight: 18, color: Colors.muted } as Style,
  label: { fontFamily: Fonts.sansMedium, fontSize: 13.5, lineHeight: 18, color: Colors.ink } as Style,
  labelSm: { fontFamily: Fonts.sansMedium, fontSize: 12, lineHeight: 16, color: Colors.ink } as Style,
  button: { fontFamily: Fonts.sansMedium, fontSize: 15, lineHeight: 18, color: Colors.cream } as Style,
  buttonSm: { fontFamily: Fonts.sansSemibold, fontSize: 13, lineHeight: 16, color: Colors.ink } as Style,
  eyebrow: { fontFamily: Fonts.sansSemibold, fontSize: 11, lineHeight: 14, letterSpacing: 1.5, color: Colors.muted } as Style,
  eyebrowSm: { fontFamily: Fonts.sansSemibold, fontSize: 10, lineHeight: 13, letterSpacing: 1.4, color: Colors.muted } as Style,
} as const;

export const Radius = {
  xs: 7,
  sm: 10,
  md: 12,
  lg: 14,
  xl: 16,
  xxl: 18,
  pill: 999,
  sheet: 26,
  sheetLg: 28,
} as const;

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
} as const;

export const Shadows = {
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 2,
  },
  raised: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 4,
  },
  cta: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 18,
    elevation: 6,
  },
  amberCta: {
    shadowColor: Colors.amber,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 14,
    elevation: 6,
  },
  navBar: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.10,
    shadowRadius: 28,
    elevation: 10,
  },
  loyalty: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.22,
    shadowRadius: 30,
    elevation: 10,
  },
} as const;

export const TabBarHeight = 76;
