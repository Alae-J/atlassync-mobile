// Receipt / Order Detail — Phygital · AtlasSync
//
// One screen, two entry points:
//   - 'walkout'   : reached right after walkout — amber wash + celebratory header
//   - 'past'      : reached from Orders / Recent Shops on Home — back + share chip header
//   - 'cancelled' : edge state — header B variant, $0.00, no items, no Re-buy
//
// Modifiers (composable on 'walkout' / 'past'):
//   - helpRequested: show small support note above items
//   - refundedId   : id of a product line that's been refunded — strikethrough + chip
//
// Row anatomy compresses Product Detail's hero into a strip:
//   thumb · name · brand · [aisle · nutriscore] · qty×unit (muted, right) · line total (serif, right)

function Receipt({
  variant = 'walkout',
  userName = 'Adam',
  helpRequested = false,
  refundedId = null,
}) {
  const D = window.PHY_DATA;

  // ── Tokens (shared with the rest of the app) ──
  const ink = '#15140f';
  const cream = '#f4ede0';
  const accent = '#2d5a3d';
  const amber = '#c87a3a';
  const muted = '#7a7163';
  const line = 'rgba(21,20,15,0.10)';
  const paper = '#fffaf0';

  const NUTRI_BG = {
    A: '#3d6e4a', B: '#7a9b3d', C: '#c89538', D: '#c8723a', E: '#b84537',
  };

  // ── This trip's line items ──
  // Modeled on savedLists[0] ("Weekly groceries"). Each row has its own qty
  // and unit price so the transcript reads like a real ledger. Totals are
  // pinned to the spec ($39.50 / $2.68 / $42.18) — small drift from row
  // sums is realistic (rounded membership discount, weighed produce).
  const LINES = [
    { id: 'banana',   qty: 3, unitPrice: 0.59, lineTotal: 1.77 },
    { id: 'milk',     qty: 1, unitPrice: 4.29, lineTotal: 4.29 },
    { id: 'bread',    qty: 1, unitPrice: 5.50, lineTotal: 5.50 },
    { id: 'eggs',     qty: 1, unitPrice: 6.99, lineTotal: 6.99 },
    { id: 'avocado',  qty: 1, unitPrice: 1.25, lineTotal: 1.25 },
    { id: 'chicken',  qty: 1, unitPrice: 8.99, lineTotal: 8.99 },
    { id: 'pasta',    qty: 1, unitPrice: 2.49, lineTotal: 2.49 },
    { id: 'tomato',   qty: 1, unitPrice: 1.99, lineTotal: 1.99 },
    { id: 'onion',    qty: 1, unitPrice: 1.49, lineTotal: 1.49 },
    { id: 'yogurt',   qty: 1, unitPrice: 5.99, lineTotal: 5.99 },
  ];
  const itemCount = LINES.reduce((s, l) => s + l.qty, 0); // 12
  const subtotal = 39.50;
  const tax = 2.68;
  const total = 42.18;

  const isCancelled = variant === 'cancelled';
  const isWalkout = variant === 'walkout';

  // ─────────────────────────────────────────────────────────────
  // Atoms (reuse the chip language from Search / Product Detail)
  // ─────────────────────────────────────────────────────────────

  const NutriBadge = ({ grade, size = 16 }) => (
    <div style={{
      width: size, height: size, borderRadius: 4,
      background: NUTRI_BG[grade] || muted, color: '#fff',
      fontSize: size * 0.56, fontWeight: 700, letterSpacing: 0.2,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.18)',
    }}>{grade}</div>
  );

  const AislePill = ({ n }) => (
    <span style={{
      fontSize: 9.5, letterSpacing: 1, fontWeight: 700,
      color: accent, background: 'rgba(45,90,61,0.10)',
      padding: '2px 6px', borderRadius: 999,
      whiteSpace: 'nowrap',
    }}>AISLE {n}</span>
  );

  const VisaChip = () => (
    // Matches the Account screen "default card" treatment, shrunk for inline use.
    <div style={{
      width: 26, height: 17, borderRadius: 3,
      background: `linear-gradient(135deg, ${ink} 0%, #2d2820 100%)`,
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      color: amber, fontSize: 7.5, fontWeight: 700, letterSpacing: 0.4,
      flexShrink: 0,
    }}>VISA</div>
  );

  const Caret = () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={muted} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
      <polyline points="9 18 15 12 9 6"/>
    </svg>
  );

  // ─────────────────────────────────────────────────────────────
  // Header strips
  // ─────────────────────────────────────────────────────────────

  const HeaderWalkout = () => (
    <div style={{ position: 'relative', flexShrink: 0 }}>
      {/* amber wash — same family as home, dialled up a notch */}
      <div style={{
        position: 'absolute', left: 0, right: 0, top: 0, height: 260,
        background: `
          radial-gradient(120% 80% at 50% 0%, rgba(200,122,58,0.32) 0%, rgba(200,122,58,0.10) 40%, transparent 75%),
          linear-gradient(180deg, rgba(244,224,196,0.55), rgba(244,237,224,0))
        `,
        pointerEvents: 'none',
      }} />
      {/* status bar gap */}
      <div style={{ height: 54 }} />

      <div style={{ position: 'relative', padding: '14px 22px 6px', display: 'flex', justifyContent: 'flex-end' }}>
        <button style={{
          width: 40, height: 40, borderRadius: 999,
          background: paper, border: `1px solid ${line}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', color: ink,
          boxShadow: '0 2px 6px rgba(20,15,5,0.06)',
        }} aria-label="Close">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      </div>

      <div style={{ position: 'relative', padding: '6px 22px 24px' }}>
        <div style={{ fontSize: 10, letterSpacing: 1.6, fontWeight: 700, color: amber }}>
          SHOPPING COMPLETE · GATE CLEARED
        </div>
        <div style={{
          fontFamily: '"Instrument Serif", Georgia, serif',
          fontSize: 38, lineHeight: 1.05, letterSpacing: -1, marginTop: 10,
          color: ink,
        }}>
          Thanks, <span style={{ fontStyle: 'italic', color: amber }}>{userName}</span>.
        </div>
        <div style={{
          fontSize: 12.5, color: muted, marginTop: 8, lineHeight: 1.45, maxWidth: 280,
        }}>
          Your receipt is below. It's also in your inbox.
        </div>
      </div>
    </div>
  );

  const HeaderPast = () => (
    <div style={{ flexShrink: 0 }}>
      {/* same faint wash the rest of the app uses, no celebration */}
      <div style={{ height: 54 }} />
      <div style={{
        padding: '8px 18px 14px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        position: 'relative', zIndex: 2,
      }}>
        <button style={{
          width: 40, height: 40, borderRadius: 999,
          background: paper, border: `1px solid ${line}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', color: ink,
          boxShadow: '0 2px 6px rgba(20,15,5,0.05)',
        }} aria-label="Back">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>
          </svg>
        </button>
        <button style={{
          width: 40, height: 40, borderRadius: 999,
          background: paper, border: `1px solid ${line}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', color: ink,
          boxShadow: '0 2px 6px rgba(20,15,5,0.05)',
        }} aria-label="Share">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/>
            <polyline points="16 6 12 2 8 6"/>
            <line x1="12" y1="2" x2="12" y2="15"/>
          </svg>
        </button>
      </div>
    </div>
  );

  // ─────────────────────────────────────────────────────────────
  // Hero block — store, metadata, total
  // ─────────────────────────────────────────────────────────────

  const Hero = () => (
    <div style={{ padding: isWalkout ? '4px 22px 22px' : '0 22px 22px', position: 'relative' }}>
      <div style={{
        fontFamily: '"Instrument Serif", Georgia, serif',
        fontSize: 30, lineHeight: 1.1, letterSpacing: -0.7, color: ink,
      }}>
        Aldi · <span style={{ fontStyle: 'italic' }}>Mansoura</span>
      </div>
      <div style={{ fontSize: 12, color: muted, marginTop: 8, lineHeight: 1.5 }}>
        Sat 4 May · 3:42 PM → 4:18 PM · 36 min
      </div>
      <div style={{
        fontFamily: '"Instrument Serif", Georgia, serif',
        fontSize: 68, lineHeight: 0.95, letterSpacing: -2.4, marginTop: 18,
        color: ink,
      }}>
        ${isCancelled ? '0.00' : total.toFixed(2)}
      </div>
    </div>
  );

  // ─────────────────────────────────────────────────────────────
  // Quick stats strip — numerics live in Instrument Serif here
  // ─────────────────────────────────────────────────────────────

  const StatsStrip = () => (
    <div style={{
      margin: '6px 22px 0',
      display: 'flex', alignItems: 'stretch',
      borderTop: `1px solid ${line}`, borderBottom: `1px solid ${line}`,
      padding: '14px 0',
    }}>
      {/* Items */}
      <div style={{ flex: 1, paddingRight: 14 }}>
        <div style={{ fontSize: 9.5, letterSpacing: 1.4, color: muted, fontWeight: 600 }}>ITEMS</div>
        <div style={{
          fontFamily: '"Instrument Serif", Georgia, serif',
          fontSize: 22, lineHeight: 1.1, letterSpacing: -0.3, marginTop: 4, color: ink,
        }}>{itemCount} <span style={{ fontSize: 13, color: muted, fontFamily: 'inherit' }}>items</span></div>
      </div>

      <div style={{ width: 1, background: line }} />

      {/* Payment */}
      <div style={{ flex: 1.2, padding: '0 14px' }}>
        <div style={{ fontSize: 9.5, letterSpacing: 1.4, color: muted, fontWeight: 600 }}>PAYMENT</div>
        <div style={{
          marginTop: 4, display: 'flex', alignItems: 'center', gap: 7,
        }}>
          <VisaChip />
          <span style={{
            fontFamily: '"Instrument Serif", Georgia, serif',
            fontSize: 19, lineHeight: 1.1, letterSpacing: -0.3, color: ink,
          }}>·· 4287</span>
        </div>
      </div>

      <div style={{ width: 1, background: line }} />

      {/* Aisles */}
      <div style={{ flex: 0.9, paddingLeft: 14 }}>
        <div style={{ fontSize: 9.5, letterSpacing: 1.4, color: muted, fontWeight: 600 }}>AISLES</div>
        <div style={{
          fontFamily: '"Instrument Serif", Georgia, serif',
          fontSize: 22, lineHeight: 1.1, letterSpacing: -0.3, marginTop: 4, color: ink,
        }}>5 <span style={{ fontSize: 13, color: muted, fontFamily: 'inherit' }}>covered</span></div>
      </div>
    </div>
  );

  // ─────────────────────────────────────────────────────────────
  // Line item — single transcript row
  // ─────────────────────────────────────────────────────────────

  const LineRow = ({ item }) => {
    const p = D.products.find((x) => x.id === item.id);
    if (!p) return null;
    const refunded = refundedId === item.id;

    return (
      <button style={{
        width: '100%', textAlign: 'left',
        display: 'flex', alignItems: 'center', gap: 12,
        background: 'transparent', border: 'none',
        padding: '13px 0',
        borderBottom: `1px solid ${line}`,
        cursor: 'pointer', fontFamily: 'inherit', color: ink,
      }}>
        {/* product thumb */}
        <div style={{
          width: 52, height: 52, borderRadius: 13, flexShrink: 0,
          background: 'linear-gradient(135deg, #fdf3e0, #f5e6cc)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 28,
          boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.6), inset 0 -1px 0 rgba(0,0,0,0.04)',
          opacity: refunded ? 0.55 : 1,
        }}>{p.emoji}</div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            fontSize: 14, fontWeight: 500,
            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
            color: refunded ? muted : ink,
          }}>{p.name}</div>
          <div style={{
            fontSize: 11.5, color: muted, marginTop: 2,
            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
          }}>{p.brand}</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 6 }}>
            <AislePill n={p.aisle} />
            <NutriBadge grade={p.nutriscore} />
          </div>
          {refunded && (
            <div style={{ marginTop: 6 }}>
              <span style={{
                fontSize: 10, letterSpacing: 0.5, fontWeight: 600,
                color: muted, background: 'rgba(21,20,15,0.06)',
                padding: '2px 8px', borderRadius: 999,
                display: 'inline-flex', alignItems: 'center', gap: 5,
              }}>
                <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="1 4 1 10 7 10"/>
                  <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/>
                </svg>
                Refunded · ${item.lineTotal.toFixed(2)}
              </span>
            </div>
          )}
        </div>

        {/* qty / unit + line total */}
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4,
          flexShrink: 0,
        }}>
          <div style={{ fontSize: 10.5, color: muted, letterSpacing: 0.2 }}>
            {item.qty} × ${item.unitPrice.toFixed(2)}
          </div>
          <div style={{
            fontFamily: '"Instrument Serif", Georgia, serif',
            fontSize: 21, lineHeight: 1, letterSpacing: -0.3,
            color: refunded ? muted : ink,
            textDecoration: refunded ? 'line-through' : 'none',
            textDecorationThickness: refunded ? '1px' : undefined,
          }}>${item.lineTotal.toFixed(2)}</div>
        </div>
      </button>
    );
  };

  // ─────────────────────────────────────────────────────────────
  // Items section (with optional help-requested eyebrow note)
  // ─────────────────────────────────────────────────────────────

  const ItemsSection = () => (
    <div style={{ padding: '22px 22px 0' }}>
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        marginBottom: 4,
      }}>
        <div style={{ fontSize: 10, letterSpacing: 1.6, color: muted, fontWeight: 600 }}>ITEMS</div>
      </div>

      {helpRequested && (
        <div style={{
          marginTop: 10, marginBottom: 6,
          display: 'flex', alignItems: 'center', gap: 9,
          padding: '10px 12px', borderRadius: 12,
          background: 'rgba(200,122,58,0.08)',
          border: `1px solid rgba(200,122,58,0.18)`,
        }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={amber} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
            <path d="M18.36 6.64a9 9 0 1 1-12.73 0"/><line x1="12" y1="2" x2="12" y2="12"/>
          </svg>
          <div style={{ fontSize: 12, color: ink, lineHeight: 1.4 }}>
            You called for an associate at <span style={{ fontWeight: 500 }}>3:58 PM</span>.
          </div>
        </div>
      )}

      <div style={{ marginTop: 2 }}>
        {LINES.map((l) => <LineRow key={l.id} item={l} />)}
      </div>
    </div>
  );

  // ─────────────────────────────────────────────────────────────
  // Totals ledger
  // ─────────────────────────────────────────────────────────────

  const TotalsBlock = () => (
    <div style={{ padding: '20px 22px 0' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
          <span style={{ fontSize: 12, color: muted, letterSpacing: 0.2 }}>Subtotal</span>
          <span style={{
            fontFamily: '"Instrument Serif", Georgia, serif',
            fontSize: 18, lineHeight: 1, letterSpacing: -0.3, color: muted,
          }}>${subtotal.toFixed(2)}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
          <span style={{ fontSize: 12, color: muted, letterSpacing: 0.2 }}>Tax</span>
          <span style={{
            fontFamily: '"Instrument Serif", Georgia, serif',
            fontSize: 18, lineHeight: 1, letterSpacing: -0.3, color: muted,
          }}>${tax.toFixed(2)}</span>
        </div>
        <div style={{
          paddingTop: 12, borderTop: `1px solid ${line}`,
          display: 'flex', justifyContent: 'space-between', alignItems: 'baseline',
        }}>
          <span style={{ fontSize: 13, color: ink, fontWeight: 500, letterSpacing: 0.2 }}>Total</span>
          <span style={{
            fontFamily: '"Instrument Serif", Georgia, serif',
            fontSize: 26, lineHeight: 1, letterSpacing: -0.5, color: ink,
          }}>${total.toFixed(2)}</span>
        </div>
      </div>
    </div>
  );

  // ─────────────────────────────────────────────────────────────
  // Actions (quiet, archival — not marketing)
  // ─────────────────────────────────────────────────────────────

  const ActionsBlock = () => (
    <div style={{ padding: '28px 22px 0' }}>
      <div style={{ fontSize: 10, letterSpacing: 1.6, color: muted, fontWeight: 600, marginBottom: 10 }}>
        RECEIPT
      </div>
      <div style={{
        background: paper, borderRadius: 14, overflow: 'hidden',
        boxShadow: '0 1px 0 rgba(255,255,255,0.7) inset, 0 4px 12px rgba(20,15,5,0.04), 0 0 0 1px rgba(21,20,15,0.05)',
      }}>
        <button style={{
          width: '100%', display: 'flex', alignItems: 'center', gap: 12,
          background: 'transparent', border: 'none', padding: '13px 16px',
          borderBottom: `1px solid ${line}`,
          cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left', color: ink,
        }}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
            <polyline points="7 10 12 15 17 10"/>
            <line x1="12" y1="15" x2="12" y2="3"/>
          </svg>
          <span style={{ flex: 1, fontSize: 13.5, fontWeight: 500 }}>Download PDF receipt</span>
          <Caret/>
        </button>
        <button style={{
          width: '100%', display: 'flex', alignItems: 'center', gap: 12,
          background: 'transparent', border: 'none', padding: '13px 16px',
          cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left', color: muted,
        }}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
            <circle cx="12" cy="12" r="3"/>
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
          </svg>
          <span style={{ flex: 1, fontSize: 13.5 }}>Report a problem</span>
          <Caret/>
        </button>
      </div>
    </div>
  );

  // ─────────────────────────────────────────────────────────────
  // Sticky CTA
  // ─────────────────────────────────────────────────────────────

  const StickyBar = () => (
    <div style={{
      position: 'absolute', left: 0, right: 0, bottom: 0,
      padding: '14px 22px 26px',
      background: `linear-gradient(180deg, rgba(244,237,224,0) 0%, ${cream} 30%)`,
      pointerEvents: 'none',
    }}>
      <button style={{
        pointerEvents: 'auto',
        width: '100%', height: 52, borderRadius: 13,
        background: ink, color: cream, border: 'none',
        fontSize: 14.5, fontWeight: 600, fontFamily: 'inherit',
        cursor: 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
        boxShadow: '0 10px 22px rgba(21,20,15,0.22), inset 0 1px 0 rgba(255,255,255,0.08)',
      }}>
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="1 4 1 10 7 10"/>
          <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/>
        </svg>
        Re-buy these items
      </button>
    </div>
  );

  // ─────────────────────────────────────────────────────────────
  // Cancelled session — own minimal body, own footer
  // ─────────────────────────────────────────────────────────────

  const CancelledBody = () => (
    <>
      <Hero />
      <div style={{ padding: '6px 22px 0' }}>
        <div style={{
          background: paper, borderRadius: 14, padding: '16px 18px',
          boxShadow: '0 1px 0 rgba(255,255,255,0.7) inset, 0 4px 12px rgba(20,15,5,0.04), 0 0 0 1px rgba(21,20,15,0.05)',
          display: 'flex', alignItems: 'flex-start', gap: 11,
        }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={muted} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: 2 }}>
            <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          <div style={{ fontSize: 12.5, color: muted, lineHeight: 1.5 }}>
            Session cancelled before payment. No items were charged.
          </div>
        </div>
      </div>
    </>
  );

  const CancelledFooter = () => (
    <div style={{
      position: 'absolute', left: 0, right: 0, bottom: 0,
      padding: '14px 22px 26px',
      background: `linear-gradient(180deg, rgba(244,237,224,0) 0%, ${cream} 30%)`,
      pointerEvents: 'none',
    }}>
      <button style={{
        pointerEvents: 'auto',
        width: '100%', height: 50, borderRadius: 13,
        background: 'transparent', color: ink,
        border: `1.5px solid ${line}`,
        fontSize: 14, fontWeight: 500, fontFamily: 'inherit',
        cursor: 'pointer',
      }}>
        Close
      </button>
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
      {/* baseline ambient wash (subtle, only used by 'past' variant; walkout draws its own stronger one) */}
      {!isWalkout && (
        <div style={{
          position: 'absolute', inset: 0,
          background: 'radial-gradient(120% 60% at 50% 0%, rgba(200,122,58,0.06) 0%, transparent 60%)',
          pointerEvents: 'none',
        }} />
      )}

      {/* Header strip */}
      {isWalkout ? <HeaderWalkout/> : <HeaderPast/>}

      {/* Scrollable body */}
      <div style={{
        flex: 1, overflowY: 'auto',
        position: 'relative', zIndex: 1,
      }}>
        {isCancelled ? (
          <CancelledBody />
        ) : (
          <>
            <Hero />
            <StatsStrip />
            <ItemsSection />
            <TotalsBlock />
            <ActionsBlock />
            <div style={{ height: 120 }} />
          </>
        )}
      </div>

      {/* Sticky footer */}
      {isCancelled ? <CancelledFooter/> : <StickyBar/>}

      <style>{`::-webkit-scrollbar { display: none; }`}</style>
    </div>
  );
}

window.Receipt = Receipt;
