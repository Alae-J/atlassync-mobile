// Shopping flow — bold/tactile (Option B)
// Five screens that span: arrive → scan-as-you-go → substitution → review → walk out.
// Each screen is a separate component so the design canvas can show them side-by-side.

const SHOP_BOLD = (() => {
  const ink = '#15140f';
  const cream = '#f4ede0';
  const accent = '#2d5a3d';
  const amber = '#c87a3a';
  const muted = '#7a7163';
  const line = 'rgba(21,20,15,0.10)';
  const dark = '#0d0c0a';
  return { ink, cream, accent, amber, muted, line, dark };
})();

// ─────────────────────────────────────────────
// 1. ARRIVE — choose how to shop
// ─────────────────────────────────────────────
function ShopArrive() {
  const D = window.PHY_DATA;
  const { ink, cream, amber, muted, line, accent } = SHOP_BOLD;
  const [selected, setSelected] = React.useState(D.savedLists[0].id);

  return (
    <div style={{
      width: '100%', height: '100%',
      background: cream, color: ink,
      fontFamily: '"Geist", system-ui, sans-serif',
      display: 'flex', flexDirection: 'column',
      position: 'relative', overflow: 'hidden',
    }}>
      <div style={{
        position: 'absolute', inset: 0,
        background: 'radial-gradient(120% 80% at 50% 0%, rgba(200,122,58,0.08) 0%, transparent 60%)',
        pointerEvents: 'none',
      }} />

      <div style={{ height: 54, flexShrink: 0 }} />

      {/* tiny header */}
      <div style={{ padding: '6px 24px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
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
        <div style={{ fontSize: 11, color: muted, letterSpacing: 1.5, fontWeight: 600 }}>
          IN-STORE
        </div>
        <div style={{ width: 36 }} />
      </div>

      {/* hero — location */}
      <div style={{ padding: '16px 24px 8px', position: 'relative', zIndex: 1 }}>
        <div style={{ fontSize: 11, color: muted, letterSpacing: 1.5, fontWeight: 600, marginBottom: 6 }}>
          ◉ DETECTED · YOU'RE AT
        </div>
        <div style={{
          fontFamily: '"Instrument Serif", Georgia, serif',
          fontSize: 44, lineHeight: 0.95, letterSpacing: -1.6,
          fontWeight: 400,
        }}>
          Marina <span style={{ fontStyle: 'italic', color: amber }}>Foods.</span>
        </div>
        <div style={{ fontSize: 12.5, color: muted, marginTop: 6 }}>
          412 Chestnut St · open until 10pm
        </div>
      </div>

      {/* scrollable middle */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '14px 24px 12px', position: 'relative', zIndex: 1 }}>
        {/* prompt */}
        <div style={{ fontSize: 11, color: muted, letterSpacing: 1.5, fontWeight: 600, marginBottom: 10 }}>
          HOW DO YOU WANT TO SHOP?
        </div>

        {/* saved lists — selectable */}
        {D.savedLists.map((sl) => {
          const isSel = selected === sl.id;
          const total = sl.items.reduce((s, id) => s + (D.products.find(p => p.id === id)?.price || 0), 0);
          return (
            <button key={sl.id} onClick={() => setSelected(sl.id)} style={{
              width: '100%', textAlign: 'left',
              background: isSel ? '#fffaf0' : 'transparent',
              border: isSel ? '1.5px solid rgba(45,90,61,0.5)' : `1px solid ${line}`,
              borderRadius: 16, padding: '12px 14px',
              marginBottom: 8, cursor: 'pointer',
              fontFamily: 'inherit',
              display: 'flex', alignItems: 'center', gap: 12,
              boxShadow: isSel ? '0 6px 16px rgba(45,90,61,0.10), 0 1px 0 rgba(255,255,255,0.7) inset' : 'none',
              transition: 'all .15s',
            }}>
              <div style={{
                width: 22, height: 22, borderRadius: '50%',
                border: isSel ? `6px solid ${accent}` : `1.5px solid ${line}`,
                background: isSel ? cream : 'transparent',
                flexShrink: 0,
                transition: 'all .15s',
              }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                  fontFamily: '"Instrument Serif", Georgia, serif',
                  fontSize: 20, lineHeight: 1.05, letterSpacing: -0.4,
                }}>{sl.name}</div>
                <div style={{ fontSize: 11.5, color: muted, marginTop: 3, display: 'flex', gap: 6, alignItems: 'center' }}>
                  <span>{sl.items.length} items</span>
                  <span style={{ opacity: 0.5 }}>·</span>
                  <span>~${total.toFixed(2)}</span>
                  <span style={{ opacity: 0.5 }}>·</span>
                  <span>used {sl.lastUsed}</span>
                </div>
              </div>
              {/* mini emoji peek */}
              <div style={{ display: 'flex', gap: 2 }}>
                {sl.items.slice(0, 3).map((id) => {
                  const p = D.products.find(x => x.id === id);
                  return (
                    <div key={id} style={{
                      width: 26, height: 26, borderRadius: 7,
                      background: 'linear-gradient(135deg, #fdf3e0, #f5e6cc)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14,
                      boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.6)',
                    }}>{p?.emoji}</div>
                  );
                })}
              </div>
            </button>
          );
        })}

        {/* divider with "or" */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '14px 0 10px' }}>
          <div style={{ flex: 1, height: 1, background: line }} />
          <div style={{ fontSize: 10, color: muted, letterSpacing: 1.4, fontWeight: 600 }}>OR</div>
          <div style={{ flex: 1, height: 1, background: line }} />
        </div>

        {/* alt actions */}
        <div style={{ display: 'flex', gap: 8 }}>
          <button style={{
            flex: 1,
            background: 'transparent', border: `1.5px dashed ${line}`,
            borderRadius: 14, padding: '14px 12px',
            cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left', color: ink,
            display: 'flex', flexDirection: 'column', gap: 6,
          }}>
            <div style={{
              width: 32, height: 32, borderRadius: 10,
              background: 'rgba(21,20,15,0.06)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', color: ink,
            }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            </div>
            <div style={{ fontSize: 13, fontWeight: 500 }}>New list</div>
            <div style={{ fontSize: 11, color: muted, lineHeight: 1.35 }}>Build it on the fly as you shop.</div>
          </button>
          <button style={{
            flex: 1,
            background: 'transparent', border: `1.5px dashed ${line}`,
            borderRadius: 14, padding: '14px 12px',
            cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left', color: ink,
            display: 'flex', flexDirection: 'column', gap: 6,
          }}>
            <div style={{
              width: 32, height: 32, borderRadius: 10,
              background: 'rgba(21,20,15,0.06)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', color: ink,
            }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="7" width="18" height="13" rx="2"/><circle cx="12" cy="13.5" r="3.5"/><path d="M9 7l1.5-3h3L15 7"/></svg>
            </div>
            <div style={{ fontSize: 13, fontWeight: 500 }}>No list</div>
            <div style={{ fontSize: 11, color: muted, lineHeight: 1.35 }}>Just scan as you go. Freestyle.</div>
          </button>
        </div>
      </div>

      {/* primary CTA */}
      <div style={{ padding: '0 24px 24px', position: 'relative', zIndex: 1 }}>
        <button style={{
          width: '100%',
          height: 58, borderRadius: 16,
          background: ink, color: cream, border: 'none',
          fontSize: 15, fontWeight: 500, fontFamily: 'inherit',
          cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '0 20px',
          boxShadow: '0 12px 28px rgba(21,20,15,0.22), inset 0 1px 0 rgba(255,255,255,0.08)',
        }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="7" width="18" height="13" rx="2"/><circle cx="12" cy="13.5" r="3.5"/><path d="M9 7l1.5-3h3L15 7"/>
            </svg>
            Start scanning
          </span>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
        </button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// 2. SHOPPING — viewfinder hero
// ─────────────────────────────────────────────
function ShopScanning() {
  const D = window.PHY_DATA;
  const { ink, cream, amber, muted, accent, dark } = SHOP_BOLD;

  const remaining = ['milk','avocado','chicken','olive-oil','bread','eggs'];
  const captured = ['banana']; // already grabbed
  const justScanned = D.products.find(p => p.id === 'banana');
  const totalSoFar = captured.reduce((s, id) => s + (D.products.find(p => p.id === id)?.price || 0), 0);

  return (
    <div style={{
      width: '100%', height: '100%',
      background: dark, color: cream,
      fontFamily: '"Geist", system-ui, sans-serif',
      display: 'flex', flexDirection: 'column',
      position: 'relative', overflow: 'hidden',
    }}>
      {/* fake camera viewfinder background */}
      <div style={{
        position: 'absolute', inset: 0,
        background: `
          radial-gradient(60% 50% at 50% 45%, rgba(200,122,58,0.18), transparent 70%),
          radial-gradient(40% 30% at 30% 30%, rgba(45,90,61,0.18), transparent 70%),
          linear-gradient(180deg, #0a0908 0%, #1a1614 50%, #0d0a08 100%)
        `,
      }} />
      {/* scanline */}
      <div style={{
        position: 'absolute', left: 36, right: 36, top: '36%',
        height: 2, background: `linear-gradient(90deg, transparent, ${amber}, transparent)`,
        boxShadow: `0 0 14px ${amber}`,
        animation: 'scanline 2s ease-in-out infinite',
      }} />

      {/* status bar gap */}
      <div style={{ height: 54, flexShrink: 0 }} />

      {/* top bar */}
      <div style={{ padding: '6px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative', zIndex: 2 }}>
        <button style={{
          width: 38, height: 38, borderRadius: 999,
          background: 'rgba(255,255,255,0.10)', border: 'none', backdropFilter: 'blur(8px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', color: cream,
          cursor: 'pointer',
        }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>

        <div style={{
          background: 'rgba(255,255,255,0.10)', backdropFilter: 'blur(8px)',
          padding: '8px 14px', borderRadius: 999,
          display: 'flex', alignItems: 'center', gap: 10,
        }}>
          <div style={{ fontSize: 9.5, opacity: 0.65, letterSpacing: 1.2, fontWeight: 600 }}>CART</div>
          <div style={{
            fontFamily: '"Instrument Serif", Georgia, serif',
            fontSize: 18, letterSpacing: -0.2,
          }}>${totalSoFar.toFixed(2)}</div>
        </div>

        <button style={{
          width: 38, height: 38, borderRadius: 999,
          background: 'rgba(255,255,255,0.10)', border: 'none', backdropFilter: 'blur(8px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', color: cream,
          cursor: 'pointer',
        }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>
        </button>
      </div>

      {/* viewfinder bracket */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', zIndex: 2 }}>
        <div style={{
          width: 240, height: 240, position: 'relative',
        }}>
          {[
            { top: 0, left: 0, br: 'tl' },
            { top: 0, right: 0, br: 'tr' },
            { bottom: 0, left: 0, br: 'bl' },
            { bottom: 0, right: 0, br: 'br' },
          ].map((c) => (
            <div key={c.br} style={{
              position: 'absolute', width: 38, height: 38,
              borderTop: c.br.startsWith('t') ? `3px solid ${cream}` : 'none',
              borderBottom: c.br.startsWith('b') ? `3px solid ${cream}` : 'none',
              borderLeft: c.br.endsWith('l') ? `3px solid ${cream}` : 'none',
              borderRight: c.br.endsWith('r') ? `3px solid ${cream}` : 'none',
              borderTopLeftRadius: c.br === 'tl' ? 8 : 0,
              borderTopRightRadius: c.br === 'tr' ? 8 : 0,
              borderBottomLeftRadius: c.br === 'bl' ? 8 : 0,
              borderBottomRightRadius: c.br === 'br' ? 8 : 0,
              ...c,
            }} />
          ))}
          {/* hint label inside frame */}
          <div style={{
            position: 'absolute', inset: 0,
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            color: 'rgba(244,237,224,0.55)', textAlign: 'center', gap: 8,
          }}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
              <path d="M3 5h2v14H3zM7 5h1v14H7zM10 5h2v14h-2zM13 5h1v14h-1zM16 5h3v14h-3zM21 5v14"/>
            </svg>
            <div style={{ fontSize: 11.5, letterSpacing: 0.8 }}>Aim at a barcode</div>
          </div>
        </div>
      </div>

      {/* just-scanned toast — pinned above the list peek */}
      <div style={{
        margin: '0 16px 12px',
        background: cream, color: ink,
        borderRadius: 16, padding: '10px 14px',
        display: 'flex', alignItems: 'center', gap: 12,
        boxShadow: '0 18px 40px rgba(0,0,0,0.45)',
        position: 'relative', zIndex: 2,
        animation: 'pop .3s cubic-bezier(.2,.8,.3,1.2)',
      }}>
        <div style={{
          width: 44, height: 44, borderRadius: 12,
          background: 'linear-gradient(135deg, #fdf3e0, #f5e6cc)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22,
        }}>{justScanned.emoji}</div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 10, color: accent, letterSpacing: 1.2, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4 }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
            ADDED TO CART
          </div>
          <div style={{ fontSize: 14, fontWeight: 500, marginTop: 2 }}>{justScanned.name}</div>
          <div style={{ fontSize: 11.5, color: muted, marginTop: 1 }}>${justScanned.price.toFixed(2)}/{justScanned.unit}</div>
        </div>
        <button style={{
          background: 'transparent', border: 'none', color: muted,
          fontSize: 12, fontWeight: 500, fontFamily: 'inherit', cursor: 'pointer',
          padding: '6px 8px',
        }}>Undo</button>
      </div>

      {/* list peek — bottom sheet handle */}
      <div style={{
        background: cream, color: ink,
        borderTopLeftRadius: 26, borderTopRightRadius: 26,
        padding: '10px 22px 22px',
        position: 'relative', zIndex: 2,
        boxShadow: '0 -8px 28px rgba(0,0,0,0.35)',
      }}>
        <div style={{ width: 40, height: 4, background: 'rgba(21,20,15,0.18)', borderRadius: 999, margin: '0 auto 12px' }} />
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 10 }}>
          <div style={{
            fontFamily: '"Instrument Serif", Georgia, serif',
            fontSize: 22, letterSpacing: -0.4,
          }}>Still to grab</div>
          <div style={{ fontSize: 12, color: muted }}>{remaining.length} left · 1 done</div>
        </div>
        <div style={{ display: 'flex', gap: 8, overflowX: 'auto' }}>
          {remaining.map((id) => {
            const p = D.products.find(x => x.id === id);
            return (
              <div key={id} style={{
                flexShrink: 0,
                background: '#fffaf0',
                borderRadius: 14, padding: '8px 10px 10px',
                width: 76,
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
                boxShadow: '0 0 0 1px rgba(21,20,15,0.05), 0 2px 6px rgba(20,15,5,0.04)',
              }}>
                <div style={{
                  width: 44, height: 44, borderRadius: 10,
                  background: 'linear-gradient(135deg, #fdf3e0, #f5e6cc)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22,
                }}>{p.emoji}</div>
                <div style={{ fontSize: 10.5, fontWeight: 500, textAlign: 'center', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', width: '100%' }}>{p.name.split(' ')[0]}</div>
              </div>
            );
          })}
        </div>
      </div>

      <style>{`
        @keyframes scanline { 0%, 100% { transform: translateY(-90px); opacity: 0.4; } 50% { transform: translateY(90px); opacity: 1; } }
        @keyframes pop { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
      `}</style>
    </div>
  );
}

// ─────────────────────────────────────────────
// 3. SUBSTITUTION — out of stock
// ─────────────────────────────────────────────
function ShopSubstitute() {
  const D = window.PHY_DATA;
  const { ink, cream, amber, muted, accent, line, dark } = SHOP_BOLD;
  const original = D.products.find(p => p.id === 'avocado');
  const sub = { id: 'avocado-organic', name: 'Organic avocado', tag: 'Produce', price: 1.79, unit: 'ea', emoji: '🥑' };

  return (
    <div style={{
      width: '100%', height: '100%',
      background: dark,
      fontFamily: '"Geist", system-ui, sans-serif',
      display: 'flex', flexDirection: 'column',
      position: 'relative', overflow: 'hidden',
    }}>
      {/* faint viewfinder behind */}
      <div style={{
        position: 'absolute', inset: 0,
        background: `linear-gradient(180deg, #0a0908 0%, #1a1614 50%, #0d0a08 100%)`,
        opacity: 0.85,
      }} />
      <div style={{
        position: 'absolute', inset: 0,
        background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(10px)',
      }} />

      <div style={{ flex: 1 }} />

      {/* sheet */}
      <div style={{
        background: cream, color: ink,
        borderTopLeftRadius: 28, borderTopRightRadius: 28,
        padding: '14px 24px 28px',
        position: 'relative', zIndex: 2,
        boxShadow: '0 -16px 40px rgba(0,0,0,0.55)',
        animation: 'slideup .3s cubic-bezier(.2,.8,.3,1)',
      }}>
        <div style={{ width: 40, height: 4, background: line, borderRadius: 999, margin: '0 auto 16px' }} />

        {/* eyebrow */}
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          background: 'rgba(45,90,61,0.10)', color: accent,
          padding: '5px 10px', borderRadius: 999,
          fontSize: 10, fontWeight: 700, letterSpacing: 1.2, marginBottom: 14,
        }}>
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/></svg>
          SWAP IT OUT
        </div>

        <div style={{
          fontFamily: '"Instrument Serif", Georgia, serif',
          fontSize: 36, lineHeight: 1, letterSpacing: -1.1,
          fontWeight: 400, marginBottom: 6,
        }}>
          Pick a different <span style={{ fontStyle: 'italic', color: amber }}>avocado</span>.
        </div>
        <div style={{ fontSize: 13, color: muted, marginBottom: 22, lineHeight: 1.5 }}>
          Same shelf, different choices. Pick what's actually in front of you.
        </div>

        {/* compare cards */}
        <div style={{ display: 'flex', gap: 10, marginBottom: 18 }}>
          {/* current pick — still on the list */}
          <div style={{
            flex: 1,
            background: '#fffaf0',
            borderRadius: 16, padding: 14,
            position: 'relative',
            boxShadow: '0 1px 0 rgba(255,255,255,0.7) inset, 0 4px 12px rgba(20,15,5,0.05), 0 0 0 1px rgba(21,20,15,0.05)',
          }}>
            <div style={{ fontSize: 9.5, color: muted, letterSpacing: 1.2, fontWeight: 600, marginBottom: 8 }}>ON YOUR LIST</div>
            <div style={{
              width: 48, height: 48, borderRadius: 12,
              background: 'linear-gradient(135deg, #fdf3e0, #f5e6cc)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26,
              marginBottom: 10,
              boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.6)',
            }}>{original.emoji}</div>
            <div style={{ fontSize: 13, fontWeight: 500 }}>{original.name}</div>
            <div style={{ fontSize: 11.5, color: muted, marginTop: 3 }}>${original.price.toFixed(2)}/{original.unit}</div>
          </div>

          {/* arrow */}
          <div style={{ alignSelf: 'center', color: muted }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
          </div>

          {/* substitute */}
          <div style={{
            flex: 1.05,
            background: '#fffaf0',
            borderRadius: 16, padding: 14,
            boxShadow: '0 1px 0 rgba(255,255,255,0.7) inset, 0 6px 16px rgba(20,15,5,0.08), 0 0 0 1px rgba(45,90,61,0.20)',
            position: 'relative',
          }}>
            <div style={{
              position: 'absolute', top: -8, right: 12,
              background: accent, color: cream,
              padding: '3px 8px', borderRadius: 999,
              fontSize: 9, fontWeight: 700, letterSpacing: 0.8,
            }}>JUST SCANNED</div>
            <div style={{ fontSize: 9.5, color: accent, letterSpacing: 1.2, fontWeight: 700, marginBottom: 8 }}>SWAP TO</div>
            <div style={{
              width: 48, height: 48, borderRadius: 12,
              background: 'linear-gradient(135deg, #fdf3e0, #f5e6cc)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26,
              marginBottom: 10,
              boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.6)',
            }}>{sub.emoji}</div>
            <div style={{ fontSize: 13, fontWeight: 500 }}>{sub.name}</div>
            <div style={{ fontSize: 11.5, color: muted, marginTop: 3 }}>${sub.price.toFixed(2)}/{sub.unit} <span style={{ color: amber, fontWeight: 600 }}>+$0.54</span></div>
          </div>
        </div>

        {/* CTAs */}
        <button style={{
          width: '100%', height: 54, borderRadius: 14,
          background: ink, color: cream, border: 'none',
          fontSize: 15, fontWeight: 500, fontFamily: 'inherit',
          cursor: 'pointer', marginBottom: 8,
          boxShadow: '0 8px 20px rgba(21,20,15,0.2)',
        }}>Swap & add to cart</button>
        <div style={{ display: 'flex', gap: 8 }}>
          <button style={{
            flex: 1, height: 46, borderRadius: 12,
            background: 'transparent', border: `1px solid ${line}`, color: ink,
            fontSize: 13, fontWeight: 500, fontFamily: 'inherit',
            cursor: 'pointer',
          }}>Add both</button>
          <button style={{
            flex: 1, height: 46, borderRadius: 12,
            background: 'transparent', border: `1px solid ${line}`, color: muted,
            fontSize: 13, fontWeight: 500, fontFamily: 'inherit',
            cursor: 'pointer',
          }}>Cancel</button>
        </div>
      </div>

      <style>{`
        @keyframes slideup { from { transform: translateY(40px); opacity: 0.6; } to { transform: translateY(0); opacity: 1; } }
      `}</style>
    </div>
  );
}

// ─────────────────────────────────────────────
// 4. REVIEW — checkout
// ─────────────────────────────────────────────
function ShopReview() {
  const D = window.PHY_DATA;
  const { ink, cream, amber, muted, accent, line } = SHOP_BOLD;
  const cart = [
    { id: 'banana', qty: 2 },
    { id: 'milk', qty: 1 },
    { id: 'avocado', qty: 4, sub: 'Organic' },
    { id: 'chicken', qty: 1 },
    { id: 'olive-oil', qty: 1 },
    { id: 'bread', qty: 1 },
    { id: 'eggs', qty: 1 },
  ];
  const subtotal = cart.reduce((s, it) => s + (D.products.find(p => p.id === it.id)?.price || 0) * it.qty, 0);
  const tax = subtotal * 0.0875;
  const total = subtotal + tax;

  return (
    <div style={{
      width: '100%', height: '100%',
      background: cream, color: ink,
      fontFamily: '"Geist", system-ui, sans-serif',
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
      <div style={{ padding: '6px 24px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <button style={{
          width: 36, height: 36, borderRadius: 999,
          background: 'rgba(21,20,15,0.06)', border: 'none',
          display: 'flex', alignItems: 'center', justifyContent: 'center', color: ink,
          cursor: 'pointer',
        }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>
          </svg>
        </button>
        <div style={{ fontSize: 11, color: muted, letterSpacing: 1.5, fontWeight: 600 }}>REVIEW & PAY</div>
        <div style={{ width: 36 }} />
      </div>

      <div style={{ padding: '14px 24px 8px' }}>
        <div style={{
          fontFamily: '"Instrument Serif", Georgia, serif',
          fontSize: 44, lineHeight: 0.95, letterSpacing: -1.6,
        }}>
          Looks <span style={{ fontStyle: 'italic', color: amber }}>good?</span>
        </div>
        <div style={{ fontSize: 13, color: muted, marginTop: 6 }}>
          {cart.length} items · 1 substitution · grabbed in 18 min
        </div>
      </div>

      {/* receipt list */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '8px 24px 12px' }}>
        <div style={{
          background: '#fffaf0',
          borderRadius: 18, padding: '6px 14px',
          boxShadow: '0 1px 0 rgba(255,255,255,0.7) inset, 0 6px 16px rgba(20,15,5,0.05), 0 0 0 1px rgba(21,20,15,0.05)',
        }}>
          {cart.map((it, i) => {
            const p = D.products.find(x => x.id === it.id);
            return (
              <div key={it.id} style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '12px 0',
                borderBottom: i < cart.length - 1 ? `1px dashed ${line}` : 'none',
              }}>
                <div style={{
                  width: 38, height: 38, borderRadius: 10,
                  background: 'linear-gradient(135deg, #fdf3e0, #f5e6cc)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20,
                }}>{p.emoji}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ fontSize: 14, fontWeight: 500 }}>{p.name}</span>
                    {it.sub && (
                      <span style={{
                        background: 'rgba(200,122,58,0.14)', color: amber,
                        padding: '1px 6px', borderRadius: 999,
                        fontSize: 9, fontWeight: 700, letterSpacing: 0.6,
                      }}>SWAP</span>
                    )}
                  </div>
                  <div style={{ fontSize: 11.5, color: muted, marginTop: 2 }}>
                    {it.qty} × ${p.price.toFixed(2)} {it.sub && <span>· {it.sub}</span>}
                  </div>
                </div>
                <div style={{
                  fontFamily: '"Instrument Serif", Georgia, serif',
                  fontSize: 17, letterSpacing: -0.2,
                }}>${(p.price * it.qty).toFixed(2)}</div>
              </div>
            );
          })}
        </div>

        {/* totals */}
        <div style={{ padding: '14px 14px 0', fontSize: 13, color: muted }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
            <span>Subtotal</span>
            <span style={{ color: ink }}>${subtotal.toFixed(2)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
            <span>Tax (8.75%)</span>
            <span style={{ color: ink }}>${tax.toFixed(2)}</span>
          </div>
        </div>

        {/* missing prompt */}
        <button style={{
          width: '100%',
          background: 'transparent', border: `1.5px dashed ${line}`,
          borderRadius: 14, padding: '12px 14px',
          marginTop: 12,
          display: 'flex', alignItems: 'center', gap: 10,
          cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left',
          color: muted,
        }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          <span style={{ fontSize: 12.5 }}>Forgot something? Scan it now.</span>
        </button>
      </div>

      {/* sticky bottom: total + pay */}
      <div style={{ padding: '0 14px 14px' }}>
        <div style={{
          background: ink, color: cream,
          borderRadius: 20, padding: '14px 18px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          boxShadow: '0 12px 28px rgba(21,20,15,0.30), inset 0 1px 0 rgba(255,255,255,0.08)',
        }}>
          <div>
            <div style={{ fontSize: 10, opacity: 0.6, letterSpacing: 1.2, fontWeight: 600 }}>YOU PAY</div>
            <div style={{
              fontFamily: '"Instrument Serif", Georgia, serif',
              fontSize: 32, lineHeight: 1, letterSpacing: -0.8, marginTop: 3,
            }}>${total.toFixed(2)}</div>
          </div>
          <button style={{
            background: amber, color: ink, border: 'none',
            padding: '14px 18px', borderRadius: 14,
            fontSize: 14, fontWeight: 600, fontFamily: 'inherit',
            cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8,
            boxShadow: '0 4px 14px rgba(200,122,58,0.40)',
          }}>
            Pay & walk out
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
          </button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// 5. WALK OUT — confirmation
// ─────────────────────────────────────────────
function ShopWalkOut() {
  const { ink, cream, amber, muted, accent, line } = SHOP_BOLD;

  return (
    <div style={{
      width: '100%', height: '100%',
      background: cream, color: ink,
      fontFamily: '"Geist", system-ui, sans-serif',
      display: 'flex', flexDirection: 'column',
      position: 'relative', overflow: 'hidden',
    }}>
      {/* celebratory wash */}
      <div style={{
        position: 'absolute', inset: 0,
        background: `
          radial-gradient(60% 50% at 50% 25%, rgba(45,90,61,0.16) 0%, transparent 60%),
          radial-gradient(80% 60% at 50% 90%, rgba(200,122,58,0.12) 0%, transparent 60%)
        `,
        pointerEvents: 'none',
      }} />

      <div style={{ height: 54, flexShrink: 0 }} />

      <div style={{ padding: '12px 24px', display: 'flex', justifyContent: 'flex-end' }}>
        <button style={{
          background: 'rgba(21,20,15,0.06)', border: 'none', color: ink,
          padding: '8px 12px', borderRadius: 999,
          fontSize: 12, fontWeight: 500, fontFamily: 'inherit',
          cursor: 'pointer',
        }}>Receipt</button>
      </div>

      <div style={{ flex: 1, padding: '20px 24px 0', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', position: 'relative', zIndex: 1 }}>
        {/* big checkmark medallion */}
        <div style={{
          width: 120, height: 120, borderRadius: '50%',
          background: `linear-gradient(135deg, ${accent}, #1f3d2a)`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: cream, marginBottom: 24,
          boxShadow: '0 18px 40px rgba(45,90,61,0.35), inset 0 1px 0 rgba(255,255,255,0.18)',
          position: 'relative',
          animation: 'pop .5s cubic-bezier(.2,.8,.3,1.4)',
        }}>
          <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
          {/* radiating ring */}
          <div style={{
            position: 'absolute', inset: -10, borderRadius: '50%',
            border: `2px solid ${accent}`, opacity: 0.2,
          }} />
        </div>

        <div style={{ fontSize: 11, color: muted, letterSpacing: 1.5, fontWeight: 600, marginBottom: 10 }}>
          PAID · ALL DONE
        </div>
        <div style={{
          fontFamily: '"Instrument Serif", Georgia, serif',
          fontSize: 48, lineHeight: 0.95, letterSpacing: -1.6,
        }}>
          Saturday haul,<br/>
          <span style={{ fontStyle: 'italic', color: amber }}>handled.</span>
        </div>
        <div style={{ fontSize: 13, color: muted, marginTop: 12, lineHeight: 1.5, maxWidth: 280 }}>
          Walk out the front. We've already let the gate know you're good.
        </div>

        {/* gate / exit ticket */}
        <div style={{
          marginTop: 28, width: '100%',
          background: ink, color: cream,
          borderRadius: 22, padding: '18px 20px',
          boxShadow: '0 20px 44px rgba(21,20,15,0.22), inset 0 1px 0 rgba(255,255,255,0.06)',
          position: 'relative', overflow: 'hidden',
        }}>
          {/* perforation */}
          <div style={{
            position: 'absolute', left: -8, top: '50%', width: 16, height: 16,
            background: cream, borderRadius: '50%', transform: 'translateY(-50%)',
          }} />
          <div style={{
            position: 'absolute', right: -8, top: '50%', width: 16, height: 16,
            background: cream, borderRadius: '50%', transform: 'translateY(-50%)',
          }} />
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 12 }}>
            <span style={{ fontSize: 10, opacity: 0.6, letterSpacing: 1.2, fontWeight: 600 }}>GATE PASS</span>
            <span style={{ fontSize: 10, opacity: 0.6, letterSpacing: 1.2, fontWeight: 600 }}>MARINA · 9:42 AM</span>
          </div>
          <div style={{
            fontFamily: '"Instrument Serif", Georgia, serif',
            fontSize: 38, lineHeight: 1, letterSpacing: 6,
            textAlign: 'center', marginBottom: 14,
          }}>
            8 4 · 2 1
          </div>
          {/* fake barcode */}
          <div style={{ display: 'flex', gap: 1.5, height: 36, justifyContent: 'center', alignItems: 'stretch' }}>
            {[2,4,1,3,2,5,1,2,4,2,1,3,4,2,1,5,2,3,1,2,4,2,1,3,2,4,1,3,2].map((w, i) => (
              <div key={i} style={{ width: w, background: cream, borderRadius: 1, opacity: 0.9 }} />
            ))}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 14, fontSize: 11, opacity: 0.7 }}>
            <span>7 items · 1 swap</span>
            <span>Total <strong style={{ opacity: 1, fontWeight: 600 }}>$48.27</strong></span>
          </div>
        </div>
      </div>

      {/* bottom secondary actions */}
      <div style={{ padding: '20px 24px 24px', position: 'relative', zIndex: 1 }}>
        <button style={{
          width: '100%', height: 54, borderRadius: 14,
          background: ink, color: cream, border: 'none',
          fontSize: 15, fontWeight: 500, fontFamily: 'inherit',
          cursor: 'pointer',
          boxShadow: '0 8px 20px rgba(21,20,15,0.18)',
          marginBottom: 8,
        }}>Done</button>
        <button style={{
          width: '100%', height: 44, borderRadius: 12,
          background: 'transparent', border: 'none', color: muted,
          fontSize: 13, fontWeight: 500, fontFamily: 'inherit',
          cursor: 'pointer',
        }}>Save haul to lists</button>
      </div>

      <style>{`
        @keyframes pop { from { transform: scale(0.6); opacity: 0; } to { transform: scale(1); opacity: 1; } }
      `}</style>
    </div>
  );
}

window.ShopArrive = ShopArrive;
window.ShopScanning = ShopScanning;
window.ShopSubstitute = ShopSubstitute;
window.ShopReview = ShopReview;
window.ShopWalkOut = ShopWalkOut;
