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
        <header className="topbar" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 32px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 6, height: 6, background: '#393E46', borderRadius: 2 }}></div>
            <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase', color: '#929AAB' }}>
              {session?.user?.institutionName?.toUpperCase() || "ADMINISTRATION PANEL"}
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ textAlign: 'right' }}>
              <p style={{ fontSize: 13, fontWeight: 600, color: '#222831', margin: 0 }}>{session?.user?.name || "User"}</p>
              <p style={{ fontSize: 10, color: '#929AAB', margin: 0, textTransform: 'capitalize' }}>
                {session?.user?.role?.toLowerCase().replace('_', ' ') || "Guest"}
                {session?.user?.institutionName && ` / ${session.user.institutionName}`}
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
                color: '#393E46',
                border: '1px solid rgba(57,62,70,0.08)',
                cursor: 'pointer',
                transition: 'all 0.18s',
              }}
            >
              {userInitials}
            </button>
          </div>
        </header>

        <main className="main-content" style={{ padding: '0 32px 32px 32px', flex: 1, overflowY: 'auto', overflowX: 'hidden', width: '100%' }}>
          {children}
        </main>
      </div>
    </div>
  );
}
