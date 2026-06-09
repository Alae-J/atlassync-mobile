// Register.jsx — Tactile design matching LoginUnified
// Fields: Name, Email, Phone (optional), Password, Confirm

function Register() {
  const [name, setName] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [phone, setPhone] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [confirm, setConfirm] = React.useState('');
  const [showPw, setShowPw] = React.useState(false);
  const [focused, setFocused] = React.useState(null);
  const [loading, setLoading] = React.useState(false);
  const [step, setStep] = React.useState('input'); // 'input' | 'success'

  const ink = '#15140f';
  const cream = '#f4ede0';
  const accent = '#2d5a3d';
  const amber = '#c87a3a';
  const muted = '#7a7163';
  const line = 'rgba(21,20,15,0.12)';

  const formatPhone = (raw) => {
    const d = raw.replace(/\D/g, '').slice(0, 10);
    if (d.length < 4) return d;
    if (d.length < 7) return `${d.slice(0, 3)} ${d.slice(3)}`;
    return `${d.slice(0, 3)} ${d.slice(3, 6)} ${d.slice(6)}`;
  };

  const nameValid = name.trim().length >= 2;
  const emailValid = email.includes('@') && email.includes('.');
  const pwValid = password.length >= 8;
  const matchValid = password.length > 0 && password === confirm;
  const phoneValid = phone === '' || phone.replace(/\D/g, '').length >= 8;
  const canSubmit = nameValid && emailValid && pwValid && matchValid && phoneValid;

  // password strength: 0-3
  const pwStrength = (() => {
    if (password.length === 0) return 0;
    let s = 0;
    if (password.length >= 8) s++;
    if (/[A-Z]/.test(password) && /[a-z]/.test(password)) s++;
    if (/\d/.test(password) || /[^A-Za-z0-9]/.test(password)) s++;
    return s;
  })();
  const strengthLabel = ['', 'Weak', 'Fair', 'Strong'][pwStrength];
  const strengthColor = ['', '#c87a3a', '#a8893d', accent][pwStrength];

  const handleSubmit = () => {
    if (!canSubmit || loading) return;
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setStep('success');
    }, 800);
  };

  return (
    <div style={{
      width: '100%', height: '100%',
      background: cream,
      fontFamily: '"Geist", -apple-system, BlinkMacSystemFont, system-ui, sans-serif',
      color: ink,
      display: 'flex', flexDirection: 'column',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* warm grain */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'radial-gradient(120% 80% at 50% 0%, rgba(200,122,58,0.10) 0%, transparent 50%), radial-gradient(80% 60% at 100% 100%, rgba(45,90,61,0.08) 0%, transparent 60%)',
        pointerEvents: 'none',
      }} />

      <div style={{ height: 54, flexShrink: 0 }} />

      {/* top row */}
      <div style={{ padding: '14px 24px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative' }}>
        <button style={{
          background: 'rgba(21,20,15,0.06)', border: 'none', borderRadius: 999,
          width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', color: ink,
        }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
        </button>
        <div style={{
          fontSize: 11, color: muted, letterSpacing: 1.5, fontWeight: 600,
          display: 'flex', alignItems: 'center', gap: 6,
        }}>
          <span style={{ width: 6, height: 6, borderRadius: 999, background: accent, display: 'inline-block' }} />
          PHYGITAL
        </div>
        <div style={{ width: 36 }} />
      </div>

      {/* hero — same scale + treatment as login */}
      <div style={{ padding: '28px 28px 0', position: 'relative' }}>
        <div style={{
          fontFamily: '"Instrument Serif", Georgia, serif',
          fontSize: 56, lineHeight: 0.92, letterSpacing: -2,
          fontWeight: 400, color: ink, maxWidth: 300,
        }}>
          Make<br/>
          yourself <span style={{ fontStyle: 'italic', color: amber }}>at home.</span>
        </div>
      </div>

      {/* loyalty card peek — same as login */}
      {step === 'input' && (
        <div style={{
          position: 'absolute', top: 300, right: -36,
          width: 170, height: 104, borderRadius: 14,
          background: 'linear-gradient(135deg, #1f3d2a 0%, #2d5a3d 100%)',
          color: cream,
          padding: 14, boxSizing: 'border-box',
          transform: 'rotate(8deg)',
          boxShadow: '0 18px 30px rgba(20,30,15,0.22), 0 4px 8px rgba(20,30,15,0.12), inset 0 1px 0 rgba(255,255,255,0.18)',
          display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
          fontSize: 9, overflow: 'hidden',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div style={{ fontFamily: '"Instrument Serif", Georgia, serif', fontSize: 18, fontStyle: 'italic' }}>P</div>
            <div style={{ fontSize: 8, opacity: 0.7, letterSpacing: 1 }}>NEW MEMBER</div>
          </div>
          <div style={{
            width: 28, height: 22, borderRadius: 4,
            background: 'linear-gradient(135deg, #d4b075, #a88550)',
            boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.2), 0 1px 2px rgba(0,0,0,0.2)',
          }} />
          <div style={{ fontSize: 10, letterSpacing: 1.5, opacity: 0.85 }}>•••• ••••</div>
          <div style={{
            position: 'absolute', inset: 0,
            background: 'linear-gradient(110deg, transparent 30%, rgba(255,255,255,0.18) 50%, transparent 70%)',
            pointerEvents: 'none',
          }} />
        </div>
      )}

      {/* form sheet */}
      <div style={{
        marginTop: 'auto',
        padding: '18px 24px 28px',
        background: 'rgba(255,253,248,0.7)',
        backdropFilter: 'blur(12px)',
        borderTop: `1px solid ${line}`,
        borderTopLeftRadius: 28,
        borderTopRightRadius: 28,
        boxShadow: '0 -10px 30px rgba(20,15,5,0.04)',
        position: 'relative',
        zIndex: 2,
      }}>
        {step === 'input' && (
          <>
            {/* Name */}
            <div style={{
              background: '#fff',
              border: `1px solid ${focused === 'name' ? ink : line}`,
              borderRadius: 14, height: 50,
              marginBottom: 8,
              boxShadow: '0 1px 0 rgba(255,255,255,0.8) inset, 0 2px 6px rgba(20,15,5,0.04)',
              display: 'flex', alignItems: 'center',
              transition: 'border-color .15s',
            }}>
              <input
                type="text" placeholder="Full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onFocus={() => setFocused('name')} onBlur={() => setFocused(null)}
                style={{
                  flex: 1, border: 'none', background: 'transparent',
                  height: '100%', padding: '0 16px',
                  fontSize: 15, fontFamily: 'inherit', color: ink, outline: 'none',
                }}
              />
            </div>

            {/* Email */}
            <div style={{
              background: '#fff',
              border: `1px solid ${focused === 'email' ? ink : line}`,
              borderRadius: 14, height: 50,
              marginBottom: 8,
              boxShadow: '0 1px 0 rgba(255,255,255,0.8) inset, 0 2px 6px rgba(20,15,5,0.04)',
              display: 'flex', alignItems: 'center',
              transition: 'border-color .15s',
            }}>
              <input
                type="email" placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onFocus={() => setFocused('email')} onBlur={() => setFocused(null)}
                style={{
                  flex: 1, border: 'none', background: 'transparent',
                  height: '100%', padding: '0 16px',
                  fontSize: 15, fontFamily: 'inherit', color: ink, outline: 'none',
                }}
              />
            </div>

            {/* Phone (optional) */}
            <div style={{
              display: 'flex', alignItems: 'center',
              background: '#fff',
              border: `1px solid ${focused === 'phone' ? ink : line}`,
              borderRadius: 14, height: 50, marginBottom: 8,
              boxShadow: '0 1px 0 rgba(255,255,255,0.8) inset, 0 2px 6px rgba(20,15,5,0.04)',
              overflow: 'hidden',
              transition: 'border-color .15s',
            }}>
              <div style={{
                display: 'flex', alignItems: 'center', gap: 4,
                padding: '0 12px', height: '100%',
                borderRight: `1px solid ${line}`,
                fontSize: 14, fontWeight: 500,
              }}>
                🇺🇸 +1
              </div>
              <input
                type="tel" placeholder="Phone (optional)"
                value={formatPhone(phone)}
                onChange={(e) => setPhone(e.target.value)}
                onFocus={() => setFocused('phone')} onBlur={() => setFocused(null)}
                style={{
                  flex: 1, border: 'none', background: 'transparent',
                  height: '100%', padding: '0 14px',
                  fontSize: 15, fontFamily: 'inherit', color: ink, outline: 'none',
                  letterSpacing: 0.3,
                }}
              />
            </div>

            {/* Password */}
            <div style={{
              background: '#fff',
              border: `1px solid ${focused === 'pw' ? ink : line}`,
              borderRadius: 14, height: 50,
              marginBottom: 8,
              boxShadow: '0 1px 0 rgba(255,255,255,0.8) inset, 0 2px 6px rgba(20,15,5,0.04)',
              display: 'flex', alignItems: 'center',
              transition: 'border-color .15s',
            }}>
              <input
                type={showPw ? 'text' : 'password'} placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onFocus={() => setFocused('pw')} onBlur={() => setFocused(null)}
                style={{
                  flex: 1, border: 'none', background: 'transparent',
                  height: '100%', padding: '0 16px',
                  fontSize: 15, fontFamily: 'inherit', color: ink, outline: 'none',
                }}
              />
              {pwStrength > 0 && (
                <div style={{
                  fontSize: 10.5, fontWeight: 600, letterSpacing: 0.6,
                  color: strengthColor, paddingRight: 10,
                }}>{strengthLabel.toUpperCase()}</div>
              )}
              <button onClick={() => setShowPw(!showPw)} style={{
                background: 'none', border: 'none', cursor: 'pointer',
                padding: '0 16px', height: '100%', color: muted,
                display: 'flex', alignItems: 'center',
              }}>
                {showPw
                  ? <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                  : <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>}
              </button>
            </div>

            {/* Confirm */}
            <div style={{
              background: '#fff',
              border: `1px solid ${focused === 'confirm' ? ink : (confirm.length > 0 && !matchValid ? '#c87a3a' : line)}`,
              borderRadius: 14, height: 50,
              boxShadow: '0 1px 0 rgba(255,255,255,0.8) inset, 0 2px 6px rgba(20,15,5,0.04)',
              display: 'flex', alignItems: 'center',
              transition: 'border-color .15s',
            }}>
              <input
                type={showPw ? 'text' : 'password'} placeholder="Confirm password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                onFocus={() => setFocused('confirm')} onBlur={() => setFocused(null)}
                style={{
                  flex: 1, border: 'none', background: 'transparent',
                  height: '100%', padding: '0 16px',
                  fontSize: 15, fontFamily: 'inherit', color: ink, outline: 'none',
                }}
              />
              {matchValid && (
                <div style={{
                  paddingRight: 14, color: accent, display: 'flex', alignItems: 'center',
                }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                </div>
              )}
            </div>

            <button
              onClick={handleSubmit}
              disabled={!canSubmit || loading}
              style={{
                marginTop: 14, width: '100%', height: 52, borderRadius: 14,
                background: canSubmit ? ink : '#d8d2c5',
                color: cream, border: 'none',
                fontSize: 15, fontWeight: 500, fontFamily: 'inherit',
                cursor: canSubmit ? 'pointer' : 'default',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                boxShadow: canSubmit ? '0 8px 20px rgba(21,20,15,0.18), inset 0 1px 0 rgba(255,255,255,0.1)' : 'none',
                transition: 'background .15s, transform .08s',
              }}
            >
              {loading
                ? <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="9" strokeOpacity="0.25"/><path d="M21 12a9 9 0 0 0-9-9" style={{ transformOrigin: 'center', animation: 'spin 0.8s linear infinite' }}/></svg>
                : (
                  <>
                    Create account
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
                  </>
                )}
            </button>

            <div style={{
              display: 'flex', alignItems: 'center', gap: 10, marginTop: 12,
              fontSize: 11, color: muted, lineHeight: 1.45,
            }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
              <span>By creating an account you agree to our <span style={{ color: ink, textDecoration: 'underline', textUnderlineOffset: 2 }}>Terms</span> & <span style={{ color: ink, textDecoration: 'underline', textUnderlineOffset: 2 }}>Privacy</span>.</span>
            </div>

            <div style={{
              marginTop: 14, paddingTop: 12, borderTop: `1px dashed ${line}`,
              textAlign: 'center', fontSize: 13, color: muted,
            }}>
              Already a member? <span style={{ color: ink, fontWeight: 500 }}>Sign in →</span>
            </div>
          </>
        )}

        {step === 'success' && (
          <div style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            padding: '20px 0',
          }}>
            <div style={{
              width: 64, height: 64, borderRadius: 999,
              background: accent, color: cream,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 10px 24px rgba(45,90,61,0.35), inset 0 1px 0 rgba(255,255,255,0.2)',
              animation: 'pop 0.4s cubic-bezier(.2,.9,.3,1.4)',
            }}>
              <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
            </div>
            <div style={{
              marginTop: 16,
              fontFamily: '"Instrument Serif", Georgia, serif',
              fontSize: 28, letterSpacing: -0.5,
            }}>You're <span style={{ fontStyle: 'italic', color: amber }}>in</span>.</div>
            <div style={{ fontSize: 13, color: muted, marginTop: 4 }}>Setting up your account…</div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes pop {
          0% { transform: scale(0.5); opacity: 0; }
          100% { transform: scale(1); opacity: 1; }
        }
        input::placeholder { color: ${muted}; }
      `}</style>
    </div>
  );
}

window.Register = Register;
