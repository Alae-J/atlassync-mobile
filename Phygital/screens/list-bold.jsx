// List editor — bold/tactile
// Always editing one list. No inner tabs. Search/add inline. App navbar at bottom.

function ListBold({ time = '9:41' }) {
  const D = window.PHY_DATA;
  const [items, setItems] = React.useState([
    { id: 'banana', qty: 2 },
    { id: 'milk', qty: 1 },
    { id: 'avocado', qty: 4 },
    { id: 'chicken', qty: 1 },
    { id: 'olive-oil', qty: 1 },
  ]);
  const [query, setQuery] = React.useState('');
  const [browseOpen, setBrowseOpen] = React.useState(false);
  const [qtyModal, setQtyModal] = React.useState(null);
  const [pendingQty, setPendingQty] = React.useState(1);

  const ink = '#15140f';
  const cream = '#f4ede0';
  const accent = '#2d5a3d';
  const amber = '#c87a3a';
  const muted = '#7a7163';
  const line = 'rgba(21,20,15,0.10)';

  const productById = (id) => D.products.find((p) => p.id === id);
  const totalEst = items.reduce((s, it) => s + (productById(it.id)?.price || 0) * it.qty, 0);

  const addItem = (id, qty) => setItems((prev) => {
    const ex = prev.find((x) => x.id === id);
    if (ex) return prev.map((x) => x.id === id ? { ...x, qty: x.qty + qty } : x);
    return [...prev, { id, qty }];
  });
  const updateQty = (id, delta) => setItems((prev) => prev.map((x) =>
    x.id === id ? { ...x, qty: Math.max(0, x.qty + delta) } : x
  ).filter((x) => x.qty > 0));

  const openQtyModal = (id) => { setQtyModal(id); setPendingQty(1); setBrowseOpen(false); };
  const confirmQty = () => { addItem(qtyModal, pendingQty); setQtyModal(null); };

  const filteredProducts = (query
    ? D.products.filter((p) => p.name.toLowerCase().includes(query.toLowerCase()))
    : D.products
  ).filter((p) => !items.find((it) => it.id === p.id));

  return (
    <div style={{
      width: '100%', height: '100%',
      background: cream,
      fontFamily: '"Geist", system-ui, sans-serif',
      color: ink,
      display: 'flex', flexDirection: 'column',
      position: 'relative', overflow: 'hidden',
    }}>
      <div style={{
        position: 'absolute', inset: 0,
        background: 'radial-gradient(120% 80% at 50% 0%, rgba(200,122,58,0.08) 0%, transparent 60%)',
        pointerEvents: 'none',
      }} />

      <div style={{ height: 54, flexShrink: 0 }} />

      {/* header */}
      <div style={{ padding: '6px 24px 10px', position: 'relative' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <button style={{
            width: 36, height: 36, borderRadius: 999,
            background: 'rgba(21,20,15,0.06)', border: 'none',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', color: ink,
          }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>
            </svg>
          </button>
          <div style={{
            fontSize: 11, color: muted, letterSpacing: 1.5, fontWeight: 600,
          }}>
            EDITING LIST
          </div>
          <button style={{
            width: 36, height: 36, borderRadius: 999,
            background: 'rgba(21,20,15,0.06)', border: 'none',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', color: ink,
          }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="1"/><circle cx="12" cy="5" r="1"/><circle cx="12" cy="19" r="1"/></svg>
          </button>
        </div>
        <div style={{
          fontFamily: '"Instrument Serif", Georgia, serif',
          fontSize: 46, lineHeight: 0.95, letterSpacing: -1.6,
          fontWeight: 400, marginTop: 12,
        }}>
          Saturday <span style={{ fontStyle: 'italic', color: amber }}>haul.</span>
        </div>
        <div style={{ fontSize: 13, color: muted, marginTop: 6 }}>
          {items.length} items lined up · est. <strong style={{ color: ink, fontWeight: 500 }}>${totalEst.toFixed(2)}</strong>
        </div>
      </div>

      {/* main list */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '12px 0 160px' }}>
        <div style={{ padding: '0 24px' }}>
          {/* inline add-items affordance — top of list */}
          <button onClick={() => setBrowseOpen(true)} style={{
            width: '100%', display: 'flex', alignItems: 'center', gap: 12,
            background: 'transparent', border: `1.5px dashed ${line}`,
            borderRadius: 16, padding: '14px 14px',
            cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left',
            color: muted, marginBottom: 12,
          }}>
            <div style={{
              width: 36, height: 36, borderRadius: 10,
              background: 'rgba(21,20,15,0.06)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', color: ink,
            }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13.5, fontWeight: 500, color: ink }}>Add items</div>
              <div style={{ fontSize: 11.5, marginTop: 2 }}>Search the catalog or pick from staples</div>
            </div>
          </button>

          {items.length === 0 && (
            <div style={{ textAlign: 'center', padding: '40px 16px', color: muted, fontSize: 13 }}>
              Empty. Tap "Add items" above to start.
            </div>
          )}
          {items.map((it) => {
            const p = productById(it.id);
            return (
              <div key={it.id} style={{
                position: 'relative',
                display: 'flex', alignItems: 'center', gap: 14,
                background: '#fffaf0',
                borderRadius: 16, padding: 12,
                marginBottom: 10,
                boxShadow: '0 1px 0 rgba(255,255,255,0.7) inset, 0 4px 12px rgba(20,15,5,0.05), 0 0 0 1px rgba(21,20,15,0.05)',
              }}>
                <div style={{
                  width: 52, height: 52, borderRadius: 12,
                  background: 'linear-gradient(135deg, #fdf3e0, #f5e6cc)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26,
                  boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.6), inset 0 -1px 0 rgba(0,0,0,0.04)',
                }}>{p.emoji}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14.5, fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.name}</div>
                  <div style={{ fontSize: 11.5, color: muted, marginTop: 3, display: 'flex', gap: 6, alignItems: 'center' }}>
                    <span style={{
                      background: 'rgba(45,90,61,0.10)', color: accent,
                      padding: '2px 7px', borderRadius: 999,
                      fontSize: 10, fontWeight: 600, letterSpacing: 0.3,
                    }}>{p.tag}</span>
                    <span>${(p.price * it.qty).toFixed(2)}</span>
                  </div>
                </div>
                <div style={{
                  display: 'flex', alignItems: 'center',
                  background: cream, borderRadius: 999,
                  boxShadow: 'inset 0 1px 2px rgba(20,15,5,0.06)',
                  padding: 3,
                }}>
                  <button onClick={() => updateQty(it.id, -1)} style={{
                    width: 28, height: 28, borderRadius: 999, border: 'none',
                    background: 'transparent', cursor: 'pointer', color: ink,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="5" y1="12" x2="19" y2="12"/></svg>
                  </button>
                  <span style={{ minWidth: 22, textAlign: 'center', fontSize: 14, fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>{it.qty}</span>
                  <button onClick={() => updateQty(it.id, 1)} style={{
                    width: 28, height: 28, borderRadius: 999, border: 'none',
                    background: ink, color: cream, cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* bottom: total bar + app navbar */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0,
        padding: '0 14px 14px',
        pointerEvents: 'none',
      }}>
        {items.length > 0 && (
          <div style={{
            background: ink, color: cream,
            borderRadius: 18, padding: '12px 16px',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            marginBottom: 10,
            boxShadow: '0 12px 28px rgba(21,20,15,0.25), inset 0 1px 0 rgba(255,255,255,0.08)',
            pointerEvents: 'auto',
          }}>
            <div>
              <div style={{ fontSize: 10, opacity: 0.6, letterSpacing: 1.2, fontWeight: 600 }}>TOTAL</div>
              <div style={{
                fontFamily: '"Instrument Serif", Georgia, serif',
                fontSize: 22, lineHeight: 1, letterSpacing: -0.5, marginTop: 2,
              }}>${totalEst.toFixed(2)}</div>
            </div>
            <button style={{
              background: amber, color: ink, border: 'none',
              padding: '10px 14px', borderRadius: 12,
              fontSize: 13, fontWeight: 600, fontFamily: 'inherit',
              cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6,
              boxShadow: '0 4px 10px rgba(200,122,58,0.35)',
              whiteSpace: 'nowrap',
            }}>
              Save & go
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
            </button>
          </div>
        )}

        {/* app navbar — same as Lists index */}
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <div style={{
            background: '#fffdf8',
            borderRadius: 999, padding: 6,
            display: 'flex', gap: 2, alignItems: 'center',
            border: `1px solid ${line}`,
            boxShadow: '0 12px 28px rgba(20,15,5,0.10), 0 2px 6px rgba(20,15,5,0.06)',
            pointerEvents: 'auto',
          }}>
            {[
              { k: 'home', label: 'Home', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9.5 9-7 9 7v10.5a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg> },
              { k: 'lists', label: 'Lists', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"/><rect x="9" y="3" width="6" height="4" rx="1"/><path d="M9 12h6M9 16h4"/></svg> },
              { k: 'orders', label: 'Orders', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg> },
              { k: 'account', label: 'Account', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/></svg> },
            ].map((t) => {
              const active = t.k === 'lists';
              return (
                <button key={t.k} style={{
                  height: 44,
                  padding: active ? '0 16px 0 12px' : '0 12px',
                  border: 'none',
                  background: active ? 'rgba(200,122,58,0.14)' : 'transparent',
                  color: active ? amber : muted,
                  borderRadius: 999,
                  fontSize: 13, fontWeight: 600, fontFamily: 'inherit',
                  cursor: 'pointer',
                  display: 'flex', alignItems: 'center', gap: 8,
                  letterSpacing: -0.1,
                  transition: 'all 0.2s ease',
                }}>
                  <span style={{ display: 'flex', alignItems: 'center' }}>{t.icon}</span>
                  {active && <span>{t.label}</span>}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* browse / search sheet */}
      {browseOpen && (
        <div style={{
          position: 'absolute', inset: 0, zIndex: 8,
          background: 'rgba(21,20,15,0.45)',
          backdropFilter: 'blur(8px)',
          display: 'flex', alignItems: 'flex-end',
          animation: 'fadein .2s',
        }} onClick={() => setBrowseOpen(false)}>
          <div onClick={(e) => e.stopPropagation()} style={{
            width: '100%', height: '78%',
            background: cream,
            borderTopLeftRadius: 28, borderTopRightRadius: 28,
            padding: '14px 0 0',
            animation: 'slideup .3s cubic-bezier(.2,.8,.3,1)',
            display: 'flex', flexDirection: 'column',
          }}>
            <div style={{ width: 40, height: 4, background: line, borderRadius: 999, margin: '0 auto 14px' }} />
            <div style={{ padding: '0 24px 12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{
                fontFamily: '"Instrument Serif", Georgia, serif',
                fontSize: 26, letterSpacing: -0.6,
              }}>Add to <span style={{ fontStyle: 'italic', color: amber }}>list</span></div>
              <button onClick={() => setBrowseOpen(false)} style={{
                width: 32, height: 32, borderRadius: 999, border: 'none',
                background: 'rgba(21,20,15,0.06)', color: ink, cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
            <div style={{ padding: '0 24px 10px' }}>
              <div style={{
                display: 'flex', alignItems: 'center', gap: 10,
                background: '#fff', border: `1px solid ${line}`,
                borderRadius: 14, padding: '0 14px', height: 46,
                boxShadow: '0 2px 6px rgba(20,15,5,0.04)',
              }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={muted} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
                <input
                  type="text" placeholder="Search products…" autoFocus
                  value={query} onChange={(e) => setQuery(e.target.value)}
                  style={{
                    flex: 1, border: 'none', background: 'transparent', outline: 'none',
                    fontSize: 14, fontFamily: 'inherit', color: ink,
                  }}
                />
              </div>
              <div style={{ display: 'flex', gap: 8, padding: '12px 0 4px', overflowX: 'auto', flexWrap: 'wrap' }}>
                {D.tags.map((t) => (
                  <button key={t} style={{
                    background: '#fff', border: `1px solid ${line}`,
                    borderRadius: 999, padding: '6px 12px',
                    fontSize: 12, fontWeight: 500, fontFamily: 'inherit', color: ink,
                    cursor: 'pointer', whiteSpace: 'nowrap',
                  }}>{t}</button>
                ))}
              </div>
            </div>
            <div style={{ flex: 1, overflowY: 'auto', padding: '4px 24px 24px' }}>
              {filteredProducts.map((p) => (
                <button key={p.id} onClick={() => openQtyModal(p.id)} style={{
                  width: '100%', display: 'flex', alignItems: 'center', gap: 12,
                  background: '#fffaf0', border: 'none',
                  borderRadius: 14, padding: 12,
                  marginBottom: 8, cursor: 'pointer',
                  boxShadow: '0 0 0 1px rgba(21,20,15,0.04), 0 2px 6px rgba(20,15,5,0.03)',
                  fontFamily: 'inherit', textAlign: 'left',
                }}>
                  <div style={{
                    width: 44, height: 44, borderRadius: 10,
                    background: 'linear-gradient(135deg, #fdf3e0, #f5e6cc)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22,
                  }}>{p.emoji}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 500 }}>{p.name}</div>
                    <div style={{ fontSize: 11.5, color: muted, marginTop: 2 }}>{p.tag} · ${p.price.toFixed(2)}/{p.unit}</div>
                  </div>
                  <div style={{
                    width: 30, height: 30, borderRadius: 999, background: ink, color: cream,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                  </div>
                </button>
              ))}
              {filteredProducts.length === 0 && (
                <div style={{ textAlign: 'center', padding: '30px 16px', color: muted, fontSize: 13 }}>
                  Nothing matches "{query}".
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* qty modal */}
      {qtyModal && (() => {
        const p = productById(qtyModal);
        return (
          <div style={{
            position: 'absolute', inset: 0, zIndex: 10,
            background: 'rgba(21,20,15,0.45)',
            backdropFilter: 'blur(8px)',
            display: 'flex', alignItems: 'flex-end',
            animation: 'fadein .2s',
          }} onClick={() => setQtyModal(null)}>
            <div onClick={(e) => e.stopPropagation()} style={{
              width: '100%',
              background: cream,
              borderTopLeftRadius: 28, borderTopRightRadius: 28,
              padding: '14px 24px 32px',
              animation: 'slideup .3s cubic-bezier(.2,.8,.3,1)',
            }}>
              <div style={{ width: 40, height: 4, background: line, borderRadius: 999, margin: '0 auto 18px' }} />
              <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 22 }}>
                <div style={{
                  width: 64, height: 64, borderRadius: 16,
                  background: 'linear-gradient(135deg, #fdf3e0, #f5e6cc)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 34,
                  boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.6), inset 0 -1px 0 rgba(0,0,0,0.04)',
                }}>{p.emoji}</div>
                <div>
                  <div style={{
                    fontFamily: '"Instrument Serif", Georgia, serif',
                    fontSize: 24, lineHeight: 1, letterSpacing: -0.4,
                  }}>{p.name}</div>
                  <div style={{ fontSize: 13, color: muted, marginTop: 4 }}>${p.price.toFixed(2)} per {p.unit} · {p.tag}</div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 22 }}>
                <button onClick={() => setPendingQty(Math.max(1, pendingQty - 1))} style={{
                  width: 56, height: 56, borderRadius: 999,
                  background: '#fff', border: `1px solid ${line}`,
                  cursor: 'pointer', color: ink,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: '0 2px 6px rgba(20,15,5,0.05)',
                }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="5" y1="12" x2="19" y2="12"/></svg>
                </button>
                <div style={{
                  fontFamily: '"Instrument Serif", Georgia, serif',
                  fontSize: 72, lineHeight: 1, letterSpacing: -2,
                }}>
                  {pendingQty}
                  <span style={{ fontSize: 18, color: muted, marginLeft: 8, fontFamily: '"Geist", sans-serif', fontWeight: 400 }}>{p.unit}</span>
                </div>
                <button onClick={() => setPendingQty(pendingQty + 1)} style={{
                  width: 56, height: 56, borderRadius: 999,
                  background: ink, color: cream, border: 'none',
                  cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: '0 4px 10px rgba(21,20,15,0.25)',
                }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                </button>
              </div>
              <div style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '14px 16px', background: '#fffaf0', borderRadius: 12,
                border: `1px solid ${line}`, marginBottom: 14, fontSize: 13,
              }}>
                <span style={{ color: muted }}>Subtotal</span>
                <strong style={{ fontFamily: '"Instrument Serif", Georgia, serif', fontSize: 22, fontWeight: 400 }}>${(p.price * pendingQty).toFixed(2)}</strong>
              </div>
              <button onClick={confirmQty} style={{
                width: '100%', height: 54, borderRadius: 14,
                background: ink, color: cream, border: 'none',
                fontSize: 15, fontWeight: 500, fontFamily: 'inherit',
                cursor: 'pointer',
                boxShadow: '0 8px 20px rgba(21,20,15,0.2)',
              }}>Add to list</button>
            </div>
          </div>
        );
      })()}

      <style>{`
        @keyframes fadein { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideup { from { transform: translateY(40px); } to { transform: translateY(0); } }
        ::-webkit-scrollbar { display: none; }
      `}</style>
    </div>
  );
}

window.ListBold = ListBold;
