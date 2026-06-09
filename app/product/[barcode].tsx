import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  ArrowLeft,
  Bell,
  CaretRight,
  MapPin,
  Notebook,
  ShareNetwork,
  ShoppingCart,
  Warning,
  Check,
} from 'phosphor-react-native';
import { Colors, Fonts, Radius, Shadows } from '../../src/constants/theme';
import { productsApi } from '../../src/api';
import { toDisplayProduct, type DisplayProduct } from '../../src/lib/productDisplay';
import { formatPrice } from '../../src/lib/formatPrice';
import { highlightIngredients, matchedAllergens } from '../../src/lib/allergens';
import { useSession } from '../../src/context/SessionContext';
import { useAuth } from '../../src/context/AuthContext';
import {
  AislePill,
  DietChip,
  ListPickerSheet,
  NutriscoreBadge,
  ProductThumb,
  StockChip,
} from '../../src/components/product';

// userDietary / userAllergens now read from user.preferences
// (Account → Preferences → Dietary / Allergens). Empty arrays mean
// no banner, no dietary chip match — same calm fallback.

export default function ProductDetailScreen() {
  const insets = useSafeAreaInsets();
  const { barcode } = useLocalSearchParams<{ barcode: string }>();
  const { isActive, scanItem } = useSession();
  const { user } = useAuth();
  const userDietary = user?.preferences.dietaryPrefs ?? [];
  const userAllergens = user?.preferences.allergens ?? [];

  const [product, setProduct] = useState<DisplayProduct | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [added, setAdded] = useState(false);
  const [adding, setAdding] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);

  useEffect(() => {
    if (!barcode) return;
    let cancelled = false;
    setLoading(true);
    setError(null);
    productsApi
      .byBarcode(String(barcode))
      .then((raw) => {
        if (!cancelled) setProduct(toDisplayProduct(raw));
      })
      .catch(() => {
        if (!cancelled) setError("We couldn't find that product.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [barcode]);

  const ingredientSegments = useMemo(() => {
    if (!product) return [];
    const flagged = matchedAllergens(product.allergens, userAllergens);
    return highlightIngredients(product.ingredients, flagged);
  }, [product, userAllergens]);

  const matched = useMemo(() => {
    if (!product) return [];
    return matchedAllergens(product.allergens, userAllergens);
  }, [product, userAllergens]);

  const handleAddToCart = useCallback(async () => {
    if (!product || adding) return;
    setAdding(true);
    try {
      await scanItem(product.barcode);
      setAdded(true);
      setTimeout(() => setAdded(false), 1400);
    } catch {
      // swallow — could surface a toast
    } finally {
      setAdding(false);
    }
  }, [product, scanItem, adding]);

  if (loading) {
    return (
      <View style={[styles.root, styles.center]}>
        <ActivityIndicator color={Colors.amber} />
      </View>
    );
  }

  if (error || !product) {
    return (
      <View style={[styles.root, { paddingTop: insets.top + 40 }]}>
        <Pressable onPress={() => router.back()} style={[styles.floatingChip, { top: insets.top + 12, left: 18 }]}>
          <ArrowLeft size={16} color={Colors.ink} weight="regular" />
        </Pressable>
        <View style={[styles.center, { paddingHorizontal: 28 }]}>
          <Text style={styles.errorTitle}>
            We don&apos;t carry <Text style={styles.errorTitleItalic}>that one</Text>.
          </Text>
          <Text style={styles.errorHelper}>
            {error ?? 'Try scanning again or searching by name.'}
          </Text>
        </View>
      </View>
    );
  }

  const matchedDietary = product.dietary.filter((d) => userDietary.includes(d));
  const otherDietary = product.dietary.filter((d) => !userDietary.includes(d));
  const visibleDietary = [...matchedDietary, ...otherDietary].slice(0, 3);

  return (
    <View style={styles.root}>
      <LinearGradient
        colors={['rgba(200,122,58,0.06)', 'transparent']}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 0.5 }}
        style={styles.bgWash}
        pointerEvents="none"
      />

      {/* Floating top bar */}
      <Pressable
        onPress={() => router.back()}
        hitSlop={10}
        style={[styles.floatingChip, { top: insets.top + 12, left: 18 }]}
      >
        <ArrowLeft size={16} color={Colors.ink} weight="regular" />
      </Pressable>
      <Pressable
        hitSlop={10}
        style={[styles.floatingChip, { top: insets.top + 12, right: 18 }]}
      >
        <ShareNetwork size={15} color={Colors.ink} weight="regular" />
      </Pressable>

      <ScrollView
        contentContainerStyle={{ paddingTop: insets.top + 4, paddingBottom: 140 }}
        showsVerticalScrollIndicator={false}
      >
        {/* HERO */}
        <View style={styles.heroWrap}>
          <View style={styles.heroSurface}>
            <LinearGradient
              colors={[Colors.tile, Colors.tileDeep]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={StyleSheet.absoluteFill}
            />
            <LinearGradient
              colors={['rgba(255,255,255,0.85)', 'transparent']}
              start={{ x: 0.5, y: 0.3 }}
              end={{ x: 0.5, y: 0.7 }}
              style={StyleSheet.absoluteFill}
            />
            <Text style={styles.heroEmoji}>{product.emoji}</Text>
            {product.nutriscore && (
              <View style={styles.heroBadge}>
                <NutriscoreBadge grade={product.nutriscore} size={32} />
              </View>
            )}
          </View>
        </View>

        {/* NAME + PRICE */}
        <View style={styles.nameBlock}>
          {product.brand && (
            <Text style={styles.brandEyebrow}>{product.brand.toUpperCase()}</Text>
          )}
          <Text style={styles.heroTitle}>{renderTitle(product.name)}</Text>

          <View style={styles.priceRow}>
            <Text style={styles.priceMain}>{formatPrice(product.price, product.currencyCode)}</Text>
            <Text style={styles.priceUnit}>per {product.unit}</Text>
          </View>

          <View style={styles.quickFacts}>
            {product.aisle != null && (
              <View style={styles.aisleFact}>
                <MapPin size={11} color={Colors.accent} weight="fill" />
                <AislePill number={product.aisle} />
              </View>
            )}
            <StockChip inStock={product.inStock} />
            {visibleDietary.map((d) => (
              <DietChip key={d} label={d} matched={matchedDietary.includes(d)} />
            ))}
          </View>
        </View>

        {/* ALLERGEN BANNER */}
        {matched.length > 0 && (
          <View style={styles.allergenBlock}>
            <View style={styles.allergenBanner}>
              <Warning size={16} color={Colors.danger} weight="regular" />
              <Text style={styles.allergenText}>
                Contains{' '}
                <Text style={styles.allergenWord}>
                  {matched.join(', ').toLowerCase()}
                </Text>{' '}
                — one of your flagged allergens.
              </Text>
            </View>
          </View>
        )}

        {/* NUTRITION */}
        {product.nutrition && product.nutriscore && (
          <View style={styles.section}>
            <Text style={styles.eyebrow}>NUTRITION</Text>
            <View style={styles.nutritionCard}>
              <View style={styles.nutritionBadgeCol}>
                <NutriscoreBadge grade={product.nutriscore} large />
                <Text style={styles.nutritionBadgeLabel}>NUTRISCORE</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.nutritionPer}>per 100g</Text>
                {[
                  { key: 'Energy', value: product.nutrition.kcal, suffix: 'kcal' },
                  { key: 'Sugars', value: product.nutrition.sugars, suffix: 'g' },
                  { key: 'Fats',   value: product.nutrition.fats,   suffix: 'g' },
                  { key: 'Salt',   value: product.nutrition.salt,   suffix: 'g' },
                ].map((row, i, arr) => (
                  <View
                    key={row.key}
                    style={[
                      styles.nutritionRow,
                      i < arr.length - 1 && styles.nutritionRowDivider,
                    ]}
                  >
                    <Text style={styles.nutritionLabel}>{row.key}</Text>
                    <Text style={styles.nutritionValue}>
                      <Text style={styles.nutritionValueStrong}>{row.value}</Text>
                      <Text style={styles.nutritionSuffix}> {row.suffix}</Text>
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          </View>
        )}

        {/* INGREDIENTS */}
        {product.ingredients.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.eyebrow}>INGREDIENTS</Text>
            <Text style={styles.ingredientsText}>
              {ingredientSegments.map((segment, i) =>
                segment.highlight ? (
                  <Text key={i} style={styles.ingredientHighlight}>
                    {segment.text}
                  </Text>
                ) : (
                  <Text key={i}>{segment.text}</Text>
                ),
              )}
            </Text>
          </View>
        )}

        {/* ABOUT */}
        {product.about && (
          <View style={styles.section}>
            <Text style={styles.eyebrow}>ABOUT</Text>
            <View style={styles.aboutCard}>
              <View style={styles.aboutIcon}>
                <Notebook size={14} color={Colors.amber} weight="regular" />
              </View>
              <Text style={styles.aboutText}>{product.about}</Text>
            </View>
          </View>
        )}
      </ScrollView>

      {/* STICKY CTA */}
      <LinearGradient
        colors={['transparent', Colors.cream]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 0.4 }}
        style={[styles.ctaWash, { paddingBottom: insets.bottom + 16 }]}
        pointerEvents="box-none"
      >
        <CTABar
          product={product}
          inSession={isActive}
          added={added}
          loading={adding}
          onAddToCart={handleAddToCart}
          onPickList={() => setSheetOpen(true)}
        />
      </LinearGradient>

      <ListPickerSheet
        visible={sheetOpen}
        onClose={() => setSheetOpen(false)}
        productName={product.name}
        productPrice={product.price}
        currencyCode={product.currencyCode}
        barcode={product.barcode}
        onStartNewList={() => setSheetOpen(false)}
      />
    </View>
  );
}

function CTABar({
  product,
  inSession,
  added,
  loading,
  onAddToCart,
  onPickList,
}: {
  product: DisplayProduct;
  inSession: boolean;
  added: boolean;
  loading: boolean;
  onAddToCart: () => void;
  onPickList: () => void;
}) {
  if (!product.inStock) {
    return (
      <View style={{ flexDirection: 'row', gap: 8 }}>
        <View style={[styles.ctaButton, styles.ctaDisabled, { flex: 1.4 }]}>
          <Text style={styles.ctaDisabledText}>Out of stock</Text>
        </View>
        <Pressable style={[styles.ctaButton, styles.ctaOutline, { flex: 1 }]}>
          <Bell size={14} color={Colors.ink} weight="regular" />
          <Text style={styles.ctaOutlineText}>Notify me</Text>
        </Pressable>
      </View>
    );
  }

  if (!inSession) {
    return (
      <Pressable
        onPress={onPickList}
        style={[styles.ctaButton, styles.ctaInk]}
      >
        <View style={styles.ctaLeftCluster}>
          <Notebook size={17} color={Colors.cream} weight="regular" />
          <Text style={styles.ctaInkText}>Add to a list</Text>
        </View>
        <CaretRight size={16} color={Colors.cream} weight="bold" />
      </Pressable>
    );
  }

  return (
    <Pressable
      onPress={onAddToCart}
      disabled={loading}
      style={[styles.ctaButton, added ? styles.ctaAdded : styles.ctaInk]}
    >
      <View style={styles.ctaLeftCluster}>
        {added ? (
          <Check size={17} color={Colors.cream} weight="bold" />
        ) : (
          <ShoppingCart size={17} color={Colors.cream} weight="regular" />
        )}
        <Text style={styles.ctaInkText}>{added ? 'Added to cart' : 'Add to cart'}</Text>
      </View>
      <Text style={styles.ctaPrice}>{formatPrice(product.price, product.currencyCode)}</Text>
    </Pressable>
  );
}

function renderTitle(name: string) {
  const parts = name.split(' ');
  const lastIndex = parts.length - 1;
  return parts.map((word, i) => (
    <Text key={`${word}-${i}`} style={i === lastIndex ? styles.heroTitleItalic : undefined}>
      {i > 0 ? ' ' : ''}
      {word}
    </Text>
  ));
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.cream },
  bgWash: { position: 'absolute', top: 0, left: 0, right: 0, height: 240 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },

  floatingChip: {
    position: 'absolute',
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255,253,248,0.85)',
    borderWidth: 1,
    borderColor: Colors.line,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
    ...Shadows.card,
  },

  heroWrap: { paddingHorizontal: 18, paddingTop: 56 },
  heroSurface: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: Radius.xxl + 6,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.lineFaint,
    ...Shadows.raised,
  },
  heroEmoji: {
    fontSize: 140,
    lineHeight: 144,
    includeFontPadding: false,
    transform: [{ translateY: -4 }],
  },
  heroBadge: {
    position: 'absolute',
    top: 14,
    right: 14,
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },

  nameBlock: { paddingHorizontal: 22, paddingTop: 22, paddingBottom: 4 },
  brandEyebrow: {
    fontFamily: Fonts.sansSemibold,
    fontSize: 11,
    letterSpacing: 1.6,
    color: Colors.muted,
    marginBottom: 6,
  },
  heroTitle: {
    fontFamily: Fonts.serif,
    fontSize: 38,
    lineHeight: 40,
    letterSpacing: -1.2,
    color: Colors.ink,
    includeFontPadding: false,
    marginBottom: 14,
  },
  heroTitleItalic: { fontFamily: Fonts.serifItalic, color: Colors.amber },

  priceRow: { flexDirection: 'row', alignItems: 'baseline', gap: 8, marginBottom: 14 },
  priceMain: {
    fontFamily: Fonts.serif,
    fontSize: 38,
    lineHeight: 40,
    letterSpacing: -0.8,
    color: Colors.ink,
    includeFontPadding: false,
  },
  priceUnit: { fontFamily: Fonts.sans, fontSize: 13, color: Colors.muted },

  quickFacts: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, alignItems: 'center' },
  aisleFact: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },

  allergenBlock: { paddingHorizontal: 22, paddingTop: 24 },
  allergenBanner: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'flex-start',
    padding: 12,
    paddingHorizontal: 14,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.dangerWashBorder,
    backgroundColor: Colors.dangerWash,
  },
  allergenText: {
    flex: 1,
    fontFamily: Fonts.sans,
    fontSize: 12.5,
    lineHeight: 18,
    color: Colors.danger,
  },
  allergenWord: { fontFamily: Fonts.sansBold },

  section: { paddingHorizontal: 22, paddingTop: 32 },
  eyebrow: {
    fontFamily: Fonts.sansSemibold,
    fontSize: 10,
    letterSpacing: 1.6,
    color: Colors.muted,
    marginBottom: 12,
  },

  nutritionCard: {
    flexDirection: 'row',
    gap: 18,
    backgroundColor: Colors.paper,
    borderRadius: Radius.xl,
    padding: 18,
    borderWidth: 1,
    borderColor: Colors.lineFaint,
    ...Shadows.card,
  },
  nutritionBadgeCol: {
    alignItems: 'center',
    gap: 6,
  },
  nutritionBadgeLabel: {
    fontFamily: Fonts.sansSemibold,
    fontSize: 9.5,
    letterSpacing: 1.2,
    color: Colors.muted,
  },
  nutritionPer: { fontFamily: Fonts.sans, fontSize: 11, color: Colors.muted, marginBottom: 10 },
  nutritionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    paddingVertical: 7,
  },
  nutritionRowDivider: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.line,
    borderStyle: 'dashed',
  },
  nutritionLabel: { fontFamily: Fonts.sans, fontSize: 13, color: Colors.muted },
  nutritionValue: { fontFamily: Fonts.sans, fontSize: 13 },
  nutritionValueStrong: { fontFamily: Fonts.sansSemibold, color: Colors.ink },
  nutritionSuffix: { fontFamily: Fonts.sans, fontSize: 11, color: Colors.muted },

  ingredientsText: {
    fontFamily: Fonts.sans,
    fontSize: 14,
    lineHeight: 22,
    color: Colors.ink,
  },
  ingredientHighlight: {
    backgroundColor: Colors.dangerWash,
    color: Colors.danger,
  },

  aboutCard: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'flex-start',
    backgroundColor: Colors.paper,
    borderRadius: Radius.lg,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.lineFaint,
  },
  aboutIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: 'rgba(200,122,58,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  aboutText: {
    flex: 1,
    fontFamily: Fonts.sans,
    fontSize: 13,
    lineHeight: 19,
    color: Colors.ink,
  },

  ctaWash: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 18,
    paddingTop: 24,
  },
  ctaButton: {
    height: 58,
    borderRadius: Radius.xl,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
  ctaInk: { backgroundColor: Colors.ink, ...Shadows.cta },
  ctaAdded: { backgroundColor: Colors.accent, ...Shadows.cta },
  ctaDisabled: { backgroundColor: 'rgba(21,20,15,0.08)', justifyContent: 'center' },
  ctaOutline: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: Colors.ink,
    gap: 6,
    justifyContent: 'center',
  },
  ctaLeftCluster: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  ctaInkText: {
    fontFamily: Fonts.sansMedium,
    fontSize: 15,
    color: Colors.cream,
  },
  ctaDisabledText: {
    fontFamily: Fonts.sansMedium,
    fontSize: 15,
    color: Colors.muted,
  },
  ctaOutlineText: {
    fontFamily: Fonts.sansMedium,
    fontSize: 14,
    color: Colors.ink,
  },
  ctaPrice: {
    fontFamily: Fonts.serif,
    fontSize: 22,
    letterSpacing: -0.3,
    color: Colors.cream,
    includeFontPadding: false,
  },

  errorTitle: {
    fontFamily: Fonts.serif,
    fontSize: 32,
    lineHeight: 34,
    letterSpacing: -1,
    color: Colors.ink,
    textAlign: 'center',
    includeFontPadding: false,
  },
  errorTitleItalic: { fontFamily: Fonts.serifItalic, color: Colors.amber },
  errorHelper: {
    fontFamily: Fonts.sans,
    fontSize: 13,
    color: Colors.muted,
    textAlign: 'center',
    marginTop: 12,
  },
});
