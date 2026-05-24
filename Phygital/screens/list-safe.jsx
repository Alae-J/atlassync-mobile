// ListSafe.jsx — Option A: Calm, structured shopping list editor
// Search + add via quantity modal, saved lists drawer, grouped by tag,
// running estimate footer.

function ListSafe({ time = '9:41' }) {
  const D = window.PHY_DATA;
  const [view, setView] = React.useState('list'); // 'list' | 'saved' | 'search'
  const [items, setItems] = React.useState([
    { id: 'banana', qty: 2 },
    { id: 'milk', qty: 1 },
    { id: 'bread', qty: 1 },
    { id: 'eggs', qty: 1 },
    { id: 'avocado', qty: 4 },
  ]);
  const [query, setQuery] = React.useState('');
  const [qtyModal, setQtyModal] = React.useState(null); // productId
  const [pendingQty, setPendingQty] = React.useState(1);

  const ink = '#1c1a17';
  const muted = '#8a8175';
  const paper = '#faf8f4';
  const line = '#e8e2d6';
  const accent = '#3d6e4a';

  const productById = (id) => D.products.find((p) => p.id === id);
  const totalEst = items.reduce((sum, it) => {
    const p = productById(it.id);
    return p ? sum + p.price * it.qty : sum;
  }, 0);

  const grouped = D.tags.reduce((acc, tag) => {
    const inTag = items.filter((it) => productById(it.id)?.tag === tag);
    if (inTag.length) acc[tag] = inTag;
    return acc;
  }, {});

  const addItem = (id, qty) => {
    setItems((prev) => {
      const existing = prev.find((x) => x.id === id);
      if (existing) return prev.map((x) => x.id === id ? { ...x, qty: x.qty + qty } : x);
      return [...prev, { id, qty }];
    });
  };
  const removeItem = (id) => setItems((prev) => prev.filter((x) => x.id !== id));
  const updateQty = (id, delta) => setItems((prev) => prev.map((x) =>
    x.id === id ? { ...x, qty: Math.max(0, x.qty + delta) } : x
  ).filter((x) => x.qty > 0));

  const openQtyModal = (productId) => {
    setQtyModal(productId);
    setPendingQty(1);
  };
  const confirmQty = () => {
    addItem(qtyModal, pendingQty);
    setQtyModal(null);
    setQuery('');
    setView('list');
  };

  const loadSavedList = (savedList) => {
    setItems(savedList.items.map((id) => ({ id, qty: 1 })));
    setView('list');
  };

  const filteredProducts = query
    ? D.products.filter((p) => p.name.toLowerCase().includes(query.toLowerCase()))
    : [];

  return (
    <div style={{
      width: '100%', height: '100%',
      background: paper, color: ink,
      fontFamily: '"Geist", system-ui, sans-serif',
      display: 'flex', flexDirection: 'column',
      position: 'relative', overflow: 'hidden',
    }}>
      <div style={{ height: 54, flexShrink: 0 }} />

      {/* header */}
      <div style={{ padding: '8px 24px 16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
          <button style={{
            background: 'transparent', border: 'none', padding: 0, cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: 4, color: ink,
          }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
          </button>
          <div style={{
            fontSize: 11, color: muted, letterSpacing: 1.5, fontWeight: 600,
            display: 'flex', alignItems: 'center', gap: 6,
          }}>
            <span style={{ width: 6, height: 6, borderRadius: 999, background: accent }} />
            PHYGITAL
          </div>
          <button style={{
            background: 'transparent', border: 'none', padding: 0, cursor: 'pointer', color: ink,
          }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="3"/></svg>
          </button>
        </div>

        <div style={{
          fontFamily: '"Instrument Serif", Georgia, serif',
          fontSize: 38, lineHeight: 1, letterSpacing: -1, fontWeight: 400,
        }}>
          Your <span style={{ fontStyle: 'italic', color: accent }}>list.</span>
        </div>
        <div style={{ fontSize: 13, color: muted, marginTop: 6 }}>
          {items.length} items · est. <strong style={{ color: ink, fontWeight: 500 }}>${totalEst.toFixed(2)}</strong>
        </div>
      </div>

      {/* search bar */}
      <div style={{ padding: '0 24px 12px' }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10,
          background: '#fff', border: `1px solid ${line}`,
          borderRadius: 12, padding: '0 14px', height: 44,
        }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={muted} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
          <input
            type="text" placeholder="Add a product…"
            value={query}
            onChange={(e) => { setQuery(e.target.value); setView(e.target.value ? 'search' : 'list'); }}
            style={{
              flex: 1, border: 'none', background: 'transparent', outline: 'none',
              fontSize: 14, fontFamily: 'inherit', color: ink,
            }}
          />
          <button onClick={() => setView(view === 'saved' ? 'list' : 'saved')} style={{
            background: view === 'saved' ? ink : 'transparent',
            color: view === 'saved' ? paper : muted,
            border: 'none', borderRadius: 8, padding: '4px 10px',
            fontSize: 11.5, fontWeight: 500, fontFamily: 'inherit',
            cursor: 'pointer', letterSpacing: 0.2,
          }}>Saved</button>
        </div>
      </div>

      {/* main scroll area */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '4px 24px 0' }}>
        {view === 'search' && (
          <div style={{ paddingTop: 4 }}>
            {filteredProducts.length === 0 && (
              <div style={{ fontSize: 13, color: muted, textAlign: 'center', padding: 20 }}>
                No matches for "{query}"
              </div>
            )}
            {filteredProducts.map((p) => (
              <button key={p.id} onClick={() => openQtyModal(p.id)} style={{
                display: 'flex', alignItems: 'center', gap: 12,
                width: '100%', padding: '10px 4px',
                background: 'transparent', border: 'none', borderBottom: `1px solid ${line}`,
                cursor: 'pointer', textAlign: 'left',
              }}>
                <div style={{
                  width: 40, height: 40, borderRadius: 10,
                  background: '#fff', border: `1px solid ${line}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20,
                }}>{p.emoji}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 500, color: ink }}>{p.name}</div>
                  <div style={{ fontSize: 11.5, color: muted, marginTop: 2 }}>{p.tag} · ${p.price.toFixed(2)}/{p.unit}</div>
                </div>
                <div style={{
                  width: 28, height: 28, borderRadius: 999, background: ink, color: paper,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                </div>
              </button>
            ))}
          </div>
        )}

        {view === 'saved' && (
          <div>
            <div style={{ fontSize: 11, color: muted, fontWeight: 600, letterSpacing: 1.4, padding: '12px 4px 8px' }}>
              SAVED LISTS
            </div>
            {D.savedLists.map((sl) => (
              <button key={sl.id} onClick={() => loadSavedList(sl)} style={{
                display: 'flex', alignItems: 'center', gap: 12,
                width: '100%', padding: '14px 14px',
                background: '#fff', border: `1px solid ${line}`, borderRadius: 12,
                marginBottom: 8, cursor: 'pointer', textAlign: 'left',
                fontFamily: 'inherit',
              }}>
                <div style={{
                  width: 40, height: 40, borderRadius: 10,
                  background: paper, border: `1px solid ${line}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', color: ink,
                }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 500 }}>{sl.name}</div>
                  <div style={{ fontSize: 11.5, color: muted, marginTop: 2 }}>{sl.count} items · used {sl.lastUsed}</div>
                </div>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={muted} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
              </button>
            ))}
          </div>
        )}

        {view === 'list' && (
          <div style={{ paddingBottom: 120 }}>
            {Object.keys(grouped).length === 0 && (
              <div style={{ textAlign: 'center', padding: '40px 16px', color: muted, fontSize: 13 }}>
                Your list is empty. Search or pick a saved list.
              </div>
            )}
            {Object.entries(grouped).map(([tag, list]) => (
              <div key={tag} style={{ marginBottom: 18 }}>
                <div style={{
                  fontSize: 10.5, color: muted, fontWeight: 600,
                  letterSpacing: 1.5, padding: '12px 4px 8px',
                  display: 'flex', alignItems: 'center', gap: 8,
                }}>
                  <span style={{ textTransform: 'uppercase' }}>{tag}</span>
                  <span style={{ flex: 1, height: 1, background: line }} />
                  <span style={{ color: muted, opacity: 0.6 }}>{list.length}</span>
                </div>
                {list.map((it) => {
                  const p = productById(it.id);
                  return (
                    <div key={it.id} style={{
                      display: 'flex', alignItems: 'center', gap: 12,
                      padding: '10px 4px', borderBottom: `1px solid ${line}`,
                    }}>
                      <div style={{
                        width: 38, height: 38, borderRadius: 10,
                        background: '#fff', border: `1px solid ${line}`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 19,
                      }}>{p.emoji}</div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 14, fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.name}</div>
                        <div style={{ fontSize: 11.5, color: muted, marginTop: 2 }}>${(p.price * it.qty).toFixed(2)} · {it.qty} {p.unit}</div>
                      </div>
                      <div style={{
                        display: 'flex', alignItems: 'center', gap: 0,
                        background: '#fff', border: `1px solid ${line}`, borderRadius: 999,
                        height: 32, padding: '0 4px',
                      }}>
                        <button onClick={() => updateQty(it.id, -1)} style={{
                          width: 24, height: 24, border: 'none', background: 'transparent',
                          cursor: 'pointer', color: ink, display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="5" y1="12" x2="19" y2="12"/></svg>
                        </button>
                        <span style={{ minWidth: 20, textAlign: 'center', fontSize: 13, fontWeight: 500, fontVariantNumeric: 'tabular-nums' }}>{it.qty}</span>
                        <button onClick={() => updateQty(it.id, 1)} style={{
                          width: 24, height: 24, border: 'none', background: 'transparent',
                          cursor: 'pointer', color: ink, display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* sticky footer CTA */}
      {view === 'list' && items.length > 0 && (
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0,
          padding: '14px 24px 32px',
          background: `linear-gradient(180deg, transparent, ${paper} 30%)`,
        }}>
          <button style={{
            width: '100%', height: 54, borderRadius: 14,
            background: ink, color: paper, border: 'none',
            fontSize: 15, fontWeight: 500, fontFamily: 'inherit',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '0 22px', cursor: 'pointer',
            boxShadow: '0 8px 20px rgba(21,20,15,0.18)',
          }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              Save & continue
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 8, opacity: 0.85 }}>
              ${totalEst.toFixed(2)}
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
            </span>
          </button>
        </div>
      )}

      {/* qty modal */}
      {qtyModal && (() => {
        const p = productById(qtyModal);
        return (
          <div style={{
            position: 'absolute', inset: 0, zIndex: 10,
            background: 'rgba(28,26,23,0.4)',
            backdropFilter: 'blur(6px)',
            display: 'flex', alignItems: 'flex-end',
            animation: 'fadein .2s',
          }} onClick={() => setQtyModal(null)}>
            <div onClick={(e) => e.stopPropagation()} style={{
              width: '100%',
              background: paper,
              borderTopLeftRadius: 24, borderTopRightRadius: 24,
              padding: '14px 24px 32px',
              animation: 'slideup .25s cubic-bezier(.2,.8,.3,1)',
            }}>
              <div style={{ width: 36, height: 4, background: line, borderRadius: 999, margin: '0 auto 18px' }} />
              <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 22 }}>
                <div style={{
                  width: 56, height: 56, borderRadius: 14,
                  background: '#fff', border: `1px solid ${line}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 30,
                }}>{p.emoji}</div>
                <div>
                  <div style={{ fontSize: 17, fontWeight: 500 }}>{p.name}</div>
                  <div style={{ fontSize: 13, color: muted, marginTop: 2 }}>${p.price.toFixed(2)} per {p.unit}</div>
                </div>
              </div>
              <div style={{ fontSize: 11, color: muted, fontWeight: 600, letterSpacing: 1.4, marginBottom: 10 }}>QUANTITY</div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 22 }}>
                <button onClick={() => setPendingQty(Math.max(1, pendingQty - 1))} style={{
                  width: 48, height: 48, borderRadius: 999, background: '#fff', border: `1px solid ${line}`,
                  cursor: 'pointer', color: ink, display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="5" y1="12" x2="19" y2="12"/></svg>
                </button>
                <div style={{
                  fontFamily: '"Instrument Serif", Georgia, serif',
                  fontSize: 56, lineHeight: 1, letterSpacing: -1.5,
                }}>
                  {pendingQty}
                  <span style={{ fontSize: 16, color: muted, marginLeft: 8, fontFamily: '"Geist", sans-serif', fontWeight: 400 }}>{p.unit}</span>
                </div>
                <button onClick={() => setPendingQty(pendingQty + 1)} style={{
                  width: 48, height: 48, borderRadius: 999, background: '#fff', border: `1px solid ${line}`,
                  cursor: 'pointer', color: ink, display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                </button>
              </div>
              <div style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '12px 14px', background: '#fff', borderRadius: 10,
                border: `1px solid ${line}`, marginBottom: 14, fontSize: 13,
              }}>
                <span style={{ color: muted }}>Estimated subtotal</span>
                <strong style={{ fontWeight: 500 }}>${(p.price * pendingQty).toFixed(2)}</strong>
              </div>
              <button onClick={confirmQty} style={{
                width: '100%', height: 52, borderRadius: 14,
                background: ink, color: paper, border: 'none',
                fontSize: 15, fontWeight: 500, fontFamily: 'inherit',
                cursor: 'pointer',
              }}>Add to list</button>
            </div>
          </div>
        );
      })()}

      <style>{`
        @keyframes fadein { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideup { from { transform: translateY(40px); } to { transform: translateY(0); } }
      `}</style>
    </div>
  );
}

window.ListSafe = ListSafe;
