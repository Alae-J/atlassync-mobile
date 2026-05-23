import { View, Text, StyleSheet } from 'react-native';
import { Fonts, NutriscoreColors, type NutriscoreGrade } from '../../constants/theme';

interface Props {
  grade: NutriscoreGrade;
  /** Edge length in pixels. Defaults to 18 (search-row chip size). */
  size?: number;
  /** Render the big serif-style letter (used on Product Detail nutrition card). */
  large?: boolean;
}

/**
 * Coloured square showing the A–E nutriscore grade. Tiny version sits in
 * the chip strip; the {@code large} variant is the focal nutrition card
 * graphic with the serif letter.
 */
export function NutriscoreBadge({ grade, size = 18, large = false }: Props) {
  const bg = NutriscoreColors[grade];
  const dimension = large ? 72 : size;
  const radius = large ? 16 : 5;
  const fontSize = large ? 48 : Math.round(dimension * 0.55);
  return (
    <View
      style={[
        styles.box,
        { backgroundColor: bg, width: dimension, height: dimension, borderRadius: radius },
      ]}
    >
      <Text
        style={[
          large ? styles.letterLarge : styles.letter,
          { fontSize },
        ]}
      >
        {grade}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  letter: {
    fontFamily: Fonts.sansBold,
    color: '#ffffff',
    includeFontPadding: false,
    letterSpacing: 0.2,
  },
  letterLarge: {
    fontFamily: Fonts.serif,
    color: '#ffffff',
    includeFontPadding: false,
    letterSpacing: 0,
  },
});
