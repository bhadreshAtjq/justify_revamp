"use client";

import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import Image from "next/image";
import logoImg from "@/app/assetes/image/logo.png";

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
        minHeight: '100vh', background: '#FFFFFF',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <div style={{ width: 24, height: 24, borderRadius: '50%', border: '2.5px solid #EAEAEA', borderTopColor: '#000000', animation: 'spin 0.6s linear infinite' }} />
      </div>
    );
  }

  return (
    <div className="homepage">
      {/* Background with soft blue gradients and grid */}
      <div className="bg-gradients">
        <div className="bg-glow bg-glow-top-left" />
        <div className="bg-glow bg-glow-bottom-right" />
      </div>
      <div className="bg-grid" />
      
      {/* Floating AI Shapes */}
      <div className="floating-shape shape-1">
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#D3FFE9" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" opacity="0.2">
          <polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/>
        </svg>
      </div>
      <div className="floating-shape shape-2">
         <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="#D3FFE9" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" opacity="0.15">
           <circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>
         </svg>
      </div>
      <div className="floating-shape shape-3">
         <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#D3FFE9" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.2">
           <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="21" x2="9" y2="9"/>
         </svg>
      </div>

      {/* Navigation */}
      <header className="hp-nav-wrapper">
        <nav className="hp-nav">
          <div className="hp-nav-logo" style={{ display: 'flex', alignItems: 'center', gap: 0 }}>
            <Image src={logoImg} alt="JustifAI Logo" style={{ height: '72px', width: 'auto', objectFit: 'contain' }} priority />
            <div style={{ display: 'flex', flexDirection: 'column', marginLeft: '12px' }}>
              <span style={{ fontSize: '24px', fontWeight: 600, color: '#000000', letterSpacing: '-0.02em', whiteSpace: 'nowrap', lineHeight: 1.1 }}>JustifAI Platform</span>
              <span style={{ fontSize: '13px', fontWeight: 500, color: '#455A64', whiteSpace: 'nowrap', marginTop: '2px' }}>A state of the art decentralized validation network</span>
            </div>
          </div>
          <div className="hp-nav-links">
            <button onClick={() => router.push("/login")} className="hp-btn-ghost">
              Sign In
            </button>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="hp-hero-section">
        <div className="hp-hero-left">
          <h1 className="hp-hero-title animate-in delay-1">
            Transform Education with AI
          </h1>
          <p className="hp-hero-sub animate-in delay-2">
            Smart admissions, student management, attendance, results, analytics, and AI-powered insights—all in one platform.
          </p>
          <div className="hp-hero-actions animate-in delay-3">
            <button className="btn-primary" onClick={() => router.push("/login")}>
              Get Started
            </button>
            <button className="btn-secondary" onClick={() => router.push("/login?role=verifier")}>
              Verify
            </button>
          </div>
        </div>
        
        <div className="hp-hero-right animate-in delay-4">
          <div className="mockup-container">
            <div className="mockup-sidebar">
              <div className="ms-icon active">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>
              </div>
              <div className="ms-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
              </div>
              <div className="ms-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>
              </div>
            </div>
            <div className="mockup-main">
              <div className="mockup-header">
                <div className="mockup-skeleton-title" />
              </div>
              <div className="mockup-body">
                {/* Analytics Cards */}
                <div className="mockup-grid">
                  <div className="mockup-card floating-card anim-float-1">
                    <div className="mc-icon attendance-icon">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><polyline points="16 11 18 13 22 9"/></svg>
                    </div>
                    <div className="mc-label">Attendance</div>
                    <div className="mc-bar" />
                  </div>
                  <div className="mockup-card floating-card anim-float-2">
                    <div className="mc-icon results-icon">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
                    </div>
                    <div className="mc-label">Results</div>
                    <div className="mc-line anim-line-1" />
                    <div className="mc-line short anim-line-2" />
                  </div>
                  <div className="mockup-card floating-card anim-float-3">
                    <div className="mc-icon ai-icon">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>
                    </div>
                    <div className="mc-label">AI Recommendations</div>
                    <div className="mc-line anim-line-1" />
                    <div className="mc-line short anim-line-2" />
                  </div>
                  <div className="mockup-card floating-card anim-float-4">
                    <div className="mc-icon notif-icon">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
                    </div>
                    <div className="mc-label">Notifications</div>
                    <div className="mc-line anim-line-3" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trusted by Institutes */}
      <section className="hp-section hp-trusted">
        <h3 className="section-subtitle animate-in delay-5">Trusted by Institutes</h3>
        <div className="trusted-logos animate-in delay-5">
           {/* Gray placeholders for logos to avoid fake data */}
           <div className="logo-placeholder" />
           <div className="logo-placeholder" />
           <div className="logo-placeholder" />
           <div className="logo-placeholder" />
           <div className="logo-placeholder" />
        </div>
      </section>

      {/* AI Features */}
      <section className="hp-section hp-features">
        <h2 className="section-title">Platform Features</h2>
        <div className="features-grid">
           <div className="feature-block animate-in delay-6">
             <div className="feature-icon bg-blue-50">
               <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#000000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
             </div>
             <h4 className="feature-title">Smart Admissions</h4>
             <p className="feature-desc">Streamline the enrollment process and manage student records efficiently from day one.</p>
           </div>
           <div className="feature-block animate-in delay-7">
             <div className="feature-icon bg-blue-50">
               <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#000000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
             </div>
             <h4 className="feature-title">Attendance & Results</h4>
             <p className="feature-desc">Automate tracking of student attendance and academic results with secure data management.</p>
           </div>
           <div className="feature-block animate-in delay-8">
             <div className="feature-icon bg-blue-50">
               <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#000000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
             </div>
             <h4 className="feature-title">AI-Powered Insights</h4>
             <p className="feature-desc">Generate actionable analytics and intelligent recommendations to improve institutional outcomes.</p>
           </div>
        </div>
      </section>
      
      <footer className="hp-footer">
        <div className="hp-topbar-content">
          <div className="hp-brand">Junagadh Agricultural University</div>
        </div>
      </footer>

      <style jsx>{`
        .homepage {
          min-height: 100vh;
          background: #FFFFFF;
          font-family: 'Inter', -apple-system, sans-serif;
          position: relative;
          overflow-x: hidden;
          color: #000000;
        }

        /* Animations */
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @keyframes floatSlow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        @keyframes floatFast {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-15px); }
        }
        @keyframes gridPan {
          0% { transform: translateY(0); }
          100% { transform: translateY(40px); }
        }
        @keyframes pulsePlaceholder {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 0.6; }
        }
        @keyframes growBar {
          0% { width: 0%; opacity: 0; }
          100% { width: 80%; opacity: 1; }
        }
        @keyframes pulseDot {
          0%, 100% { transform: scale(1); opacity: 0.4; background: #E2E8F0; }
          50% { transform: scale(1.25); opacity: 1; background: #D3FFE9; }
        }
        @keyframes stretchLine {
          0% { width: 0%; opacity: 0; }
          100% { width: var(--target-width, 100%); opacity: 1; }
        }

        .animate-in {
          opacity: 0;
          animation: fadeInUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .delay-1 { animation-delay: 0.1s; }
        .delay-2 { animation-delay: 0.2s; }
        .delay-3 { animation-delay: 0.3s; }
        .delay-4 { animation-delay: 0.4s; }
        .delay-5 { animation-delay: 0.5s; }
        .delay-6 { animation-delay: 0.6s; }
        .delay-7 { animation-delay: 0.7s; }
        .delay-8 { animation-delay: 0.8s; }

        /* Background */
        .bg-gradients {
          position: fixed;
          inset: 0;
          z-index: 0;
          overflow: hidden;
          pointer-events: none;
        }
        .bg-glow {
          position: absolute;
          filter: blur(120px);
          opacity: 0.6;
          border-radius: 50%;
        }
        .bg-glow-top-left {
          width: 600px;
          height: 600px;
          background: rgba(191, 219, 254, 0.7); /* soft blue */
          top: -200px;
          left: -200px;
        }
        .bg-glow-bottom-right {
          width: 500px;
          height: 500px;
          background: rgba(219, 234, 254, 0.6);
          bottom: -100px;
          right: -150px;
        }

        .bg-grid {
          position: fixed;
          inset: -40px 0 0 0;
          z-index: 0;
          pointer-events: none;
          background-image: linear-gradient(rgba(15, 23, 42, 0.03) 1px, transparent 1px),
                            linear-gradient(90deg, rgba(15, 23, 42, 0.03) 1px, transparent 1px);
          background-size: 40px 40px;
          mask-image: linear-gradient(to bottom, white 30%, transparent 100%);
          -webkit-mask-image: linear-gradient(to bottom, white 30%, transparent 100%);
          animation: gridPan 15s linear infinite;
        }

        /* Floating AI Shapes */
        .floating-shape {
          position: absolute;
          z-index: 0;
          pointer-events: none;
        }
        .shape-1 { top: 15%; left: 10%; animation: floatSlow 8s infinite ease-in-out; }
        .shape-2 { top: 60%; left: 5%; animation: floatFast 12s infinite ease-in-out; }
        .shape-3 { top: 20%; right: 40%; animation: floatSlow 10s infinite ease-in-out alternate; }

        /* Nav */
        .hp-nav-wrapper {
          position: relative;
          z-index: 100;
          background: rgba(255, 255, 255, 0.8);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border-bottom: 1px solid rgba(0, 0, 0, 0.05);
        }
        .hp-nav {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 16px 48px;
          max-width: 1200px;
          margin: 0 auto;
        }
        .hp-nav-logo {
          display: flex;
          align-items: center;
          gap: 12px;
          font-size: 18px;
          font-weight: 700;
          color: #000000;
          letter-spacing: -0.02em;
        }
        .hp-logo-mark {
          width: 32px;
          height: 32px;
          background: #D3FFE9;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #FFF;
          font-weight: 700;
          font-size: 14px;
        }
        .hp-nav-links {
          display: flex;
          align-items: center;
          gap: 16px;
        }
        .hp-btn-ghost {
          background: #D3FFE9;
          border: 1px solid #D3FFE9;
          border-top-color: #60A5FA;
          font-size: 14px;
          font-weight: 600;
          color: #000000;
          cursor: pointer;
          transition: all 0.3s ease;
          padding: 8px 20px;
          border-radius: 8px;
          box-shadow: 0 4px 12px rgba(211, 255, 233, 0.3), inset 0 1px 1px rgba(255, 255, 255, 0.4);
        }
        .hp-btn-ghost:hover {
          background: linear-gradient(135deg, #D3FFE9, #D3FFE9);
          border-color: #007B3E;
          box-shadow: 0 4px 12px rgba(211, 255, 233, 0.4), 0 0 20px rgba(211, 255, 233, 0.5);
          transform: translateY(-1px);
        }

        /* Hero */
        .hp-hero-section {
          position: relative;
          z-index: 10;
          display: flex;
          align-items: center;
          gap: 64px;
          max-width: 1200px;
          margin: 0 auto;
          padding: 100px 48px;
        }
        .hp-hero-left {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 24px;
        }
        .hp-hero-title {
          font-size: 64px;
          font-weight: 800;
          color: #263238;
          letter-spacing: -0.04em;
          line-height: 1.1;
        }
        .hp-hero-sub {
          font-size: 20px;
          color: #475569;
          line-height: 1.6;
          font-weight: 400;
          max-width: 500px;
        }
        .hp-hero-actions {
          display: flex;
          align-items: center;
          gap: 16px;
          margin-top: 16px;
        }
        .btn-primary {
          padding: 12px 28px;
          background: #D3FFE9;
          border: 1px solid #D3FFE9;
          border-radius: 8px;
          font-size: 15px;
          font-weight: 600;
          color: #000000;
          cursor: pointer;
          transition: all 0.2s;
          box-shadow: 0 4px 12px rgba(211, 255, 233, 0.2);
          position: relative;
          overflow: hidden;
        }
        .btn-primary::after {
          content: '';
          position: absolute;
          top: -50%;
          left: -50%;
          width: 200%;
          height: 200%;
          background: linear-gradient(45deg, transparent, rgba(255,255,255,0.2), transparent);
          transform: rotate(45deg) translateY(-100%);
          transition: transform 0.6s ease;
        }
        .btn-primary:hover::after {
          transform: rotate(45deg) translateY(100%);
        }
        .btn-primary:hover {
          background: linear-gradient(135deg, #D3FFE9, #D3FFE9);
          border-color: #007B3E;
          transform: translateY(-2px);
          box-shadow: 0 6px 16px rgba(211, 255, 233, 0.3);
        }
        .btn-primary:active {
          transform: translateY(1px) scale(0.96);
        }
        
        .btn-secondary {
          padding: 12px 28px;
          background: #FFFFFF;
          border: 1.5px solid #D3FFE9;
          border-radius: 8px;
          font-size: 15px;
          font-weight: 600;
          color: #000000;
          cursor: pointer;
          transition: all 0.2s;
        }
        .btn-secondary:hover {
          background: #E6F5F6;
          border-color: #007B3E;
          transform: translateY(-2px);
        }
        .btn-secondary:active {
          transform: translateY(1px) scale(0.96);
        }

        /* Hero Right - Mockup */
        .hp-hero-right {
          flex: 1;
          position: relative;
        }
        .mockup-container {
          background: rgba(255, 255, 255, 0.8);
          backdrop-filter: blur(20px);
          border: 1px solid #007B3E;
          border-radius: 20px;
          box-shadow: 0 20px 40px rgba(15, 23, 42, 0.08), 0 0 0 1px rgba(15, 23, 42, 0.05);
          display: flex;
          min-height: 440px;
          height: auto;
          overflow: hidden;
          position: relative;
        }
        .mockup-sidebar {
          width: 80px;
          background: #D3FFE9;
          position: relative;
          display: flex;
          flex-direction: column;
          align-items: center;
          padding-top: 24px;
          gap: 24px;
        }
        .ms-icon {
          width: 32px;
          height: 32px;
          border-radius: 8px;
          background: rgba(0, 0, 0, 0.03);
          color: rgba(0, 0, 0, 0.4);
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .ms-icon.active {
  background: #FFFFFF;
  color: #000000;
  box-shadow: 0 2px 4px rgba(0,0,0,0.04);
}
        .mockup-main {
          flex: 1;
          display: flex;
          flex-direction: column;
          padding: 24px;
        }
        .mockup-header {
          display: flex;
          justify-content: space-between;
          margin-bottom: 32px;
        }
        .mockup-skeleton-title {
          width: 120px;
          height: 16px;
          background: #CBD5E1; /* Darkened from E2E8F0 */
          border-radius: 4px;
        }
        .mockup-body {
          flex: 1;
        }
        .mockup-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
          gap: 16px;
        }
        
        .mockup-card {
          background: #FFFFFF;
          border: 1px solid #D3FFE9;
          border-radius: 12px;
          padding: 16px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
          transition: transform 0.3s;
        }
        .floating-card:hover {
          transform: translateY(-8px) scale(1.05);
          box-shadow: 0 15px 30px rgba(15, 23, 42, 0.15);
          border-color: #007B3E;
          z-index: 10;
        }
        .mc-icon {
          width: 32px;
          height: 32px;
          border-radius: 8px;
          margin-bottom: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .attendance-icon { background: rgba(211, 255, 233, 0.2); color: #3b82f6; }
        .results-icon { background: rgba(16, 185, 129, 0.2); color: #000000; }
        .ai-icon { background: rgba(139, 92, 246, 0.2); color: #8B5CF6; }
        .notif-icon { background: rgba(251, 140, 0, 0.2); color: #FB8C00; }

        .mc-label {
          font-size: 11px;
          font-weight: 600;
          color: #263238;
          margin-bottom: 8px;
        }
        .mc-bar {
          height: 8px;
          background: #D3FFE9;
          border-radius: 4px;
          width: 0%;
          animation: growBar 1.2s ease-out 1s forwards;
        }
        .mc-line {
          height: 4px;
          background: #D3FFE9;
          border-radius: 2px;
          margin-bottom: 6px;
          width: 0%;
        }
        .anim-line-1 { --target-width: 100%; animation: stretchLine 0.8s ease-out 1.2s forwards; }
        .anim-line-2 { --target-width: 60%; animation: stretchLine 0.8s ease-out 1.4s forwards; }
        .anim-line-3 { --target-width: 90%; animation: stretchLine 0.8s ease-out 1.6s forwards; }
        
        .anim-float-1 { animation: floatSlow 6s infinite ease-in-out; }
        .anim-float-2 { animation: floatSlow 7s infinite ease-in-out reverse; }
        .anim-float-3 { animation: floatFast 8s infinite ease-in-out; }
        .anim-float-4 { animation: floatFast 9s infinite ease-in-out reverse; }

        /* Sections */
        .hp-section {
          position: relative;
          z-index: 10;
          max-width: 1200px;
          margin: 0 auto;
          padding: 60px 48px;
        }
        .hp-trusted {
          text-align: center;
          padding-top: 20px;
          padding-bottom: 0px;
        }
        .section-subtitle {
          font-size: 14px;
          font-weight: 600;
          color: #94A3B8;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          margin-bottom: 32px;
        }
        .trusted-logos {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 48px;
          flex-wrap: wrap;
        }
        .logo-placeholder {
          width: 120px;
          height: 40px;
          background: #F1F5F9;
          border-radius: 6px;
          animation: pulsePlaceholder 3s infinite ease-in-out;
        }
        .logo-placeholder:nth-child(odd) { animation-delay: 1.5s; }

        .hp-features {
          padding-top: 20px;
          padding-bottom: 120px;
        }
        .section-title {
          font-size: 36px;
          font-weight: 800;
          color: #263238;
          text-align: center;
          margin-bottom: 48px;
          letter-spacing: -0.02em;
        }
        .features-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 24px;
        }
        .feature-block {
          background: #FFFFFF;
          border: 1px solid #E2E8F0;
          border-radius: 16px;
          padding: 32px;
          box-shadow: 0 4px 6px rgba(15, 23, 42, 0.02);
          transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.4s cubic-bezier(0.16, 1, 0.3, 1), border-color 0.4s ease;
        }
        .feature-block:hover {
          transform: translateY(-8px) scale(1.02);
          box-shadow: 0 20px 40px rgba(15, 23, 42, 0.08);
          border-color: #007B3E;
        }
        .feature-block:hover .feature-icon svg {
          transform: scale(1.15) rotate(5deg);
        }
        .feature-icon {
          width: 48px;
          height: 48px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 24px;
        }
        .feature-icon svg {
          transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .bg-blue-50 { background: #D3FFE9; }
        
        .feature-title {
          font-size: 20px;
          font-weight: 700;
          color: #263238;
          margin-bottom: 12px;
        }
        .feature-desc {
          font-size: 15px;
          color: #607D8B;
          line-height: 1.6;
        }

        /* Footer */
        .hp-footer {
          position: relative;
          z-index: 10;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 32px 48px;
          border-top: 1px solid #F1F5F9;
        }
        .hp-footer-left {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 14px;
          font-weight: 600;
          color: #607D8B;
        }
        .small-logo {
          width: 20px;
          height: 20px;
          font-size: 10px;
        }

        @media (max-width: 992px) {
          .hp-nav {
            padding: 16px 24px;
          }
          .hp-hero-section {
            flex-direction: column;
            text-align: center;
            padding: 40px 24px;
            gap: 40px;
          }
          .hp-hero-title {
            font-size: 40px;
          }
          .hp-hero-actions {
            justify-content: center;
          }
          .hp-hero-sub {
            margin: 0 auto;
          }
          .hp-hero-right {
            width: 100%;
          }
          .features-grid {
            grid-template-columns: 1fr;
          }
          .hp-section {
            padding: 40px 24px;
          }
          .section-title {
            font-size: 28px;
          }
        }
      `}</style>
    </div>
  );
}
