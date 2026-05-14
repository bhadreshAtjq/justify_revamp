"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FaColumns, FaShieldAlt, FaFlask, FaBuilding, FaSignOutAlt, FaLayerGroup } from "react-icons/fa";
import { useSession, signOut } from "next-auth/react";

export default function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();

  const allItems = [
    { href: "/dashboard", label: "Dashboard", icon: FaColumns, roles: ["SUPER_ADMIN", "INSTITUTION_ADMIN", "ISSUER", "AUDITOR"] },
    { href: "/verify", label: "Verify", icon: FaShieldAlt, roles: ["SUPER_ADMIN", "INSTITUTION_ADMIN", "ISSUER", "AUDITOR", "PUBLIC_VERIFIER"] },
    { href: "/sandbox", label: "Merkle Sandbox", icon: FaFlask, roles: ["SUPER_ADMIN", "INSTITUTION_ADMIN"] },
    { href: "/bulk-ocr", label: "Bulk OCR Ingestion", icon: FaLayerGroup, roles: ["SUPER_ADMIN", "INSTITUTION_ADMIN", "ISSUER"] },
    { href: "/admin/tenants", label: "Tenants", icon: FaBuilding, roles: ["SUPER_ADMIN"] },
  ];

  const navItems = allItems.filter(item => 
    item.roles.includes(session?.user?.role || "")
  );

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <h1>JustifAI</h1>
        <p>Verification System</p>
      </div>

      <nav className="sidebar-nav">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`nav-link ${isActive ? "active" : ""}`}
            >
              <item.icon />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
      <div style={{ marginTop: 'auto', padding: '0 12px 12px 12px' }}>
        <button 
          onClick={() => signOut({ callbackUrl: "/" })}
          className="nav-link"
          style={{ width: '100%', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }}
        >
          <FaSignOutAlt />
          <span>Logout</span>
        </button>
      </div>

      <div style={{ padding: '20px 28px', opacity: 0.25, fontSize: '10px', letterSpacing: '0.5px' }}>
        JUSTIFAI V1.2
      </div>
    </aside>
  );
}
