// Personal Details — edit surfaces for the Account → Profile tab.
// Same chrome as register.jsx / login-bold.jsx OTP step (back chip, eyebrow,
// serif italic hero, paper-card inputs, sticky ink CTA with arrow).
//
// Exports:
//   EditName       — Screen 1
//   EditPhoneEnter — Screen 2A
//   EditPhoneVerify — Screen 2B (lifts the 6-cell OTP exactly)
//   EditPassword   — Screen 3
//   Avatar         — circular avatar handling no-photo / photo / uploading
//   PhotoRow       — the "Profile photo" row showing Upload / Edit / Uploading…

// ─────────────────────────────────────────────────────────────
// Shared tokens + atoms
// ─────────────────────────────────────────────────────────────

const PD = (() => {
  const ink = '#15140f';
  const cream = '#f4ede0';
  const accent = '#2d5a3d';
  const amber = '#c87a3a';
  const danger = '#b84537';
  const muted = '#7a7163';
  const line = 'rgba(21,20,15,0.12)';
  const paper = '#fffdf8';
  return { ink, cream, accent, amber, danger, muted, line, paper };
})();

function PDChrome({ children, eyebrow, eyebrowColor, title, italic, helper, footer, statusDark = false }) {
  const { ink, cream, amber, muted, line } = PD;
  return (
    <div style={{
      width: '100%', height: '100%',
      background: cream, color: ink,
      fontFamily: '"Geist", -apple-system, system-ui, sans-serif',
      display: 'flex', flexDirection: 'column',
      position: 'relative', overflow: 'hidden',
    }}>
      {/* same warm wash as register */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'radial-gradient(120% 60% at 50% 0%, rgba(200,122,58,0.10) 0%, transparent 55%)',
        pointerEvents: 'none',
      }} />

      <div style={{ height: 54, flexShrink: 0 }} />

      <div style={{
        position: 'relative', zIndex: 1,
        padding: '14px 24px 0', display: 'flex', alignItems: 'center',
        justifyContent: 'space-between',
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
          <span style={{ width: 6, height: 6, borderRadius: 999, background: PD.accent, display: 'inline-block' }} />
          PHYGITAL
        </div>
        <div style={{ width: 36 }} />
      </div>

      <div style={{ padding: '28px 28px 0', position: 'relative', zIndex: 1 }}>
        <div style={{
          fontSize: 11, letterSpacing: 1.6, fontWeight: 700,
          color: eyebrowColor || amber,
        }}>
          {eyebrow}
        </div>
        <div style={{
          fontFamily: '"Instrument Serif", Georgia, serif',
          fontSize: 42, lineHeight: 1.02, letterSpacing: -1.2,
          marginTop: 12, maxWidth: 320,
        }}>
          {title} <span style={{ fontStyle: 'italic', color: amber }}>{italic}</span>.
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
          background: `linear-gradient(180deg, rgba(244,237,224,0) 0%, ${PD.cream} 30%)`,
        }}>
          {footer}
        </div>
      )}
    </div>
  );
}

// Dark "next" CTA — identical to register / login auth screens
function PDPrimary({ label, disabled, loading }) {
  const { ink, cream } = PD;
  return (
    <button
      disabled={disabled}
      style={{
        width: '100%', height: 52, borderRadius: 14,
        background: disabled ? '#d8d2c5' : ink,
        color: cream, border: 'none',
        fontSize: 15, fontWeight: 500, fontFamily: 'inherit',
        cursor: disabled ? 'default' : 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
        boxShadow: disabled ? 'none'
          : '0 8px 20px rgba(21,20,15,0.18), inset 0 1px 0 rgba(255,255,255,0.1)',
      }}
    >
      {loading
        ? <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="9" strokeOpacity="0.25"/>
            <path d="M21 12a9 9 0 0 0-9-9" style={{ transformOrigin: 'center', animation: 'pdspin 0.8s linear infinite' }}/>
          </svg>
        : (
          <>
            {label}
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="5" y1="12" x2="19" y2="12"/>
              <polyline points="12 5 19 12 12 19"/>
            </svg>
          </>
        )}
    </button>
  );
}

// Standard input — matches register.jsx
function PDInput({ value, placeholder, type = 'text', focused = false, error = false, mono = false, prefix, suffix }) {
  const { ink, line, muted } = PD;
  const borderColor = error ? PD.danger : (focused ? ink : line);
  return (
    <div style={{
      background: '#fff',
      border: `1px solid ${borderColor}`,
      borderRadius: 14, height: 52,
      boxShadow: '0 1px 0 rgba(255,255,255,0.8) inset, 0 2px 6px rgba(20,15,5,0.04)',
      display: 'flex', alignItems: 'center', overflow: 'hidden',
      transition: 'border-color .15s',
    }}>
      {prefix && (
        <div style={{
          display: 'flex', alignItems: 'center', height: '100%',
          paddingLeft: 4, paddingRight: 0,
        }}>
          {prefix}
        </div>
      )}
      <div style={{
        flex: 1, padding: '0 16px',
        fontSize: mono ? 17 : 16,
        fontFamily: mono ? 'ui-monospace, SFMono-Regular, monospace' : 'inherit',
        color: value ? ink : muted,
        letterSpacing: mono ? 1.2 : 0,
        whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
      }}>
        {value || placeholder}
      </div>
      {suffix && (
        <div style={{
          display: 'flex', alignItems: 'center', height: '100%',
          paddingRight: 4,
        }}>
          {suffix}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Screen 1 · Edit name
// ─────────────────────────────────────────────────────────────

function EditName({ value = 'Adam Sami Tarek', previous = 'Adam Sami', focused = true, changed = true }) {
  const { muted } = PD;
  return (
    <PDChrome
      eyebrow="PERSONAL DETAILS"
      title="Update your"
      italic="name"
      helper="Shown on receipts and at the gate. You can change this any time."
      footer={<PDPrimary label="Save changes" disabled={!changed} />}
    >
      <div style={{ padding: '24px 24px 0' }}>
        <div style={{
          fontSize: 11, fontWeight: 600, letterSpacing: 0.8,
          color: muted, marginBottom: 8, textTransform: 'uppercase',
        }}>
          Full name
        </div>
        <PDInput value={value} placeholder="Full name" focused={focused} />
        <div style={{
          marginTop: 10, fontSize: 12, color: muted,
          display: 'flex', alignItems: 'center', gap: 8,
        }}>
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, opacity: 0.7 }}>
            <polyline points="1 4 1 10 7 10"/>
            <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/>
          </svg>
          previous: <span style={{ color: PD.ink, opacity: 0.85 }}>{previous}</span>
        </div>
      </div>
    </PDChrome>
  );
}

// ─────────────────────────────────────────────────────────────
// Screen 2A · Phone — enter number
// ─────────────────────────────────────────────────────────────

function CountryChip({ flag = '🇪🇬', code = '+20' }) {
  const { ink, line } = PD;
  return (
    <button style={{
      display: 'flex', alignItems: 'center', gap: 6,
      height: 40, padding: '0 10px 0 12px',
      border: `1px solid ${line}`, borderRadius: 12,
      background: '#fff', color: ink,
      fontFamily: 'inherit', fontSize: 14, fontWeight: 500,
      cursor: 'pointer', flexShrink: 0,
      boxShadow: '0 1px 0 rgba(255,255,255,0.8) inset, 0 2px 4px rgba(20,15,5,0.03)',
    }}>
      <span style={{ fontSize: 16, lineHeight: 1 }}>{flag}</span>
      <span style={{ fontFeatureSettings: '"tnum"' }}>{code}</span>
      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.55 }}>
        <polyline points="6 9 12 15 18 9"/>
      </svg>
    </button>
  );
}

function EditPhoneEnter({ value = '100 449 4287', focused = true, valid = true }) {
  const { muted } = PD;
  return (
    <PDChrome
      eyebrow="STEP 1 · NUMBER"
      title="What's your"
      italic="number"
      helper="We'll text you a six-digit code to confirm."
      footer={<PDPrimary label="Send code" disabled={!valid} />}
    >
      <div style={{ padding: '24px 24px 0' }}>
        <div style={{
          fontSize: 11, fontWeight: 600, letterSpacing: 0.8,
          color: muted, marginBottom: 8, textTransform: 'uppercase',
        }}>
          Mobile number
        </div>
        <div style={{ display: 'flex', alignItems: 'stretch', gap: 8 }}>
          <CountryChip flag="🇪🇬" code="+20" />
          <div style={{ flex: 1 }}>
            <PDInput value={value} placeholder="100 ··· ····" focused={focused} mono />
          </div>
        </div>
        <div style={{
          marginTop: 10, fontSize: 12, color: muted, lineHeight: 1.45,
        }}>
          Standard SMS rates apply. We'll never share this with anyone outside Phygital.
        </div>
      </div>
    </PDChrome>
  );
}

// ─────────────────────────────────────────────────────────────
// Screen 2B · Phone — verify (lifts the 6-cell OTP from login-bold)
// ─────────────────────────────────────────────────────────────

function OTPCell({ value, focused }) {
  const { ink, cream, line } = PD;
  return (
    <div style={{
      flex: 1, height: 58,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: focused ? cream : '#fff',
      border: `1.5px solid ${value || focused ? ink : line}`,
      borderRadius: 12,
      fontSize: 24, fontWeight: 500,
      fontFamily: '"Instrument Serif", Georgia, serif',
      letterSpacing: -0.5,
      color: ink,
      boxShadow: focused ? `0 0 0 4px rgba(21,20,15,0.06)` : '0 1px 0 rgba(255,255,255,0.8) inset',
      transition: 'all .15s',
      position: 'relative',
    }}>
      {value}
      {focused && !value && (
        <div style={{
          width: 2, height: 22, background: ink,
          animation: 'pdcaret 1s steps(1) infinite',
        }} />
      )}
    </div>
  );
}

function EditPhoneVerify({ digits = ['1','2','9','','',''], error = false, cooldown = 28 }) {
  const { ink, muted, danger, amber } = PD;
  const filled = digits.filter(Boolean).length;
  const ready = filled === 6;
  const focusIdx = filled < 6 ? filled : -1;

  return (
    <PDChrome
      eyebrow="STEP 2 · CONFIRM"
      title="Check your"
      italic="texts"
      footer={<PDPrimary label="Verify" disabled={!ready || error} />}
    >
      <div style={{ padding: '20px 24px 0' }}>
        <div style={{ fontSize: 13, color: muted, lineHeight: 1.5 }}>
          We sent a 6-digit code to <span style={{ color: ink, fontWeight: 500 }}>+20 100 449 4287</span>.
        </div>
        <button style={{
          marginTop: 6, padding: 0,
          background: 'transparent', border: 'none', cursor: 'pointer',
          fontSize: 12.5, fontFamily: 'inherit', color: muted,
          textDecoration: 'underline', textUnderlineOffset: 3,
          textDecorationColor: 'rgba(21,20,15,0.25)',
        }}>
          Wrong number? Edit
        </button>

        <div style={{ display: 'flex', gap: 8, marginTop: 22 }}>
          {digits.map((d, i) => (
            <OTPCell key={i} value={d} focused={i === focusIdx} />
          ))}
        </div>

        {error && (
          <div style={{
            marginTop: 14, fontSize: 12.5, color: danger,
            display: 'flex', alignItems: 'center', gap: 7,
          }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="8" x2="12" y2="12"/>
              <line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            That code didn't match. Try once more.
          </div>
        )}

        <div style={{
          marginTop: 22, fontSize: 12.5, color: muted,
          display: 'flex', alignItems: 'center', gap: 8,
        }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.65 }}>
            <circle cx="12" cy="12" r="10"/>
            <polyline points="12 6 12 12 16 14"/>
          </svg>
          Resend in {cooldown}s
        </div>
      </div>
    </PDChrome>
  );
}

// ─────────────────────────────────────────────────────────────
// Screen 3 · Change password
// ─────────────────────────────────────────────────────────────

function StrengthMeter({ score }) {
  const { line, muted, amber, accent } = PD;
  // 4 segments. Color ramps amber→accent as score rises.
  const palette = ['rgba(184,69,55,0.65)', 'rgba(200,149,56,0.85)', 'rgba(200,122,58,0.95)', accent];
  const label = ['Too short', 'Weak', 'Fair', 'Good', 'Strong'][score];
  const labelColor = [muted, '#b84537', '#a8893d', amber, accent][score];
  return (
    <div style={{ marginTop: 10 }}>
      <div style={{ display: 'flex', gap: 5 }}>
        {[0,1,2,3].map((i) => (
          <div key={i} style={{
            flex: 1, height: 4, borderRadius: 999,
            background: i < score ? palette[Math.min(score - 1, 3)] : 'rgba(21,20,15,0.07)',
            transition: 'background .2s',
          }} />
        ))}
      </div>
      {score > 0 && (
        <div style={{
          marginTop: 7, fontSize: 11.5, fontWeight: 500,
          letterSpacing: 0.3, color: labelColor,
        }}>
          {label}
        </div>
      )}
    </div>
  );
}

function EyeToggle({ shown }) {
  return (
    <button style={{
      background: 'none', border: 'none', cursor: 'pointer',
      padding: '0 16px', height: '100%', color: PD.muted,
      display: 'flex', alignItems: 'center',
    }}>
      {shown
        ? <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
            <line x1="1" y1="1" x2="23" y2="23"/>
          </svg>
        : <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
            <circle cx="12" cy="12" r="3"/>
          </svg>}
    </button>
  );
}

function PWField({ label, value, masked = true, focused = false, error = false, hint }) {
  const { muted, danger } = PD;
  // Bullets when masked; raw chars otherwise. Both still feel like an input value.
  const display = masked ? '•'.repeat(value.length) : value;
  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{
        fontSize: 11, fontWeight: 600, letterSpacing: 0.8,
        color: muted, marginBottom: 7, textTransform: 'uppercase',
      }}>
        {label}
      </div>
      <PDInput
        value={display}
        placeholder={masked ? '••••••••' : 'password'}
        focused={focused}
        error={error}
        mono={!masked}
        suffix={<EyeToggle shown={!masked} />}
      />
      {hint}
      {error && (
        <div style={{
          marginTop: 8, fontSize: 12.5, color: danger,
          display: 'flex', alignItems: 'center', gap: 7,
        }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="8" x2="12" y2="12"/>
            <line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          Doesn't match the new password.
        </div>
      )}
    </div>
  );
}

function EditPassword({
  current = '••••••••••',
  next = 'mansoura-2024!',
  confirm = 'mansoura-2024!',
  focused = 'next',
  strength = 4,
}) {
  const { muted } = PD;
  const matches = next === confirm && confirm.length > 0;
  const longEnough = next.length >= 8;
  const canSubmit = matches && longEnough;

  return (
    <PDChrome
      eyebrow="SECURITY"
      eyebrowColor={PD.amber}
      title="Change your"
      italic="password"
      footer={<PDPrimary label="Update password" disabled={!canSubmit} />}
    >
      <div style={{ padding: '22px 24px 0' }}>
        <PWField
          label="Current password"
          value={current}
          masked={focused !== 'current-shown'}
          focused={focused === 'current'}
        />
        <PWField
          label="New password"
          value={next}
          masked={focused !== 'next-shown'}
          focused={focused === 'next'}
          hint={<StrengthMeter score={strength} />}
        />
        <PWField
          label="Confirm new password"
          value={confirm}
          masked={focused !== 'confirm-shown'}
          focused={focused === 'confirm'}
        />
        <div style={{
          marginTop: 4, fontSize: 12, color: muted, lineHeight: 1.5,
          display: 'flex', alignItems: 'center', gap: 7,
        }}>
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, opacity: 0.55 }}>
            <rect x="3" y="11" width="18" height="11" rx="2"/>
            <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
          </svg>
          8+ characters · mix letters and numbers
        </div>
      </div>
    </PDChrome>
  );
}

// ─────────────────────────────────────────────────────────────
// Avatar — three states for the Account masthead
// ─────────────────────────────────────────────────────────────

function Avatar({ state = 'empty', initial = 'A', imageSrc, size = 64 }) {
  const { cream, amber, ink, line } = PD;
  const fontSize = size * 0.47;
  const dimmed = state === 'uploading';

  const inner = state === 'photo' || state === 'uploading'
    ? (
      <div style={{
        width: '100%', height: '100%', borderRadius: 999,
        background: imageSrc
          ? `center/cover no-repeat url(${imageSrc})`
          : `linear-gradient(135deg, #d2a978 0%, #8d5d35 100%)`,
        opacity: dimmed ? 0.6 : 1,
        position: 'relative',
        boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.18), inset 0 0 0 1px rgba(21,20,15,0.10)',
      }}>
        {!imageSrc && state === 'photo' && (
          // a soft, generic portrait silhouette so the "photo set" state reads
          // without requiring a real asset
          <svg viewBox="0 0 64 64" style={{ position: 'absolute', inset: 0, opacity: 0.65 }}>
            <circle cx="32" cy="24" r="10" fill={cream}/>
            <path d="M10 60 c4 -14 16 -20 22 -20 s18 6 22 20 z" fill={cream}/>
          </svg>
        )}
      </div>
    )
    : (
      <div style={{
        width: '100%', height: '100%', borderRadius: 999,
        background: `linear-gradient(135deg, ${amber} 0%, #a8542a 100%)`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: cream, fontSize, letterSpacing: -1,
        fontFamily: '"Instrument Serif", Georgia, serif',
        boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.22), inset 0 0 0 1px rgba(21,20,15,0.10)',
      }}>
        {initial}
      </div>
    );

  return (
    <div style={{
      position: 'relative', width: size, height: size,
      cursor: state === 'uploading' ? 'default' : 'pointer',
    }}>
      <div style={{
        width: size, height: size, borderRadius: 999,
        boxShadow: '0 6px 14px rgba(200,122,58,0.22), 0 0 0 1px rgba(21,20,15,0.06)',
        overflow: 'hidden',
      }}>
        {inner}
      </div>
      {state === 'uploading' && (
        <svg
          width={size + 10} height={size + 10}
          viewBox="0 0 100 100"
          style={{
            position: 'absolute', top: -5, left: -5,
            animation: 'pdspin 1.2s linear infinite',
          }}
        >
          <circle cx="50" cy="50" r="46" fill="none"
            stroke={amber} strokeWidth="3" strokeLinecap="round"
            strokeDasharray="80 220" />
        </svg>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// PhotoRow — the value column inside Personal Details for the photo row
// ─────────────────────────────────────────────────────────────

function PhotoRow({ state = 'empty' }) {
  const { muted, amber, line, paper, ink } = PD;
  const Icon = (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2"/>
      <circle cx="8.5" cy="8.5" r="1.5"/>
      <polyline points="21 15 16 10 5 21"/>
    </svg>
  );

  let valueNode;
  if (state === 'empty') {
    valueNode = <span style={{ fontSize: 13, color: muted }}>Upload</span>;
  } else if (state === 'photo') {
    valueNode = <span style={{ fontSize: 13, color: muted }}>Edit</span>;
  } else {
    valueNode = (
      <span style={{
        display: 'inline-flex', alignItems: 'center', gap: 7, fontSize: 13, color: ink,
      }}>
        <span style={{
          display: 'inline-block', position: 'relative',
          background: 'linear-gradient(90deg, rgba(21,20,15,0.05), rgba(200,122,58,0.18), rgba(21,20,15,0.05))',
          backgroundSize: '200% 100%',
          animation: 'pdshimmer 1.4s linear infinite',
          padding: '2px 8px', borderRadius: 999,
        }}>Uploading…</span>
      </span>
    );
  }

  return (
    <div style={{
      width: '100%', display: 'flex', alignItems: 'center', gap: 14,
      padding: '14px 0',
    }}>
      <span style={{
        width: 32, height: 32, borderRadius: 8,
        background: 'rgba(200,122,58,0.10)', color: amber,
        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
      }}>{Icon}</span>
      <span style={{ flex: 1, fontSize: 14.5 }}>Profile photo</span>
      {valueNode}
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={muted} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="9 18 15 12 9 6"/>
      </svg>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Demo card — shows all three avatar states + matching rows
// ─────────────────────────────────────────────────────────────

function AvatarRefreshDemo() {
  const { cream, ink, muted, line, paper } = PD;
  const cell = (state, title, blurb, initial) => (
    <div style={{
      padding: 24, background: paper, borderRadius: 18,
      border: `1px solid ${line}`,
      boxShadow: '0 1px 0 rgba(255,255,255,0.6) inset',
    }}>
      <div style={{ fontSize: 10, letterSpacing: 1.6, color: muted, fontWeight: 600, marginBottom: 14 }}>
        {title}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <Avatar state={state} initial={initial} size={64} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            fontFamily: '"Instrument Serif", Georgia, serif',
            fontSize: 24, lineHeight: 1, letterSpacing: -0.4,
          }}>
            Adam
          </div>
          <div style={{ fontSize: 11.5, color: muted, marginTop: 4 }}>
            +20 100 ··· 4287
          </div>
        </div>
      </div>
      <div style={{ marginTop: 14, paddingTop: 6, borderTop: `1px dashed ${line}` }}>
        <PhotoRow state={state} />
      </div>
      <div style={{ marginTop: 6, fontSize: 11.5, color: muted, lineHeight: 1.45, fontStyle: 'italic' }}>
        {blurb}
      </div>
    </div>
  );

  return (
    <div style={{
      width: '100%', height: '100%', overflow: 'auto',
      background: cream, color: ink,
      fontFamily: '"Geist", system-ui, sans-serif',
      padding: '60px 22px 30px', boxSizing: 'border-box',
    }}>
      <div style={{
        fontSize: 11, letterSpacing: 1.6, color: PD.amber, fontWeight: 700,
        marginBottom: 8,
      }}>
        AVATAR · THREE STATES
      </div>
      <div style={{
        fontFamily: '"Instrument Serif", Georgia, serif',
        fontSize: 38, lineHeight: 1, letterSpacing: -1, marginBottom: 4,
      }}>
        The masthead <span style={{ fontStyle: 'italic', color: PD.amber }}>circle</span>.
      </div>
      <div style={{ fontSize: 12.5, color: muted, marginTop: 12, lineHeight: 1.5, marginBottom: 24 }}>
        Tap opens the iOS-native action sheet ("Take photo" / "Choose from library" / "Cancel"). The row mirrors the avatar — same tap, same sheet.
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {cell('empty', 'STATE 1 · NO PHOTO', 'Today\'s default. Initial on amber gradient.', 'A')}
        {cell('photo', 'STATE 2 · PHOTO SET', 'Same circle, same inner shadow — sits in the design.', 'A')}
        {cell('uploading', 'STATE 3 · UPLOADING', 'Photo at 60% opacity, amber ring spinner. Tap disabled.', 'A')}
      </div>

      <style>{`
        @keyframes pdspin { to { transform: rotate(360deg); } }
        @keyframes pdshimmer { from { background-position: 0% 0; } to { background-position: -200% 0; } }
        @keyframes pdcaret { 50% { opacity: 0; } }
      `}</style>
    </div>
  );
}

// Expose
Object.assign(window, {
  EditName,
  EditPhoneEnter,
  EditPhoneVerify,
  EditPassword,
  Avatar,
  PhotoRow,
  AvatarRefreshDemo,
});
