import { useState } from 'react';

// ── Field component ───────────────────────────────────────────────
function Field({ label, type = 'text', value, onChange, placeholder, error }) {
  const [show, setShow] = useState(false);
  const isPassword = type === 'password';

  return (
    <div className="auth-field">
      <label className="auth-label">{label}</label>
      <div className={`auth-input-wrap ${error ? 'has-error' : ''}`}>
        <input
          className="auth-input"
          type={isPassword && show ? 'text' : type}
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          autoComplete={isPassword ? 'current-password' : 'off'}
        />
        {isPassword && (
          <button
            type="button"
            className="auth-eye"
            onClick={() => setShow(s => !s)}
            tabIndex={-1}
            aria-label={show ? 'Hide password' : 'Show password'}
          >
            {show ? (
              // Eye-off icon
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
                <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
                <line x1="1" y1="1" x2="23" y2="23"/>
              </svg>
            ) : (
              // Eye icon
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                <circle cx="12" cy="12" r="3"/>
              </svg>
            )}
          </button>
        )}
      </div>
      {error && <span className="auth-field-error">{error}</span>}
    </div>
  );
}

// ── Sign Up Form ──────────────────────────────────────────────────
function SignUpForm({ onSuccess }) {
  const [form,    setForm]    = useState({ name: '', email: '', password: '' });
  const [errors,  setErrors]  = useState({});
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState('');

  const set = field => val => setForm(f => ({ ...f, [field]: val }));

  const validate = () => {
    const e = {};
    if (!form.name.trim())                          e.name     = 'Name is required';
    if (!form.email.trim())                         e.email    = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(form.email))     e.email    = 'Enter a valid email';
    if (!form.password)                             e.password = 'Password is required';
    else if (form.password.length < 4)             e.password = 'Minimum 4 characters';
    return e;
  };

 const handleSubmit = async () => {
  const e = validate();

  if (Object.keys(e).length) {
    setErrors(e);
    return;
  }

  setErrors({});
  setApiError('');
  setLoading(true);

  try {
    const res = await fetch('https://chatbot-dw95.onrender.com/create_user', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(form),
    });

    const data = await res.json();

    if (!res.ok) {
      let errorMessage = 'Something went wrong. Please try again.';

      if (typeof data.detail === 'string') {
        errorMessage = data.detail;
      }

      setApiError(errorMessage);
      return;
    }

    onSuccess({
      id: data.data.id,
      name: data.data.name,
      email: data.data.email,
    });

  } catch (error) {
    console.error(error);
    setApiError('Cannot reach server. Make sure the backend is running.');
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="auth-form">
      <Field label="Full Name"      value={form.name}     onChange={set('name')}     placeholder="John Doe"           error={errors.name}     />
      <Field label="Email Address"  value={form.email}    onChange={set('email')}    placeholder="you@example.com"    error={errors.email}    type="email" />
      <Field label="Password"       value={form.password} onChange={set('password')} placeholder="Min. 4 characters"  error={errors.password} type="password" />

      {apiError && <p className="auth-api-error">{apiError}</p>}

      <button className="auth-submit" onClick={handleSubmit} disabled={loading}>
        {loading
          ? <span className="auth-spinner" />
          : 'Create Account'}
      </button>
    </div>
  );
}

// ── Sign In Form ──────────────────────────────────────────────────
function SignInForm({ onSuccess }) {
  const [form,     setForm]     = useState({ email: '', password: '' });
  const [errors,   setErrors]   = useState({});
  const [apiError, setApiError] = useState('');
  const [loading,  setLoading]  = useState(false);

  const set = field => val => setForm(f => ({ ...f, [field]: val }));

  const validate = () => {
    const e = {};
    if (!form.email.trim())                      e.email    = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(form.email))  e.email    = 'Enter a valid email';
    if (!form.password)                          e.password = 'Password is required';
    return e;
  };

  const handleSubmit = async () => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }

    setErrors({});
    setApiError('');
    setLoading(true);

    try {
      
      const res  = await fetch('https://chatbot-dw95.onrender.com/validate_user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();

      if (!res.ok) {
        setApiError(data?.detail || 'Something went wrong. Please try again.');
        return;
      }

      localStorage.setItem("token", data.access_token)

      onSuccess({ id: data.user.id, name: data.user.name, email: data.user.email, token:data.access_token });
    } catch {
      setApiError('Sign-in API not available yet. Please sign up first.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-form">
      <Field label="Email Address" value={form.email}    onChange={set('email')}    placeholder="you@example.com"  error={errors.email}    type="email"    />
      <Field label="Password"      value={form.password} onChange={set('password')} placeholder="Your password"    error={errors.password} type="password" />

      {apiError && <p className="auth-api-error">{apiError}</p>}

      <button className="auth-submit" onClick={handleSubmit} disabled={loading}>
        {loading ? <span className="auth-spinner" /> : 'Sign In'}
      </button>
    </div>
  );
}

// ── AuthPage ──────────────────────────────────────────────────────
export default function AuthPage({ onAuthSuccess }) {
  const [tab, setTab] = useState('signup'); // 'signin' | 'signup'

  return (
    <div className="auth-shell">
      {/* Ambient orbs (reuse app-level vars) */}
      <div className="orb orb-1" />
      <div className="orb orb-2" />
      <div className="orb orb-3" />

      <div className="auth-card">
        {/* Logo */}
        <div className="auth-logo">
          <div className="auth-logo-ring">A</div>
          <h1 className="auth-logo-name">Ask AI</h1>
        </div>

        <p className="auth-tagline">Your AI-powered assistant</p>

        {/* Tabs */}
        <div className="auth-tabs">
          <button
            className={`auth-tab ${tab === 'signin' ? 'active' : ''}`}
            onClick={() => setTab('signin')}
          >
            Sign In
          </button>
          <button
            className={`auth-tab ${tab === 'signup' ? 'active' : ''}`}
            onClick={() => setTab('signup')}
          >
            Sign Up
          </button>
          <span className={`auth-tab-indicator ${tab === 'signup' ? 'right' : 'left'}`} />
        </div>

        {/* Form */}
        {tab === 'signup'
          ? <SignUpForm onSuccess={onAuthSuccess} />
          : <SignInForm onSuccess={onAuthSuccess} />
        }

        {/* Footer switch */}
        <p className="auth-switch">
          {tab === 'signup'
            ? <>Already have an account? <button className="auth-switch-btn" onClick={() => setTab('signin')}>Sign In</button></>
            : <>Don't have an account? <button className="auth-switch-btn" onClick={() => setTab('signup')}>Sign Up</button></>
          }
        </p>
      </div>
    </div>
  );
}
