import { useEffect, useMemo, useState } from 'react';
import { View, Text, TextInput, ScrollView, Pressable, Modal, StyleSheet, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowLeft, ArrowRight, DotsThreeVertical, Plus, Minus, MagnifyingGlass, X, PencilSimple, Trash } from 'phosphor-react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Colors, Fonts, Radius, Shadows, TabBarHeight } from '../src/constants/theme';
import { TabBar } from '../src/components/TabBar';
import { listsApi, productsApi } from '../src/api';
import { toDisplayProduct, type DisplayProduct } from '../src/lib/productDisplay';
import { formatPrice } from '../src/lib/formatPrice';

interface ListItem {
  barcode: string;
  product: DisplayProduct;
  qty: number;
}

const SEARCH_DEBOUNCE_MS = 300;

type EditorOrigin = 'shop-arrive' | 'lists';

export default function ListEditorScreen() {
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ id?: string; from?: string }>();
  const origin: EditorOrigin = params.from === 'shop-arrive' ? 'shop-arrive' : 'lists';

  const listId = useMemo(() => {
    if (!params.id) return null;
    const n = Number(params.id);
    return Number.isFinite(n) && n > 0 ? n : null;
  }, [params.id]);

  // Redirect back if there's no valid numeric id
  useEffect(() => {
    if (params.id !== undefined && listId === null) {
      router.replace('/(tabs)/lists');
    }
  }, [listId, params.id]);

  const [items, setItems] = useState<ListItem[]>([]);
  const [name, setName] = useState('New list');
  const [loadingList, setLoadingList] = useState(!!listId);

  const [browseOpen, setBrowseOpen] = useState(false);
  const [qtyTarget, setQtyTarget] = useState<DisplayProduct | null>(null);
  const [pendingQty, setPendingQty] = useState(1);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<DisplayProduct[]>([]);
  const [searching, setSearching] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [renameOpen, setRenameOpen] = useState(false);
  const [renameDraft, setRenameDraft] = useState('New list');
  const [renameError, setRenameError] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [saving, setSaving] = useState(false);

  // Load existing list on mount
  useEffect(() => {
    if (!listId) return;
    let cancelled = false;
    setLoadingList(true);

    (async () => {
      try {
        const detail = await listsApi.get(listId);
        if (cancelled) return;

        setName(detail.name);
        setRenameDraft(detail.name);

        if (detail.items.length === 0) {
          setItems([]);
          setLoadingList(false);
          return;
        }

        const barcodes = detail.items.map((i) => i.barcode);
        const products = await productsApi.batch(barcodes);
        if (cancelled) return;

        const productMap = new Map(products.map((p) => [p.barcode, p]));

        const enriched: ListItem[] = detail.items
          .map((item) => {
            const product = productMap.get(item.barcode);
            if (!product) return null; // barcode no longer in catalog — skip silently
            return { barcode: item.barcode, product: toDisplayProduct(product), qty: item.qty };
          })
          .filter((it): it is ListItem => it !== null);

        setItems(enriched);
      } catch {
        // Failed to load — leave empty, user can still add items
      } finally {
        if (!cancelled) setLoadingList(false);
      }
    })();

    return () => { cancelled = true; };
  }, [listId]);

  const exit = () => {
    if (origin === 'shop-arrive') router.replace('/shop/arrive');
    else router.replace('/(tabs)/lists');
  };

  const totalEst = items.reduce((sum, it) => sum + it.product.price * it.qty, 0);

  const addItem = (product: DisplayProduct, qty: number) => {
    setItems((prev) => {
      const existing = prev.find((x) => x.barcode === product.barcode);
      if (existing) {
        return prev.map((x) =>
          x.barcode === product.barcode ? { ...x, qty: x.qty + qty } : x,
        );
      }
      return [...prev, { barcode: product.barcode, product, qty }];
    });
  };

  const updateQty = (barcode: string, delta: number) => {
    setItems((prev) =>
      prev
        .map((x) => (x.barcode === barcode ? { ...x, qty: Math.max(0, x.qty + delta) } : x))
        .filter((x) => x.qty > 0),
    );
  };

  const openQtyModal = (product: DisplayProduct) => {
    setQtyTarget(product);
    setPendingQty(1);
    setBrowseOpen(false);
  };

  const confirmQty = () => {
    if (qtyTarget) addItem(qtyTarget, pendingQty);
    setQtyTarget(null);
  };

  const handleSave = async () => {
    if (!listId || saving) return;
    setSaving(true);
    try {
      await listsApi.update(listId, {
        items: items.map((it) => ({ barcode: it.barcode, qty: it.qty })),
      });
      exit();
    } catch {
      setSaving(false);
    }
  };

  const handleRenameConfirm = async () => {
    const trimmed = renameDraft.trim();
    if (!trimmed) return;
    setRenameError(null);

    setName(trimmed);
    setRenameOpen(false);

    if (!listId) return;
    try {
      await listsApi.update(listId, { name: trimmed });
    } catch {
      setRenameError('Could not save name. Try again.');
      // Revert to previous name on failure
      setName(name);
    }
  };

  const handleDelete = async () => {
    setConfirmDelete(false);
    if (!listId) { exit(); return; }
    try {
      await listsApi.remove(listId);
    } catch {
      // Even on error, navigate away — the list will still exist on backend
    }
    exit();
  };

  useEffect(() => {
    if (!browseOpen) return;
    const trimmed = query.trim();
    let cancelled = false;
    setSearching(true);
    const t = setTimeout(async () => {
      try {
        const raw = await productsApi.search({ query: trimmed || undefined, limit: 20 });
        if (!cancelled) setResults(raw.map(toDisplayProduct));
      } catch {
        if (!cancelled) setResults([]);
      } finally {
        if (!cancelled) setSearching(false);
      }
    }, SEARCH_DEBOUNCE_MS);
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, [query, browseOpen]);

  const filteredResults = results.filter(
    (p) => !items.find((it) => it.barcode === p.barcode),
  );

  if (loadingList) {
    return (
      <View style={[styles.root, styles.loadingRoot]}>
        <ActivityIndicator color={Colors.amber} size="large" />
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <LinearGradient
        colors={['rgba(200,122,58,0.08)', 'transparent']}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 0.5 }}
        style={styles.bgWash}
        pointerEvents="none"
      />

      <View style={[styles.header, { paddingTop: insets.top + 6 }]}>
        <View style={styles.headerRow}>
          <Pressable style={styles.iconBtn} onPress={exit}>
            <ArrowLeft size={16} color={Colors.ink} weight="bold" />
          </Pressable>
          <Text style={styles.headerLabel}>EDITING LIST</Text>
          <Pressable style={styles.iconBtn} onPress={() => setMenuOpen(true)}>
            <DotsThreeVertical size={16} color={Colors.ink} weight="bold" />
          </Pressable>
        </View>
        <Text style={styles.heroTitle}>{name}<Text style={styles.heroItalic}>.</Text></Text>
        <Text style={styles.heroMeta}>
          {items.length} items lined up · est. <Text style={styles.heroMetaStrong}>{formatPrice(totalEst)}</Text>
        </Text>
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.list,
          { paddingBottom: TabBarHeight + insets.bottom + (items.length > 0 ? 100 : 24) },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <Pressable style={styles.addCta} onPress={() => setBrowseOpen(true)}>
          <View style={styles.addIcon}>
            <Plus size={16} color={Colors.ink} weight="bold" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.addCtaTitle}>Add items</Text>
            <Text style={styles.addCtaSub}>Search the catalog or pick from staples</Text>
          </View>
        </Pressable>

        {items.length === 0 && (
          <Text style={styles.emptyText}>Empty. Tap "Add items" above to start.</Text>
        )}

        {items.map((it) => (
          <View key={it.barcode} style={styles.itemRow}>
            <View style={styles.itemThumb}>
              <Text style={styles.itemEmoji}>{it.product.emoji}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.itemName} numberOfLines={1}>{it.product.name}</Text>
              <View style={styles.itemMetaRow}>
                {it.product.brand && (
                  <View style={styles.tagPill}>
                    <Text style={styles.tagPillText}>{it.product.brand}</Text>
                  </View>
                )}
                <Text style={styles.itemPrice}>{formatPrice(it.product.price * it.qty)}</Text>
              </View>
            </View>
            <View style={styles.stepper}>
              <Pressable style={styles.stepperBtn} onPress={() => updateQty(it.barcode, -1)}>
                <Minus size={12} color={Colors.ink} weight="bold" />
              </Pressable>
              <Text style={styles.stepperQty}>{it.qty}</Text>
              <Pressable style={styles.stepperBtnFilled} onPress={() => updateQty(it.barcode, 1)}>
                <Plus size={12} color={Colors.cream} weight="bold" />
              </Pressable>
            </View>
          </View>
        ))}
      </ScrollView>

      {items.length > 0 && (
        <View style={[styles.totalBar, { bottom: TabBarHeight + insets.bottom + 14 }]}>
          <View>
            <Text style={styles.totalLabel}>TOTAL</Text>
            <Text style={styles.totalAmount}>{formatPrice(totalEst)}</Text>
          </View>
          <Pressable style={[styles.saveBtn, saving && styles.saveBtnDisabled]} onPress={handleSave} disabled={saving}>
            {saving
              ? <ActivityIndicator size="small" color={Colors.ink} />
              : <>
                  <Text style={styles.saveBtnText}>Save & go</Text>
                  <ArrowRight size={14} color={Colors.ink} weight="bold" />
                </>
            }
          </Pressable>
        </View>
      )}

      <TabBar active="lists" />

      {/* Browse / Add Items sheet */}
      <Modal
        visible={browseOpen}
        transparent
        animationType="slide"
        onRequestClose={() => setBrowseOpen(false)}
      >
        <Pressable style={styles.scrim} onPress={() => setBrowseOpen(false)}>
          <Pressable
            style={[styles.sheet, styles.browseSheet, { paddingBottom: insets.bottom + 12 }]}
            onPress={(e) => e.stopPropagation()}
          >
            <View style={styles.handle} />
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>
                Add to <Text style={styles.sheetTitleItalic}>list</Text>
              </Text>
              <Pressable style={styles.closeBtn} onPress={() => setBrowseOpen(false)}>
                <X size={14} color={Colors.ink} weight="bold" />
              </Pressable>
            </View>
            <View style={styles.searchRow}>
              <MagnifyingGlass size={16} color={Colors.muted} weight="regular" />
              <TextInput
                placeholder="Search products…"
                placeholderTextColor={Colors.muted}
                value={query}
                onChangeText={setQuery}
                style={styles.searchInput}
                autoFocus
              />
            </View>
            <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.searchResults} showsVerticalScrollIndicator={false}>
              {searching && filteredResults.length === 0 ? (
                <View style={styles.searchLoadingRow}>
                  <ActivityIndicator color={Colors.amber} />
                </View>
              ) : filteredResults.length === 0 ? (
                <Text style={styles.noMatch}>
                  {query.trim() ? `Nothing matches "${query}".` : 'Start typing to find products.'}
                </Text>
              ) : (
                filteredResults.map((p) => (
                  <ProductPickRow key={p.barcode} product={p} onPress={() => openQtyModal(p)} />
                ))
              )}
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>

      {/* Qty picker sheet */}
      <Modal
        visible={!!qtyTarget}
        transparent
        animationType="slide"
        onRequestClose={() => setQtyTarget(null)}
      >
        <Pressable style={styles.scrim} onPress={() => setQtyTarget(null)}>
          {qtyTarget && (
            <Pressable
              style={[styles.sheet, styles.qtySheet, { paddingBottom: insets.bottom + 24 }]}
              onPress={(e) => e.stopPropagation()}
            >
              <View style={styles.handle} />
              <View style={styles.qtyHeader}>
                <View style={styles.qtyThumb}>
                  <Text style={styles.qtyEmoji}>{qtyTarget.emoji}</Text>
                </View>
                <View>
                  <Text style={styles.qtyName}>{qtyTarget.name}</Text>
                  <Text style={styles.qtyMeta}>
                    {formatPrice(qtyTarget.price)} per {qtyTarget.unit}
                    {qtyTarget.brand ? ` · ${qtyTarget.brand}` : ''}
                  </Text>
                </View>
              </View>
              <View style={styles.qtyControls}>
                <Pressable
                  style={styles.qtyCircleBtn}
                  onPress={() => setPendingQty((q) => Math.max(1, q - 1))}
                >
                  <Minus size={18} color={Colors.ink} weight="bold" />
                </Pressable>
                <View style={styles.qtyValueRow}>
                  <Text style={styles.qtyValue}>{pendingQty}</Text>
                  <Text style={styles.qtyUnit}>{qtyTarget.unit}</Text>
                </View>
                <Pressable
                  style={[styles.qtyCircleBtn, styles.qtyCircleBtnFilled]}
                  onPress={() => setPendingQty((q) => q + 1)}
                >
                  <Plus size={18} color={Colors.cream} weight="bold" />
                </Pressable>
              </View>
              <View style={styles.qtySubtotal}>
                <Text style={styles.qtySubtotalLabel}>Subtotal</Text>
                <Text style={styles.qtySubtotalValue}>
                  {formatPrice(qtyTarget.price * pendingQty)}
                </Text>
              </View>
              <Pressable style={styles.confirmBtn} onPress={confirmQty}>
                <Text style={styles.confirmBtnText}>Add to list</Text>
              </Pressable>
            </Pressable>
          )}
        </Pressable>
      </Modal>

      {/* Menu sheet */}
      <Modal
        visible={menuOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setMenuOpen(false)}
      >
        <Pressable style={styles.scrim} onPress={() => setMenuOpen(false)}>
          <Pressable
            style={[styles.menuSheet, { paddingBottom: insets.bottom + 24 }]}
            onPress={(e) => e.stopPropagation()}
          >
            <View style={styles.handle} />
            <Pressable
              style={styles.menuRow}
              onPress={() => {
                setMenuOpen(false);
                setRenameDraft(name);
                setRenameError(null);
                setRenameOpen(true);
              }}
            >
              <View style={styles.menuRowIcon}>
                <PencilSimple size={16} color={Colors.ink} weight="regular" />
              </View>
              <Text style={styles.menuRowLabel}>Rename list</Text>
            </Pressable>
            <Pressable
              style={[styles.menuRow, styles.menuRowDestructive]}
              onPress={() => {
                setMenuOpen(false);
                setConfirmDelete(true);
              }}
            >
              <View style={[styles.menuRowIcon, styles.menuRowIconDestructive]}>
                <Trash size={16} color={Colors.danger} weight="regular" />
              </View>
              <Text style={[styles.menuRowLabel, styles.menuRowLabelDestructive]}>Delete list</Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>

      {/* Rename sheet */}
      <Modal
        visible={renameOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setRenameOpen(false)}
      >
        <Pressable style={styles.scrim} onPress={() => setRenameOpen(false)}>
          <Pressable
            style={[styles.alertSheet, { paddingBottom: insets.bottom + 24 }]}
            onPress={(e) => e.stopPropagation()}
          >
            <View style={styles.handle} />
            <Text style={styles.alertTitle}>
              Rename <Text style={styles.alertTitleItalic}>list</Text>
            </Text>
            <TextInput
              value={renameDraft}
              onChangeText={setRenameDraft}
              placeholder="List name"
              placeholderTextColor={Colors.muted}
              style={styles.renameInput}
              autoFocus
              maxLength={48}
            />
            {renameError && (
              <Text style={styles.renameError}>{renameError}</Text>
            )}
            <View style={styles.alertActions}>
              <Pressable style={styles.alertBtnGhost} onPress={() => setRenameOpen(false)}>
                <Text style={styles.alertBtnGhostText}>Cancel</Text>
              </Pressable>
              <Pressable
                style={styles.alertBtnPrimary}
                onPress={handleRenameConfirm}
              >
                <Text style={styles.alertBtnPrimaryText}>Save</Text>
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>

      {/* Delete confirmation sheet */}
      <Modal
        visible={confirmDelete}
        transparent
        animationType="fade"
        onRequestClose={() => setConfirmDelete(false)}
      >
        <Pressable style={styles.scrim} onPress={() => setConfirmDelete(false)}>
          <Pressable
            style={[styles.alertSheet, { paddingBottom: insets.bottom + 24 }]}
            onPress={(e) => e.stopPropagation()}
          >
            <View style={styles.handle} />
            <Text style={styles.alertTitle}>
              Delete <Text style={styles.alertTitleItalic}>{name}</Text>?
            </Text>
            <Text style={styles.alertBody}>
              This list and its {items.length} items will be removed. You can't undo this.
            </Text>
            <View style={styles.alertActions}>
              <Pressable style={styles.alertBtnGhost} onPress={() => setConfirmDelete(false)}>
                <Text style={styles.alertBtnGhostText}>Cancel</Text>
              </Pressable>
              <Pressable
                style={styles.alertBtnDanger}
                onPress={handleDelete}
              >
                <Text style={styles.alertBtnDangerText}>Delete</Text>
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

function ProductPickRow({ product, onPress }: { product: DisplayProduct; onPress: () => void }) {
  return (
    <Pressable style={styles.pickRow} onPress={onPress}>
      <View style={styles.pickThumb}>
        <Text style={styles.pickEmoji}>{product.emoji}</Text>
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.pickName}>{product.name}</Text>
        <Text style={styles.pickMeta}>
          {product.brand ? `${product.brand} · ` : ''}{formatPrice(product.price)}/{product.unit}
        </Text>
      </View>
      <View style={styles.pickAddBtn}>
        <Plus size={14} color={Colors.cream} weight="bold" />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.cream },
  loadingRoot: { alignItems: 'center', justifyContent: 'center' },
  bgWash: { position: 'absolute', top: 0, left: 0, right: 0, height: 320 },

  header: { paddingHorizontal: 24, paddingBottom: 12 },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.inkGlassFill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerLabel: {
    fontFamily: Fonts.sansSemibold,
    fontSize: 11,
    letterSpacing: 1.5,
    color: Colors.muted,
  },
  heroTitle: {
    fontFamily: Fonts.serif,
    fontSize: 46,
    lineHeight: 50,
    letterSpacing: -1.6,
    color: Colors.ink,
    marginTop: 12,
    includeFontPadding: false,
  },
  heroItalic: { fontFamily: Fonts.serifItalic, color: Colors.amber },
  heroMeta: { fontFamily: Fonts.sans, fontSize: 13, color: Colors.muted, marginTop: 6 },
  heroMetaStrong: { fontFamily: Fonts.sansMedium, color: Colors.ink },

  list: { paddingHorizontal: 24, paddingTop: 12 },

  addCta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1.5,
    borderColor: Colors.line,
    borderStyle: 'dashed',
    borderRadius: Radius.xl,
    padding: 14,
    marginBottom: 12,
  },
  addIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: Colors.inkGlassFill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addCtaTitle: { fontFamily: Fonts.sansMedium, fontSize: 13.5, color: Colors.ink },
  addCtaSub: { fontFamily: Fonts.sans, fontSize: 11.5, color: Colors.muted, marginTop: 2 },

  emptyText: {
    textAlign: 'center',
    paddingVertical: 40,
    fontFamily: Fonts.sans,
    fontSize: 13,
    color: Colors.muted,
  },

  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: Colors.card,
    borderRadius: Radius.xl,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: Colors.lineFaint,
    ...Shadows.card,
  },
  itemThumb: {
    width: 52,
    height: 52,
    borderRadius: 12,
    backgroundColor: Colors.tile,
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemEmoji: { fontSize: 26 },
  itemName: { fontFamily: Fonts.sansMedium, fontSize: 14.5, color: Colors.ink },
  itemMetaRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 },
  tagPill: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: Radius.pill,
    backgroundColor: 'rgba(45,90,61,0.10)',
  },
  tagPillText: {
    fontFamily: Fonts.sansSemibold,
    fontSize: 10,
    letterSpacing: 0.3,
    color: Colors.accent,
  },
  itemPrice: { fontFamily: Fonts.sans, fontSize: 11.5, color: Colors.muted },

  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.cream,
    borderRadius: Radius.pill,
    padding: 3,
  },
  stepperBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepperBtnFilled: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.ink,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepperQty: {
    minWidth: 22,
    textAlign: 'center',
    fontFamily: Fonts.sansSemibold,
    fontSize: 14,
    color: Colors.ink,
  },

  totalBar: {
    position: 'absolute',
    left: 14,
    right: 14,
    backgroundColor: Colors.ink,
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    ...Shadows.cta,
  },
  totalLabel: {
    fontFamily: Fonts.sansSemibold,
    fontSize: 10,
    letterSpacing: 1.2,
    color: 'rgba(244,237,224,0.6)',
  },
  totalAmount: {
    fontFamily: Fonts.serif,
    fontSize: 22,
    letterSpacing: -0.5,
    color: Colors.cream,
    marginTop: 2,
  },
  saveBtn: {
    backgroundColor: Colors.amber,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    minWidth: 110,
    justifyContent: 'center',
    ...Shadows.amberCta,
  },
  saveBtnDisabled: { opacity: 0.6 },
  saveBtnText: { fontFamily: Fonts.sansSemibold, fontSize: 13, color: Colors.ink },

  scrim: { flex: 1, backgroundColor: Colors.scrim, justifyContent: 'flex-end' },
  sheet: { backgroundColor: Colors.cream, borderTopLeftRadius: 28, borderTopRightRadius: 28, paddingTop: 14 },
  browseSheet: { height: '78%' },
  qtySheet: { paddingHorizontal: 24, paddingTop: 14 },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: Colors.line,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 16,
  },

  sheetHeader: {
    paddingHorizontal: 24,
    paddingBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sheetTitle: { fontFamily: Fonts.serif, fontSize: 26, letterSpacing: -0.6, color: Colors.ink },
  sheetTitleItalic: { fontFamily: Fonts.serifItalic, color: Colors.amber },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.inkGlassFill,
    alignItems: 'center',
    justifyContent: 'center',
  },

  searchRow: {
    marginHorizontal: 24,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: Colors.line,
    borderRadius: 14,
    paddingHorizontal: 14,
    height: 46,
  },
  searchInput: {
    flex: 1,
    fontFamily: Fonts.sans,
    fontSize: 14,
    color: Colors.ink,
  },
  tagRow: { paddingHorizontal: 24, paddingVertical: 12, gap: 8 },
  tagChip: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: Colors.line,
    borderRadius: Radius.pill,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  tagChipText: { fontFamily: Fonts.sansMedium, fontSize: 12, color: Colors.ink },

  searchResults: { paddingHorizontal: 24, paddingBottom: 24 },
  pickRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: Colors.card,
    borderRadius: 14,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: Colors.lineFaint,
  },
  pickThumb: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: Colors.tile,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pickEmoji: { fontSize: 22 },
  pickName: { fontFamily: Fonts.sansMedium, fontSize: 14, color: Colors.ink },
  pickMeta: { fontFamily: Fonts.sans, fontSize: 11.5, color: Colors.muted, marginTop: 2 },
  pickAddBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: Colors.ink,
    alignItems: 'center',
    justifyContent: 'center',
  },
  noMatch: {
    textAlign: 'center',
    paddingVertical: 30,
    fontFamily: Fonts.sans,
    fontSize: 13,
    color: Colors.muted,
  },
  searchLoadingRow: {
    paddingVertical: 30,
    alignItems: 'center',
  },

  qtyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: 22,
  },
  qtyThumb: {
    width: 64,
    height: 64,
    borderRadius: 16,
    backgroundColor: Colors.tile,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qtyEmoji: { fontSize: 34 },
  qtyName: { fontFamily: Fonts.serif, fontSize: 24, lineHeight: 26, letterSpacing: -0.4, color: Colors.ink },
  qtyMeta: { fontFamily: Fonts.sans, fontSize: 13, color: Colors.muted, marginTop: 4 },
  qtyControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 22,
  },
  qtyCircleBtn: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: Colors.line,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.card,
  },
  qtyCircleBtnFilled: {
    backgroundColor: Colors.ink,
    borderColor: Colors.ink,
  },
  qtyValueRow: { flexDirection: 'row', alignItems: 'baseline', gap: 8 },
  qtyValue: { fontFamily: Fonts.serif, fontSize: 72, lineHeight: 72, letterSpacing: -2, color: Colors.ink },
  qtyUnit: { fontFamily: Fonts.sans, fontSize: 18, color: Colors.muted },
  qtySubtotal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: Colors.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.line,
    marginBottom: 14,
  },
  qtySubtotalLabel: { fontFamily: Fonts.sans, fontSize: 13, color: Colors.muted },
  qtySubtotalValue: { fontFamily: Fonts.serif, fontSize: 22, color: Colors.ink },
  confirmBtn: {
    height: 54,
    borderRadius: 14,
    backgroundColor: Colors.ink,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.cta,
  },
  confirmBtnText: { fontFamily: Fonts.sansMedium, fontSize: 15, color: Colors.cream },

  menuSheet: {
    backgroundColor: Colors.cream,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 18,
    paddingTop: 14,
    paddingBottom: 24,
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingVertical: 14,
    paddingHorizontal: 6,
    borderRadius: Radius.lg,
  },
  menuRowDestructive: {},
  menuRowIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: Colors.inkGlassFill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuRowIconDestructive: { backgroundColor: 'rgba(184,69,55,0.10)' },
  menuRowLabel: { fontFamily: Fonts.sansMedium, fontSize: 15, color: Colors.ink },
  menuRowLabelDestructive: { color: Colors.danger },

  alertSheet: {
    backgroundColor: Colors.cream,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 24,
    paddingTop: 14,
  },
  alertTitle: {
    fontFamily: Fonts.serif,
    fontSize: 28,
    lineHeight: 32,
    letterSpacing: -0.6,
    color: Colors.ink,
    marginBottom: 10,
    includeFontPadding: false,
  },
  alertTitleItalic: { fontFamily: Fonts.serifItalic, color: Colors.amber },
  alertBody: {
    fontFamily: Fonts.sans,
    fontSize: 13,
    lineHeight: 19.5,
    color: Colors.muted,
    marginBottom: 18,
  },
  renameInput: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: Colors.line,
    borderRadius: 14,
    paddingHorizontal: 14,
    height: 50,
    fontFamily: Fonts.sans,
    fontSize: 15,
    color: Colors.ink,
    marginBottom: 10,
  },
  renameError: {
    fontFamily: Fonts.sans,
    fontSize: 12,
    color: Colors.danger,
    marginBottom: 10,
  },
  alertActions: { flexDirection: 'row', gap: 8 },
  alertBtnGhost: {
    flex: 1,
    height: 50,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.line,
    alignItems: 'center',
    justifyContent: 'center',
  },
  alertBtnGhostText: { fontFamily: Fonts.sansMedium, fontSize: 14, color: Colors.muted },
  alertBtnPrimary: {
    flex: 1,
    height: 50,
    borderRadius: 12,
    backgroundColor: Colors.ink,
    alignItems: 'center',
    justifyContent: 'center',
  },
  alertBtnPrimaryText: { fontFamily: Fonts.sansMedium, fontSize: 14, color: Colors.cream },
  alertBtnDanger: {
    flex: 1,
    height: 50,
    borderRadius: 12,
    backgroundColor: Colors.danger,
    alignItems: 'center',
    justifyContent: 'center',
  },
  alertBtnDangerText: { fontFamily: Fonts.sansMedium, fontSize: 14, color: Colors.cream },
});
