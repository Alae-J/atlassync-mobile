// Scan screen — Phygital · v2
//
// Keeps the camera-framed scanline from the original ShopScanning, but
// adds three things on top:
//   1) Post-scan peek card (between the frame and the totals strip)
//      — four variants: normal / allergen / rfid / unknown
//   2) Search escape hatch link beneath the in-frame hint
//   3) Pressable totals strip at the bottom (caret → Review)
//
// Props:
//   variant   : 'idle' | 'normal' | 'allergen' | 'rfid' | 'unknown'
//   scannedId : product id for the peek card content (default 'milk' so
//               'allergen' shows the milk match against the user's prefs)
//   unknownBarcode : barcode digits to show for the 'unknown' variant
//   prevCount, prevTotal : pre-scan totals (the strip ticks from these
//               to the post-scan values, with an amber freshness wash)

function ScanV2({
  variant = 'normal',
  scannedId = 'milk',
  unknownBarcode = '5 901234 123457',
  prevCount = 6,
  prevTotal = 31.85,
}) {
  const D = window.PHY_DATA;

  const ink = '#15140f';
  const cream = '#f4ede0';
  const accent = '#2d5a3d';
  const amber = '#c87a3a';
  const muted = '#7a7163';
  const line = 'rgba(21,20,15,0.10)';
  const dark = '#0d0c0a';
  const softRed = '#b84537';
  const softRedWash = 'rgba(184,69,55,0.10)';

  const NUTRI_BG = {
    A: '#3d6e4a',
    B: '#7a9b3d',
    C: '#c89538',
    D: '#c8723a',
    E: '#b84537',
  };

  const p = D.products.find((x) => x.id === scannedId) || D.products[0];
  const userDietary = D.userPrefs.dietary || [];
  const userAllergens = (D.userPrefs.allergens || []).map((a) => a.toLowerCase());
  const matchedAllergens = (p.allergens || []).filter((a) =>
    userAllergens.includes(a.toLowerCase())
  );
  const dietHit = (p.dietary || []).find((d) => userDietary.includes(d));

  // Post-scan total — show 'idle' at pre-scan values, otherwise add the
  // scanned product to the totals strip. (No effect for 'unknown'.)
  const isLive = variant !== 'idle';
  const scannedCount = (isLive && variant !== 'unknown') ? prevCount + 1 : prevCount;
  const scannedTotal = (isLive && variant !== 'unknown') ? prevTotal + p.price : prevTotal;

  // ─────────────────────────────────────────────────────────────
  // Shared mini chips — match Search/Detail vocabulary
  // ─────────────────────────────────────────────────────────────
  const AislePill = ({ n }) => (
    <span style={{
      fontSize: 10, letterSpacing: 1, fontWeight: 700,
      color: accent, background: 'rgba(45,90,61,0.10)',
      padding: '2px 7px', borderRadius: 999,
      whiteSpace: 'nowrap',
    }}>AISLE {n}</span>
  );
  const NutriBadge = ({ grade, size = 18 }) => (
    <div style={{
      width: size, height: size, borderRadius: 5,
      background: NUTRI_BG[grade] || muted, color: '#fff',
      fontSize: size * 0.55, fontWeight: 700, letterSpacing: 0.2,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.18)',
    }}>{grade}</div>
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

  // ─────────────────────────────────────────────────────────────
  // Peek card
  // ─────────────────────────────────────────────────────────────
  const PeekCard = () => {
    if (variant === 'idle') return null;

    // ── Variant D: unknown barcode ─────────────────────────
    if (variant === 'unknown') {
      return (
        <div style={{
          background: cream, color: ink,
          borderRadius: 18, padding: '16px 18px 14px',
          boxShadow: '0 18px 40px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.7)',
          position: 'relative', overflow: 'hidden',
          animation: 'peekUp .3s cubic-bezier(.2,.8,.3,1.2)',
        }}>
          <div style={{ fontSize: 10, color: muted, letterSpacing: 1.4, fontWeight: 700 }}>
            UNKNOWN CODE
          </div>
          <div style={{
            fontFamily: '"Instrument Serif", Georgia, serif',
            fontSize: 26, lineHeight: 1.1, letterSpacing: -0.6,
            marginTop: 6,
          }}>
            We don't carry <span style={{ fontStyle: 'italic', color: amber }}>that one.</span>
          </div>
          <div style={{
            marginTop: 10,
            fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
            fontSize: 12, color: muted, letterSpacing: 1.5,
          }}>{unknownBarcode}</div>

          <div style={{
            display: 'flex', justifyContent: 'flex-end', alignItems: 'center',
            marginTop: 14, paddingTop: 12, borderTop: `1px solid ${line}`,
          }}>
            <button style={{
              background: 'transparent', border: 'none', color: ink,
              fontSize: 12.5, fontWeight: 500, fontFamily: 'inherit',
              cursor: 'pointer', padding: 0,
              textDecoration: 'underline', textUnderlineOffset: 3,
              display: 'inline-flex', alignItems: 'center', gap: 4,
            }}>
              Try again
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
            </button>
          </div>

          {/* drain hairline */}
          <div style={{
            position: 'absolute', left: 0, right: 0, bottom: 0,
            height: 2, background: 'rgba(21,20,15,0.06)',
          }}>
            <div style={{
              height: '100%', width: '100%',
              background: amber, transformOrigin: 'right',
              animation: 'drain 3.5s linear forwards',
            }} />
          </div>
        </div>
      );
    }

    // ── Variants A / B / C — recognized product ────────────
    const showAllergen = variant === 'allergen' && matchedAllergens.length > 0;
    const showRfid = variant === 'rfid';

    return (
      <div style={{
        background: cream, color: ink,
        borderRadius: 18, padding: '14px 16px 12px',
        boxShadow: '0 18px 40px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.7)',
        position: 'relative', overflow: 'hidden',
        animation: 'peekUp .3s cubic-bezier(.2,.8,.3,1.2)',
      }}>
        <div style={{
          fontSize: 10, color: accent, letterSpacing: 1.2, fontWeight: 700,
          display: 'flex', alignItems: 'center', gap: 4, marginBottom: 10,
        }}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
          JUST SCANNED
        </div>

        {/* row: thumb · name+brand · price */}
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
          <div style={{
            width: 56, height: 56, borderRadius: 14, flexShrink: 0,
            background: 'linear-gradient(135deg, #fdf3e0, #f5e6cc)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 30,
            boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.6), inset 0 -1px 0 rgba(0,0,0,0.04)',
          }}>{p.emoji}</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{
              fontFamily: '"Instrument Serif", Georgia, serif',
              fontSize: 22, lineHeight: 1.1, letterSpacing: -0.4,
              whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
            }}>{p.name}</div>
            <div style={{
              fontSize: 11.5, color: muted, marginTop: 2,
              whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
            }}>{p.brand}</div>
          </div>
          <div style={{
            fontFamily: '"Instrument Serif", Georgia, serif',
            fontSize: 22, lineHeight: 1, letterSpacing: -0.3,
            flexShrink: 0, marginTop: 3,
          }}>${p.price.toFixed(2)}</div>
        </div>

        {/* allergen banner — only Variant B */}
        {showAllergen && (
          <div style={{
            background: softRedWash,
            border: '1px solid rgba(184,69,55,0.20)',
            borderRadius: 10, padding: '8px 10px',
            marginTop: 12,
            display: 'flex', alignItems: 'flex-start', gap: 8,
            color: softRed, fontSize: 11.5, lineHeight: 1.4,
          }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: 1 }}><path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
            <span>
              Contains <strong style={{ fontWeight: 700 }}>{matchedAllergens.join(', ').toLowerCase()}</strong> — flagged in your allergens.
            </span>
          </div>
        )}

        {/* chip strip */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 12, flexWrap: 'wrap' }}>
          <AislePill n={p.aisle} />
          <NutriBadge grade={p.nutriscore} />
          {dietHit && <DietChip label={dietHit} />}
        </div>

        {/* rfid note — only Variant C */}
        {showRfid && (
          <div style={{
            marginTop: 12,
            background: 'rgba(21,20,15,0.04)',
            borderRadius: 10, padding: '9px 12px',
            display: 'flex', alignItems: 'center', gap: 9,
            fontSize: 11.5, color: ink, lineHeight: 1.4,
            animation: 'fadeIn .3s ease',
          }}>
            <div style={{
              width: 24, height: 24, borderRadius: 7,
              background: 'rgba(200,122,58,0.14)', color: amber, flexShrink: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12.55a11 11 0 0 1 14.08 0"/><path d="M1.42 9a16 16 0 0 1 21.16 0"/><path d="M8.53 16.11a6 6 0 0 1 6.95 0"/><line x1="12" y1="20" x2="12.01" y2="20"/></svg>
            </div>
            <span><strong style={{ fontWeight: 600 }}>RFID secured.</strong> Pick up at the counter on your way out.</span>
          </div>
        )}

        {/* action row */}
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          marginTop: 14, paddingTop: 12, borderTop: `1px solid ${line}`,
        }}>
          <button style={{
            background: 'transparent', border: 'none', color: muted,
            fontSize: 12.5, fontWeight: 500, fontFamily: 'inherit',
            cursor: 'pointer', padding: 0,
            textDecoration: 'underline', textUnderlineOffset: 3,
            display: 'inline-flex', alignItems: 'center', gap: 4,
          }}>
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/></svg>
            Undo
          </button>
          <button style={{
            background: 'transparent', border: 'none', color: ink,
            fontSize: 12.5, fontWeight: 500, fontFamily: 'inherit',
            cursor: 'pointer', padding: 0,
            display: 'inline-flex', alignItems: 'center', gap: 4,
          }}>
            See details
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
          </button>
        </div>

        {/* drain hairline — or static rule for allergen variant */}
        <div style={{
          position: 'absolute', left: 0, right: 0, bottom: 0,
          height: 2, background: 'rgba(21,20,15,0.06)',
        }}>
          {showAllergen ? (
            // Static rule when card is locked open
            <div style={{ height: '100%', background: softRed, opacity: 0.6 }} />
          ) : (
            <div style={{
              height: '100%', width: '100%',
              background: variant === 'rfid' ? amber : accent,
              transformOrigin: 'right',
              animation: 'drain 3.5s linear forwards',
            }} />
          )}
        </div>
      </div>
    );
  };

  // ─────────────────────────────────────────────────────────────
  // Layout
  // ─────────────────────────────────────────────────────────────
  return (
    <div style={{
      width: '100%', height: '100%',
      background: dark, color: cream,
      fontFamily: '"Geist", system-ui, sans-serif',
      display: 'flex', flexDirection: 'column',
      position: 'relative', overflow: 'hidden',
    }}>
      {/* viewfinder backdrop — unchanged from original */}
      <div style={{
        position: 'absolute', inset: 0,
        background: `
          radial-gradient(60% 50% at 50% 40%, rgba(200,122,58,0.18), transparent 70%),
          radial-gradient(40% 30% at 30% 26%, rgba(45,90,61,0.18), transparent 70%),
          linear-gradient(180deg, #0a0908 0%, #1a1614 50%, #0d0a08 100%)
        `,
      }} />
      {/* scanline — unchanged */}
      <div style={{
        position: 'absolute', left: 36, right: 36, top: '32%',
        height: 2, background: `linear-gradient(90deg, transparent, ${amber}, transparent)`,
        boxShadow: `0 0 14px ${amber}`,
        animation: 'scanline 2s ease-in-out infinite',
      }} />

      {/* status bar gap */}
      <div style={{ height: 54, flexShrink: 0 }} />

      {/* ── Top bar: close + scanning chip + library ──────── */}
      <div style={{
        padding: '6px 18px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        position: 'relative', zIndex: 2,
      }}>
        <button style={{
          width: 38, height: 38, borderRadius: 999,
          background: 'rgba(255,255,255,0.10)', border: 'none',
          backdropFilter: 'blur(8px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', color: cream,
          cursor: 'pointer',
        }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
        <div style={{
          background: 'rgba(255,255,255,0.10)', backdropFilter: 'blur(8px)',
          padding: '7px 14px', borderRadius: 999,
          display: 'flex', alignItems: 'center', gap: 8,
          fontSize: 11, letterSpacing: 1, fontWeight: 600,
        }}>
          <span style={{
            width: 6, height: 6, borderRadius: 999, background: amber,
            animation: 'pulse 1.4s ease-in-out infinite',
          }} />
          SCANNING
        </div>
        <button style={{
          width: 38, height: 38, borderRadius: 999,
          background: 'rgba(255,255,255,0.10)', border: 'none',
          backdropFilter: 'blur(8px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', color: cream,
          cursor: 'pointer',
        }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>
        </button>
      </div>

      {/* ── Viewfinder frame + hint + escape hatch ────────── */}
      <div style={{
        flex: 1,
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        position: 'relative', zIndex: 2,
        padding: '0 24px',
      }}>
        <div style={{ width: 240, height: 240, position: 'relative' }}>
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
          <div style={{
            position: 'absolute', inset: 0,
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            color: 'rgba(244,237,224,0.55)', textAlign: 'center', gap: 8,
          }}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
              <path d="M3 5h2v14H3zM7 5h1v14H7zM10 5h2v14h-2zM13 5h1v14h-1zM16 5h3v14h-3zM21 5v14"/>
            </svg>
            <div style={{ fontSize: 11.5, letterSpacing: 0.8 }}>Tap to simulate scan</div>
          </div>
        </div>

        {/* Search escape hatch — quiet link beneath the frame */}
        <button style={{
          marginTop: 18,
          background: 'transparent', border: 'none',
          color: 'rgba(244,237,224,0.65)',
          fontSize: 12.5, fontFamily: 'inherit',
          fontWeight: 500, cursor: 'pointer', padding: '4px 6px',
          textDecoration: 'underline', textUnderlineOffset: 3,
          textDecorationColor: 'rgba(244,237,224,0.25)',
          display: 'inline-flex', alignItems: 'center', gap: 6,
        }}>
          No barcode? Search manually
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
        </button>
      </div>

      {/* ── Peek card ──────────────────────────────────────── */}
      {isLive && (
        <div style={{
          padding: '0 14px 10px',
          position: 'relative', zIndex: 2,
        }}>
          <PeekCard />
        </div>
      )}

      {/* ── Totals strip — pressable, with caret ──────────── */}
      <div style={{
        margin: '0 14px 18px',
        position: 'relative', zIndex: 2,
      }}>
        <button style={{
          width: '100%',
          background: ink, color: cream, border: 'none',
          borderRadius: 18, padding: '12px 16px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left',
          boxShadow: '0 12px 28px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.06)',
          position: 'relative', overflow: 'hidden',
        }}>
          {/* freshness wash — flashes behind the strip when totals change */}
          {isLive && variant !== 'unknown' && (
            <div style={{
              position: 'absolute', inset: 0,
              background: 'radial-gradient(80% 100% at 80% 50%, rgba(200,122,58,0.30), transparent 70%)',
              animation: 'fresh 1.6s ease-out forwards',
              pointerEvents: 'none',
            }} />
          )}

          <div style={{ display: 'flex', alignItems: 'center', gap: 14, position: 'relative' }}>
            <div style={{
              width: 36, height: 36, borderRadius: 10,
              background: 'rgba(255,255,255,0.08)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: amber,
            }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
            </div>
            <div>
              <div style={{ fontSize: 10, opacity: 0.55, letterSpacing: 1.2, fontWeight: 600 }}>CART</div>
              <div style={{
                fontFamily: '"Instrument Serif", Georgia, serif',
                fontSize: 22, lineHeight: 1, letterSpacing: -0.4, marginTop: 3,
              }}>
                {scannedCount} items
                <span style={{ opacity: 0.4, margin: '0 6px' }}>·</span>
                ${scannedTotal.toFixed(2)}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12.5, opacity: 0.7, position: 'relative' }}>
            Review
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
          </div>
        </button>
      </div>

      <style>{`
        @keyframes scanline { 0%, 100% { transform: translateY(-90px); opacity: 0.4; } 50% { transform: translateY(90px); opacity: 1; } }
        @keyframes peekUp { from { transform: translateY(28px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        @keyframes drain { from { transform: scaleX(1); } to { transform: scaleX(0); } }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.35; } }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes fresh { 0% { opacity: 1; } 100% { opacity: 0; } }
      `}</style>
    </div>
  );
}

window.ScanV2 = ScanV2;
