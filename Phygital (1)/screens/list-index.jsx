// Lists index — accessed via bottom navbar's "Lists" tab.
// Shows all saved shopping lists with creation date, item count, last used.
// Tap a list to drill into the editor.

function ListIndex({ userName = 'Adam' }) {
  const D = window.PHY_DATA;

  const ink = '#15140f';
  const cream = '#f4ede0';
  const accent = '#2d5a3d';
  const amber = '#c87a3a';
  const muted = '#7a7163';
  const line = 'rgba(21,20,15,0.10)';
  const paper = '#fffdf8';

  // Augment saved lists with creation dates (for design display)
  const lists = [
    { ...D.savedLists[0], created: 'May 12, 2024', estimate: 64.50 },
    { ...D.savedLists[1], created: 'Apr 28, 2024', estimate: 31.20 },
    { ...D.savedLists[2], created: 'Mar 04, 2024', estimate: 28.75 },
    { id: 'guests', name: 'Guests this Friday', count: 9, lastUsed: 'never used', items: ['chicken','olive-oil','tomato','onion','bread','cheese','salmon','apple','coffee'], created: 'Yesterday', estimate: 52.30 },
  ];

  return (
    <div style={{
      width: '100%', height: '100%',
      background: '#f0eee9',
      fontFamily: 'Geist, system-ui, sans-serif',
      color: ink,
      overflow: 'hidden',
      position: 'relative',
    }}>
      <div style={{
        height: '100%', overflowY: 'auto',
        scrollbarWidth: 'none', paddingBottom: 110, paddingTop: 50,
      }}>
        {/* masthead */}
        <div style={{ padding: '20px 22px 6px' }}>
          <div style={{ fontSize: 11, letterSpacing: 1.6, color: muted, fontWeight: 600 }}>YOUR LISTS</div>
          <div style={{
            fontFamily: '"Instrument Serif", Georgia, serif',
            fontSize: 38, lineHeight: 1.1, letterSpacing: -1.1, marginTop: 6,
          }}>
            What's <span style={{ fontStyle: 'italic' }}>cooking</span>?
          </div>
          <div style={{ fontSize: 13, color: muted, marginTop: 8 }}>
            {lists.length} lists · pick one to take to the store
          </div>
        </div>

        {/* New list CTA */}
        <div style={{ padding: '18px 22px 0' }}>
          <button style={{
            width: '100%', padding: '14px 16px',
            background: ink, color: cream, border: 'none',
            borderRadius: 14, fontFamily: 'inherit',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            cursor: 'pointer',
            boxShadow: '0 8px 18px rgba(20,15,5,0.18)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{
                width: 32, height: 32, borderRadius: 999,
                background: amber, color: ink,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              </span>
              <span style={{ fontSize: 14, fontWeight: 500 }}>Start a new list</span>
            </div>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.6 }}>
              <polyline points="9 18 15 12 9 6"/>
            </svg>
          </button>
        </div>

        {/* Lists */}
        <div style={{ padding: '20px 22px 0', display: 'flex', flexDirection: 'column', gap: 10 }}>
          {lists.map((l, i) => (
            <button key={l.id} style={{
              width: '100%', padding: 16,
              background: paper, border: `1px solid ${line}`,
              borderRadius: 16, fontFamily: 'inherit',
              cursor: 'pointer', textAlign: 'left',
              display: 'flex', alignItems: 'center', gap: 14,
              boxShadow: '0 1px 0 rgba(255,255,255,0.7) inset, 0 4px 10px rgba(20,15,5,0.04)',
            }}>
              {/* preview avatar — emoji stack */}
              <div style={{
                width: 56, height: 56, borderRadius: 12,
                background: 'linear-gradient(135deg, #fdf3e0, #f5e6cc)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 22, position: 'relative',
                boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.6), inset 0 -1px 0 rgba(0,0,0,0.04)',
                flexShrink: 0,
              }}>
                <span style={{ fontSize: 26 }}>
                  {l.items[0] && D.products.find((p) => p.id === l.items[0])?.emoji}
                </span>
                <span style={{
                  position: 'absolute', bottom: -4, right: -4,
                  background: ink, color: cream,
                  fontSize: 10, fontWeight: 700,
                  padding: '2px 6px', borderRadius: 999,
                  border: `2px solid ${paper}`,
                }}>{l.count}</span>
              </div>

              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                  fontFamily: '"Instrument Serif", Georgia, serif',
                  fontSize: 22, lineHeight: 1.15, letterSpacing: -0.4,
                }}>{l.name}</div>
                <div style={{ fontSize: 11.5, color: muted, marginTop: 4, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span>Created {l.created}</span>
                  <span style={{ width: 3, height: 3, borderRadius: 999, background: muted }} />
                  <span style={{ fontStyle: 'italic' }}>{l.lastUsed}</span>
                </div>
                <div style={{ fontSize: 12, color: ink, marginTop: 6, fontWeight: 500 }}>
                  est. ${l.estimate.toFixed(2)}
                </div>
              </div>

              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={muted} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                <polyline points="9 18 15 12 9 6"/>
              </svg>
            </button>
          ))}
        </div>

        <div style={{ fontSize: 11, color: muted, textAlign: 'center', marginTop: 24, fontStyle: 'italic' }}>
          Lists never expire — they wait for you.
        </div>
      </div>

      {/* bottom navbar */}
      <div style={{
        position: 'absolute', bottom: 16, left: 0, right: 0,
        display: 'flex', justifyContent: 'center',
        pointerEvents: 'none',
      }}>
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

      <style>{`::-webkit-scrollbar { display: none; }`}</style>
    </div>
  );
}

window.ListIndex = ListIndex;
