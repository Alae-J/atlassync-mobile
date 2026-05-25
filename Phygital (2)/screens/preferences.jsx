// Preferences — five edit surfaces for the Account → Preferences tab,
// plus a refreshed row treatment showing the deferred Language state.
//
// Composes the same chrome (PDChrome / PDPrimary) as personal-details.jsx —
// back chip, amber eyebrow, italic-serif hero, sticky ink CTA. The two
// picker screens (Store, Currency) save instantly; the chip-cloud + toggle
// screens (Dietary, Allergens, Notifications) need explicit Save.

// ── Shared tokens (same as personal-details + product) ──────────────────
const PR = (() => {
  const ink = '#15140f';
  const cream = '#f4ede0';
  const accent = '#2d5a3d';
  const amber = '#c87a3a';
  const muted = '#7a7163';
  const line = 'rgba(21,20,15,0.12)';
  const lineSoft = 'rgba(21,20,15,0.07)';
  const paper = '#fffdf8';
  const softRed = '#b84537';
  const softRedWash = 'rgba(184,69,55,0.10)';
  const softRedBorder = 'rgba(184,69,55,0.30)';
  return { ink, cream, accent, amber, muted, line, lineSoft, paper, softRed, softRedWash, softRedBorder };
})();

// ── Chrome shared with personal-details ─────────────────────────────────
function PRChrome({ children, eyebrow, title, italic, helper, footer }) {
  const { ink, cream, amber, muted } = PR;
  return (
    <div style={{
      width: '100%', height: '100%',
      background: cream, color: ink,
      fontFamily: '"Geist", -apple-system, system-ui, sans-serif',
      display: 'flex', flexDirection: 'column',
      position: 'relative', overflow: 'hidden',
    }}>
      <div style={{
        position: 'absolute', inset: 0,
        background: 'radial-gradient(120% 60% at 50% 0%, rgba(200,122,58,0.10) 0%, transparent 55%)',
        pointerEvents: 'none',
      }} />
      <div style={{ height: 54, flexShrink: 0 }} />

      <div style={{
        position: 'relative', zIndex: 1,
        padding: '14px 24px 0',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <button style={{
          background: 'rgba(21,20,15,0.06)', border: 'none', borderRadius: 999,
          width: 36, height: 36,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', color: ink,
        }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
        </button>
        <div style={{
          fontSize: 11, color: muted, letterSpacing: 1.5, fontWeight: 600,
          display: 'flex', alignItems: 'center', gap: 6,
        }}>
          <span style={{ width: 6, height: 6, borderRadius: 999, background: PR.accent, display: 'inline-block' }} />
          PHYGITAL
        </div>
        <div style={{ width: 36 }} />
      </div>

      <div style={{ padding: '28px 28px 0', position: 'relative', zIndex: 1 }}>
        <div style={{ fontSize: 11, letterSpacing: 1.6, fontWeight: 700, color: amber }}>
          {eyebrow}
        </div>
        <div style={{
          fontFamily: '"Instrument Serif", Georgia, serif',
          fontSize: 38, lineHeight: 1.02, letterSpacing: -1.1,
          marginTop: 12, maxWidth: 320,
        }}>
          {title} <span style={{ fontStyle: 'italic', color: amber }}>{italic}</span>
        </div>
        {helper && (
          <div style={{ fontSize: 13, color: muted, marginTop: 12, lineHeight: 1.5, maxWidth: 320 }}>
            {helper}
          </div>
        )}
      </div>

      <div style={{ flex: 1, position: 'relative', zIndex: 1, overflow: 'auto' }}>
        {children}
      </div>

      {footer && (
        <div style={{
          position: 'relative', zIndex: 2,
          padding: '14px 24px 28px',
          background: `linear-gradient(180deg, rgba(244,237,224,0) 0%, ${PR.cream} 30%)`,
        }}>
          {footer}
        </div>
      )}
    </div>
  );
}

function PRPrimary({ label, disabled }) {
  const { ink, cream } = PR;
  return (
    <button disabled={disabled} style={{
      width: '100%', height: 52, borderRadius: 14,
      background: disabled ? '#d8d2c5' : ink, color: cream,
      border: 'none',
      fontSize: 15, fontWeight: 500, fontFamily: 'inherit',
      cursor: disabled ? 'default' : 'pointer',
      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
      boxShadow: disabled ? 'none'
        : '0 8px 20px rgba(21,20,15,0.18), inset 0 1px 0 rgba(255,255,255,0.1)',
    }}>
      {label}
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="5" y1="12" x2="19" y2="12"/>
        <polyline points="12 5 19 12 12 19"/>
      </svg>
    </button>
  );
}

// Check chip used by the picker screens (Store, Currency)
function CheckChip() {
  const { accent, cream } = PR;
  return (
    <div style={{
      width: 26, height: 26, borderRadius: 999,
      background: accent, color: cream,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      flexShrink: 0,
      boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.18)',
    }}>
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="20 6 9 17 4 12"/>
      </svg>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Preferences TAB · refreshed rows (this is what the user sees on Account)
// ─────────────────────────────────────────────────────────────

function PreferencesTabRows() {
  const { ink, cream, muted, line, lineSoft, paper, accent, amber } = PR;

  // Reused style for the value-side label
  const Value = ({ children, soft }) => (
    <span style={{ fontSize: 13, color: soft ? muted : ink, opacity: soft ? 0.85 : 1 }}>
      {children}
    </span>
  );
  const Caret = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={muted} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
      <polyline points="9 18 15 12 9 6"/>
    </svg>
  );

  const Row = ({ icon, label, value, deferred, last }) => (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 14,
      padding: '15px 0',
      borderBottom: last ? 'none' : `1px ${deferred ? 'dashed' : 'solid'} ${deferred ? lineSoft : line}`,
      opacity: deferred ? 0.78 : 1,
      cursor: deferred ? 'default' : 'pointer',
    }}>
      <span style={{
        width: 32, height: 32, borderRadius: 8,
        background: deferred ? 'rgba(21,20,15,0.05)' : 'rgba(200,122,58,0.10)',
        color: deferred ? muted : amber,
        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
      }}>{icon}</span>
      <span style={{ flex: 1, fontSize: 14.5, color: deferred ? muted : ink }}>{label}</span>
      <Value soft={deferred}>{value}</Value>
      {deferred
        ? <span style={{
            fontSize: 9.5, letterSpacing: 1, fontWeight: 700, color: muted,
            border: `1px dashed ${line}`, padding: '2px 6px', borderRadius: 999,
            textTransform: 'uppercase',
          }}>
            soon
          </span>
        : <Caret />}
    </div>
  );

  return (
    <div style={{
      width: '100%', height: '100%', overflow: 'auto',
      background: cream, color: ink,
      fontFamily: '"Geist", system-ui, sans-serif',
      padding: '60px 22px 30px', boxSizing: 'border-box',
    }}>
      <div style={{ fontSize: 11, letterSpacing: 1.6, color: amber, fontWeight: 700, marginBottom: 8 }}>
        PREFERENCES · TAB ROWS
      </div>
      <div style={{
        fontFamily: '"Instrument Serif", Georgia, serif',
        fontSize: 36, lineHeight: 1, letterSpacing: -1, marginBottom: 4,
      }}>
        How you <span style={{ fontStyle: 'italic', color: amber }}>shop</span>.
      </div>
      <div style={{ fontSize: 12.5, color: muted, marginTop: 12, lineHeight: 1.5, marginBottom: 22 }}>
        Six rows, five tappable. Language gets a dashed-rule, "SOON" pill, no caret — deferred without screaming broken.
      </div>

      <div style={{
        background: paper, border: `1px solid ${line}`,
        borderRadius: 16, padding: '4px 18px',
      }}>
        <Row
          icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>}
          label="Default store"
          value="Aldi · Mansoura"
        />
        <Row
          icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>}
          label="Currency"
          value="USD ($)"
        />
        <Row
          icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M2 12h20"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>}
          label="Language"
          value="Coming soon"
          deferred
        />
        <Row
          icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10 21a2 2 0 0 0 4 0"/></svg>}
          label="Notifications"
          value="3 categories on"
        />
        <Row
          icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="m4.93 4.93 14.14 14.14"/></svg>}
          label="Dietary"
          value="4 active"
        />
        <Row
          icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>}
          label="Allergens"
          value="2 flagged"
          last
        />
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Screen 1 · Default store picker
// ─────────────────────────────────────────────────────────────

const STORES = [
  { id: 'aldi-mansoura',  name: 'Aldi · Mansoura',     distance: '1.2 km',  hours: 'open until 11 PM', selected: true },
  { id: 'aldi-cairo',     name: 'Aldi · Heliopolis',   distance: '8.4 km',  hours: 'open until 10 PM', selected: false },
  { id: 'aldi-talkha',    name: 'Aldi · Talkha',       distance: '5.6 km',  hours: 'closes at 9 PM',   selected: false },
];

function StoreRow({ store, last }) {
  const { ink, cream, muted, line, amber } = PR;
  return (
    <button style={{
      width: '100%', display: 'flex', alignItems: 'center', gap: 14,
      padding: '14px 0',
      background: 'transparent', border: 'none',
      borderBottom: last ? 'none' : `1px solid ${line}`,
      cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left', color: ink,
    }}>
      <div style={{
        width: 46, height: 46, borderRadius: 12, flexShrink: 0,
        background: 'linear-gradient(135deg, #fdf3e0, #f5e6cc)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: amber,
        boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.7), inset 0 -1px 0 rgba(0,0,0,0.04)',
      }}>
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
          <circle cx="12" cy="10" r="3"/>
        </svg>
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 14.5, fontWeight: 500 }}>{store.name}</div>
        <div style={{ fontSize: 12, color: muted, marginTop: 3 }}>
          {store.distance} · {store.hours}
        </div>
      </div>
      {store.selected && <CheckChip />}
    </button>
  );
}

function PrefStore({ selectedId = 'aldi-mansoura' }) {
  const { paper, line } = PR;
  return (
    <PRChrome
      eyebrow="PREFERENCES"
      title="Where do you mostly"
      italic="shop?"
    >
      <div style={{ padding: '22px 22px 22px' }}>
        <div style={{
          background: paper, border: `1px solid ${line}`,
          borderRadius: 16, padding: '4px 18px',
        }}>
          {STORES.map((s, i) => (
            <StoreRow
              key={s.id}
              store={{ ...s, selected: s.id === selectedId }}
              last={i === STORES.length - 1}
            />
          ))}
        </div>
      </div>
    </PRChrome>
  );
}

// ─────────────────────────────────────────────────────────────
// Screen 2 · Currency picker
// ─────────────────────────────────────────────────────────────

const CURRENCIES = [
  { code: 'EGP', name: 'Egyptian Pound',  symbol: 'E£' },
  { code: 'MAD', name: 'Moroccan Dirham', symbol: 'د.م' },
  { code: 'USD', name: 'US Dollar',       symbol: '$' },
  { code: 'EUR', name: 'Euro',            symbol: '€' },
  { code: 'GBP', name: 'British Pound',   symbol: '£' },
  { code: 'SAR', name: 'Saudi Riyal',     symbol: '﷼' },
  { code: 'AED', name: 'UAE Dirham',      symbol: 'د.إ' },
];

function CurrencyRow({ c, selected, last }) {
  const { ink, muted, line, amber } = PR;
  return (
    <button style={{
      width: '100%', display: 'flex', alignItems: 'center', gap: 14,
      padding: '13px 0',
      background: 'transparent', border: 'none',
      borderBottom: last ? 'none' : `1px solid ${line}`,
      cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left', color: ink,
    }}>
      <div style={{
        width: 36, height: 24, borderRadius: 6, flexShrink: 0,
        background: 'linear-gradient(135deg, #fdf6e8, #f3e9d3)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.7), inset 0 0 0 1px rgba(21,20,15,0.06)',
      }}>
        <span style={{
          fontFamily: '"Instrument Serif", Georgia, serif',
          fontSize: c.symbol.length > 1 ? 13 : 18,
          lineHeight: 1, color: ink, letterSpacing: -0.3,
        }}>
          {c.symbol}
        </span>
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 14.5, fontWeight: 500 }}>
          {c.name} · <span style={{ color: muted, fontWeight: 400 }}>{c.code}</span>
        </div>
      </div>
      {selected && <CheckChip />}
    </button>
  );
}

function PrefCurrency({ selectedCode = 'USD' }) {
  const { paper, line } = PR;
  return (
    <PRChrome
      eyebrow="PREFERENCES"
      title="Show prices in"
      italic="which currency?"
    >
      <div style={{ padding: '22px 22px 22px' }}>
        <div style={{
          background: paper, border: `1px solid ${line}`,
          borderRadius: 16, padding: '4px 18px',
        }}>
          {CURRENCIES.map((c, i) => (
            <CurrencyRow
              key={c.code} c={c}
              selected={c.code === selectedCode}
              last={i === CURRENCIES.length - 1}
            />
          ))}
        </div>
      </div>
    </PRChrome>
  );
}

// ─────────────────────────────────────────────────────────────
// Screen 3 · Notifications (toggles)
// ─────────────────────────────────────────────────────────────

function IOSSwitch({ on, disabled, locked }) {
  const { accent, muted } = PR;
  const w = 46, h = 28, knob = 24;
  const trackColor = disabled
    ? (on ? 'rgba(45,90,61,0.45)' : 'rgba(21,20,15,0.12)')
    : (on ? accent : 'rgba(21,20,15,0.18)');
  return (
    <div style={{
      width: w, height: h, borderRadius: 999, position: 'relative',
      background: trackColor,
      transition: 'background .15s',
      flexShrink: 0,
      boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.08)',
      opacity: disabled ? 0.95 : 1,
      cursor: disabled ? 'default' : 'pointer',
    }}>
      <div style={{
        position: 'absolute', top: 2, left: on ? (w - knob - 2) : 2,
        width: knob, height: knob, borderRadius: 999,
        background: '#fff',
        boxShadow: '0 2px 4px rgba(0,0,0,0.15), 0 1px 2px rgba(0,0,0,0.1)',
        transition: 'left .15s',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: muted,
      }}>
        {locked && (
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="11" width="18" height="11" rx="2"/>
            <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
          </svg>
        )}
      </div>
    </div>
  );
}

function NotifRow({ icon, name, helper, on, locked, last }) {
  const { ink, muted, line, amber } = PR;
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 14,
      padding: '14px 0',
      borderBottom: last ? 'none' : `1px solid ${line}`,
    }}>
      <span style={{
        width: 32, height: 32, borderRadius: 8,
        background: 'rgba(200,122,58,0.10)', color: amber,
        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
      }}>{icon}</span>
      <div style={{ flex: 1, minWidth: 0, paddingRight: 8 }}>
        <div style={{ fontSize: 14.5, fontWeight: 500, color: ink }}>{name}</div>
        <div style={{ fontSize: 12, color: muted, marginTop: 3, lineHeight: 1.4 }}>{helper}</div>
      </div>
      <IOSSwitch on={on} disabled={locked} locked={locked} />
    </div>
  );
}

function PrefNotifications({ changed = false }) {
  const { paper, line } = PR;
  return (
    <PRChrome
      eyebrow="PREFERENCES"
      title="What should we"
      italic="ping you for?"
      helper="We never send promotional spam. Each category opts in independently."
      footer={<PRPrimary label="Save preferences" disabled={!changed} />}
    >
      <div style={{ padding: '22px 22px 0' }}>
        <div style={{
          background: paper, border: `1px solid ${line}`,
          borderRadius: 16, padding: '4px 18px',
        }}>
          <NotifRow
            icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 11H5l3-3"/><path d="M19 13h-4l3 3"/><path d="M9 5v6h10"/><path d="M5 13v6h10"/></svg>}
            name="Saved-list reminders"
            helper="When a list of yours has aged 2+ weeks without a shop"
            on={true}
          />
          <NotifRow
            icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>}
            name="Price drops"
            helper="When something on your saved lists drops in price"
            on={true}
          />
          <NotifRow
            icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.7 13.4a2 2 0 0 0 2 1.6h9.7a2 2 0 0 0 2-1.6L23 6H6"/></svg>}
            name="Session updates"
            helper="Cart-totals nudges and ‘forgot to scan’ pings while you shop"
            on={false}
          />
          <NotifRow
            icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>}
            name="Receipts"
            helper="Always on — you'll always get a copy of your purchase by email and in-app"
            on={true}
            locked
            last
          />
        </div>

        <div style={{
          marginTop: 14, fontSize: 11.5, color: PR.muted, lineHeight: 1.45,
          display: 'flex', alignItems: 'center', gap: 7,
        }}>
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, opacity: 0.55 }}>
            <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
          </svg>
          Locked categories help us meet our service obligations.
        </div>
      </div>
    </PRChrome>
  );
}

// ─────────────────────────────────────────────────────────────
// Chip atoms — reused by Dietary + Allergens
// ─────────────────────────────────────────────────────────────

function DietChip({ label, on }) {
  const { ink, cream, muted, line } = PR;
  return (
    <button style={{
      padding: '8px 13px', borderRadius: 999,
      fontSize: 12.5, fontWeight: 500, fontFamily: 'inherit',
      background: on ? ink : 'transparent',
      color: on ? cream : muted,
      border: on ? 'none' : `1px solid ${line}`,
      display: 'inline-flex', alignItems: 'center', gap: 6,
      cursor: 'pointer',
      transition: 'all .12s',
    }}>
      {on && (
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="20 6 9 17 4 12"/>
        </svg>
      )}
      {label}
    </button>
  );
}

function AllergenChip({ label, on }) {
  const { muted, line, softRed, softRedWash, softRedBorder } = PR;
  return (
    <button style={{
      padding: '8px 13px', borderRadius: 999,
      fontSize: 12.5, fontWeight: 500, fontFamily: 'inherit',
      background: on ? softRedWash : 'transparent',
      color: on ? softRed : muted,
      border: on ? `1px solid ${softRedBorder}` : `1px solid ${line}`,
      display: 'inline-flex', alignItems: 'center', gap: 6,
      cursor: 'pointer',
      transition: 'all .12s',
    }}>
      {on && (
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
          <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
          <line x1="12" y1="9" x2="12" y2="13"/>
          <line x1="12" y1="17" x2="12.01" y2="17"/>
        </svg>
      )}
      {label}
    </button>
  );
}

// ─────────────────────────────────────────────────────────────
// Screen 4 · Dietary
// ─────────────────────────────────────────────────────────────

const DIET_CHIPS = [
  'Halal','No pork','No alcohol','Vegetarian','Vegan','Pescatarian',
  'Gluten-free','Lactose-free','Low sugar','Low sodium','Keto',
  'Sugar-free','Organic only','Locally sourced',
];

function PrefDietary({ active = ['Halal','No pork','No alcohol','Low sugar'], changed = true }) {
  return (
    <PRChrome
      eyebrow="DIET · YOUR RULES"
      title="What do you"
      italic="keep out?"
      helper="We'll mark matching items on Product Detail and the scan card so you don't have to think about it mid-aisle."
      footer={<PRPrimary label="Save preferences" disabled={!changed} />}
    >
      <div style={{ padding: '22px 24px 0' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {DIET_CHIPS.map((c) => (
            <DietChip key={c} label={c} on={active.includes(c)} />
          ))}
        </div>

        <div style={{
          marginTop: 18, fontSize: 11.5, color: PR.muted,
          display: 'flex', alignItems: 'center', gap: 7,
        }}>
          <span style={{
            width: 6, height: 6, borderRadius: 999, background: PR.ink, display: 'inline-block',
          }} />
          {active.length} active · tap to toggle
        </div>
      </div>
    </PRChrome>
  );
}

// ─────────────────────────────────────────────────────────────
// Screen 5 · Allergens
// ─────────────────────────────────────────────────────────────

const ALLERGEN_CHIPS = [
  'Milk','Eggs','Gluten','Wheat','Soy','Fish','Shellfish','Crustaceans',
  'Molluscs','Peanuts','Tree nuts','Sesame','Mustard','Celery','Sulphites','Lupin',
];

function PrefAllergens({ flagged = ['Milk','Shellfish'], changed = true }) {
  return (
    <PRChrome
      eyebrow="DIET · FLAGGED ALLERGENS"
      title="Anything you can't"
      italic="touch?"
      helper="Items containing any of these get a red banner on Product Detail and lock the scan peek until you confirm."
      footer={<PRPrimary label="Save preferences" disabled={!changed} />}
    >
      <div style={{ padding: '22px 24px 0' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {ALLERGEN_CHIPS.map((c) => (
            <AllergenChip key={c} label={c} on={flagged.includes(c)} />
          ))}
        </div>

        <div style={{
          marginTop: 18, fontSize: 11.5, color: PR.muted,
          display: 'flex', alignItems: 'center', gap: 7,
        }}>
          <span style={{
            width: 6, height: 6, borderRadius: 999, background: PR.softRed, display: 'inline-block',
          }} />
          {flagged.length} flagged · tap to toggle
        </div>
      </div>
    </PRChrome>
  );
}

Object.assign(window, {
  PreferencesTabRows,
  PrefStore,
  PrefCurrency,
  PrefNotifications,
  PrefDietary,
  PrefAllergens,
});
