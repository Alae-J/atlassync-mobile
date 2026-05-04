// Home.jsx — Phygital home screen (Tactile system)
// Hero card shifts based on context: default | active-session | list-ready.

function Home({ heroState = 'default', userName = 'Adam' }) {
  const D = window.PHY_DATA;

  const ink = '#15140f';
  const cream = '#f4ede0';
  const accent = '#2d5a3d';
  const amber = '#c87a3a';
  const muted = '#7a7163';
  const line = 'rgba(21,20,15,0.10)';

  const productById = (id) => D.products.find((p) => p.id === id);

  const recentShops = [
    { date: 'Last Saturday', total: 42.18, items: 12 },
    { date: 'Apr 24', total: 28.50, items: 8 },
    { date: 'Apr 17', total: 51.30, items: 15 },
  ];

  const renderHero = () => {
    if (heroState === 'active') {
      return (
        <div style={{
          background: `linear-gradient(135deg, #1f3d2a 0%, ${accent} 100%)`,
          borderRadius: 22, padding: '20px 22px',
          color: cream, position: 'relative', overflow: 'hidden',
          boxShadow: '0 14px 30px rgba(31,61,42,0.32), inset 0 1px 0 rgba(255,255,255,0.12)',
        }}>
          <div style={{ fontSize: 11, letterSpacing: 1.4, opacity: 0.7, fontWeight: 600 }}>SHOPPING NOW</div>
          <div style={{
            fontFamily: '"Instrument Serif", Georgia, serif',
            fontSize: 36, lineHeight: 1.1, letterSpacing: -1, marginTop: 6,
          }}>Aldi · <span style={{ fontStyle: 'italic' }}>Mansoura</span></div>
          <div style={{ fontSize: 12, opacity: 0.65, marginTop: 6 }}>Started 14 minutes ago</div>
          <div style={{ display: 'flex', gap: 16, marginTop: 16 }}>
            <div>
              <div style={{ fontSize: 10, opacity: 0.6, letterSpacing: 1, fontWeight: 600 }}>SCANNED</div>
              <div style={{ fontFamily: '"Instrument Serif", Georgia, serif', fontSize: 24, marginTop: 2 }}>7 items</div>
            </div>
            <div style={{ width: 1, background: 'rgba(255,255,255,0.18)' }} />
            <div>
              <div style={{ fontSize: 10, opacity: 0.6, letterSpacing: 1, fontWeight: 600 }}>RUNNING</div>
              <div style={{ fontFamily: '"Instrument Serif", Georgia, serif', fontSize: 24, marginTop: 2 }}>$23.40</div>
            </div>
          </div>
          <button style={{
            marginTop: 18, width: '100%', height: 46, borderRadius: 12,
            background: cream, color: ink, border: 'none',
            fontSize: 14, fontWeight: 600, fontFamily: 'inherit',
            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            boxShadow: '0 4px 10px rgba(20,15,5,0.18)',
          }}>
            Resume session
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
          </button>
          <div style={{
            position: 'absolute', bottom: -20, right: -20, width: 100, height: 100,
            borderRadius: 999, background: 'rgba(255,255,255,0.06)',
          }} />
        </div>
      );
    }

    if (heroState === 'list-ready') {
      const sl = D.savedLists[0];
      return (
        <div style={{
          background: '#fffaf0',
          borderRadius: 22, padding: '20px 22px',
          color: ink, position: 'relative',
          boxShadow: '0 8px 24px rgba(20,15,5,0.07), 0 0 0 1px rgba(21,20,15,0.05), inset 0 1px 0 rgba(255,255,255,0.7)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <span style={{
              fontSize: 10, letterSpacing: 1.4, fontWeight: 700,
              background: amber, color: ink,
              padding: '3px 8px', borderRadius: 999,
            }}>READY TO GO</span>
          </div>
          <div style={{
            fontFamily: '"Instrument Serif", Georgia, serif',
            fontSize: 30, lineHeight: 1.15, letterSpacing: -0.8, marginTop: 4,
          }}>
            Your <span style={{ fontStyle: 'italic', color: amber }}>{sl.name}</span><br/>
            is loaded.
          </div>
          <div style={{ fontSize: 13, color: muted, marginTop: 10 }}>
            {sl.count} items · est. <strong style={{ color: ink, fontWeight: 600 }}>$58.40</strong>
          </div>
          <div style={{ display: 'flex', gap: 4, marginTop: 12 }}>
            {sl.items.slice(0, 8).map((id) => (
              <span key={id} style={{
                width: 26, height: 26, borderRadius: 7,
                background: cream, fontSize: 14,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>{productById(id)?.emoji}</span>
            ))}
          </div>
          <button style={{
            marginTop: 16, width: '100%', height: 50, borderRadius: 12,
            background: ink, color: cream, border: 'none',
            fontSize: 14.5, fontWeight: 600, fontFamily: 'inherit',
            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
            boxShadow: '0 8px 18px rgba(21,20,15,0.2)',
          }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
            Open entry QR
          </button>
        </div>
      );
    }

    // default
    return (
      <div style={{
        background: ink, color: cream,
        borderRadius: 22, padding: '22px 22px 20px',
        position: 'relative', overflow: 'hidden',
        boxShadow: '0 14px 30px rgba(21,20,15,0.25), inset 0 1px 0 rgba(255,255,255,0.08)',
      }}>
        <div style={{
          position: 'absolute', inset: 0,
          background: 'radial-gradient(80% 60% at 100% 0%, rgba(200,122,58,0.18) 0%, transparent 60%)',
        }} />
        <div style={{ position: 'relative' }}>
          <div style={{ fontSize: 11, letterSpacing: 1.4, fontWeight: 600, opacity: 0.6 }}>QUICK START</div>
          <div style={{
            fontFamily: '"Instrument Serif", Georgia, serif',
            fontSize: 36, lineHeight: 1.1, letterSpacing: -1, marginTop: 8,
          }}>
            Start a<br/>
            <span style={{ fontStyle: 'italic', color: amber }}>shopping session.</span>
          </div>
          <div style={{ fontSize: 12.5, opacity: 0.7, marginTop: 10, lineHeight: 1.4, maxWidth: 220 }}>
            Show your QR at the gate. Skip the line on the way out.
          </div>
          <button style={{
            marginTop: 18, width: '100%', height: 50, borderRadius: 12,
            background: amber, color: ink, border: 'none',
            fontSize: 14.5, fontWeight: 600, fontFamily: 'inherit',
            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
            boxShadow: '0 6px 14px rgba(200,122,58,0.4)',
          }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
            Get my QR
          </button>
        </div>
      </div>
    );
  };

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

      <div style={{ height: 54, flexShrink: 0 }} />

      {/* greeting + store pill */}
      <div style={{ padding: '8px 22px 14px', position: 'relative' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: 11, color: muted, letterSpacing: 1.4, fontWeight: 600 }}>SATURDAY · 4 MAY</div>
            <div style={{
              fontFamily: '"Instrument Serif", Georgia, serif',
              fontSize: 30, lineHeight: 1.15, letterSpacing: -0.8, marginTop: 6,
            }}>
              Hi, <span style={{ fontStyle: 'italic', color: amber }}>{userName}</span>.
            </div>
          </div>
          <button style={{
            width: 40, height: 40, borderRadius: 999,
            background: '#fffaf0', border: `1px solid ${line}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', color: ink, position: 'relative',
            boxShadow: '0 2px 6px rgba(20,15,5,0.05)',
          }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
            <span style={{
              position: 'absolute', top: 8, right: 9,
              width: 7, height: 7, borderRadius: 999, background: amber,
              border: `2px solid #fffaf0`,
            }} />
          </button>
        </div>
        <div style={{
          marginTop: 16,
          display: 'inline-flex', alignItems: 'center', gap: 8,
          background: '#fffaf0', border: `1px solid ${line}`,
          padding: '7px 12px', borderRadius: 999,
          fontSize: 12, color: ink,
          boxShadow: '0 1px 3px rgba(20,15,5,0.04)',
        }}>
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke={accent} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
          <span style={{ color: muted }}>Closest:</span>
          <strong style={{ fontWeight: 500 }}>Aldi · Mansoura</strong>
          <span style={{ color: muted }}>· 1.2 km</span>
        </div>
      </div>

      {/* scrollable content */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '0 22px 140px' }}>
        {renderHero()}

        {/* Lists rail */}
        <div style={{ marginTop: 26 }}>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 12, gap: 12 }}>
            <div style={{
              fontFamily: '"Instrument Serif", Georgia, serif',
              fontSize: 22, letterSpacing: -0.4, lineHeight: 1.2, whiteSpace: 'nowrap', flexShrink: 0,
            }}>Your <span style={{ fontStyle: 'italic' }}>lists</span></div>
            <button style={{
              background: 'transparent', border: 'none', color: muted,
              fontSize: 12, fontWeight: 500, fontFamily: 'inherit',
              cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4,
            }}>See all <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="9 18 15 12 9 6"/></svg></button>
          </div>
          <div style={{
            display: 'flex', gap: 10, overflowX: 'auto',
            margin: '0 -22px', padding: '0 22px 4px',
            scrollSnapType: 'x mandatory',
          }}>
            {D.savedLists.map((sl, i) => (
              <button key={sl.id} style={{
                flexShrink: 0, width: 180, scrollSnapAlign: 'start',
                background: i === 0 ? `linear-gradient(135deg, #fdf3e0, #f5e6cc)` : '#fffaf0',
                border: 'none', borderRadius: 16, padding: 14,
                cursor: 'pointer', textAlign: 'left',
                fontFamily: 'inherit', color: ink,
                boxShadow: '0 4px 12px rgba(20,15,5,0.06), 0 0 0 1px rgba(21,20,15,0.04)',
              }}>
                <div style={{ display: 'flex', gap: 3, marginBottom: 12 }}>
                  {sl.items.slice(0, 4).map((id) => (
                    <span key={id} style={{
                      width: 26, height: 26, borderRadius: 7,
                      background: 'rgba(255,255,255,0.7)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14,
                    }}>{productById(id)?.emoji}</span>
                  ))}
                </div>
                <div style={{
                  fontFamily: '"Instrument Serif", Georgia, serif',
                  fontSize: 18, lineHeight: 1.1, letterSpacing: -0.3,
                  textWrap: 'pretty',
                }}>{sl.name}</div>
                <div style={{ fontSize: 11.5, color: muted, marginTop: 6 }}>
                  {sl.count} items · {sl.lastUsed}
                </div>
              </button>
            ))}
            <button style={{
              flexShrink: 0, width: 130, scrollSnapAlign: 'start',
              background: 'transparent',
              border: `1.5px dashed ${line}`, borderRadius: 16, padding: 14,
              cursor: 'pointer', textAlign: 'left',
              fontFamily: 'inherit', color: muted,
              display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
              minHeight: 124,
            }}>
              <div style={{
                width: 32, height: 32, borderRadius: 999,
                background: '#fffaf0', border: `1px solid ${line}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: ink,
              }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              </div>
              <div style={{ fontSize: 13, fontWeight: 500, color: ink, lineHeight: 1.3 }}>New list</div>
            </button>
          </div>
        </div>

        {/* Recent shops */}
        <div style={{ marginTop: 24 }}>
          <div style={{
            fontFamily: '"Instrument Serif", Georgia, serif',
            fontSize: 22, letterSpacing: -0.4, marginBottom: 12, lineHeight: 1.2, whiteSpace: 'nowrap',
          }}>Recent <span style={{ fontStyle: 'italic' }}>shops</span></div>
          {recentShops.map((rs, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', gap: 12,
              padding: '12px 14px', background: '#fffaf0',
              borderRadius: 12, marginBottom: 8,
              boxShadow: '0 0 0 1px rgba(21,20,15,0.04)',
            }}>
              <div style={{
                width: 36, height: 36, borderRadius: 10,
                background: cream, display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: muted,
              }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13.5, fontWeight: 500 }}>{rs.date}</div>
                <div style={{ fontSize: 11.5, color: muted, marginTop: 2 }}>{rs.items} items</div>
              </div>
              <div style={{
                fontFamily: '"Instrument Serif", Georgia, serif',
                fontSize: 18, letterSpacing: -0.3,
              }}>${rs.total.toFixed(2)}</div>
            </div>
          ))}
        </div>
      </div>

      {/* bottom tab bar — cream pill with amber active capsule */}
      <div style={{
        position: 'absolute', bottom: 16, left: 0, right: 0,
        display: 'flex', justifyContent: 'center',
        pointerEvents: 'none',
      }}>
        <div style={{
          background: '#fffdf8',
          borderRadius: 999,
          padding: 6,
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
            const active = t.k === 'home';
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

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
        ::-webkit-scrollbar { display: none; }
      `}</style>
    </div>
  );
}

window.Home = Home;
