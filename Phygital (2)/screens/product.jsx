// Product Detail screen — Phygital
// Single scrollable screen pushed modally over the tabs. Sticky bottom CTA adapts.
//
// Props:
//   productId : id from PHY_DATA.products
//   cta       : 'session' | 'list' | 'oos'
//               session — user is in an active shopping session → "Add to cart"
//               list    — no session → "Add to a list" (opens list-picker sheet)
//               oos     — product out of stock → "Notify when back" + disabled primary
//   added     : boolean — show post-tap "Added" state on the cart CTA
//   sheetOpen : boolean — preview the list-picker half-sheet

function ProductDetail({
  productId = 'chicken',
  cta = 'session',
  added = false,
  sheetOpen = false,
}) {
  const D = window.PHY_DATA;
  const p = D.products.find((x) => x.id === productId) || D.products[0];

  const ink = '#15140f';
  const cream = '#f4ede0';
  const accent = '#2d5a3d';
  const amber = '#c87a3a';
  const muted = '#7a7163';
  const line = 'rgba(21,20,15,0.10)';
  const paper = '#fffaf0';
  const softRed = '#b84537';
  const softRedWash = 'rgba(184,69,55,0.10)';

  const NUTRI_BG = {
    A: '#3d6e4a',
    B: '#7a9b3d',
    C: '#c89538',
    D: '#c8723a',
    E: '#b84537',
  };

  const userAllergens = (D.userPrefs.allergens || []).map((a) => a.toLowerCase());
  const userDietary = D.userPrefs.dietary || [];

  // Which of THIS product's allergens does the user actually care about?
  const matchedAllergens = (p.allergens || []).filter((a) =>
    userAllergens.includes(a.toLowerCase())
  );

  // Highlight matched dietary tags first (e.g. "Halal" if the user flagged it),
  // then show 1-2 other relevant ones to fill the row.
  const matchedDietary = (p.dietary || []).filter((d) => userDietary.includes(d));
  const otherDietary = (p.dietary || []).filter((d) => !userDietary.includes(d));
  const visibleDietary = [...matchedDietary, ...otherDietary].slice(0, 3);

  // ── Subviews ───────────────────────────────────────────────
  const Eyebrow = ({ children, color = muted }) => (
    <div style={{
      fontSize: 10, letterSpacing: 1.6, color, fontWeight: 600,
      marginBottom: 12,
    }}>{children}</div>
  );

  const Pill = ({ children, tone = 'default', icon }) => {
    const tones = {
      default: { bg: 'rgba(21,20,15,0.06)', fg: ink, br: 'transparent' },
      aisle:   { bg: 'rgba(45,90,61,0.10)', fg: accent, br: 'transparent' },
      diet:    { bg: ink, fg: cream, br: 'transparent' },
      dietOff: { bg: 'transparent', fg: muted, br: line },
      oos:     { bg: softRedWash, fg: softRed, br: 'rgba(184,69,55,0.18)' },
      stock:   { bg: 'rgba(45,90,61,0.10)', fg: accent, br: 'transparent' },
    }[tone];
    return (
      <span style={{
        display: 'inline-flex', alignItems: 'center', gap: 5,
        padding: '6px 10px', borderRadius: 999,
        fontSize: 11.5, fontWeight: 600, letterSpacing: 0.2,
        background: tones.bg, color: tones.fg,
        border: `1px solid ${tones.br}`,
        whiteSpace: 'nowrap',
      }}>
        {icon}
        {children}
      </span>
    );
  };

  // Ingredients with allergen words highlighted in soft red.
  const ingredientsWithHighlights = (() => {
    if (!matchedAllergens.length) return <>{p.ingredients}</>;
    // Build a regex that matches the user's allergen words AND common stems
    // (e.g. user has 'Milk' → highlight "milk", "cow’s milk", "dairy" not handled,
    //  but we keep it word-level to stay calm). Case-insensitive.
    const escaped = matchedAllergens
      .map((a) => a.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
      .join('|');
    const re = new RegExp(`(${escaped})`, 'ig');
    const parts = p.ingredients.split(re);
    return parts.map((part, i) =>
      re.test(part) ? (
        <span key={i} style={{
          background: softRedWash, color: softRed,
          padding: '0 4px', borderRadius: 4,
        }}>{part}</span>
      ) : (
        <span key={i}>{part}</span>
      )
    );
  })();

  const showAllergenBanner = matchedAllergens.length > 0;

  // ── Bottom CTA bar ─────────────────────────────────────────
  const CTABar = () => {
    if (cta === 'oos') {
      return (
        <div style={{ display: 'flex', gap: 8 }}>
          <button disabled style={{
            flex: 1.4, height: 56, borderRadius: 14,
            background: 'rgba(21,20,15,0.08)', color: muted, border: 'none',
            fontSize: 15, fontWeight: 500, fontFamily: 'inherit',
            cursor: 'not-allowed',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          }}>Out of stock</button>
          <button style={{
            flex: 1, height: 56, borderRadius: 14,
            background: 'transparent', color: ink, border: `1.5px solid ${ink}`,
            fontSize: 14, fontWeight: 500, fontFamily: 'inherit',
            cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
            whiteSpace: 'nowrap',
          }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
            Notify me
          </button>
        </div>
      );
    }

    if (cta === 'list') {
      return (
        <button style={{
          width: '100%', height: 58, borderRadius: 16,
          background: ink, color: cream, border: 'none',
          fontSize: 15, fontWeight: 500, fontFamily: 'inherit',
          cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '0 20px',
          boxShadow: '0 12px 28px rgba(21,20,15,0.22), inset 0 1px 0 rgba(255,255,255,0.08)',
        }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"/><rect x="9" y="3" width="6" height="4" rx="1"/><path d="M9 12h6M9 16h4"/></svg>
            Add to a list
          </span>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
        </button>
      );
    }

    // session — default
    return (
      <button style={{
        width: '100%', height: 58, borderRadius: 16,
        background: added ? accent : ink, color: cream, border: 'none',
        fontSize: 15, fontWeight: 500, fontFamily: 'inherit',
        cursor: 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 20px',
        boxShadow: added
          ? '0 12px 28px rgba(45,90,61,0.30), inset 0 1px 0 rgba(255,255,255,0.10)'
          : '0 12px 28px rgba(21,20,15,0.22), inset 0 1px 0 rgba(255,255,255,0.08)',
        transition: 'all .25s',
      }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {added ? (
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
          ) : (
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
          )}
          {added ? 'Added to cart' : 'Add to cart'}
        </span>
        <span style={{
          fontFamily: '"Instrument Serif", Georgia, serif',
          fontSize: 22, letterSpacing: -0.3,
        }}>
          ${p.price.toFixed(2)}
        </span>
      </button>
    );
  };

  // ── Layout ─────────────────────────────────────────────────
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
        background: 'radial-gradient(120% 50% at 50% 0%, rgba(200,122,58,0.06) 0%, transparent 60%)',
        pointerEvents: 'none',
      }} />

      {/* status bar gap */}
      <div style={{ height: 54, flexShrink: 0 }} />

      {/* floating back / share row — overlays the hero */}
      <div style={{
        position: 'absolute', top: 54, left: 0, right: 0,
        padding: '12px 18px', zIndex: 3,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        pointerEvents: 'none',
      }}>
        <button style={{
          width: 38, height: 38, borderRadius: 999,
          background: 'rgba(255,253,248,0.85)', backdropFilter: 'blur(8px)',
          border: `1px solid ${line}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center', color: ink,
          cursor: 'pointer', pointerEvents: 'auto',
          boxShadow: '0 2px 6px rgba(20,15,5,0.06)',
        }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>
          </svg>
        </button>
        <button style={{
          width: 38, height: 38, borderRadius: 999,
          background: 'rgba(255,253,248,0.85)', backdropFilter: 'blur(8px)',
          border: `1px solid ${line}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center', color: ink,
          cursor: 'pointer', pointerEvents: 'auto',
          boxShadow: '0 2px 6px rgba(20,15,5,0.06)',
        }}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>
        </button>
      </div>

      {/* scrollable body */}
      <div style={{ flex: 1, overflowY: 'auto', paddingBottom: 110 }}>
        {/* ── HERO ─────────────────────────────────────────── */}
        <div style={{ padding: '0 18px' }}>
          <div style={{
            width: '100%', aspectRatio: '1 / 1',
            borderRadius: 24, marginTop: -4,
            background: `
              radial-gradient(60% 50% at 50% 30%, rgba(255,255,255,0.85) 0%, transparent 70%),
              linear-gradient(135deg, #fdf3e0 0%, #f5e6cc 100%)
            `,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            position: 'relative', overflow: 'hidden',
            boxShadow: '0 12px 28px rgba(20,15,5,0.06), inset 0 1px 0 rgba(255,255,255,0.7), 0 0 0 1px rgba(21,20,15,0.05)',
          }}>
            {/* hero emoji as product stand-in */}
            <div style={{ fontSize: 140, lineHeight: 1, transform: 'translateY(-4px)' }}>
              {p.emoji}
            </div>
            {/* nutriscore corner badge — small reference */}
            <div style={{
              position: 'absolute', top: 14, right: 14,
              width: 32, height: 32, borderRadius: 8,
              background: NUTRI_BG[p.nutriscore] || muted,
              color: '#fff', fontSize: 16, fontWeight: 700,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 4px 10px rgba(20,15,5,0.12), inset 0 1px 0 rgba(255,255,255,0.18)',
            }}>{p.nutriscore}</div>
          </div>
        </div>

        {/* ── NAME + PRICE ─────────────────────────────────── */}
        <div style={{ padding: '22px 22px 4px' }}>
          <div style={{ fontSize: 11, letterSpacing: 1.6, color: muted, fontWeight: 600, marginBottom: 6 }}>
            {p.brand?.toUpperCase()}
          </div>
          <div style={{
            fontFamily: '"Instrument Serif", Georgia, serif',
            fontSize: 38, lineHeight: 1, letterSpacing: -1.2, marginBottom: 14,
          }}>
            {p.name.split(' ').map((w, i, arr) => (
              <React.Fragment key={i}>
                {i === arr.length - 1 ? <span style={{ fontStyle: 'italic', color: amber }}>{w}</span> : w}
                {i < arr.length - 1 ? ' ' : ''}
              </React.Fragment>
            ))}
          </div>

          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 14 }}>
            <div style={{
              fontFamily: '"Instrument Serif", Georgia, serif',
              fontSize: 38, lineHeight: 1, letterSpacing: -0.8,
            }}>${p.price.toFixed(2)}</div>
            <div style={{ fontSize: 13, color: muted }}>per {p.unit}</div>
          </div>

          {/* quick-facts row */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            <Pill tone="aisle" icon={
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
            }>AISLE {p.aisle}</Pill>
            {p.inStock ? (
              <Pill tone="stock">In stock</Pill>
            ) : (
              <Pill tone="oos">Out of stock</Pill>
            )}
            {visibleDietary.map((d) => {
              const matched = matchedDietary.includes(d);
              return <Pill key={d} tone={matched ? 'diet' : 'dietOff'}>
                {matched && <span style={{ fontSize: 10 }}>✓</span>}
                {d}
              </Pill>;
            })}
          </div>
        </div>

        {/* ── ALLERGEN BANNER (conditional) ────────────────── */}
        {showAllergenBanner && (
          <div style={{ padding: '24px 22px 0' }}>
            <div style={{
              background: softRedWash,
              border: '1px solid rgba(184,69,55,0.20)',
              borderRadius: 14, padding: '12px 14px',
              display: 'flex', alignItems: 'flex-start', gap: 10,
              color: softRed,
            }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: 2 }}><path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
              <div style={{ fontSize: 12.5, lineHeight: 1.45 }}>
                Contains <strong style={{ fontWeight: 700 }}>{matchedAllergens.join(', ').toLowerCase()}</strong> — one of your flagged allergens.
              </div>
            </div>
          </div>
        )}

        {/* ── NUTRITION ────────────────────────────────────── */}
        <div style={{ padding: '32px 22px 0' }}>
          <Eyebrow>NUTRITION</Eyebrow>
          <div style={{
            background: paper,
            borderRadius: 16, padding: 18,
            boxShadow: '0 1px 0 rgba(255,255,255,0.7) inset, 0 4px 12px rgba(20,15,5,0.04), 0 0 0 1px rgba(21,20,15,0.05)',
            display: 'flex', gap: 18,
          }}>
            {/* big nutriscore letter */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, flexShrink: 0 }}>
              <div style={{
                width: 72, height: 72, borderRadius: 16,
                background: NUTRI_BG[p.nutriscore] || muted,
                color: '#fff',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: '"Instrument Serif", Georgia, serif',
                fontSize: 48, lineHeight: 1, fontWeight: 400,
                boxShadow: '0 6px 14px rgba(20,15,5,0.10), inset 0 1px 0 rgba(255,255,255,0.18)',
              }}>{p.nutriscore}</div>
              <div style={{ fontSize: 9.5, color: muted, letterSpacing: 1.2, fontWeight: 600 }}>NUTRISCORE</div>
            </div>

            {/* nutrition table */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 11, color: muted, marginBottom: 10 }}>per 100{p.unit === 'lb' ? 'g' : (p.unit === 'gal' ? 'ml' : 'g')}</div>
              {[
                { k: 'Energy', v: `${p.nutrition.kcal}`, suffix: 'kcal' },
                { k: 'Sugars', v: `${p.nutrition.sugars}`, suffix: 'g' },
                { k: 'Fats',   v: `${p.nutrition.fats}`, suffix: 'g' },
                { k: 'Salt',   v: `${p.nutrition.salt}`, suffix: 'g' },
              ].map((row, i, arr) => (
                <div key={row.k} style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'baseline',
                  padding: '7px 0',
                  borderBottom: i < arr.length - 1 ? `1px dashed ${line}` : 'none',
                  fontSize: 13,
                }}>
                  <span style={{ color: muted }}>{row.k}</span>
                  <span>
                    <strong style={{ fontWeight: 600 }}>{row.v}</strong>
                    <span style={{ color: muted, marginLeft: 3, fontSize: 11 }}>{row.suffix}</span>
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── INGREDIENTS ──────────────────────────────────── */}
        <div style={{ padding: '32px 22px 0' }}>
          <Eyebrow>INGREDIENTS</Eyebrow>
          <div style={{
            fontSize: 14, lineHeight: 1.6, color: ink,
            textWrap: 'pretty',
          }}>
            {ingredientsWithHighlights}
          </div>
        </div>

        {/* ── ABOUT (conditional) ──────────────────────────── */}
        {p.about && (
          <div style={{ padding: '32px 22px 0' }}>
            <Eyebrow>ABOUT</Eyebrow>
            <div style={{
              background: paper,
              borderRadius: 14, padding: '14px 16px',
              display: 'flex', alignItems: 'flex-start', gap: 12,
              boxShadow: '0 0 0 1px rgba(21,20,15,0.05)',
            }}>
              <div style={{
                width: 32, height: 32, borderRadius: 10,
                background: 'rgba(200,122,58,0.12)', color: amber, flexShrink: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="6" width="20" height="12" rx="2"/><path d="M6 12h.01M10 12h.01M14 12h.01M18 12h.01"/></svg>
              </div>
              <div style={{ flex: 1, fontSize: 13, lineHeight: 1.5, color: ink }}>
                {p.about}
              </div>
            </div>
          </div>
        )}

        {/* trailing spacer so last content clears the CTA */}
        <div style={{ height: 40 }} />
      </div>

      {/* ── STICKY BOTTOM CTA ────────────────────────────── */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0,
        padding: '14px 18px 22px',
        background: `linear-gradient(180deg, rgba(244,237,224,0) 0%, ${cream} 22%)`,
        pointerEvents: 'none',
      }}>
        <div style={{ pointerEvents: 'auto' }}>
          <CTABar />
        </div>
      </div>

      {/* ── LIST-PICKER HALF SHEET ───────────────────────── */}
      {sheetOpen && (
        <div style={{
          position: 'absolute', inset: 0, zIndex: 8,
          background: 'rgba(21,20,15,0.45)',
          backdropFilter: 'blur(8px)',
          display: 'flex', alignItems: 'flex-end',
        }}>
          <div style={{
            width: '100%',
            background: cream,
            borderTopLeftRadius: 28, borderTopRightRadius: 28,
            padding: '14px 22px 24px',
            boxShadow: '0 -16px 40px rgba(0,0,0,0.30)',
          }}>
            <div style={{ width: 40, height: 4, background: line, borderRadius: 999, margin: '0 auto 16px' }} />
            <div style={{
              fontFamily: '"Instrument Serif", Georgia, serif',
              fontSize: 26, lineHeight: 1, letterSpacing: -0.6,
              marginBottom: 4,
            }}>Add to which <span style={{ fontStyle: 'italic', color: amber }}>list?</span></div>
            <div style={{ fontSize: 12.5, color: muted, marginBottom: 16 }}>
              {p.name} · ${p.price.toFixed(2)}
            </div>

            {D.savedLists.map((sl, i) => (
              <button key={sl.id} style={{
                width: '100%', display: 'flex', alignItems: 'center', gap: 12,
                background: paper, border: 'none',
                borderRadius: 14, padding: 12,
                marginBottom: 8, cursor: 'pointer',
                fontFamily: 'inherit', textAlign: 'left',
                boxShadow: '0 0 0 1px rgba(21,20,15,0.05), 0 2px 6px rgba(20,15,5,0.03)',
              }}>
                <div style={{ display: 'flex', gap: 2 }}>
                  {sl.items.slice(0, 3).map((id) => {
                    const pp = D.products.find(x => x.id === id);
                    return (
                      <div key={id} style={{
                        width: 30, height: 30, borderRadius: 8,
                        background: 'linear-gradient(135deg, #fdf3e0, #f5e6cc)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16,
                      }}>{pp?.emoji}</div>
                    );
                  })}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    fontFamily: '"Instrument Serif", Georgia, serif',
                    fontSize: 18, lineHeight: 1.1, letterSpacing: -0.3,
                  }}>{sl.name}</div>
                  <div style={{ fontSize: 11.5, color: muted, marginTop: 2 }}>
                    {sl.count} items · {sl.lastUsed}
                  </div>
                </div>
                <div style={{
                  width: 30, height: 30, borderRadius: 999,
                  background: ink, color: cream,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                }}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                </div>
              </button>
            ))}

            <button style={{
              width: '100%', display: 'flex', alignItems: 'center', gap: 10,
              background: 'transparent', border: `1.5px dashed ${line}`,
              borderRadius: 14, padding: '12px 14px',
              cursor: 'pointer', fontFamily: 'inherit', color: muted,
              marginTop: 4,
            }}>
              <div style={{
                width: 26, height: 26, borderRadius: 8,
                background: 'rgba(21,20,15,0.06)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', color: ink,
              }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              </div>
              <span style={{ fontSize: 13, color: ink, fontWeight: 500 }}>Start a new list</span>
            </button>
          </div>
        </div>
      )}

      <style>{`::-webkit-scrollbar { display: none; }`}</style>
    </div>
  );
}

window.ProductDetail = ProductDetail;
