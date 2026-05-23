// Search screen — Phygital · v2
//
// Pushed modally over the tabs from the search affordance in the home
// header. Sticky top input row. The body below has four states.
//
// Props:
//   state    : 'cold' | 'typing' | 'results' | 'empty'
//   query    : current input value (string)
//   addedId  : product id whose row "+" just got tapped — shows the
//              soft green confirmation flicker (active-session variant)
//   sheetOpen: boolean — preview the list-picker half sheet rising
//              from a "+" tap when there's no active session
//
// Row anatomy mirrors the Product Detail page exactly:
//   thumb · name · brand · [aisle · nutriscore · diet] · price · "+"

function Search({
  state = 'results',
  query = 'ch',
  addedId = null,
  sheetOpen = false,
}) {
  const D = window.PHY_DATA;

  const ink = '#15140f';
  const cream = '#f4ede0';
  const accent = '#2d5a3d';
  const amber = '#c87a3a';
  const muted = '#7a7163';
  const line = 'rgba(21,20,15,0.10)';
  const paper = '#fffaf0';

  const NUTRI_BG = {
    A: '#3d6e4a',
    B: '#7a9b3d',
    C: '#c89538',
    D: '#c8723a',
    E: '#b84537',
  };

  // ── Static taxonomy: aisles for the "Browse by aisle" rail ──
  // Aisle numbers align with the products[] aisle field, so taps could
  // pre-filter the catalog. Halal counter is a named alias for the meat
  // aisle — reflects how Egyptian users actually talk about it.
  const AISLES = [
    { num: 1, name: 'Produce', sub: 'Fruits & vegetables' },
    { num: 5, name: 'Dairy', sub: 'Milk, cheese, yogurt' },
    { num: 8, name: 'Bakery', sub: 'Bread & pastries' },
    { num: 9, name: 'Pantry', sub: 'Oils, pasta, grains' },
    { num: 11, name: 'Seafood', sub: 'Fresh fish counter' },
    { num: 12, name: 'Halal counter', sub: 'Meat & poultry' },
  ];

  const userDietary = D.userPrefs.dietary || [];

  // ── Filter the catalog ──
  const q = (query || '').trim().toLowerCase();
  const matches = q
    ? D.products.filter((p) => (
        p.name.toLowerCase().includes(q)
        || (p.brand || '').toLowerCase().includes(q)
        || p.tag.toLowerCase().includes(q)
      ))
    : [];

  const isCold = state === 'cold';
  const isLoading = state === 'typing';
  const isEmpty = state === 'empty' || (!isCold && !isLoading && matches.length === 0);
  const showInputQuery = isCold ? '' : query;

  // ─────────────────────────────────────────────────────────────
  // Subviews
  // ─────────────────────────────────────────────────────────────

  const NutriBadge = ({ grade, size = 18 }) => (
    <div style={{
      width: size, height: size, borderRadius: 5,
      background: NUTRI_BG[grade] || muted, color: '#fff',
      fontSize: size * 0.55, fontWeight: 700, letterSpacing: 0.2,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.18)',
    }}>{grade}</div>
  );

  const AislePill = ({ n }) => (
    <span style={{
      fontSize: 10, letterSpacing: 1, fontWeight: 700,
      color: accent, background: 'rgba(45,90,61,0.10)',
      padding: '2px 7px', borderRadius: 999,
      whiteSpace: 'nowrap',
    }}>AISLE {n}</span>
  );

  const DietChip = ({ label }) => (
    <span style={{
      fontSize: 10, letterSpacing: 0.3, fontWeight: 600,
      color: cream, background: ink,
      padding: '2px 8px', borderRadius: 999,
      whiteSpace: 'nowrap',
      display: 'inline-flex', alignItems: 'center', gap: 3,
    }}>
      <span style={{ fontSize: 9 }}>✓</span>{label}
    </span>
  );

  const PlusButton = ({ added }) => (
    <div style={{
      width: 34, height: 34, borderRadius: 999,
      background: added ? accent : ink,
      color: cream, flexShrink: 0,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      boxShadow: added
        ? '0 4px 12px rgba(45,90,61,0.30), inset 0 1px 0 rgba(255,255,255,0.10)'
        : '0 3px 8px rgba(21,20,15,0.18), inset 0 1px 0 rgba(255,255,255,0.06)',
      transition: 'all .25s cubic-bezier(.2,.8,.3,1)',
    }}>
      {added ? (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
      ) : (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
      )}
    </div>
  );

  const ResultRow = ({ p }) => {
    // Pick one dietary tag that matches the user's prefs — first match
    // wins. If no overlap, no chip (we don't pad rows with noise).
    const dietHit = (p.dietary || []).find((d) => userDietary.includes(d));
    const added = addedId === p.id;

    return (
      <div style={{
        display: 'flex', alignItems: 'center', gap: 12,
        padding: '12px 0',
        borderBottom: `1px solid ${line}`,
      }}>
        {/* Row tap region — everything left of the "+" pushes Detail */}
        <button style={{
          flex: 1, display: 'flex', alignItems: 'center', gap: 12,
          background: 'transparent', border: 'none',
          padding: 0, cursor: 'pointer',
          fontFamily: 'inherit', textAlign: 'left', color: ink, minWidth: 0,
        }}>
          {/* product thumb */}
          <div style={{
            width: 56, height: 56, borderRadius: 14, flexShrink: 0,
            background: 'linear-gradient(135deg, #fdf3e0, #f5e6cc)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 30,
            boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.6), inset 0 -1px 0 rgba(0,0,0,0.04)',
          }}>{p.emoji}</div>

          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{
              fontSize: 14.5, fontWeight: 500,
              whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
            }}>{p.name}</div>
            <div style={{
              fontSize: 11.5, color: muted, marginTop: 2,
              whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
            }}>{p.brand}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 6 }}>
              <AislePill n={p.aisle} />
              <NutriBadge grade={p.nutriscore} />
              {dietHit && <DietChip label={dietHit} />}
              {!p.inStock && (
                <span style={{
                  fontSize: 10, letterSpacing: 0.6, fontWeight: 600,
                  color: muted, background: 'rgba(21,20,15,0.06)',
                  padding: '2px 7px', borderRadius: 999,
                }}>Out</span>
              )}
            </div>
          </div>
        </button>

        {/* price + add */}
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8,
          flexShrink: 0,
        }}>
          <div style={{
            fontFamily: '"Instrument Serif", Georgia, serif',
            fontSize: 22, lineHeight: 1, letterSpacing: -0.3,
          }}>${p.price.toFixed(2)}</div>
          <button style={{
            background: 'transparent', border: 'none', padding: 0, cursor: 'pointer',
          }} aria-label={`Add ${p.name}`}>
            <PlusButton added={added} />
          </button>
        </div>
      </div>
    );
  };

  const SkeletonRow = ({ i }) => (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 12,
      padding: '12px 0',
      borderBottom: `1px solid ${line}`,
      opacity: 1 - i * 0.18,
    }}>
      <div style={{
        width: 56, height: 56, borderRadius: 14, flexShrink: 0,
        background: 'rgba(21,20,15,0.06)',
        animation: `pulse 1.4s ease-in-out ${i * 0.12}s infinite`,
      }} />
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 7 }}>
        <div style={{
          height: 12, width: `${70 - i * 8}%`, borderRadius: 4,
          background: 'rgba(21,20,15,0.08)',
          animation: `pulse 1.4s ease-in-out ${i * 0.12}s infinite`,
        }} />
        <div style={{
          height: 9, width: `${40 + i * 4}%`, borderRadius: 4,
          background: 'rgba(21,20,15,0.06)',
          animation: `pulse 1.4s ease-in-out ${i * 0.12 + 0.1}s infinite`,
        }} />
        <div style={{ display: 'flex', gap: 5, marginTop: 2 }}>
          <div style={{ height: 14, width: 50, borderRadius: 999, background: 'rgba(21,20,15,0.06)' }} />
          <div style={{ height: 14, width: 18, borderRadius: 5, background: 'rgba(21,20,15,0.06)' }} />
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8, flexShrink: 0 }}>
        <div style={{ height: 16, width: 50, borderRadius: 4, background: 'rgba(21,20,15,0.07)' }} />
        <div style={{ width: 34, height: 34, borderRadius: 999, background: 'rgba(21,20,15,0.05)' }} />
      </div>
    </div>
  );

  // ─────────────────────────────────────────────────────────────
  // Layout
  // ─────────────────────────────────────────────────────────────
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
        background: 'radial-gradient(120% 60% at 50% 0%, rgba(200,122,58,0.06) 0%, transparent 60%)',
        pointerEvents: 'none',
      }} />

      {/* status bar gap */}
      <div style={{ height: 54, flexShrink: 0 }} />

      {/* ── Top row: back + input ──────────────────────────── */}
      <div style={{
        padding: '8px 18px 12px',
        display: 'flex', alignItems: 'center', gap: 10,
        position: 'relative', zIndex: 3,
      }}>
        <button style={{
          width: 40, height: 40, borderRadius: 999, flexShrink: 0,
          background: paper, border: `1px solid ${line}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', color: ink,
          boxShadow: '0 2px 6px rgba(20,15,5,0.05)',
        }} aria-label="Back">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>
          </svg>
        </button>

        <div style={{
          flex: 1, height: 44,
          background: paper, border: `1px solid ${line}`,
          borderRadius: 14,
          display: 'flex', alignItems: 'center', gap: 10,
          padding: '0 12px',
          boxShadow: '0 2px 6px rgba(20,15,5,0.04)',
        }}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={muted} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
          </svg>

          <div style={{
            flex: 1, fontSize: 14, color: ink,
            display: 'flex', alignItems: 'center', minWidth: 0,
          }}>
            {showInputQuery ? (
              <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{showInputQuery}</span>
            ) : (
              <span style={{ color: muted }}>Search products, brands, barcodes</span>
            )}
            <span style={{
              display: 'inline-block', width: 1.5, height: 17,
              background: amber, marginLeft: 2,
              animation: 'caret 1s steps(1) infinite',
            }} />
          </div>

          {/* Clear-X — only when there's a query */}
          {showInputQuery && (
            <button style={{
              width: 22, height: 22, borderRadius: 999, flexShrink: 0,
              background: 'rgba(21,20,15,0.10)', border: 'none', color: ink,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer',
            }} aria-label="Clear">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          )}
        </div>
      </div>

      {/* hairline + loading progress strip */}
      <div style={{ position: 'relative', height: 1, flexShrink: 0, zIndex: 2 }}>
        <div style={{ position: 'absolute', inset: 0, background: line }} />
        {isLoading && (
          <div style={{
            position: 'absolute', top: 0, bottom: 0, left: 0,
            width: '40%', background: amber,
            animation: 'progress 1.2s ease-in-out infinite',
          }} />
        )}
      </div>

      {/* ── Scrollable body ────────────────────────────────── */}
      <div style={{
        flex: 1, overflowY: 'auto',
        position: 'relative', zIndex: 1,
      }}>
        {/* soft fade-to-cream beneath the input */}
        <div style={{
          position: 'sticky', top: 0, height: 12,
          background: `linear-gradient(180deg, ${cream}, rgba(244,237,224,0))`,
          marginBottom: -12, zIndex: 2, pointerEvents: 'none',
        }} />

        {/* ── STATE A: Cold ─────────────────────────────── */}
        {isCold && (
          <div style={{ padding: '14px 22px 32px' }}>
            <div style={{
              fontSize: 13, color: muted, lineHeight: 1.5,
              marginBottom: 26, maxWidth: 280,
            }}>
              Search a <span style={{ color: ink }}>name</span>, <span style={{ color: ink }}>brand</span>, or scan a code.
            </div>

            <div style={{ fontSize: 10, letterSpacing: 1.6, color: muted, fontWeight: 600, marginBottom: 10 }}>
              RECENT
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 32 }}>
              {D.recentSearches.map((r, i) => (
                <button key={i} style={{
                  padding: '7px 12px', borderRadius: 999,
                  fontSize: 12, fontWeight: 500, fontFamily: 'inherit',
                  background: 'transparent', color: ink,
                  border: `1px solid ${line}`,
                  cursor: 'pointer',
                  display: 'inline-flex', alignItems: 'center', gap: 6,
                }}>
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke={muted} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                  {r}
                </button>
              ))}
            </div>

            <div style={{ fontSize: 10, letterSpacing: 1.6, color: muted, fontWeight: 600, marginBottom: 10 }}>
              BROWSE BY AISLE
            </div>
            <div style={{
              background: paper, borderRadius: 16,
              boxShadow: '0 1px 0 rgba(255,255,255,0.7) inset, 0 4px 12px rgba(20,15,5,0.04), 0 0 0 1px rgba(21,20,15,0.05)',
              overflow: 'hidden',
            }}>
              {AISLES.map((a, i) => (
                <button key={a.num} style={{
                  width: '100%', display: 'flex', alignItems: 'center', gap: 12,
                  background: 'transparent', border: 'none',
                  padding: '13px 16px',
                  borderBottom: i < AISLES.length - 1 ? `1px solid ${line}` : 'none',
                  cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left',
                }}>
                  <AislePill n={a.num} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{
                      fontFamily: '"Instrument Serif", Georgia, serif',
                      fontSize: 19, lineHeight: 1.1, letterSpacing: -0.3,
                      color: ink,
                    }}>{a.name}</div>
                    <div style={{ fontSize: 11.5, color: muted, marginTop: 1 }}>{a.sub}</div>
                  </div>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={muted} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                    <polyline points="9 18 15 12 9 6"/>
                  </svg>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── STATE B: Typing / loading skeletons ──────── */}
        {isLoading && (
          <div style={{ padding: '14px 22px 32px' }}>
            <div style={{
              fontSize: 10, letterSpacing: 1.6, color: muted, fontWeight: 600,
              padding: '0 0 4px',
            }}>SEARCHING…</div>
            {[0, 1, 2, 3].map((i) => <SkeletonRow key={i} i={i} />)}
          </div>
        )}

        {/* ── STATE C: Results ──────────────────────────── */}
        {!isCold && !isLoading && !isEmpty && (
          <div style={{ padding: '14px 22px 32px' }}>
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '0 0 4px',
              fontSize: 11.5, color: muted,
            }}>
              <span>
                <strong style={{ color: ink, fontWeight: 600 }}>{matches.length}</strong> result{matches.length === 1 ? '' : 's'}
              </span>
              <button style={{
                background: 'transparent', border: 'none', color: muted,
                fontSize: 11.5, fontFamily: 'inherit', cursor: 'pointer',
                display: 'inline-flex', alignItems: 'center', gap: 4, padding: 0,
              }}>
                Sort
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
              </button>
            </div>
            {matches.map((p) => <ResultRow key={p.id} p={p} />)}
          </div>
        )}

        {/* ── STATE D: No results ──────────────────────── */}
        {isEmpty && (
          <div style={{ padding: '48px 28px 0' }}>
            <div style={{
              fontFamily: '"Instrument Serif", Georgia, serif',
              fontSize: 38, lineHeight: 1, letterSpacing: -1.2,
              color: ink,
            }}>
              Nothing in stock for <span style={{ fontStyle: 'italic', color: amber }}>"{query}"</span>.
            </div>
            <div style={{
              fontSize: 13, color: muted, marginTop: 12, lineHeight: 1.55, maxWidth: 280,
            }}>
              Try a broader term, or scan the barcode.
            </div>
          </div>
        )}
      </div>

      {/* ── List-picker half sheet (no-session "+") ──────── */}
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
              {(() => {
                const p = D.products.find((x) => x.id === (addedId || 'olive-oil')) || D.products[0];
                return `${p.name} · $${p.price.toFixed(2)}`;
              })()}
            </div>

            {D.savedLists.map((sl) => (
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
                    const pp = D.products.find((x) => x.id === id);
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
                  width: 30, height: 30, borderRadius: 999, flexShrink: 0,
                  background: ink, color: cream,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
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

      <style>{`
        @keyframes caret { 0%, 50% { opacity: 1; } 50.01%, 100% { opacity: 0; } }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.55; } }
        @keyframes progress {
          0%   { transform: translateX(-100%); }
          100% { transform: translateX(350%); }
        }
        ::-webkit-scrollbar { display: none; }
      `}</style>
    </div>
  );
}

window.Search = Search;
