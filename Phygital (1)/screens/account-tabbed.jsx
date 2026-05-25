// Account / Settings — TABBED variant.
// Compact header with avatar, then a horizontal tab strip switches between sub-pages.

function AccountTabbed({ userName = 'Adam', tab = 'profile' }) {
  const ink = '#15140f';
  const cream = '#f4ede0';
  const accent = '#2d5a3d';
  const amber = '#c87a3a';
  const muted = '#7a7163';
  const line = 'rgba(21,20,15,0.10)';
  const paper = '#fffdf8';

  const [activeTab, setActiveTab] = React.useState(tab);
  React.useEffect(() => { setActiveTab(tab); }, [tab]);

  const tabs = [
    { k: 'profile', label: 'Profile' },
    { k: 'payments', label: 'Payments' },
    { k: 'preferences', label: 'Preferences' },
    { k: 'help', label: 'Help' },
  ];

  // shared row
  const Row = ({ icon, label, value, last }) => (
    <button style={{
      width: '100%', display: 'flex', alignItems: 'center', gap: 14,
      padding: '14px 0', background: 'transparent', border: 'none',
      borderBottom: last ? 'none' : `1px solid ${line}`,
      cursor: 'pointer', textAlign: 'left', fontFamily: 'inherit',
    }}>
      <span style={{
        width: 32, height: 32, borderRadius: 8,
        background: 'rgba(200,122,58,0.10)', color: amber,
        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
      }}>{icon}</span>
      <span style={{ flex: 1, fontSize: 14.5, color: ink }}>{label}</span>
      {value && <span style={{ fontSize: 13, color: muted }}>{value}</span>}
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={muted} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="9 18 15 12 9 6"/>
      </svg>
    </button>
  );

  // ─── PROFILE TAB ───
  const ProfileTab = () => (
    <>
      {/* Loyalty card */}
      <div style={{ padding: '6px 22px 0' }}>
        <div style={{
          background: ink, color: cream,
          borderRadius: 18, padding: 22,
          position: 'relative', overflow: 'hidden',
          boxShadow: '0 14px 30px rgba(20,15,5,0.22)',
        }}>
          <div style={{
            position: 'absolute', inset: 0,
            background: `radial-gradient(circle at 88% 18%, rgba(200,122,58,0.22), transparent 50%),
                         radial-gradient(circle at 12% 88%, rgba(45,90,61,0.18), transparent 50%)`,
          }} />
          <div style={{ position: 'relative', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ fontSize: 10, letterSpacing: 1.6, opacity: 0.6, fontWeight: 600 }}>PHYGITAL · MEMBER</div>
              <div style={{
                fontFamily: '"Instrument Serif", Georgia, serif',
                fontSize: 26, lineHeight: 1.25, letterSpacing: -0.6, marginTop: 6,
              }}>
                {userName} <span style={{ fontStyle: 'italic', opacity: 0.85 }}>Tarek</span>
              </div>
            </div>
            <div style={{
              background: 'rgba(244,237,224,0.08)', border: '1px solid rgba(244,237,224,0.15)',
              borderRadius: 8, padding: '4px 10px',
              fontSize: 10, letterSpacing: 1, fontWeight: 600,
            }}>GOLD</div>
          </div>

          <div style={{ position: 'relative', marginTop: 18, display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontSize: 10, letterSpacing: 1.6, opacity: 0.55, fontWeight: 600 }}>POINTS</div>
              <div style={{
                fontFamily: '"Instrument Serif", Georgia, serif',
                fontSize: 36, lineHeight: 1, letterSpacing: -0.8, marginTop: 4,
              }}>2,840</div>
              <div style={{ fontSize: 11, opacity: 0.65, marginTop: 4 }}>
                160 to <span style={{ fontStyle: 'italic' }}>Platinum</span>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 1.5, height: 36 }}>
              {[3,5,2,4,3,5,2,3,4,2,5,3,4,2,3,5,2,4,3,4].map((h, i) => (
                <div key={i} style={{
                  width: i % 3 === 0 ? 2 : 1.5,
                  height: `${50 + h * 8}%`,
                  background: cream,
                }} />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Identity / edit profile */}
      <div style={{ padding: '24px 22px 0' }}>
        <div style={{ fontSize: 10, letterSpacing: 1.6, color: muted, fontWeight: 600, marginBottom: 6 }}>IDENTITY</div>
        <div style={{
          fontFamily: '"Instrument Serif", Georgia, serif',
          fontSize: 26, letterSpacing: -0.6, lineHeight: 1.1, marginBottom: 14,
        }}>Personal <span style={{ fontStyle: 'italic' }}>details</span></div>
        <div style={{ background: paper, border: `1px solid ${line}`, borderRadius: 14, padding: '4px 18px' }}>
          <Row
            icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>}
            label="Full name"
            value={`${userName} Tarek`}
          />
          <Row
            icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>}
            label="Phone number"
            value="+20 100 ··· 4287"
          />
          <Row
            icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>}
            label="Email"
            value="adam@hey.com"
          />
          <Row
            icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2 3 7v6c0 5 3.5 9.5 9 11 5.5-1.5 9-6 9-11V7l-9-5z"/><path d="m9 12 2 2 4-4"/></svg>}
            label="Password"
            value="Change"
          />
          <Row
            icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>}
            label="Profile photo"
            value="Upload"
            last
          />
        </div>
      </div>

      {/* Spending insights — compact */}
      <div style={{ padding: '24px 22px 0' }}>
        <div style={{ fontSize: 10, letterSpacing: 1.6, color: muted, fontWeight: 600, marginBottom: 6 }}>THIS MONTH</div>
        <div style={{
          fontFamily: '"Instrument Serif", Georgia, serif',
          fontSize: 26, letterSpacing: -0.6, lineHeight: 1.1, marginBottom: 14,
        }}>
          Spent <span style={{ fontStyle: 'italic' }}>$248.40</span>
        </div>
        <div style={{
          background: paper, border: `1px solid ${line}`,
          borderRadius: 14, padding: 14,
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: muted, marginBottom: 8 }}>
            <span>6 trips · $41/trip avg</span>
            <span>Budget <span style={{ color: ink, fontWeight: 600 }}>$400</span></span>
          </div>
          <div style={{ height: 8, borderRadius: 999, background: 'rgba(21,20,15,0.06)', overflow: 'hidden' }}>
            <div style={{ width: '62%', height: '100%', background: accent, borderRadius: 999 }} />
          </div>
          <div style={{ fontSize: 11, color: muted, marginTop: 6 }}>62% of budget · $151.60 left</div>
        </div>
      </div>

      {/* Diet preferences chip set */}
      <div style={{ padding: '24px 22px 0' }}>
        <div style={{ fontSize: 10, letterSpacing: 1.6, color: muted, fontWeight: 600, marginBottom: 6 }}>DIET</div>
        <div style={{
          fontFamily: '"Instrument Serif", Georgia, serif',
          fontSize: 26, letterSpacing: -0.6, lineHeight: 1.1, marginBottom: 14,
        }}>Tastes &amp; <span style={{ fontStyle: 'italic' }}>dislikes</span></div>
        <div style={{
          background: paper, border: `1px solid ${line}`,
          borderRadius: 14, padding: 14,
          display: 'flex', flexWrap: 'wrap', gap: 8,
        }}>
          {[
            { label: 'Halal', active: true },
            { label: 'No pork', active: true },
            { label: 'Low sugar', active: true },
            { label: 'No alcohol', active: true },
            { label: 'Vegetarian', active: false },
            { label: 'Gluten-free', active: false },
            { label: '+ Manage', active: false },
          ].map((p) => (
            <div key={p.label} style={{
              padding: '7px 12px', borderRadius: 999,
              fontSize: 12, fontWeight: 500,
              background: p.active ? ink : 'transparent',
              color: p.active ? cream : muted,
              border: p.active ? 'none' : `1px solid ${line}`,
            }}>
              {p.active && <span style={{ marginRight: 6 }}>✓</span>}
              {p.label}
            </div>
          ))}
        </div>
      </div>
      {/* Sign out at bottom of profile */}
      <div style={{ padding: '28px 22px 0' }}>
        <button style={{
          width: '100%', padding: '14px 0',
          background: 'transparent', border: `1px solid ${line}`,
          borderRadius: 12, fontSize: 13.5, fontWeight: 500,
          color: '#b84537', fontFamily: 'inherit', cursor: 'pointer',
        }}>Sign out</button>
      </div>
    </>
  );
  // ─── PAYMENTS TAB ───
  const PaymentsTab = () => (
    <div style={{ padding: '6px 22px 0' }}>
      <div style={{ fontSize: 10, letterSpacing: 1.6, color: muted, fontWeight: 600, marginBottom: 6 }}>PAYMENT METHODS</div>
      <div style={{
        fontFamily: '"Instrument Serif", Georgia, serif',
        fontSize: 26, letterSpacing: -0.6, lineHeight: 1.1, marginBottom: 18,
      }}>How you <span style={{ fontStyle: 'italic' }}>pay</span></div>

      <div style={{ background: paper, border: `1px solid ${line}`, borderRadius: 16, overflow: 'hidden' }}>
        <div style={{ padding: 16, display: 'flex', alignItems: 'center', gap: 14, borderBottom: `1px solid ${line}`, background: 'rgba(45,90,61,0.04)' }}>
          <div style={{ width: 44, height: 30, borderRadius: 5, background: `linear-gradient(135deg, ${ink} 0%, #2d2820 100%)`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: amber, fontSize: 11, fontWeight: 700 }}>VISA</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 14, fontWeight: 500 }}>·· ·· 4287</div>
            <div style={{ fontSize: 11, color: muted, marginTop: 2 }}>Default · Expires 09/28</div>
          </div>
          <span style={{ background: accent, color: cream, fontSize: 9, letterSpacing: 1, fontWeight: 700, padding: '3px 7px', borderRadius: 4 }}>DEFAULT</span>
        </div>
        <div style={{ padding: 16, display: 'flex', alignItems: 'center', gap: 14, borderBottom: `1px solid ${line}` }}>
          <div style={{ width: 44, height: 30, borderRadius: 5, background: '#e60000', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 9, fontWeight: 700 }}>VF Cash</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 14, fontWeight: 500 }}>+20 ··· 4287</div>
            <div style={{ fontSize: 11, color: muted, marginTop: 2 }}>Vodafone Cash wallet</div>
          </div>
        </div>
        <div style={{ padding: 16, display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ width: 44, height: 30, borderRadius: 5, background: ink, display: 'flex', alignItems: 'center', justifyContent: 'center', color: cream, fontSize: 13, fontWeight: 600 }}></div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 14, fontWeight: 500 }}>Apple Pay</div>
            <div style={{ fontSize: 11, color: muted, marginTop: 2 }}>Connected</div>
          </div>
        </div>
        <button style={{
          width: '100%', padding: '14px 16px',
          background: 'transparent', border: 'none', borderTop: `1px solid ${line}`,
          fontSize: 13, fontWeight: 500, color: amber, fontFamily: 'inherit', cursor: 'pointer',
          textAlign: 'left', display: 'flex', alignItems: 'center', gap: 8,
        }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Add payment method
        </button>
      </div>

      <div style={{ marginTop: 22, fontSize: 10, letterSpacing: 1.6, color: muted, fontWeight: 600, marginBottom: 6 }}>BILLING</div>
      <div style={{ background: paper, border: `1px solid ${line}`, borderRadius: 14, padding: '4px 18px' }}>
        <Row icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 7h18v10H3z"/><path d="M3 11h18"/></svg>} label="Receipts archive" value="42" />
        <Row icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>} label="Export statements" last />
      </div>
    </div>
  );

  // ─── PREFERENCES TAB ───
  const PreferencesTab = () => (
    <div style={{ padding: '6px 22px 0' }}>
      <div style={{ fontSize: 10, letterSpacing: 1.6, color: muted, fontWeight: 600, marginBottom: 6 }}>PREFERENCES</div>
      <div style={{
        fontFamily: '"Instrument Serif", Georgia, serif',
        fontSize: 26, letterSpacing: -0.6, lineHeight: 1.1, marginBottom: 18,
      }}>Set the <span style={{ fontStyle: 'italic' }}>defaults</span></div>

      <div style={{ background: paper, border: `1px solid ${line}`, borderRadius: 14, padding: '4px 18px' }}>
        <Row icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>} label="Default store" value="Aldi · Mansoura" />
        <Row icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10 21a2 2 0 0 0 4 0"/></svg>} label="Notifications" value="Deals, lists" />
        <Row icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M2 12h20"/></svg>} label="Language" value="English" />
        <Row icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>} label="Currency" value="USD ($)" last />
      </div>

      <div style={{ marginTop: 22, fontSize: 10, letterSpacing: 1.6, color: muted, fontWeight: 600, marginBottom: 6 }}>DIET</div>
      <div style={{ background: paper, border: `1px solid ${line}`, borderRadius: 14, padding: '4px 18px' }}>
        <Row icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="m4.93 4.93 14.14 14.14"/></svg>} label="Dietary restrictions" value="4 active" />
        <Row icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>} label="Allergens" value="1" last />
      </div>
    </div>
  );

  // ─── HELP TAB ───
  const HelpTab = () => (
    <div style={{ padding: '6px 22px 0' }}>
      <div style={{ fontSize: 10, letterSpacing: 1.6, color: muted, fontWeight: 600, marginBottom: 6 }}>HELP &amp; TRUST</div>
      <div style={{
        fontFamily: '"Instrument Serif", Georgia, serif',
        fontSize: 26, letterSpacing: -0.6, lineHeight: 1.1, marginBottom: 18,
      }}>The <span style={{ fontStyle: 'italic' }}>boring stuff</span></div>

      <div style={{ background: paper, border: `1px solid ${line}`, borderRadius: 14, padding: '4px 18px' }}>
        <Row icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>} label="Privacy &amp; data" />
        <Row icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>} label="Linked accounts" value="2" />
        <Row icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>} label="Help &amp; support" />
        <Row icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>} label="About Phygital" value="v1.0.4" last />
      </div>

      <div style={{ marginTop: 22 }}>
        <button style={{
          width: '100%', padding: '14px 0',
          background: 'transparent', border: `1px solid ${line}`,
          borderRadius: 12, fontSize: 13.5, fontWeight: 500,
          color: muted, fontFamily: 'inherit', cursor: 'pointer',
        }}>Contact support</button>
      </div>
    </div>
  );

  return (
    <div style={{
      width: '100%', height: '100%',
      background: '#f0eee9',
      fontFamily: 'Geist, system-ui, sans-serif',
      color: ink,
      overflow: 'hidden',
      position: 'relative',
    }}>
      {/* fixed header (avatar + tabs) */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, zIndex: 5,
        background: '#f0eee9',
        paddingTop: 50,
      }}>
        {/* avatar row */}
        <div style={{ padding: '12px 22px 16px', display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{
            width: 48, height: 48, borderRadius: 999,
            background: `linear-gradient(135deg, ${amber} 0%, #a8542a 100%)`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: '"Instrument Serif", Georgia, serif',
            fontSize: 24, color: cream, letterSpacing: -1,
            boxShadow: '0 4px 10px rgba(200,122,58,0.3)',
          }}>{userName[0]}</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{
              fontFamily: '"Instrument Serif", Georgia, serif',
              fontSize: 24, lineHeight: 1, letterSpacing: -0.6,
            }}>{userName} <span style={{ fontStyle: 'italic' }}>Tarek</span></div>
            <div style={{ fontSize: 11.5, color: muted, marginTop: 3 }}>+20 100 ··· 4287</div>
          </div>
        </div>

        {/* tabs strip */}
        <div style={{
          padding: '0 22px',
          display: 'flex', gap: 4, overflowX: 'auto',
          scrollbarWidth: 'none',
          borderBottom: `1px solid ${line}`,
        }}>
          {tabs.map((t) => {
            const active = t.k === activeTab;
            return (
              <button key={t.k} onClick={() => setActiveTab(t.k)} style={{
                padding: '12px 14px',
                background: 'transparent', border: 'none',
                fontSize: 13.5, fontWeight: active ? 600 : 500,
                color: active ? amber : muted,
                fontFamily: 'inherit', cursor: 'pointer',
                position: 'relative', flexShrink: 0,
              }}>
                {t.label}
                {active && (
                  <div style={{
                    position: 'absolute', bottom: -1, left: 14, right: 14,
                    height: 2, background: amber, borderRadius: 2,
                  }} />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* content */}
      <div style={{
        height: '100%', overflowY: 'auto',
        scrollbarWidth: 'none', paddingTop: 180, paddingBottom: 110,
      }}>
        {activeTab === 'profile' && <ProfileTab />}
        {activeTab === 'payments' && <PaymentsTab />}
        {activeTab === 'preferences' && <PreferencesTab />}
        {activeTab === 'help' && <HelpTab />}
      </div>

      {/* bottom tab bar */}
      <div style={{
        position: 'absolute', bottom: 16, left: 0, right: 0,
        display: 'flex', justifyContent: 'center', pointerEvents: 'none',
      }}>
        <div style={{
          background: '#fffdf8', borderRadius: 999, padding: 6,
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
            const active = t.k === 'account';
            return (
              <button key={t.k} style={{
                height: 44,
                padding: active ? '0 16px 0 12px' : '0 12px',
                border: 'none',
                background: active ? 'rgba(200,122,58,0.14)' : 'transparent',
                color: active ? amber : muted,
                borderRadius: 999, fontSize: 13, fontWeight: 600, fontFamily: 'inherit',
                cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8,
                letterSpacing: -0.1, transition: 'all 0.2s ease',
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

window.AccountTabbed = AccountTabbed;
