import { useNavigate, Link } from "react-router-dom";
import { useState } from "react";
import { supabase } from "../client";
import { TrendingUp, Mail, Lock, ArrowRight, Loader2, AlertCircle, CheckCircle2 } from "lucide-react";

const TICKER_DATA = [
  { sym: "AAPL",  price: "189.42", chg: "+1.23%", up: true  },
  { sym: "MSFT",  price: "412.18", chg: "+0.87%", up: true  },
  { sym: "NVDA",  price: "875.30", chg: "-2.41%", up: false },
  { sym: "GOOGL", price: "174.65", chg: "+0.52%", up: true  },
  { sym: "TSLA",  price: "247.10", chg: "-1.08%", up: false },
  { sym: "JPM",   price: "209.34", chg: "+0.31%", up: true  },
  { sym: "AMZN",  price: "196.88", chg: "+1.74%", up: true  },
  { sym: "META",  price: "528.01", chg: "+2.10%", up: true  },
  { sym: "BRK.B", price: "396.22", chg: "-0.12%", up: false },
  { sym: "XOM",   price: "115.47", chg: "+0.68%", up: true  },
];

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState<string | null>(null);
  const [message, setMessage]   = useState<string | null>(null);

  const clearFeedback = () => { setError(null); setMessage(null); };

  async function handleSignIn() {
    if (!email || !password) {
      setError("Please enter your email and password.");
      return;
    }
    clearFeedback();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      setError(error.message);
    } else {
      setMessage("Sign in successful! Redirecting…");
      setTimeout(() => navigate("/welcome"), 900);
    }
  }

  async function handleSignUp() {
    if (!email || !password) {
      setError("Please enter an email and password to register.");
      return;
    }
    clearFeedback();
    setLoading(true);
    const { error } = await supabase.auth.signUp({ email, password });
    setLoading(false);
    if (error) {
      setError(error.message);
    } else {
      setMessage("Account created! Check your email for a confirmation link.");
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter") handleSignIn();
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=IBM+Plex+Mono:wght@400;500;600&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;1,9..40,300&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        :root {
          --navy-950: #080C14;
          --navy-900: #0D1421;
          --navy-800: #111B2E;
          --navy-700: #162038;
          --navy-600: #1E2D4A;
          --navy-500: #2A3F60;
          --navy-400: #3D5578;
          --slate-300: #8899B4;
          --slate-200: #A8B8CC;
          --slate-100: #C8D4E3;
          --amber-500: #F0A500;
          --amber-400: #F5B830;
          --amber-300: #FAD06A;
          --green-400: #2DDBA8;
          --red-400:   #F06070;
          --white:     #F5F8FC;
          --font-display: 'DM Serif Display', Georgia, serif;
          --font-body:    'DM Sans', system-ui, sans-serif;
          --font-mono:    'IBM Plex Mono', 'Courier New', monospace;
          --ease-out: cubic-bezier(0.16, 1, 0.3, 1);
        }

        body {
          font-family: var(--font-body);
          background: var(--navy-950);
          color: var(--slate-100);
          min-height: 100vh;
          -webkit-font-smoothing: antialiased;
        }

        /* ── Ticker ── */
        .login-ticker {
          position: fixed;
          top: 0; left: 0; right: 0;
          z-index: 10;
          display: flex;
          overflow: hidden;
          background: var(--navy-900);
          border-bottom: 1px solid rgba(255,255,255,0.06);
          padding: 0.35rem 0;
        }
        .login-ticker-inner {
          display: flex;
          gap: 2rem;
          animation: tickerScroll 28s linear infinite;
          white-space: nowrap;
        }
        .login-ticker-item {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-family: var(--font-mono);
          font-size: 0.65rem;
        }
        .t-sym  { color: var(--white);       font-weight: 600; }
        .t-px   { color: var(--slate-200); }
        .t-up   { color: #2DDBA8; }
        .t-dn   { color: #F06070; }
        @keyframes tickerScroll {
          from { transform: translateX(0); }
          to   { transform: translateX(-50%); }
        }

        /* ── Page layout ── */
        .login-page {
          min-height: 100vh;
          display: grid;
          grid-template-columns: 1fr 1fr;
        }

        /* ── Left panel ── */
        .login-left {
          background: var(--navy-900);
          border-right: 1px solid rgba(255,255,255,0.06);
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          padding: 6rem 4rem 3rem;
          position: relative;
          overflow: hidden;
        }

        /* Grid texture */
        .login-left::before {
          content: '';
          position: absolute;
          inset: 0;
          background-image:
            linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px);
          background-size: 36px 36px;
          pointer-events: none;
        }

        /* Amber glow in corner */
        .login-left::after {
          content: '';
          position: absolute;
          bottom: -120px; left: -80px;
          width: 400px; height: 400px;
          background: radial-gradient(circle, rgba(240,165,0,0.08) 0%, transparent 70%);
          pointer-events: none;
        }

        .login-brand {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-family: var(--font-display);
          font-size: 1.5rem;
          color: var(--white);
          position: relative;
          z-index: 1;
        }
        .login-brand .accent { color: var(--amber-400); }

        .login-hero {
          position: relative;
          z-index: 1;
        }
        .login-hero h2 {
          font-family: var(--font-display);
          font-size: clamp(2rem, 3vw, 3rem);
          color: var(--white);
          line-height: 1.1;
          margin-bottom: 1rem;
        }
        .login-hero h2 em {
          font-style: italic;
          color: var(--amber-400);
        }
        .login-hero p {
          font-size: 0.925rem;
          color: var(--slate-200);
          line-height: 1.65;
          max-width: 380px;
        }

        .login-stats {
          display: flex;
          gap: 2rem;
          position: relative;
          z-index: 1;
        }
        .login-stat-v {
          font-family: var(--font-mono);
          font-size: 1.25rem;
          font-weight: 600;
          color: var(--white);
          display: block;
        }
        .login-stat-l {
          font-family: var(--font-mono);
          font-size: 0.6rem;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: var(--slate-300);
          display: block;
        }

        /* ── Right panel (form) ── */
        .login-right {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 6rem 3rem 3rem;
          background: var(--navy-950);
        }

        .login-form-wrap {
          width: 100%;
          max-width: 420px;
          animation: fadeUp 0.5s var(--ease-out) both;
        }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        .login-form-header {
          margin-bottom: 2.5rem;
        }
        .login-form-header h1 {
          font-family: var(--font-display);
          font-size: 1.875rem;
          color: var(--white);
          margin-bottom: 0.375rem;
        }
        .login-form-header p {
          font-size: 0.875rem;
          color: var(--slate-300);
        }

        /* Form fields */
        .login-field {
          margin-bottom: 1rem;
        }
        .login-field-label {
          font-family: var(--font-mono);
          font-size: 0.62rem;
          font-weight: 600;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: var(--slate-300);
          display: block;
          margin-bottom: 0.4rem;
        }
        .login-input-wrap {
          position: relative;
        }
        .login-input-icon {
          position: absolute;
          left: 0.875rem;
          top: 50%;
          transform: translateY(-50%);
          color: var(--slate-300);
          pointer-events: none;
          width: 15px; height: 15px;
        }
        .login-input {
          width: 100%;
          padding: 0.7rem 1rem 0.7rem 2.5rem;
          background: var(--navy-800);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 8px;
          color: var(--white);
          font-family: var(--font-body);
          font-size: 0.875rem;
          transition: border-color 0.2s, box-shadow 0.2s;
          outline: none;
        }
        .login-input:focus {
          border-color: var(--amber-500);
          box-shadow: 0 0 0 3px rgba(240,165,0,0.12);
        }
        .login-input::placeholder {
          color: var(--slate-300);
          opacity: 0.5;
        }

        /* Divider */
        .login-divider {
          height: 1px;
          background: rgba(255,255,255,0.07);
          margin: 1.5rem 0;
        }

        /* Buttons */
        .login-btn-primary {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          padding: 0.75rem 1.5rem;
          background: var(--amber-500);
          color: var(--navy-900);
          border: none;
          border-radius: 8px;
          font-family: var(--font-body);
          font-size: 0.925rem;
          font-weight: 700;
          cursor: pointer;
          transition: background 0.2s, transform 0.15s, box-shadow 0.2s;
          margin-bottom: 0.75rem;
        }
        .login-btn-primary:hover:not(:disabled) {
          background: var(--amber-400);
          transform: translateY(-1px);
          box-shadow: 0 8px 24px rgba(240,165,0,0.28);
        }
        .login-btn-primary:active { transform: translateY(0); box-shadow: none; }
        .login-btn-primary:disabled { opacity: 0.4; cursor: not-allowed; }

        .login-btn-secondary {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          padding: 0.7rem 1.5rem;
          background: transparent;
          color: var(--slate-100);
          border: 1px solid rgba(255,255,255,0.12);
          border-radius: 8px;
          font-family: var(--font-body);
          font-size: 0.875rem;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.2s, border-color 0.2s, color 0.2s;
        }
        .login-btn-secondary:hover:not(:disabled) {
          background: rgba(255,255,255,0.05);
          border-color: rgba(255,255,255,0.22);
          color: var(--white);
        }
        .login-btn-secondary:disabled { opacity: 0.4; cursor: not-allowed; }

        /* Feedback banners */
        .login-feedback {
          display: flex;
          align-items: flex-start;
          gap: 0.5rem;
          padding: 0.75rem 1rem;
          border-radius: 8px;
          font-size: 0.8rem;
          line-height: 1.5;
          margin-bottom: 1.25rem;
          animation: fadeUp 0.25s var(--ease-out) both;
        }
        .login-feedback-error {
          background: rgba(240,96,112,0.1);
          border: 1px solid rgba(240,96,112,0.25);
          color: #F06070;
        }
        .login-feedback-success {
          background: rgba(45,219,168,0.1);
          border: 1px solid rgba(45,219,168,0.25);
          color: #2DDBA8;
        }
        .login-feedback svg { flex-shrink: 0; margin-top: 1px; }

        /* Footer note */
        .login-footer-note {
          margin-top: 1.5rem;
          text-align: center;
          font-size: 0.75rem;
          color: var(--slate-300);
          font-family: var(--font-mono);
        }

        /* Spinner */
        @keyframes spin { to { transform: rotate(360deg); } }
        .spin { animation: spin 0.9s linear infinite; }

        /* Responsive */
        @media (max-width: 768px) {
          .login-page { grid-template-columns: 1fr; }
          .login-left { display: none; }
          .login-right { padding: 5rem 1.5rem 2rem; }
        }
      `}</style>

      {/* Ticker */}
      <div className="login-ticker">
        <div className="login-ticker-inner">
          {[...TICKER_DATA, ...TICKER_DATA].map((t, i) => (
            <span key={i} className="login-ticker-item">
              <span className="t-sym">{t.sym}</span>
              <span className="t-px">{t.price}</span>
              <span className={t.up ? "t-up" : "t-dn"}>{t.chg}</span>
            </span>
          ))}
        </div>
      </div>

      <div className="login-page">
        {/* ── Left panel ── */}
        <div className="login-left">
          <div className="login-brand">
            <TrendingUp size={20} color="var(--amber-400)" />
            Trade<span className="accent">Step</span>
          </div>

          <div className="login-hero">
            <h2>
              Screen smarter.<br />
              <em>Invest better.</em>
            </h2>
            <p>
              Build granular stock screens from balance sheet data, technical
              signals, and options greeks. Get a curated digest delivered to
              your inbox — no spreadsheets required.
            </p>
          </div>

          <div className="login-stats">
            {[
              { v: "8,000+", l: "Equities"     },
              { v: "120+",   l: "Data Fields"  },
              { v: "<5ms",   l: "Query Speed"  },
            ].map(({ v, l }) => (
              <div key={l}>
                <span className="login-stat-v">{v}</span>
                <span className="login-stat-l">{l}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── Right panel ── */}
        <div className="login-right">
          <div className="login-form-wrap">
            <div className="login-form-header">
              <h1>Welcome back.</h1>
              <p>Sign in to your account or register to get started.</p>
            </div>

            {/* Feedback */}
            {error && (
              <div className="login-feedback login-feedback-error">
                <AlertCircle size={14} />
                {error}
              </div>
            )}
            {message && (
              <div className="login-feedback login-feedback-success">
                <CheckCircle2 size={14} />
                {message}
              </div>
            )}

            {/* Email */}
            <div className="login-field">
              <label className="login-field-label">Email Address</label>
              <div className="login-input-wrap">
                <Mail className="login-input-icon" />
                <input
                  type="email"
                  placeholder="you@example.com"
                  className="login-input"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); clearFeedback(); }}
                  onKeyDown={handleKeyDown}
                  autoComplete="email"
                />
              </div>
            </div>

            {/* Password */}
            <div className="login-field">
              <label className="login-field-label">Password</label>
              <div className="login-input-wrap">
                <Lock className="login-input-icon" />
                <input
                  type="password"
                  placeholder="••••••••"
                  className="login-input"
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); clearFeedback(); }}
                  onKeyDown={handleKeyDown}
                  autoComplete="current-password"
                />
              </div>
            </div>

            <div className="login-divider" />

            {/* Sign In */}
            <button
              className="login-btn-primary"
              onClick={handleSignIn}
              disabled={loading}
            >
              {loading ? (
                <Loader2 size={16} className="spin" />
              ) : (
                <ArrowRight size={16} />
              )}
              {loading ? "Signing in…" : "Sign In"}
            </button>

            {/* Register */}
            <button
              className="login-btn-secondary"
              onClick={handleSignUp}
              disabled={loading}
            >
              Create an Account
            </button>

            <p className="login-footer-note">
              By continuing, you agree to our Terms of Service & Privacy Policy.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
