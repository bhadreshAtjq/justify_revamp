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
      <div className="bg-glow bg-glow-1" />
      <div className="bg-glow bg-glow-2" />
      <div className="login-grid-bg" />

      <button onClick={() => router.push("/")} className="back-btn animate-in delay-1">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="m15 18-6-6 6-6"/>
        </svg>
        Back
      </button>

      <div className="login-container animate-in delay-2">
        <div className="login-header">
          <h1>{mode === "login" ? "Welcome back" : "Create an account"}</h1>
          <p>
            {mode === "login"
              ? "Enter your details to sign in to your account"
              : "Register as a verifier to authenticate credentials"
            }
          </p>
        </div>

        <div className="login-card">
          <div className="lf-tabs">
            <div className="lf-tabs-slider" style={{ transform: isVerifier || mode === "register" ? 'translateX(100%)' : 'translateX(0%)' }} />
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

          {error && (
            <div className="lf-alert lf-alert-error animate-in">
              <div className="lf-alert-icon">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>
                </svg>
              </div>
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="lf-alert lf-alert-success animate-in">
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
              <label htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="m@example.com"
                required
                autoComplete="email"
              />
            </div>

            {mode === "login" && (
              <div className="lf-field">
                <div className="label-row">
                  <label htmlFor="password">Password</label>
                </div>
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

            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? (
                <div className="lf-spinner" />
              ) : mode === "login" ? (
                "Sign In"
              ) : (
                "Create Account"
              )}
            </button>
          </form>
        </div>

        <div className="login-footer animate-in delay-3">
          {mode === "login" ? (
            <p>
              Need to verify a document?{" "}
              <button type="button" onClick={() => { setMode("register"); setError(""); router.replace("/login?role=verifier"); }}>
                Sign up
              </button>
            </p>
          ) : (
            <p>
              Already have an account?{" "}
              <button type="button" onClick={() => { setMode("login"); setError(""); setSuccess(""); router.replace("/login"); }}>
                Sign in
              </button>
            </p>
          )}
        </div>
      </div>

      <style jsx>{`
        .login-page {
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 100vh;
          font-family: 'Inter', -apple-system, sans-serif;
          background: #FFFFFF;
          color: #000000;
          position: relative;
          overflow: hidden;
        }

        /* Ambient Glows */
        .bg-glow {
          position: absolute;
          filter: blur(140px);
          opacity: 0.6;
          border-radius: 50%;
          pointer-events: none;
        }
        .bg-glow-1 {
          width: 800px;
          height: 800px;
          background: rgba(211, 255, 233, 0.08);
          top: -200px;
          left: 50%;
          transform: translateX(-50%);
        }
        .bg-glow-2 {
          width: 600px;
          height: 600px;
          background: rgba(96, 165, 250, 0.08);
          bottom: -150px;
          right: -100px;
        }

        .login-grid-bg {
          position: absolute;
          inset: 0;
          background-image:
            linear-gradient(rgba(15, 23, 42, 0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(15, 23, 42, 0.03) 1px, transparent 1px);
          background-size: 50px 50px;
          pointer-events: none;
          mask-image: radial-gradient(circle at center, black 0%, transparent 80%);
          -webkit-mask-image: radial-gradient(circle at center, black 0%, transparent 80%);
        }

        /* Animations */
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(15px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        
        .animate-in {
          opacity: 0;
          animation: fadeInUp 0.7s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .delay-1 { animation-delay: 0.1s; }
        .delay-2 { animation-delay: 0.2s; }
        .delay-3 { animation-delay: 0.3s; }

        /* Back Button */
        .back-btn {
          position: absolute;
          top: 32px;
          left: 32px;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: none;
          border: none;
          color: #607D8B;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          font-family: inherit;
          transition: color 0.2s;
          z-index: 10;
        }
        .back-btn:hover { color: #000000; }

        /* Container & Header */
        .login-container {
          width: 100%;
          max-width: 420px;
          padding: 20px;
          position: relative;
          z-index: 10;
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .login-header {
          text-align: center;
          margin-bottom: 32px;
          width: 100%;
        }
        .logo-mark {
          width: 44px;
          height: 44px;
          background: #D3FFE9;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 800;
          font-size: 20px;
          color: #263238;
          margin: 0 auto 24px;
          box-shadow: 0 8px 20px rgba(211, 255, 233, 0.2);
        }
        .login-header h1 {
          font-size: 26px;
          font-weight: 700;
          color: #263238;
          letter-spacing: -0.03em;
          margin-bottom: 8px;
        }
        .login-header p {
          font-size: 14px;
          color: #607D8B;
        }

        /* Glassmorphic Card */
        .login-card {
          width: 100%;
          background: #FFFFFF;
          border: 1px solid #E2E8F0;
          border-radius: 16px;
          padding: 32px;
          box-shadow: 0 20px 40px rgba(15, 23, 42, 0.06), 0 1px 3px rgba(15, 23, 42, 0.05);
        }

        /* Tabs */
        .lf-tabs {
          display: flex;
          position: relative;
          background: #F1F5F9;
          border-radius: 10px;
          padding: 4px;
          width: 100%;
          margin-bottom: 32px;
          border: 1px solid #E2E8F0;
        }
        .lf-tabs-slider {
          position: absolute;
          width: calc(50% - 4px);
          height: calc(100% - 8px);
          background: #FFFFFF;
          border: 1px solid rgba(15, 23, 42, 0.04);
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(15, 23, 42, 0.05);
          transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .lf-tab {
          flex: 1;
          padding: 10px 12px;
          border: none;
          background: transparent;
          font-size: 13px;
          font-weight: 600;
          color: #607D8B;
          cursor: pointer;
          position: relative;
          z-index: 10;
          font-family: inherit;
          transition: color 0.2s;
        }
        .lf-tab.active { color: #263238; }

        /* Alerts */
        .lf-alert {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 12px 14px;
          border-radius: 10px;
          margin-bottom: 24px;
          font-size: 13px;
          font-weight: 500;
        }
        .lf-alert-error {
          background: #FEF2F2;
          border: 1px solid #FEE2E2;
          color: #B91C1C;
        }
        .lf-alert-success {
          background: #F0FDF4;
          border: 1px solid #DCFCE7;
          color: #15803D;
        }
        .lf-alert-icon { display: flex; flex-shrink: 0; }

        /* Form */
        .lf-form {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }
        .lf-field {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .label-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .lf-field label {
          font-size: 13px;
          font-weight: 600;
          color: #607D8B;
        }
        .lf-field input {
          padding: 12px 16px;
          border-radius: 10px;
          border: 1.5px solid #E2E8F0;
          font-size: 14px;
          font-family: inherit;
          color: #000000;
          background: #FFFFFF;
          transition: all 0.2s;
          outline: none;
        }
        .lf-field input::placeholder { color: #94A3B8; }
        .lf-field input:focus {
          border-color: #000000;
          box-shadow: 0 0 0 4px rgba(211, 255, 233, 0.1);
        }

        /* Button */
        .btn-primary {
          padding: 14px;
          background: #D3FFE9;
          border: 1px solid #D3FFE9;
          border-radius: 10px;
          font-size: 14px;
          font-weight: 600;
          color: #000000;
          cursor: pointer;
          transition: all 0.2s;
          margin-top: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 12px rgba(211, 255, 233, 0.2);
        }
        .btn-primary:hover:not(:disabled) {
          background: linear-gradient(135deg, #D3FFE9, #D3FFE9);
          border-color: #000000;
          transform: translateY(-1px);
          box-shadow: 0 6px 16px rgba(211, 255, 233, 0.3);
        }
        .btn-primary:active:not(:disabled) { transform: translateY(1px); }
        .btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }

        .lf-spinner {
          width: 18px;
          height: 18px;
          border: 2px solid rgba(255,255,255,0.3);
          border-top-color: #000000;
          border-radius: 50%;
          animation: spin 0.6s linear infinite;
        }

        /* Footer */
        .login-footer {
          margin-top: 24px;
          text-align: center;
        }
        .login-footer p {
          font-size: 13px;
          color: #607D8B;
        }
        .login-footer button {
          background: none;
          border: none;
          color: #000000;
          font-weight: 600;
          cursor: pointer;
          font-size: 13px;
          font-family: inherit;
          transition: color 0.2s;
          margin-left: 4px;
        }
        .login-footer button:hover { color: #1D4ED8; text-decoration: underline; }
      `}</style>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: '100vh', background: '#F7F7F7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: 24, height: 24, borderRadius: '50%', border: '2.5px solid #EEEEEE', borderTopColor: '#000000', animation: 'spin 0.6s linear infinite' }} />
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}
