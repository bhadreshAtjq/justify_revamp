"use client";

import Sidebar from "@/components/Sidebar";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session } = useSession();
  
  const userInitials = session?.user?.name
    ? session.user.name.split(" ").map(n => n[0]).join("").toUpperCase()
    : session?.user?.email?.[0].toUpperCase() || "U";

  return (
    <div className="app-shell">
      <Sidebar />
      <div className="main-wrapper">
        <header className="topbar" style={{ height: 80, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 32px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 12, height: 12, background: '#609966', borderRadius: 2 }}></div>
            <div className="section-meta" style={{ letterSpacing: 2 }}>{session?.user?.institutionName?.toUpperCase() || "ADMINISTRATION PANEL"}</div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
             <div style={{ textAlign: 'right' }}>
               <p style={{ fontSize: 13, fontWeight: 700 }}>{session?.user?.name || "User"}</p>
               <p style={{ fontSize: 10, opacity: 0.5, textTransform: 'capitalize' }}>
                 Role: {session?.user?.role?.toLowerCase().replace('_', ' ') || "Guest"}
                 {session?.user?.institutionName && ` | ${session.user.institutionName}`}
               </p>
             </div>
             <button 
               onClick={() => signOut()}
               title="Sign Out"
               style={{ 
                 width: 40, 
                 height: 40, 
                 borderRadius: 12, 
                 background: '#9DC08B', 
                 display: 'flex', 
                 alignItems: 'center', 
                 justifyContent: 'center', 
                 fontWeight: 900, 
                 color: '#40513B',
                 border: 'none',
                 cursor: 'pointer'
               }}
             >
               {userInitials}
             </button>
          </div>
        </header>

        <main className="main-content" style={{ padding: '0 32px 32px 32px', flex: 1, overflowY: 'auto' }}>
          {children}
        </main>
      </div>
    </div>
  );
}
