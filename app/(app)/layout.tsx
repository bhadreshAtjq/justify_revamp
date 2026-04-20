"use client";

import Sidebar from "@/components/Sidebar";
import { usePathname } from "next/navigation";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const title = pathname === "/dashboard" ? "University Dashboard" : "Verification Portal";

  return (
    <div className="app-shell">
      <Sidebar />
      <div className="main-wrapper">
        <header className="topbar">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: 12, height: 12, borderRadius: 2, background: '#609966' }}></div>
            <h2 style={{ fontSize: 16, textTransform: 'uppercase', letterSpacing: 1 }}>{title}</h2>
          </div>
          
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 16 }}>
             <div style={{ textAlign: 'right' }}>
               <p style={{ fontSize: 13, fontWeight: 700 }}>Admin Portal</p>
               <p style={{ fontSize: 10, opacity: 0.5 }}>Network: Mainnet</p>
             </div>
             <div style={{ width: 40, height: 40, borderRadius: 12, background: '#9DC08B', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, color: '#40513B' }}>
               A
             </div>
          </div>
        </header>
        <main className="main-content">
          {children}
        </main>
      </div>
    </div>
  );
}
