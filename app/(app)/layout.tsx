"use client";

import { useState } from "react";
import Sidebar from "@/components/Sidebar";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import Image from "next/image";
import logoImg from "@/app/assetes/image/logo.png";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session } = useSession();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const userInitials = session?.user?.name
    ? session.user.name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)
    : session?.user?.email?.[0].toUpperCase() || "U";

  return (
    <div className="app-shell">
      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="sidebar-overlay" 
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
      
      <Sidebar isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)} />
      <div className="main-wrapper">


        <header className="topbar">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {/* Hamburger Button for Mobile */}
            <button 
              className="mobile-menu-btn"
              onClick={() => setIsMobileMenuOpen(true)}
              title="Open Menu"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="3" y1="12" x2="21" y2="12"></line>
                <line x1="3" y1="6" x2="21" y2="6"></line>
                <line x1="3" y1="18" x2="21" y2="18"></line>
              </svg>
            </button>
            <div style={{ display: 'flex', alignItems: 'center', gap: 0 }}>
              <Image src={logoImg} alt="JustifAI Logo" style={{ height: '52px', width: 'auto', objectFit: 'contain' }} priority />
              <div className="flex flex-col min-w-0 -ml-1" style={{ maxWidth: 'calc(100vw - 120px)' }}>
                <span className="text-xs sm:text-sm md:text-base font-extrabold uppercase leading-tight text-[#006064] tracking-wide" style={{ letterSpacing: '0.5px', wordWrap: 'break-word' }}>
                  JUNAGADH AGRICULTURAL UNIVERSITY
                </span>
                <span className="text-[9px] sm:text-[10px] font-semibold uppercase text-[#607D8B] leading-tight" style={{ wordWrap: 'break-word' }}>
                  A state agricultural university established under Gujarat
                </span>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div className="topbar-user">
              <p style={{ fontSize: 13, fontWeight: 600, color: '#222831', margin: 0, whiteSpace: 'nowrap' }}>
                {session?.user?.name?.replace("Krishi", "Junagadh Agricultural") || "User"}
              </p>
              <p style={{ fontSize: 10, color: '#929AAB', margin: 0, textTransform: 'capitalize', whiteSpace: 'nowrap' }}>
                {session?.user?.role?.toLowerCase().replace('_', ' ') || "Guest"}
              </p>
            </div>
            <button
              onClick={() => signOut({ callbackUrl: "/" })}
              title="Sign Out"
              style={{
                width: 36,
                height: 36,
                borderRadius: 8,
                background: '#EEEEEE',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
                fontSize: 12,
                color: '#000000',
                border: '1px solid rgba(57,62,70,0.08)',
                cursor: 'pointer',
                transition: 'all 0.18s',
              }}
            >
              {userInitials}
            </button>
          </div>
        </header>

        <main className="main-content">
          {children}
        </main>
      </div>
    </div>
  );
}
