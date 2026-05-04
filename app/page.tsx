"use client";

import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";

export default function HomePage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (status === "authenticated") {
      router.push("/dashboard");
    }
  }, [status, router]);

  if (status === "loading" || !mounted) {
    return (
      <div style={{
        minHeight: '100vh', background: '#F7F7F7',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <div style={{ width: 24, height: 24, borderRadius: '50%', border: '2.5px solid #EEEEEE', borderTopColor: '#393E46', animation: 'spin 0.6s linear infinite' }} />
      </div>
    );
  }

  return (
    <div className="homepage">
      {/* Decorative grid bg */}
      <div className="hp-grid-bg" />

      {/* Navigation */}
      <nav className="hp-nav">
        <div className="hp-nav-logo">
          <div className="hp-logo-mark">J</div>
          <span>JustifAI</span>
        </div>
        <div className="hp-nav-links">
          <button onClick={() => router.push("/login")} className="hp-btn-ghost">
            Sign In
          </button>
          <button onClick={() => router.push("/login?role=verifier")} className="hp-btn-solid">
            Get Started
          </button>
        </div>
      </nav>

      {/* Hero */}
      <section className="hp-hero">
        <div className="hp-hero-badge">
          <div className="hp-badge-dot" />
          BLOCKCHAIN-ANCHORED VERIFICATION
        </div>
        <h1 className="hp-hero-title">
          Academic Credentials,<br />
          <span className="hp-hero-accent">Immutably Verified.</span>
        </h1>
        <p className="hp-hero-sub">
          A zero-trust verification layer for marksheets, certificates, and transcripts.
          Anchored on-chain. Tamper-proof by design.
        </p>
      </section>

      {/* Role Cards */}
      <section className="hp-roles">
        <div className="hp-role-card hp-role-institute" onClick={() => router.push("/login")}>
          <div className="hp-role-icon">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 21h18" />
              <path d="M5 21V7l7-4 7 4v14" />
              <path d="M9 21v-6h6v6" />
              <path d="M10 10h.01" />
              <path d="M14 10h.01" />
            </svg>
          </div>
          <div className="hp-role-label">INSTITUTION</div>
          <h2 className="hp-role-title">Issue & Anchor</h2>
          <p className="hp-role-desc">
            Upload academic records in bulk, generate Merkle proofs,
            and anchor them to the public blockchain for immutable verification.
          </p>
          <div className="hp-role-features">
            <div className="hp-feature-item">
              <div className="hp-feature-dot" />
              Bulk CSV Ingestion
            </div>
            <div className="hp-feature-item">
              <div className="hp-feature-dot" />
              Merkle Tree Construction
            </div>
            <div className="hp-feature-item">
              <div className="hp-feature-dot" />
              On-Chain Anchoring
            </div>
            <div className="hp-feature-item">
              <div className="hp-feature-dot" />
              Marksheet Preview & PDF
            </div>
          </div>
          <div className="hp-role-action">
            Sign In as Institution
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14" /><path d="m12 5 7 7-7 7" />
            </svg>
          </div>
        </div>

        <div className="hp-role-card hp-role-verifier" onClick={() => router.push("/login?role=verifier")}>
          <div className="hp-role-icon">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              <path d="m9 12 2 2 4-4" />
            </svg>
          </div>
          <div className="hp-role-label">VERIFIER</div>
          <h2 className="hp-role-title">Authenticate & Validate</h2>
          <p className="hp-role-desc">
            Upload a scanned document to verify its authenticity against
            the blockchain ledger. No institutional access required.
          </p>
          <div className="hp-role-features">
            <div className="hp-feature-item">
              <div className="hp-feature-dot" />
              Document OCR Scanning
            </div>
            <div className="hp-feature-item">
              <div className="hp-feature-dot" />
              Keccak256 Hash Generation
            </div>
            <div className="hp-feature-item">
              <div className="hp-feature-dot" />
              Blockchain Cross-Check
            </div>
            <div className="hp-feature-item">
              <div className="hp-feature-dot" />
              Instant Verification Result
            </div>
          </div>
          <div className="hp-role-action">
            Start Verification
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14" /><path d="m12 5 7 7-7 7" />
            </svg>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="hp-process">
        <div className="hp-section-meta">HOW IT WORKS</div>
        <div className="hp-steps">
          <div className="hp-step">
            <div className="hp-step-num">01</div>
            <h3>Ingest</h3>
            <p>Institutions upload academic data via CSV. Each record is hashed using Keccak256.</p>
          </div>
          <div className="hp-step-connector" />
          <div className="hp-step">
            <div className="hp-step-num">02</div>
            <h3>Anchor</h3>
            <p>Hashes are assembled into a Merkle Tree. The root is anchored on the Polygon blockchain.</p>
          </div>
          <div className="hp-step-connector" />
          <div className="hp-step">
            <div className="hp-step-num">03</div>
            <h3>Verify</h3>
            <p>Anyone can scan a document. The system regenerates its hash and checks the blockchain.</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="hp-footer">
        <div className="hp-footer-left">
          <div className="hp-logo-mark" style={{ width: 28, height: 28, fontSize: 12 }}>J</div>
          <span style={{ fontSize: 12, color: '#929AAB' }}>JustifAI v1.2</span>
        </div>
        <p style={{ fontSize: 11, color: '#929AAB', opacity: 0.6 }}>
          Zero-Trust Academic Verification Layer
        </p>
      </footer>

      <style jsx>{`
        .homepage {
          min-height: 100vh;
          background: #F7F7F7;
          font-family: 'Inter', -apple-system, sans-serif;
          position: relative;
          overflow-x: hidden;
        }

        .hp-grid-bg {
          position: fixed;
          inset: 0;
          background-image:
            linear-gradient(rgba(57,62,70,0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(57,62,70,0.03) 1px, transparent 1px);
          background-size: 60px 60px;
          pointer-events: none;
          z-index: 0;
        }

        /* Nav */
        .hp-nav {
          position: relative;
          z-index: 10;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 20px 48px;
          max-width: 1200px;
          margin: 0 auto;
        }
        .hp-nav-logo {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 16px;
          font-weight: 700;
          color: #222831;
          letter-spacing: -0.3px;
        }
        .hp-logo-mark {
          width: 34px;
          height: 34px;
          background: #393E46;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #F7F7F7;
          font-weight: 800;
          font-size: 14px;
        }
        .hp-nav-links {
          display: flex;
          gap: 10px;
        }
        .hp-btn-ghost {
          padding: 9px 20px;
          background: none;
          border: 1.5px solid rgba(57,62,70,0.12);
          border-radius: 8px;
          font-size: 13px;
          font-weight: 600;
          color: #393E46;
          cursor: pointer;
          transition: all 0.18s;
          font-family: inherit;
        }
        .hp-btn-ghost:hover {
          border-color: #393E46;
          background: rgba(57,62,70,0.03);
        }
        .hp-btn-solid {
          padding: 9px 20px;
          background: #393E46;
          border: 1.5px solid #393E46;
          border-radius: 8px;
          font-size: 13px;
          font-weight: 600;
          color: #F7F7F7;
          cursor: pointer;
          transition: all 0.18s;
          font-family: inherit;
        }
        .hp-btn-solid:hover {
          background: #2c3038;
          transform: translateY(-1px);
          box-shadow: 0 4px 14px rgba(57,62,70,0.18);
        }

        /* Hero */
        .hp-hero {
          position: relative;
          z-index: 1;
          text-align: center;
          padding: 60px 48px 40px;
          max-width: 780px;
          margin: 0 auto;
        }
        .hp-hero-badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 6px 16px;
          background: #FFFFFF;
          border: 1px solid rgba(57,62,70,0.08);
          border-radius: 100px;
          font-size: 10px;
          font-weight: 700;
          color: #929AAB;
          letter-spacing: 1.8px;
          margin-bottom: 28px;
        }
        .hp-badge-dot {
          width: 6px;
          height: 6px;
          background: #393E46;
          border-radius: 50%;
          animation: pulseSoft 2s infinite;
        }
        .hp-hero-title {
          font-size: 48px;
          font-weight: 700;
          color: #222831;
          letter-spacing: -1.5px;
          line-height: 1.15;
          margin-bottom: 20px;
        }
        .hp-hero-accent {
          background: linear-gradient(135deg, #393E46, #929AAB);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .hp-hero-sub {
          font-size: 16px;
          color: #929AAB;
          line-height: 1.7;
          max-width: 520px;
          margin: 0 auto;
        }

        /* Role cards */
        .hp-roles {
          position: relative;
          z-index: 1;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 24px;
          max-width: 900px;
          margin: 0 auto;
          padding: 20px 48px 60px;
        }
        .hp-role-card {
          background: #FFFFFF;
          border-radius: 16px;
          border: 1.5px solid rgba(57,62,70,0.06);
          padding: 36px 32px 28px;
          cursor: pointer;
          transition: all 0.28s ease;
          position: relative;
          overflow: hidden;
        }
        .hp-role-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 3px;
          background: #393E46;
          transform: scaleX(0);
          transition: transform 0.3s ease;
          transform-origin: left;
        }
        .hp-role-card:hover::before {
          transform: scaleX(1);
        }
        .hp-role-card:hover {
          border-color: rgba(57,62,70,0.15);
          box-shadow: 0 12px 40px rgba(57,62,70,0.08);
          transform: translateY(-4px);
        }
        .hp-role-icon {
          width: 52px;
          height: 52px;
          background: #F7F7F7;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #393E46;
          margin-bottom: 20px;
          transition: all 0.28s;
        }
        .hp-role-card:hover .hp-role-icon {
          background: #393E46;
          color: #F7F7F7;
        }
        .hp-role-label {
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 2px;
          color: #929AAB;
          margin-bottom: 8px;
        }
        .hp-role-title {
          font-size: 22px;
          font-weight: 700;
          color: #222831;
          letter-spacing: -0.4px;
          margin-bottom: 10px;
        }
        .hp-role-desc {
          font-size: 13px;
          color: #929AAB;
          line-height: 1.7;
          margin-bottom: 20px;
        }
        .hp-role-features {
          display: flex;
          flex-direction: column;
          gap: 8px;
          margin-bottom: 24px;
        }
        .hp-feature-item {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 12px;
          color: #393E46;
          font-weight: 500;
        }
        .hp-feature-dot {
          width: 4px;
          height: 4px;
          background: #929AAB;
          border-radius: 50%;
          flex-shrink: 0;
        }
        .hp-role-action {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 13px;
          font-weight: 600;
          color: #393E46;
          padding-top: 20px;
          border-top: 1px solid rgba(57,62,70,0.06);
          transition: gap 0.2s;
        }
        .hp-role-card:hover .hp-role-action {
          gap: 12px;
        }

        /* Process */
        .hp-process {
          position: relative;
          z-index: 1;
          max-width: 900px;
          margin: 0 auto;
          padding: 40px 48px 60px;
          text-align: center;
        }
        .hp-section-meta {
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 2.5px;
          color: #929AAB;
          margin-bottom: 32px;
        }
        .hp-steps {
          display: flex;
          align-items: flex-start;
          justify-content: center;
          gap: 0;
        }
        .hp-step {
          flex: 1;
          max-width: 240px;
          padding: 0 16px;
        }
        .hp-step-num {
          font-size: 32px;
          font-weight: 700;
          color: #EEEEEE;
          margin-bottom: 12px;
          font-family: 'JetBrains Mono', monospace;
        }
        .hp-step h3 {
          font-size: 16px;
          font-weight: 700;
          color: #222831;
          margin-bottom: 8px;
        }
        .hp-step p {
          font-size: 13px;
          color: #929AAB;
          line-height: 1.6;
        }
        .hp-step-connector {
          width: 40px;
          height: 1px;
          background: #EEEEEE;
          margin-top: 24px;
          flex-shrink: 0;
        }

        /* Footer */
        .hp-footer {
          position: relative;
          z-index: 1;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 24px 48px;
          border-top: 1px solid rgba(57,62,70,0.06);
          max-width: 1200px;
          margin: 0 auto;
        }
        .hp-footer-left {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        @keyframes pulseSoft {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        @media (max-width: 768px) {
          .hp-nav { padding: 16px 20px; }
          .hp-hero { padding: 40px 20px 24px; }
          .hp-hero-title { font-size: 32px; }
          .hp-roles {
            grid-template-columns: 1fr;
            padding: 16px 20px 40px;
          }
          .hp-steps { flex-direction: column; align-items: center; gap: 24px; }
          .hp-step-connector { width: 1px; height: 24px; }
          .hp-process { padding: 24px 20px 40px; }
          .hp-footer { padding: 20px; flex-direction: column; gap: 10px; }
        }
      `}</style>
    </div>
  );
}
