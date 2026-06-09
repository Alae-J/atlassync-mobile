import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  ArrowLeft,
  CaretDown,
  CaretRight,
  Clock,
  MagnifyingGlass,
  X,
} from 'phosphor-react-native';
import { Colors, Fonts, Radius, Shadows } from '../src/constants/theme';
import { productsApi } from '../src/api';
import type { Product } from '../src/types';
import { aisles } from '../src/data/aisles';
import { recentSearches } from '../src/lib/recentSearches';
import { toDisplayProduct, type DisplayProduct } from '../src/lib/productDisplay';
import { formatPrice } from '../src/lib/formatPrice';
import { useSession } from '../src/context/SessionContext';
import { useAuth } from '../src/context/AuthContext';
import {
  AislePill,
  DietChip,
  ListPickerSheet,
  NutriscoreBadge,
  PlusButton,
  ProductThumb,
} from '../src/components/product';

type Mode = 'cold' | 'typing' | 'results' | 'empty';

const DEBOUNCE_MS = 300;

// USER_DIETARY now read from user.preferences (Account → Preferences → Dietary)
// — no hardcoded fallback; an empty array means no dietary chips will surface.

export default function SearchScreen() {
  const insets = useSafeAreaInsets();
  const inputRef = useRef<TextInput>(null);
  const { isActive, scanItem } = useSession();
  const { user } = useAuth();
  const { returnTo } = useLocalSearchParams<{ returnTo?: string }>();

  // `router.back()` would normally pop the previous route, but search is at
  // root level so a push from a nested stack (e.g. /shop/scan) breaks the
  // back trail and lands on whatever the parent tab last showed. The caller
  // passes a `returnTo` to override that with an explicit destination.
  const handleBack = useCallback(() => {
    if (returnTo) {
      router.replace(returnTo as never);
      return;
    }
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(tabs)/home');
    }
  }, [returnTo]);

  const [query, setQuery] = useState('');
  const [debounced, setDebounced] = useState('');
  const [aisleFilter, setAisleFilter] = useState<number | null>(null);
  const [results, setResults] = useState<DisplayProduct[]>([]);
  const [loading, setLoading] = useState(false);
  const [recents, setRecents] = useState<string[]>([]);
  const [addedId, setAddedId] = useState<number | null>(null);
  const [sheetProduct, setSheetProduct] = useState<DisplayProduct | null>(null);

  // Load recent searches once.
  useEffect(() => {
    void recentSearches.list().then(setRecents);
  }, []);

  // Debounce the query for both server load and UI state.
  useEffect(() => {
    const trimmed = query.trim();
    if (!trimmed && aisleFilter === null) {
      setDebounced('');
      setResults([]);
      return;
    }
    setLoading(true);
    const t = setTimeout(() => setDebounced(trimmed), DEBOUNCE_MS);
    return () => clearTimeout(t);
  }, [query, aisleFilter]);

  // Fire the actual API call when the debounced query / aisle settles.
  useEffect(() => {
    if (!debounced && aisleFilter === null) return;
    let cancelled = false;
    (async () => {
      try {
        const raw = await productsApi.search({
          query: debounced || undefined,
          aisle: aisleFilter ?? undefined,
        });
        if (!cancelled) setResults(raw.map(toDisplayProduct));
      } catch {
        if (!cancelled) setResults([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [debounced, aisleFilter]);

  const mode: Mode = useMemo(() => {
    if (loading) return 'typing';
    if (!query.trim() && aisleFilter === null) return 'cold';
    if (results.length === 0) return 'empty';
    return 'results';
  }, [loading, query, aisleFilter, results]);

  const handlePickAisle = (number: number) => {
    setAisleFilter(number);
    setQuery('');
  };

  const handleRecent = (term: string) => {
    setQuery(term);
    setAisleFilter(null);
  };

  const handleClear = () => {
    setQuery('');
    setAisleFilter(null);
    inputRef.current?.focus();
  };

  const handleRowTap = useCallback(
    async (product: DisplayProduct) => {
      // Persist the query that produced this hit (not the recent term itself).
      const trimmed = query.trim();
      if (trimmed.length > 0) {
        const next = await recentSearches.push(trimmed);
        setRecents(next);
      }
      router.push({ pathname: '/product/[barcode]', params: { barcode: product.barcode } });
    },
    [query],
  );

  const handlePlus = useCallback(
    async (product: DisplayProduct) => {
      if (isActive) {
        try {
          await scanItem(product.barcode);
          setAddedId(product.id);
          setTimeout(() => setAddedId(null), 1100);
        } catch {
          // swallow — could surface a toast later
        }
      } else {
        setSheetProduct(product);
      }
    },
    [isActive, scanItem],
  );

  const activeFilterLabel = aisleFilter
    ? aisles.find((a) => a.number === aisleFilter)?.name ?? `Aisle ${aisleFilter}`
    : null;

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.root}
    >
      <LinearGradient
        colors={['rgba(200,122,58,0.06)', 'transparent']}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 0.5 }}
        style={styles.bgWash}
        pointerEvents="none"
      />

      {/* status bar gap */}
      <View style={{ height: insets.top }} />

      {/* Back + input row */}
      <View style={styles.topRow}>
        <Pressable
          onPress={handleBack}
          hitSlop={10}
          style={styles.backChip}
        >
          <ArrowLeft size={16} color={Colors.ink} weight="regular" />
        </Pressable>

        <View style={styles.inputWrap}>
          <MagnifyingGlass size={15} color={Colors.muted} weight="regular" />
          <TextInput
            ref={inputRef}
            value={query}
            onChangeText={setQuery}
            placeholder="Search products, brands, barcodes"
            placeholderTextColor={Colors.muted}
            style={styles.input}
            autoFocus
            returnKeyType="search"
            selectionColor={Colors.amber}
          />
          {(query.length > 0 || aisleFilter !== null) && (
            <Pressable onPress={handleClear} hitSlop={10} style={styles.clearBtn}>
              <X size={10} color={Colors.ink} weight="bold" />
            </Pressable>
          )}
        </View>
      </View>

      {/* Hairline + amber progress strip during typing */}
      <View style={styles.hairline}>
        {loading && <View style={styles.progressFill} />}
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {mode === 'cold' && (
          <ColdState
            recents={recents}
            onPickRecent={handleRecent}
            onPickAisle={handlePickAisle}
          />
        )}

        {mode === 'typing' && <TypingState />}

        {mode === 'results' && (
          <ResultsState
            results={results}
            activeFilterLabel={activeFilterLabel}
            addedId={addedId}
            userDietary={user?.preferences.dietaryPrefs ?? []}
            onRowTap={handleRowTap}
            onPlus={handlePlus}
          />
        )}

        {mode === 'empty' && (
          <EmptyState query={query.trim() || activeFilterLabel || ''} />
        )}
      </ScrollView>

      <ListPickerSheet
        visible={sheetProduct !== null}
        onClose={() => setSheetProduct(null)}
        productName={sheetProduct?.name ?? ''}
        productPrice={sheetProduct?.price ?? 0}
        currencyCode={sheetProduct?.currencyCode}
        barcode={sheetProduct?.barcode}
        onStartNewList={() => setSheetProduct(null)}
      />
    </KeyboardAvoidingView>
  );
}

// ── States ────────────────────────────────────────────────────────────

function ColdState({
  recents,
  onPickRecent,
  onPickAisle,
}: {
  recents: string[];
  onPickRecent: (term: string) => void;
  onPickAisle: (number: number) => void;
}) {
  return (
    <View style={{ paddingHorizontal: 22, paddingTop: 14, paddingBottom: 40 }}>
      <Text style={styles.helper}>
        Search a <Text style={styles.helperStrong}>name</Text>,{' '}
        <Text style={styles.helperStrong}>brand</Text>, or scan a code.
      </Text>

      {recents.length > 0 && (
        <>
          <Text style={styles.eyebrow}>RECENT</Text>
          <View style={styles.recentRow}>
            {recents.map((term) => (
              <Pressable
                key={term}
                onPress={() => onPickRecent(term)}
                style={styles.recentChip}
              >
                <Clock size={10} color={Colors.muted} weight="regular" />
                <Text style={styles.recentLabel}>{term}</Text>
              </Pressable>
            ))}
          </View>
        </>
      )}

      <Text style={styles.eyebrow}>BROWSE BY AISLE</Text>
      <View style={styles.aisleCard}>
        {aisles.map((aisle, i) => (
          <Pressable
            key={aisle.number}
            onPress={() => onPickAisle(aisle.number)}
            style={[styles.aisleRow, i < aisles.length - 1 && styles.aisleRowDivider]}
          >
            <AislePill number={aisle.number} />
            <View style={{ flex: 1, minWidth: 0 }}>
              <Text style={styles.aisleName}>{aisle.name}</Text>
              <Text style={styles.aisleSub}>{aisle.subtitle}</Text>
            </View>
            <CaretRight size={14} color={Colors.muted} weight="bold" />
          </Pressable>
        ))}
      </View>
    </View>
  );
}

function TypingState() {
  return (
    <View style={{ paddingHorizontal: 22, paddingTop: 14, paddingBottom: 40 }}>
      <Text style={styles.eyebrow}>SEARCHING…</Text>
      {[0, 1, 2, 3].map((i) => (
        <View
          key={i}
          style={[styles.skeletonRow, { opacity: 1 - i * 0.18 }]}
        >
          <View style={styles.skeletonThumb} />
          <View style={{ flex: 1, gap: 7 }}>
            <View style={[styles.skeletonLine, { width: `${70 - i * 8}%`, height: 12 }]} />
            <View style={[styles.skeletonLine, { width: `${40 + i * 4}%`, height: 9 }]} />
            <View style={{ flexDirection: 'row', gap: 5 }}>
              <View style={[styles.skeletonLine, { width: 50, height: 14, borderRadius: 999 }]} />
              <View style={[styles.skeletonLine, { width: 18, height: 14, borderRadius: 5 }]} />
            </View>
          </View>
          <View style={{ alignItems: 'flex-end', gap: 8 }}>
            <View style={[styles.skeletonLine, { width: 50, height: 16 }]} />
            <View style={[styles.skeletonLine, { width: 34, height: 34, borderRadius: 999 }]} />
          </View>
        </View>
      ))}
    </View>
  );
}

function ResultsState({
  results,
  activeFilterLabel,
  addedId,
  userDietary,
  onRowTap,
  onPlus,
}: {
  results: DisplayProduct[];
  activeFilterLabel: string | null;
  addedId: number | null;
  userDietary: string[];
  onRowTap: (p: DisplayProduct) => void;
  onPlus: (p: DisplayProduct) => void;
}) {
  return (
    <View style={{ paddingHorizontal: 22, paddingTop: 14, paddingBottom: 40 }}>
      <View style={styles.resultsHeader}>
        <Text style={styles.resultsCount}>
          <Text style={styles.resultsCountStrong}>{results.length}</Text>{' '}
          result{results.length === 1 ? '' : 's'}
          {activeFilterLabel ? <Text style={styles.resultsCountStrong}> · {activeFilterLabel}</Text> : null}
        </Text>
        <Pressable style={styles.sortBtn}>
          <Text style={styles.sortLabel}>Sort</Text>
          <CaretDown size={11} color={Colors.muted} weight="bold" />
        </Pressable>
      </View>

      {results.map((product) => (
        <ResultRow
          key={product.id}
          product={product}
          added={addedId === product.id}
          userDietary={userDietary}
          onRowTap={onRowTap}
          onPlus={onPlus}
        />
      ))}
    </View>
  );
}

function ResultRow({
  product,
  added,
  userDietary,
  onRowTap,
  onPlus,
}: {
  product: DisplayProduct;
  added: boolean;
  userDietary: string[];
  onRowTap: (p: DisplayProduct) => void;
  onPlus: (p: DisplayProduct) => void;
}) {
  const dietHit = product.dietary.find((d) => userDietary.includes(d));
  return (
    <View style={styles.resultRow}>
      <Pressable
        onPress={() => onRowTap(product)}
        style={styles.resultBody}
      >
        <ProductThumb emoji={product.emoji} size={56} />
        <View style={{ flex: 1, minWidth: 0 }}>
          <Text style={styles.productName} numberOfLines={1}>
            {product.name}
          </Text>
          {product.brand && (
            <Text style={styles.productBrand} numberOfLines={1}>
              {product.brand}
            </Text>
          )}
          <View style={styles.chipStrip}>
            {product.aisle != null && <AislePill number={product.aisle} />}
            {product.nutriscore && <NutriscoreBadge grade={product.nutriscore} />}
            {dietHit && <DietChip label={dietHit} />}
            {!product.inStock && (
              <View style={styles.outChip}>
                <Text style={styles.outChipLabel}>Out</Text>
              </View>
            )}
          </View>
        </View>
      </Pressable>

      <View style={styles.priceCol}>
        <Text style={styles.price}>{formatPrice(product.price, product.currencyCode)}</Text>
        <PlusButton onPress={() => onPlus(product)} added={added} />
      </View>
    </View>
  );
}

function EmptyState({ query }: { query: string }) {
  return (
    <View style={{ paddingHorizontal: 28, paddingTop: 48 }}>
      <Text style={styles.emptyTitle}>
        Nothing in stock for{' '}
        <Text style={styles.emptyTitleItalic}>&ldquo;{query}&rdquo;</Text>.
      </Text>
      <Text style={styles.emptyHelper}>Try a broader term, or scan the barcode.</Text>
    </View>
  );
}

// ── Styles ────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.cream },
  bgWash: { position: 'absolute', top: 0, left: 0, right: 0, height: 240 },

  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 18,
    paddingTop: 8,
    paddingBottom: 12,
  },
  backChip: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.paper,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.line,
    ...Shadows.card,
  },
  inputWrap: {
    flex: 1,
    height: 44,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: Colors.paper,
    borderWidth: 1,
    borderColor: Colors.line,
    borderRadius: Radius.lg,
    paddingHorizontal: 12,
    ...Shadows.card,
  },
  input: {
    flex: 1,
    fontFamily: Fonts.sans,
    fontSize: 14,
    color: Colors.ink,
    padding: 0,
    includeFontPadding: false,
  },
  clearBtn: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: Colors.inkGlassFill,
    alignItems: 'center',
    justifyContent: 'center',
  },

  hairline: { height: 1, backgroundColor: Colors.line, overflow: 'hidden' },
  progressFill: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    width: '40%',
    backgroundColor: Colors.amber,
  },

  scroll: { paddingBottom: 32 },

  helper: {
    fontFamily: Fonts.sans,
    fontSize: 13,
    lineHeight: 19,
    color: Colors.muted,
    marginBottom: 26,
    maxWidth: 280,
  },
  helperStrong: { color: Colors.ink },

  eyebrow: {
    fontFamily: Fonts.sansSemibold,
    fontSize: 10,
    letterSpacing: 1.6,
    color: Colors.muted,
    marginBottom: 10,
  },

  recentRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 32 },
  recentChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: Colors.line,
  },
  recentLabel: {
    fontFamily: Fonts.sansMedium,
    fontSize: 12,
    color: Colors.ink,
  },

  aisleCard: {
    backgroundColor: Colors.paper,
    borderRadius: Radius.xl,
    borderWidth: 1,
    borderColor: Colors.lineFaint,
    overflow: 'hidden',
    ...Shadows.card,
  },
  aisleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 13,
  },
  aisleRowDivider: { borderBottomWidth: 1, borderBottomColor: Colors.line },
  aisleName: {
    fontFamily: Fonts.serif,
    fontSize: 19,
    lineHeight: 22,
    letterSpacing: -0.3,
    color: Colors.ink,
    includeFontPadding: false,
  },
  aisleSub: { fontFamily: Fonts.sans, fontSize: 11.5, color: Colors.muted, marginTop: 1 },

  skeletonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.line,
  },
  skeletonThumb: {
    width: 56,
    height: 56,
    borderRadius: 14,
    backgroundColor: Colors.inkGlassFill,
  },
  skeletonLine: { backgroundColor: 'rgba(21,20,15,0.08)', borderRadius: 4 },

  resultsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 4,
  },
  resultsCount: { fontFamily: Fonts.sans, fontSize: 11.5, color: Colors.muted },
  resultsCountStrong: { fontFamily: Fonts.sansSemibold, color: Colors.ink },
  sortBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  sortLabel: { fontFamily: Fonts.sans, fontSize: 11.5, color: Colors.muted },

  resultRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.line,
  },
  resultBody: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    minWidth: 0,
  },
  productName: {
    fontFamily: Fonts.sansMedium,
    fontSize: 14.5,
    color: Colors.ink,
    includeFontPadding: false,
  },
  productBrand: {
    fontFamily: Fonts.sans,
    fontSize: 11.5,
    color: Colors.muted,
    marginTop: 2,
  },
  chipStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 6,
    flexWrap: 'wrap',
  },
  outChip: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 999,
    backgroundColor: 'rgba(21,20,15,0.06)',
  },
  outChipLabel: {
    fontFamily: Fonts.sansSemibold,
    fontSize: 10,
    letterSpacing: 0.6,
    color: Colors.muted,
  },

  priceCol: {
    alignItems: 'flex-end',
    gap: 8,
  },
  price: {
    fontFamily: Fonts.serif,
    fontSize: 22,
    lineHeight: 22,
    letterSpacing: -0.3,
    color: Colors.ink,
    includeFontPadding: false,
  },

  emptyTitle: {
    fontFamily: Fonts.serif,
    fontSize: 38,
    lineHeight: 40,
    letterSpacing: -1.2,
    color: Colors.ink,
    includeFontPadding: false,
  },
  emptyTitleItalic: { fontFamily: Fonts.serifItalic, color: Colors.amber },
  emptyHelper: {
    fontFamily: Fonts.sans,
    fontSize: 13,
    lineHeight: 19,
    color: Colors.muted,
    marginTop: 12,
    maxWidth: 280,
  },
});
