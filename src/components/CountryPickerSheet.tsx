import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Modal,
  View,
  Text,
  Pressable,
  TextInput,
  StyleSheet,
  FlatList,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { Check, MagnifyingGlass, X } from 'phosphor-react-native';
import { Colors, Fonts, Radius, Shadows } from '../constants/theme';
import { countries, filterCountries, type Country } from '../data/countries';

interface Props {
  visible: boolean;
  onClose: () => void;
  selectedCode: string;
  onPick: (country: Country) => void;
}

/**
 * Country / dial-code picker. Rises from the bottom over a blurred scrim,
 * searchable by country name, ISO code, or dial digits. The selected
 * country shows a check on the right.
 */
export function CountryPickerSheet({ visible, onClose, selectedCode, onPick }: Props) {
  const [query, setQuery] = useState('');
  const inputRef = useRef<TextInput>(null);

  const offset = useSharedValue(700);
  const scrim = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      setQuery('');
      offset.value = withSpring(0, { damping: 22, stiffness: 220 });
      scrim.value = withTiming(1, { duration: 160 });
      setTimeout(() => inputRef.current?.focus(), 80);
    } else {
      offset.value = withTiming(700, { duration: 180 });
      scrim.value = withTiming(0, { duration: 140 });
    }
  }, [visible, offset, scrim]);

  const sheetStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: offset.value }],
  }));
  const scrimStyle = useAnimatedStyle(() => ({ opacity: scrim.value }));

  const results = useMemo(() => filterCountries(query), [query]);

  return (
    <Modal transparent visible={visible} animationType="none" onRequestClose={onClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.root}
      >
        <Animated.View style={[styles.scrim, scrimStyle]}>
          <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        </Animated.View>

        <Animated.View style={[styles.sheet, sheetStyle]}>
          <View style={styles.grabber} />

          <View style={styles.headerRow}>
            <Text style={styles.title}>
              Pick a <Text style={styles.titleItalic}>country.</Text>
            </Text>
            <Pressable onPress={onClose} hitSlop={10} style={styles.closeBtn}>
              <X size={14} color={Colors.ink} weight="bold" />
            </Pressable>
          </View>

          <View style={styles.searchWrap}>
            <MagnifyingGlass size={15} color={Colors.muted} weight="regular" />
            <TextInput
              ref={inputRef}
              value={query}
              onChangeText={setQuery}
              placeholder="Search country or dial code"
              placeholderTextColor={Colors.muted}
              style={styles.searchInput}
              selectionColor={Colors.amber}
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="search"
            />
            {query.length > 0 && (
              <Pressable onPress={() => setQuery('')} hitSlop={10}>
                <X size={12} color={Colors.muted} weight="bold" />
              </Pressable>
            )}
          </View>

          <FlatList
            data={results}
            keyExtractor={(c) => c.code}
            keyboardShouldPersistTaps="handled"
            initialNumToRender={20}
            ListEmptyComponent={
              <Text style={styles.empty}>No country matches “{query}”.</Text>
            }
            renderItem={({ item, index }) => {
              const selected = item.code === selectedCode;
              return (
                <Pressable
                  onPress={() => {
                    onPick(item);
                    onClose();
                  }}
                  style={[styles.row, index < results.length - 1 && styles.rowDivider]}
                >
                  <Text style={styles.flag}>{item.flag}</Text>
                  <Text style={styles.name} numberOfLines={1}>
                    {item.name}
                  </Text>
                  <Text style={styles.dial}>{item.dialCode}</Text>
                  {selected && (
                    <View style={styles.checkChip}>
                      <Check size={11} color={Colors.cream} weight="bold" />
                    </View>
                  )}
                </Pressable>
              );
            }}
          />
        </Animated.View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

// Re-export for callers that want to default the picker selection.
export { countries };

const styles = StyleSheet.create({
  root: { flex: 1, justifyContent: 'flex-end' },
  scrim: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(21,20,15,0.45)' },
  sheet: {
    backgroundColor: Colors.cream,
    borderTopLeftRadius: Radius.sheetLg,
    borderTopRightRadius: Radius.sheetLg,
    paddingHorizontal: 22,
    paddingTop: 14,
    paddingBottom: 28,
    maxHeight: '82%',
    minHeight: '60%',
    ...Shadows.raised,
  },
  grabber: {
    width: 40,
    height: 4,
    backgroundColor: Colors.line,
    borderRadius: 999,
    alignSelf: 'center',
    marginBottom: 14,
  },

  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  title: {
    fontFamily: Fonts.serif,
    fontSize: 26,
    lineHeight: 30,
    letterSpacing: -0.6,
    color: Colors.ink,
    includeFontPadding: false,
  },
  titleItalic: { fontFamily: Fonts.serifItalic, color: Colors.amber },
  closeBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.inkGlassFill,
    alignItems: 'center',
    justifyContent: 'center',
  },

  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.paper,
    borderWidth: 1,
    borderColor: Colors.line,
    borderRadius: Radius.md,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 6,
    ...Shadows.card,
  },
  searchInput: {
    flex: 1,
    fontFamily: Fonts.sans,
    fontSize: 14,
    color: Colors.ink,
    padding: 0,
    includeFontPadding: false,
  },

  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
  },
  rowDivider: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.line,
  },
  flag: { fontSize: 22, includeFontPadding: false },
  name: {
    flex: 1,
    fontFamily: Fonts.sans,
    fontSize: 14.5,
    color: Colors.ink,
  },
  dial: {
    fontFamily: Fonts.sansSemibold,
    fontSize: 13,
    color: Colors.muted,
    letterSpacing: 0.2,
  },
  checkChip: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: Colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 4,
  },
  empty: {
    fontFamily: Fonts.sans,
    fontSize: 13,
    color: Colors.muted,
    textAlign: 'center',
    paddingVertical: 40,
  },
});
