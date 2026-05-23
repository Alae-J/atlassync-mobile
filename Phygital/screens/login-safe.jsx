// LoginSafe.jsx — Option A: Editorial/Notion-flavored login
// Calm, restrained, paper-feeling. Email + password, with social.

function LoginSafe({ time = '9:41' }) {
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [showPw, setShowPw] = React.useState(false);
  const [focused, setFocused] = React.useState(null);
  const [loading, setLoading] = React.useState(false);
  const [success, setSuccess] = React.useState(false);

  const valid = email.includes('@') && password.length >= 4;

  const handleSubmit = () => {
    if (!valid || loading) return;
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSuccess(true);
    }, 900);
  };

  const ink = '#1c1a17';
  const muted = '#8a8175';
  const paper = '#faf8f4';
  const line = '#e8e2d6';
  const accent = '#3d6e4a';

  const fieldStyle = (key) => ({
    width: '100%',
    height: 52,
    padding: '0 14px',
    border: 'none',
    background: 'transparent',
    fontSize: 16,
    fontFamily: 'inherit',
    color: ink,
    outline: 'none',
    boxSizing: 'border-box',
  });

  const fieldWrap = (key) => ({
    width: '100%',
    background: '#fff',
    border: `1px solid ${focused === key ? ink : line}`,
    borderRadius: 12,
    transition: 'border-color .15s, box-shadow .15s',
    boxShadow: focused === key ? '0 0 0 3px rgba(28,26,23,0.06)' : 'none',
    display: 'flex',
    alignItems: 'center',
    boxSizing: 'border-box',
  });

  return (
    <div style={{
      width: '100%', height: '100%',
      background: paper,
      fontFamily: '"Geist", -apple-system, BlinkMacSystemFont, system-ui, sans-serif',
      color: ink,
      display: 'flex', flexDirection: 'column',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* paper grain */}
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: 'radial-gradient(circle at 20% 30%, rgba(180,160,120,0.04) 0%, transparent 60%), radial-gradient(circle at 80% 70%, rgba(120,140,100,0.03) 0%, transparent 60%)',
        pointerEvents: 'none',
      }} />

      {/* status bar spacer */}
      <div style={{ height: 54, flexShrink: 0 }} />

      {/* header */}
      <div style={{ padding: '20px 28px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative' }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8,
        }}>
          <div style={{
            width: 28, height: 28, borderRadius: 8,
            background: ink,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: paper, fontWeight: 600, fontSize: 14,
            fontFamily: '"Instrument Serif", Georgia, serif',
            fontStyle: 'italic',
          }}>P</div>
          <span style={{ fontSize: 14, letterSpacing: -0.2, fontWeight: 500 }}>Phygital</span>
        </div>
        <button style={{
          background: 'transparent', border: 'none',
          fontSize: 13, color: muted, cursor: 'pointer',
          fontFamily: 'inherit', padding: 6,
        }}>Help</button>
      </div>

      {/* hero */}
      <div style={{ padding: '64px 28px 32px', position: 'relative' }}>
        <div style={{
          fontFamily: '"Instrument Serif", Georgia, serif',
          fontSize: 42, lineHeight: 1.05, letterSpacing: -1,
          fontWeight: 400, color: ink,
        }}>
          Welcome<br/>
          <span style={{ fontStyle: 'italic', color: accent }}>back.</span>
        </div>
        <div style={{
          marginTop: 14, fontSize: 15, color: muted, lineHeight: 1.5, maxWidth: 280,
        }}>
          Skip the line. Sign in to continue your shopping session.
        </div>
      </div>

      {/* form */}
      <div style={{ padding: '0 28px', display: 'flex', flexDirection: 'column', gap: 12, position: 'relative' }}>
        <div>
          <label style={{ fontSize: 12, color: muted, fontWeight: 500, marginBottom: 6, display: 'block', letterSpacing: 0.2 }}>EMAIL</label>
          <div style={fieldWrap('email')}>
            <input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onFocus={() => setFocused('email')}
              onBlur={() => setFocused(null)}
              style={fieldStyle('email')}
            />
          </div>
        </div>

        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 6 }}>
            <label style={{ fontSize: 12, color: muted, fontWeight: 500, letterSpacing: 0.2 }}>PASSWORD</label>
            <button style={{
              background: 'none', border: 'none', fontSize: 12, color: ink,
              fontFamily: 'inherit', cursor: 'pointer', padding: 0,
              textDecoration: 'underline', textUnderlineOffset: 3, textDecorationColor: line,
            }}>Forgot?</button>
          </div>
          <div style={fieldWrap('password')}>
            <input
              type={showPw ? 'text' : 'password'}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onFocus={() => setFocused('password')}
              onBlur={() => setFocused(null)}
              style={fieldStyle('password')}
            />
            <button
              onClick={() => setShowPw(!showPw)}
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                padding: '0 14px', height: '100%', color: muted,
                display: 'flex', alignItems: 'center',
              }}>
              {showPw
                ? <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                : <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>}
            </button>
          </div>
        </div>

        {/* primary button */}
        <button
          onClick={handleSubmit}
          disabled={!valid || loading}
          style={{
            marginTop: 14, height: 54, borderRadius: 12,
            background: success ? accent : (valid ? ink : '#d8d2c5'),
            color: paper, border: 'none',
            fontSize: 15, fontWeight: 500, fontFamily: 'inherit',
            cursor: valid ? 'pointer' : 'default',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            gap: 8,
            transition: 'background .2s, transform .08s',
            letterSpacing: -0.1,
          }}
          onMouseDown={(e) => valid && (e.currentTarget.style.transform = 'scale(0.98)')}
          onMouseUp={(e) => (e.currentTarget.style.transform = '')}
          onMouseLeave={(e) => (e.currentTarget.style.transform = '')}
        >
          {success
            ? (<><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg> Signed in</>)
            : loading
              ? (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="9" strokeOpacity="0.25"/><path d="M21 12a9 9 0 0 0-9-9" style={{ transformOrigin: 'center', animation: 'spin 0.8s linear infinite' }}/></svg>)
              : 'Sign in'}
        </button>

        {/* divider */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '20px 0 8px' }}>
          <div style={{ flex: 1, height: 1, background: line }} />
          <span style={{ fontSize: 11, color: muted, letterSpacing: 1.4, fontWeight: 500 }}>OR CONTINUE WITH</span>
          <div style={{ flex: 1, height: 1, background: line }} />
        </div>

        {/* social */}
        <div style={{ display: 'flex', gap: 10 }}>
          {[
            { id: 'apple', label: 'Apple', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/></svg> },
            { id: 'google', label: 'Google', icon: <svg width="18" height="18" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg> },
          ].map((s) => (
            <button key={s.id} style={{
              flex: 1, height: 50, borderRadius: 12,
              background: '#fff', border: `1px solid ${line}`,
              fontSize: 14, fontFamily: 'inherit', fontWeight: 500, color: ink,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              cursor: 'pointer',
            }}>{s.icon}{s.label}</button>
          ))}
        </div>
      </div>

      {/* footer */}
      <div style={{ marginTop: 'auto', padding: '32px 28px 40px', textAlign: 'center', position: 'relative' }}>
        <div style={{ fontSize: 13, color: muted }}>
          New here? <span style={{ color: ink, fontWeight: 500, textDecoration: 'underline', textUnderlineOffset: 3, textDecorationColor: line }}>Create an account</span>
        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        input::placeholder { color: ${muted}; }
      `}</style>
    </div>
  );
}

window.LoginSafe = LoginSafe;
