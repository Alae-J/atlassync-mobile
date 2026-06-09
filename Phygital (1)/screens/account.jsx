// Account / Settings screen — editorial scroll layout.
// Sections: profile header → loyalty hero → spending → diet → payments → preferences → trust.

function Account({ userName = 'Adam' }) {
  const ink = '#15140f';
  const cream = '#f4ede0';
  const accent = '#2d5a3d';
  const amber = '#c87a3a';
  const muted = '#7a7163';
  const line = 'rgba(21,20,15,0.10)';
  const paper = '#fffdf8';

  // Mock spending data — last 30 days
  const spent = 248.40;
  const budget = 400;
  const pct = Math.round((spent / budget) * 100);
  const trips = 6;
  const avg = Math.round(spent / trips);

  // Mini bar chart — last 7 weeks
  const weeklySpend = [42, 68, 31, 95, 54, 78, 62];
  const maxSpend = Math.max(...weeklySpend);

  const Section = ({ eyebrow, title, italic, children }) => (
    <div style={{ padding: '32px 22px 8px' }}>
      <div style={{ fontSize: 10, letterSpacing: 1.6, color: muted, fontWeight: 600, marginBottom: 6 }}>
        {eyebrow}
      </div>
      <div style={{
        fontFamily: '"Instrument Serif", Georgia, serif',
        fontSize: 28, letterSpacing: -0.6, lineHeight: 1.1, marginBottom: 18,
      }}>
        {title} {italic && <span style={{ fontStyle: 'italic' }}>{italic}</span>}
      </div>
      {children}
    </div>
  );

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
      }}>
        {icon}
      </span>
      <span style={{ flex: 1, fontSize: 14.5, color: ink }}>{label}</span>
      {value && <span style={{ fontSize: 13, color: muted }}>{value}</span>}
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={muted} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
        <polyline points="9 18 15 12 9 6"/>
      </svg>
    </button>
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
      <div style={{
        height: '100%', overflowY: 'auto',
        scrollbarWidth: 'none', paddingBottom: 110, paddingTop: 50,
      }}>
        {/* Profile masthead */}
        <div style={{ padding: '8px 22px 8px', display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{
            width: 64, height: 64, borderRadius: 999,
            background: `linear-gradient(135deg, ${amber} 0%, #a8542a 100%)`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: '"Instrument Serif", Georgia, serif',
            fontSize: 30, color: cream, letterSpacing: -1,
            boxShadow: '0 6px 14px rgba(200,122,58,0.35)',
          }}>
            {userName[0]}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{
              fontFamily: '"Instrument Serif", Georgia, serif',
              fontSize: 32, lineHeight: 1, letterSpacing: -0.8,
            }}>
              {userName}
            </div>
            <div style={{ fontSize: 12.5, color: muted, marginTop: 4 }}>
              +20 100 ··· 4287 · adam@hey.com
            </div>
          </div>
          <button style={{
            background: 'transparent', border: `1px solid ${line}`,
            borderRadius: 999, padding: '6px 12px',
            fontSize: 12, color: ink, fontFamily: 'inherit', cursor: 'pointer',
          }}>Edit</button>
        </div>

        {/* Loyalty card hero */}
        <div style={{ padding: '24px 22px 0' }}>
          <div style={{
            background: ink, color: cream,
            borderRadius: 18, padding: 22,
            position: 'relative', overflow: 'hidden',
            boxShadow: '0 14px 30px rgba(20,15,5,0.22)',
          }}>
            {/* texture */}
            <div style={{
              position: 'absolute', inset: 0,
              background: `radial-gradient(circle at 88% 18%, rgba(200,122,58,0.22), transparent 50%),
                           radial-gradient(circle at 12% 88%, rgba(45,90,61,0.18), transparent 50%)`,
              pointerEvents: 'none',
            }} />
            <div style={{ position: 'relative', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div style={{ fontSize: 10, letterSpacing: 1.6, opacity: 0.6, fontWeight: 600 }}>PHYGITAL · MEMBER</div>
                <div style={{
                  fontFamily: '"Instrument Serif", Georgia, serif',
                  fontSize: 28, lineHeight: 1.25, letterSpacing: -0.6, marginTop: 8,
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
                  fontSize: 38, lineHeight: 1, letterSpacing: -0.8, marginTop: 4,
                }}>
                  2,840
                </div>
                <div style={{ fontSize: 11, opacity: 0.65, marginTop: 4 }}>
                  160 to <span style={{ fontStyle: 'italic' }}>Platinum</span>
                </div>
              </div>
              {/* barcode */}
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: 1.5, height: 38 }}>
                {[3,5,2,4,3,5,2,3,4,2,5,3,4,2,3,5,2,4,3,4].map((h, i) => (
                  <div key={i} style={{
                    width: i % 3 === 0 ? 2 : 1.5,
                    height: `${50 + h * 8}%`,
                    background: cream, borderRadius: 0.5,
                  }} />
                ))}
              </div>
            </div>

            {/* progress to next tier */}
            <div style={{ position: 'relative', marginTop: 18 }}>
              <div style={{
                height: 4, borderRadius: 999,
                background: 'rgba(244,237,224,0.15)', overflow: 'hidden',
              }}>
                <div style={{
                  width: '94.6%', height: '100%',
                  background: amber, borderRadius: 999,
                }} />
              </div>
            </div>
          </div>
        </div>

        {/* Spending insights */}
        <Section eyebrow="THIS MONTH" title="You've spent" italic="$248.40">
          <div style={{
            background: paper, border: `1px solid ${line}`,
            borderRadius: 16, padding: 18,
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 14 }}>
              <div>
                <div style={{ fontSize: 12, color: muted }}>{trips} trips · avg ${avg}/trip</div>
              </div>
              <div style={{ fontSize: 12, color: muted }}>
                Budget <span style={{ color: ink, fontWeight: 600 }}>${budget}</span>
              </div>
            </div>

            {/* budget bar */}
            <div style={{
              height: 8, borderRadius: 999, background: 'rgba(21,20,15,0.06)',
              overflow: 'hidden', position: 'relative',
            }}>
              <div style={{
                width: `${pct}%`, height: '100%',
                background: pct > 80 ? amber : accent, borderRadius: 999,
              }} />
            </div>
            <div style={{ fontSize: 11, color: muted, marginTop: 6 }}>
              {pct}% of monthly budget · ${budget - spent} left
            </div>

            {/* weekly bars */}
            <div style={{ marginTop: 22, display: 'flex', alignItems: 'flex-end', gap: 6, height: 76 }}>
              {weeklySpend.map((v, i) => (
                <div key={i} style={{ flex: 1, height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end', gap: 6 }}>
                  <div style={{
                    width: '100%', height: `${(v / maxSpend) * 100}%`,
                    minHeight: 4,
                    background: i === weeklySpend.length - 1 ? accent : 'rgba(21,20,15,0.12)',
                    borderRadius: 4,
                  }} />
                  <div style={{ fontSize: 9, color: muted, letterSpacing: 0.4 }}>W{i + 1}</div>
                </div>
              ))}
            </div>
            <div style={{ fontSize: 11, color: muted, marginTop: 10, fontStyle: 'italic' }}>
              Last 7 weeks · trending +12% vs prior period
            </div>
          </div>
        </Section>

        {/* Diet preferences */}
        <Section eyebrow="DIET" title="Tastes &" italic="dislikes">
          <div style={{
            background: paper, border: `1px solid ${line}`,
            borderRadius: 16, padding: 18,
          }}>
            <div style={{ fontSize: 13, color: ink, marginBottom: 12 }}>
              <span style={{ color: muted }}>Influences product order in-store and hides items you'll never buy.</span>
            </div>

            {/* active prefs */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {[
                { label: 'Halal', active: true },
                { label: 'No pork', active: true },
                { label: 'Low sugar', active: true },
                { label: 'Lactose intolerant', active: false },
                { label: 'Vegetarian', active: false },
                { label: 'Vegan', active: false },
                { label: 'Gluten-free', active: false },
                { label: 'Nut allergy', active: false },
                { label: 'No alcohol', active: true },
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

            {/* allergens */}
            <div style={{ marginTop: 18, paddingTop: 14, borderTop: `1px solid ${line}` }}>
              <div style={{ fontSize: 11, letterSpacing: 1.4, color: muted, fontWeight: 600, marginBottom: 8 }}>
                ALLERGENS — ALWAYS HIDE
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                <div style={{
                  padding: '7px 12px', borderRadius: 999,
                  fontSize: 12, fontWeight: 500,
                  background: 'rgba(184,69,55,0.08)', color: '#b84537',
                  border: '1px solid rgba(184,69,55,0.18)',
                }}>
                  ⊘ Shellfish
                </div>
                <button style={{
                  padding: '7px 12px', borderRadius: 999,
                  fontSize: 12, fontWeight: 500,
                  background: 'transparent', color: muted,
                  border: `1px dashed ${line}`, cursor: 'pointer', fontFamily: 'inherit',
                }}>
                  + Add allergen
                </button>
              </div>
            </div>
          </div>
        </Section>

        {/* Payment methods */}
        <Section eyebrow="PAYMENT" title="How you" italic="pay">
          <div style={{
            background: paper, border: `1px solid ${line}`,
            borderRadius: 16, overflow: 'hidden',
          }}>
            {/* Default card */}
            <div style={{
              padding: 16, display: 'flex', alignItems: 'center', gap: 14,
              borderBottom: `1px solid ${line}`,
              background: 'rgba(45,90,61,0.04)',
            }}>
              <div style={{
                width: 44, height: 30, borderRadius: 5,
                background: `linear-gradient(135deg, ${ink} 0%, #2d2820 100%)`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: amber, fontSize: 11, fontWeight: 700, letterSpacing: 0.5,
              }}>
                VISA
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 500 }}>·· ·· 4287</div>
                <div style={{ fontSize: 11, color: muted, marginTop: 2 }}>Default · Expires 09/28</div>
              </div>
              <span style={{
                background: accent, color: cream,
                fontSize: 9, letterSpacing: 1, fontWeight: 700,
                padding: '3px 7px', borderRadius: 4,
              }}>DEFAULT</span>
            </div>

            {/* Vodafone Cash */}
            <div style={{
              padding: 16, display: 'flex', alignItems: 'center', gap: 14,
              borderBottom: `1px solid ${line}`,
            }}>
              <div style={{
                width: 44, height: 30, borderRadius: 5,
                background: '#e60000',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#fff', fontSize: 9, fontWeight: 700, letterSpacing: 0.3,
              }}>
                VF Cash
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 500 }}>+20 ··· 4287</div>
                <div style={{ fontSize: 11, color: muted, marginTop: 2 }}>Vodafone Cash wallet</div>
              </div>
            </div>

            {/* Apple Pay */}
            <div style={{
              padding: 16, display: 'flex', alignItems: 'center', gap: 14,
            }}>
              <div style={{
                width: 44, height: 30, borderRadius: 5,
                background: ink,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: cream, fontSize: 13, fontWeight: 600,
              }}>
                
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 500 }}>Apple Pay</div>
                <div style={{ fontSize: 11, color: muted, marginTop: 2 }}>Connected</div>
              </div>
            </div>

            <button style={{
              width: '100%', padding: '14px 16px',
              background: 'transparent', border: 'none', borderTop: `1px solid ${line}`,
              fontSize: 13, fontWeight: 500, color: amber,
              fontFamily: 'inherit', cursor: 'pointer', textAlign: 'left',
              display: 'flex', alignItems: 'center', gap: 8,
            }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
              Add payment method
            </button>
          </div>
        </Section>

        {/* Preferences */}
        <Section eyebrow="PREFERENCES" title="Set the" italic="defaults">
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
              icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10 21a2 2 0 0 0 4 0"/></svg>}
              label="Notifications"
              value="Deals, lists"
            />
            <Row
              icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M2 12h20"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>}
              label="Language"
              value="English"
            />
            <Row
              icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>}
              label="Currency"
              value="USD ($)"
              last
            />
          </div>
        </Section>

        {/* Trust */}
        <Section eyebrow="TRUST &amp; HELP" title="The" italic="boring stuff">
          <div style={{
            background: paper, border: `1px solid ${line}`,
            borderRadius: 16, padding: '4px 18px',
          }}>
            <Row
              icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>}
              label="Privacy &amp; data"
            />
            <Row
              icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>}
              label="Linked accounts"
              value="2"
            />
            <Row
              icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>}
              label="Help &amp; support"
            />
            <Row
              icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>}
              label="About Phygital"
              value="v1.0.4"
              last
            />
          </div>
        </Section>

        {/* Sign out */}
        <div style={{ padding: '24px 22px 0' }}>
          <button style={{
            width: '100%', padding: '14px 0',
            background: 'transparent', border: `1px solid ${line}`,
            borderRadius: 12, fontSize: 13.5, fontWeight: 500,
            color: '#b84537', fontFamily: 'inherit', cursor: 'pointer',
          }}>
            Sign out
          </button>
          <div style={{ fontSize: 11, color: muted, textAlign: 'center', marginTop: 18, fontStyle: 'italic' }}>
            Phygital · Mansoura · since 2024
          </div>
        </div>
      </div>

      {/* bottom tab bar — mirrors Home, Account active */}
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
            const active = t.k === 'account';
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

window.Account = Account;
