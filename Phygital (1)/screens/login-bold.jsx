// LoginBold.jsx — Option B: Tactile/Bold phone-first login with OTP
// Big editorial wordmark, peeking skeuomorphic loyalty card,
// phone-number entry, then 6-digit OTP with auto-advance.

function LoginBold({ time = '9:41' }) {
  const [step, setStep] = React.useState('phone'); // phone | otp | success
  const [phone, setPhone] = React.useState('');
  const [otp, setOtp] = React.useState(['', '', '', '', '', '']);
  const [loading, setLoading] = React.useState(false);
  const otpRefs = React.useRef([]);
  const phoneRef = React.useRef(null);

  // colors — warmer, deeper
  const ink = '#15140f';
  const cream = '#f4ede0';
  const accent = '#2d5a3d'; // deep produce green
  const amber = '#c87a3a'; // tactile warm
  const muted = '#7a7163';
  const line = 'rgba(21,20,15,0.12)';

  const phoneValid = phone.replace(/\D/g, '').length >= 8;
  const otpComplete = otp.every((d) => d !== '');

  const formatPhone = (raw) => {
    const d = raw.replace(/\D/g, '').slice(0, 10);
    if (d.length < 4) return d;
    if (d.length < 7) return `${d.slice(0, 3)} ${d.slice(3)}`;
    return `${d.slice(0, 3)} ${d.slice(3, 6)} ${d.slice(6)}`;
  };

  const sendOtp = () => {
    if (!phoneValid || loading) return;
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setStep('otp');
      setTimeout(() => otpRefs.current[0]?.focus(), 100);
    }, 700);
  };

  const handleOtpChange = (i, val) => {
    const d = val.replace(/\D/g, '').slice(-1);
    const next = [...otp];
    next[i] = d;
    setOtp(next);
    if (d && i < 5) otpRefs.current[i + 1]?.focus();
    if (next.every((x) => x !== '') && i === 5) {
      setLoading(true);
      setTimeout(() => {
        setLoading(false);
        setStep('success');
      }, 800);
    }
  };

  const handleOtpKey = (i, e) => {
    if (e.key === 'Backspace' && !otp[i] && i > 0) {
      otpRefs.current[i - 1]?.focus();
    }
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

      {/* status bar spacer */}
      <div style={{ height: 54, flexShrink: 0 }} />

      {/* top row */}
      <div style={{ padding: '14px 24px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative' }}>
        {step === 'otp' ? (
          <button onClick={() => { setStep('phone'); setOtp(['', '', '', '', '', '']); }}
            style={{
              background: 'rgba(21,20,15,0.06)', border: 'none', borderRadius: 999,
              width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', color: ink,
            }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
          </button>
        ) : <div style={{ width: 36 }} />}
        <div style={{
          fontSize: 11, color: muted, letterSpacing: 1.5, fontWeight: 600,
          display: 'flex', alignItems: 'center', gap: 6,
        }}>
          <span style={{ width: 6, height: 6, borderRadius: 999, background: accent, display: 'inline-block' }} />
          PHYGITAL
        </div>
        <div style={{ width: 36 }} />
      </div>

      {/* hero — wordmark */}
      <div style={{ padding: '36px 28px 0', position: 'relative' }}>
        <div style={{
          fontFamily: '"Instrument Serif", Georgia, serif',
          fontSize: 68, lineHeight: 0.92, letterSpacing: -2.4,
          fontWeight: 400, color: ink,
          maxWidth: 280,
        }}>
          Shop<br/>
          <span style={{ fontStyle: 'italic', color: amber }}>without</span><br/>
          waiting.
        </div>
      </div>

      {/* skeuomorphic loyalty card peek */}
      {step === 'phone' && (
        <div style={{
          position: 'absolute', top: 360, right: -36,
          width: 170, height: 104, borderRadius: 14,
          background: 'linear-gradient(135deg, #1f3d2a 0%, #2d5a3d 100%)',
          color: cream,
          padding: 14, boxSizing: 'border-box',
          transform: 'rotate(8deg)',
          boxShadow: '0 18px 30px rgba(20,30,15,0.22), 0 4px 8px rgba(20,30,15,0.12), inset 0 1px 0 rgba(255,255,255,0.18)',
          display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
          fontSize: 9,
          overflow: 'hidden',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div style={{ fontFamily: '"Instrument Serif", Georgia, serif', fontSize: 18, fontStyle: 'italic' }}>P</div>
            <div style={{ fontSize: 8, opacity: 0.7, letterSpacing: 1 }}>MEMBER</div>
          </div>
          {/* embossed chip */}
          <div style={{
            width: 28, height: 22, borderRadius: 4,
            background: 'linear-gradient(135deg, #d4b075, #a88550)',
            boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.2), 0 1px 2px rgba(0,0,0,0.2)',
          }} />
          <div style={{ fontSize: 10, letterSpacing: 1.5, opacity: 0.85 }}>•••• 4892</div>
          {/* shine */}
          <div style={{
            position: 'absolute', inset: 0,
            background: 'linear-gradient(110deg, transparent 30%, rgba(255,255,255,0.18) 50%, transparent 70%)',
            pointerEvents: 'none',
          }} />
        </div>
      )}

      {/* form area */}
      <div style={{
        marginTop: 'auto',
        padding: '28px 24px 36px',
        background: 'rgba(255,253,248,0.7)',
        backdropFilter: 'blur(12px)',
        borderTop: `1px solid ${line}`,
        borderTopLeftRadius: 28,
        borderTopRightRadius: 28,
        boxShadow: '0 -10px 30px rgba(20,15,5,0.04)',
        position: 'relative',
        zIndex: 2,
      }}>
        {step === 'phone' && (
          <>
            <div style={{ fontSize: 13, color: muted, marginBottom: 14, lineHeight: 1.5 }}>
              Enter your number. We'll send a 6-digit code.
            </div>
            <div style={{
              display: 'flex', alignItems: 'center',
              background: '#fff',
              border: `1px solid ${line}`,
              borderRadius: 14, height: 58,
              boxShadow: '0 1px 0 rgba(255,255,255,0.8) inset, 0 2px 6px rgba(20,15,5,0.04)',
              overflow: 'hidden',
            }}>
              <div style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '0 14px', height: '100%',
                borderRight: `1px solid ${line}`,
                fontSize: 16, fontWeight: 500,
              }}>
                🇺🇸 +1
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginLeft: 2, opacity: 0.4 }}><polyline points="6 9 12 15 18 9"/></svg>
              </div>
              <input
                ref={phoneRef}
                type="tel"
                placeholder="555 123 4567"
                value={formatPhone(phone)}
                onChange={(e) => setPhone(e.target.value)}
                style={{
                  flex: 1, border: 'none', background: 'transparent',
                  height: '100%', padding: '0 14px',
                  fontSize: 17, fontFamily: 'inherit', color: ink,
                  outline: 'none', letterSpacing: 0.3,
                }}
              />
            </div>

            <button
              onClick={sendOtp}
              disabled={!phoneValid || loading}
              style={{
                marginTop: 14, width: '100%', height: 58, borderRadius: 14,
                background: phoneValid ? ink : '#d8d2c5',
                color: cream, border: 'none',
                fontSize: 16, fontWeight: 500, fontFamily: 'inherit',
                cursor: phoneValid ? 'pointer' : 'default',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                gap: 10,
                boxShadow: phoneValid ? '0 8px 20px rgba(21,20,15,0.18), inset 0 1px 0 rgba(255,255,255,0.1)' : 'none',
                transition: 'background .15s, transform .08s',
              }}
              onMouseDown={(e) => phoneValid && (e.currentTarget.style.transform = 'scale(0.985)')}
              onMouseUp={(e) => (e.currentTarget.style.transform = '')}
              onMouseLeave={(e) => (e.currentTarget.style.transform = '')}
            >
              {loading
                ? <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="9" strokeOpacity="0.25"/><path d="M21 12a9 9 0 0 0-9-9" style={{ transformOrigin: 'center', animation: 'spin 0.8s linear infinite' }}/></svg>
                : <>Send code <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg></>}
            </button>

            <div style={{
              display: 'flex', alignItems: 'center', gap: 10, marginTop: 18,
              fontSize: 12, color: muted,
            }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
              Encrypted end-to-end. We never sell your data.
            </div>

            <div style={{
              marginTop: 22, paddingTop: 18, borderTop: `1px dashed ${line}`,
              textAlign: 'center', fontSize: 13, color: muted,
            }}>
              First time here? <span style={{ color: ink, fontWeight: 500 }}>Create an account →</span>
            </div>
          </>
        )}

        {step === 'otp' && (
          <>
            <div style={{ fontSize: 18, fontWeight: 500, marginBottom: 4 }}>Check your messages</div>
            <div style={{ fontSize: 13, color: muted, marginBottom: 22, lineHeight: 1.5 }}>
              Code sent to <strong style={{ color: ink, fontWeight: 500 }}>+1 {formatPhone(phone)}</strong>
            </div>
            <div style={{ display: 'flex', gap: 8, marginBottom: 18 }}>
              {otp.map((d, i) => (
                <input
                  key={i}
                  ref={(el) => (otpRefs.current[i] = el)}
                  inputMode="numeric"
                  maxLength={1}
                  value={d}
                  onChange={(e) => handleOtpChange(i, e.target.value)}
                  onKeyDown={(e) => handleOtpKey(i, e)}
                  style={{
                    flex: 1, height: 58, textAlign: 'center',
                    fontSize: 24, fontWeight: 500, fontFamily: '"Instrument Serif", Georgia, serif',
                    background: '#fff',
                    border: `1.5px solid ${d ? ink : line}`,
                    borderRadius: 12,
                    outline: 'none',
                    color: ink,
                    transition: 'border-color .15s, transform .1s',
                    boxShadow: '0 1px 0 rgba(255,255,255,0.8) inset, 0 2px 4px rgba(20,15,5,0.03)',
                  }}
                />
              ))}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 13 }}>
              <span style={{ color: muted }}>Didn't get it?</span>
              <button style={{
                background: 'none', border: 'none', color: ink, fontWeight: 500,
                fontFamily: 'inherit', cursor: 'pointer', padding: 0,
                textDecoration: 'underline', textUnderlineOffset: 3,
              }}>Resend in 28s</button>
            </div>
            {loading && (
              <div style={{
                marginTop: 22, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                fontSize: 13, color: muted,
              }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="9" strokeOpacity="0.25"/><path d="M21 12a9 9 0 0 0-9-9" style={{ transformOrigin: 'center', animation: 'spin 0.8s linear infinite' }}/></svg>
                Verifying…
              </div>
            )}
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
            }}>Welcome <span style={{ fontStyle: 'italic', color: amber }}>in</span>.</div>
            <div style={{ fontSize: 13, color: muted, marginTop: 4 }}>Loading your shopping session…</div>
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

window.LoginBold = LoginBold;
