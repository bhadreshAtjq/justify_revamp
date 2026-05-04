"use client";

import { useState, useEffect, Suspense } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const roleParam = searchParams.get("role");
  const isVerifier = roleParam === "verifier";

  const [mode, setMode] = useState<"login" | "register">(isVerifier ? "register" : "login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isVerifier) setMode("register");
  }, [isVerifier]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError("Invalid credentials. Please check your email and password.");
      } else {
        router.push(isVerifier ? "/verify" : "/dashboard");
      }
    } catch {
      setError("Connection failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, role: "PUBLIC_VERIFIER" }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Registration failed.");
        return;
      }

      setSuccess("Account created. Your credentials have been sent to your email.");
      setMode("login");
      setName("");
      setPassword("");
    } catch {
      setError("Connection failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-grid-bg" />

      {/* Left visual panel */}
      <div className="login-visual">
        <div className="login-visual-content">
          <div className="lv-logo">
            <div className="lv-logo-mark">J</div>
            <span>JustifAI</span>
          </div>

          <div className="lv-hero">
            <h2>{isVerifier ? "Verify Documents" : "Institution Portal"}</h2>
            <p>
              {isVerifier
                ? "Authenticate academic credentials against the blockchain ledger with a single scan."
                : "Manage, anchor, and verify academic records using cryptographic proof on the public blockchain."
              }
            </p>
          </div>

          <div className="lv-stats">
            <div className="lv-stat">
              <div className="lv-stat-num">256</div>
              <div className="lv-stat-label">BIT ENCRYPTION</div>
            </div>
            <div className="lv-stat-divider" />
            <div className="lv-stat">
              <div className="lv-stat-num">Polygon</div>
              <div className="lv-stat-label">BLOCKCHAIN NETWORK</div>
            </div>
            <div className="lv-stat-divider" />
            <div className="lv-stat">
              <div className="lv-stat-num">Keccak</div>
              <div className="lv-stat-label">HASH ALGORITHM</div>
            </div>
          </div>

          <div className="lv-footer">
            <button onClick={() => router.push("/")} className="lv-back-btn">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="m15 18-6-6 6-6"/>
              </svg>
              Back to Home
            </button>
          </div>
        </div>
      </div>

      {/* Right form panel */}
      <div className="login-form-panel">
        <div className="login-form-container">

          {/* Role toggle */}
          <div className="lf-tabs">
            <button
              className={`lf-tab ${!isVerifier && mode === "login" ? "active" : ""}`}
              onClick={() => { setMode("login"); setError(""); setSuccess(""); router.replace("/login"); }}
            >
              Institution
            </button>
            <button
              className={`lf-tab ${isVerifier || mode === "register" ? "active" : ""}`}
              onClick={() => { setMode("register"); setError(""); setSuccess(""); router.replace("/login?role=verifier"); }}
            >
              Verifier
            </button>
          </div>

          <div className="lf-header">
            <h1>{mode === "login" ? "Sign In" : "Create Account"}</h1>
            <p>
              {mode === "login"
                ? "Access your institution dashboard to manage academic records."
                : "Register as a verifier. Your password will be sent to your email address."
              }
            </p>
          </div>

          {error && (
            <div className="lf-alert lf-alert-error">
              <div className="lf-alert-icon">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>
                </svg>
              </div>
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="lf-alert lf-alert-success">
              <div className="lf-alert-icon">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
                </svg>
              </div>
              <span>{success}</span>
            </div>
          )}

          <form onSubmit={mode === "login" ? handleLogin : handleRegister} className="lf-form">
            {mode === "register" && (
              <div className="lf-field">
                <label htmlFor="name">Full Name</label>
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your full name"
                  required
                  autoComplete="name"
                />
              </div>
            )}

            <div className="lf-field">
              <label htmlFor="email">Email Address</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
                autoComplete="email"
              />
            </div>

            {mode === "login" && (
              <div className="lf-field">
                <label htmlFor="password">Password</label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                  autoComplete="current-password"
                />
              </div>
            )}

            <button type="submit" className="lf-submit" disabled={loading}>
              {loading ? (
                <div className="lf-spinner" />
              ) : mode === "login" ? (
                "Sign In"
              ) : (
                "Create Account"
              )}
            </button>
          </form>

          <div className="lf-switch">
            {mode === "login" ? (
              <p>
                Need to verify a document?{" "}
                <button onClick={() => { setMode("register"); setError(""); router.replace("/login?role=verifier"); }}>
                  Create verifier account
                </button>
              </p>
            ) : (
              <p>
                Already have an account?{" "}
                <button onClick={() => { setMode("login"); setError(""); setSuccess(""); router.replace("/login"); }}>
                  Sign in
                </button>
              </p>
            )}
          </div>
        </div>
      </div>

      <style jsx>{`
        .login-page {
          display: flex;
          min-height: 100vh;
          font-family: 'Inter', -apple-system, sans-serif;
          position: relative;
        }

        .login-grid-bg {
          position: fixed;
          inset: 0;
          background-image:
            linear-gradient(rgba(57,62,70,0.02) 1px, transparent 1px),
            linear-gradient(90deg, rgba(57,62,70,0.02) 1px, transparent 1px);
          background-size: 60px 60px;
          pointer-events: none;
          z-index: 0;
        }

        /* Left visual */
        .login-visual {
          flex: 1;
          background: #393E46;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          overflow: hidden;
          min-height: 100vh;
        }
        .login-visual::before {
          content: '';
          position: absolute;
          inset: 0;
          background-image:
            linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px);
          background-size: 40px 40px;
        }
        .login-visual::after {
          content: '';
          position: absolute;
          bottom: -120px;
          right: -120px;
          width: 400px;
          height: 400px;
          border-radius: 50%;
          background: rgba(255,255,255,0.02);
        }
        .login-visual-content {
          position: relative;
          z-index: 1;
          padding: 48px;
          max-width: 460px;
          display: flex;
          flex-direction: column;
          min-height: 100vh;
          justify-content: center;
        }
        .lv-logo {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 16px;
          font-weight: 700;
          color: #F7F7F7;
          margin-bottom: 60px;
        }
        .lv-logo-mark {
          width: 34px;
          height: 34px;
          background: rgba(255,255,255,0.12);
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #F7F7F7;
          font-weight: 800;
          font-size: 14px;
        }
        .lv-hero h2 {
          font-size: 32px;
          font-weight: 700;
          color: #F7F7F7;
          letter-spacing: -0.8px;
          margin-bottom: 14px;
          line-height: 1.2;
        }
        .lv-hero p {
          font-size: 14px;
          color: rgba(255,255,255,0.5);
          line-height: 1.7;
          margin-bottom: 48px;
        }
        .lv-stats {
          display: flex;
          align-items: center;
          gap: 24px;
        }
        .lv-stat-num {
          font-size: 18px;
          font-weight: 700;
          color: #F7F7F7;
          font-family: 'JetBrains Mono', monospace;
          margin-bottom: 4px;
        }
        .lv-stat-label {
          font-size: 9px;
          font-weight: 600;
          letter-spacing: 1.5px;
          color: rgba(255,255,255,0.3);
        }
        .lv-stat-divider {
          width: 1px;
          height: 32px;
          background: rgba(255,255,255,0.08);
        }
        .lv-footer {
          margin-top: 60px;
        }
        .lv-back-btn {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: none;
          border: none;
          color: rgba(255,255,255,0.4);
          font-size: 12px;
          font-weight: 500;
          cursor: pointer;
          font-family: inherit;
          padding: 0;
          transition: color 0.18s;
        }
        .lv-back-btn:hover {
          color: rgba(255,255,255,0.8);
        }

        /* Right form */
        .login-form-panel {
          flex: 1;
          background: #F7F7F7;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          z-index: 1;
          min-height: 100vh;
        }
        .login-form-container {
          width: 100%;
          max-width: 380px;
          padding: 40px;
        }
        .lf-tabs {
          display: flex;
          gap: 4px;
          padding: 4px;
          background: #FFFFFF;
          border-radius: 10px;
          border: 1px solid rgba(57,62,70,0.06);
          margin-bottom: 36px;
        }
        .lf-tab {
          flex: 1;
          padding: 10px 16px;
          border: none;
          background: none;
          border-radius: 7px;
          font-size: 13px;
          font-weight: 600;
          color: #929AAB;
          cursor: pointer;
          transition: all 0.18s;
          font-family: inherit;
        }
        .lf-tab.active {
          background: #393E46;
          color: #F7F7F7;
        }
        .lf-tab:hover:not(.active) {
          color: #393E46;
        }
        .lf-header {
          margin-bottom: 28px;
        }
        .lf-header h1 {
          font-size: 24px;
          font-weight: 700;
          color: #222831;
          letter-spacing: -0.5px;
          margin-bottom: 8px;
        }
        .lf-header p {
          font-size: 13px;
          color: #929AAB;
          line-height: 1.6;
        }

        /* Alerts */
        .lf-alert {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 12px 14px;
          border-radius: 10px;
          margin-bottom: 20px;
          font-size: 13px;
          font-weight: 500;
          animation: slideUp 0.25s ease;
        }
        .lf-alert-error {
          background: rgba(192, 57, 43, 0.05);
          border: 1px solid rgba(192, 57, 43, 0.12);
          color: #C0392B;
        }
        .lf-alert-success {
          background: rgba(45, 106, 79, 0.05);
          border: 1px solid rgba(45, 106, 79, 0.12);
          color: #2D6A4F;
        }
        .lf-alert-icon {
          flex-shrink: 0;
          display: flex;
        }

        /* Form */
        .lf-form {
          display: flex;
          flex-direction: column;
          gap: 18px;
        }
        .lf-field {
          display: flex;
          flex-direction: column;
          gap: 7px;
        }
        .lf-field label {
          font-size: 12px;
          font-weight: 600;
          color: #393E46;
          letter-spacing: 0.02em;
        }
        .lf-field input {
          padding: 12px 14px;
          border-radius: 10px;
          border: 1.5px solid rgba(57,62,70,0.1);
          font-size: 14px;
          font-family: inherit;
          color: #222831;
          background: #FFFFFF;
          transition: all 0.18s;
          outline: none;
        }
        .lf-field input::placeholder {
          color: #C0C5CE;
        }
        .lf-field input:focus {
          border-color: #393E46;
          box-shadow: 0 0 0 3px rgba(57,62,70,0.06);
        }

        .lf-submit {
          margin-top: 4px;
          padding: 13px;
          background: #393E46;
          color: #F7F7F7;
          border: none;
          border-radius: 10px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          font-family: inherit;
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 46px;
        }
        .lf-submit:hover:not(:disabled) {
          background: #2c3038;
          transform: translateY(-1px);
          box-shadow: 0 4px 14px rgba(57,62,70,0.2);
        }
        .lf-submit:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        .lf-spinner {
          width: 18px;
          height: 18px;
          border: 2px solid rgba(255,255,255,0.2);
          border-top-color: #F7F7F7;
          border-radius: 50%;
          animation: spin 0.5s linear infinite;
        }

        .lf-switch {
          margin-top: 24px;
          text-align: center;
        }
        .lf-switch p {
          font-size: 13px;
          color: #929AAB;
        }
        .lf-switch button {
          background: none;
          border: none;
          color: #393E46;
          font-weight: 600;
          cursor: pointer;
          font-size: 13px;
          font-family: inherit;
          text-decoration: underline;
          text-underline-offset: 2px;
          transition: opacity 0.18s;
        }
        .lf-switch button:hover {
          opacity: 0.7;
        }

        @keyframes slideUp {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        @media (max-width: 900px) {
          .login-page { flex-direction: column; }
          .login-visual { min-height: auto; padding: 40px 0; }
          .login-visual-content { min-height: auto; padding: 32px; }
          .lv-hero { margin-bottom: 0; }
          .lv-hero p { margin-bottom: 24px; }
          .lv-stats { display: none; }
          .lv-footer { margin-top: 24px; }
          .login-form-panel { min-height: auto; }
          .login-form-container { padding: 32px 24px; }
        }
      `}</style>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: '100vh', background: '#F7F7F7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: 24, height: 24, borderRadius: '50%', border: '2.5px solid #EEEEEE', borderTopColor: '#393E46', animation: 'spin 0.6s linear infinite' }} />
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}
