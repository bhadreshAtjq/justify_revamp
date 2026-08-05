"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FaColumns, FaShieldAlt, FaFlask, FaBuilding, FaSignOutAlt, FaLayerGroup, FaCode, FaList, FaChartLine, FaPlus } from "react-icons/fa";
import { useSession, signOut } from "next-auth/react";
import { useAppStore } from "@/store/useAppStore";
import Image from "next/image";
import logoImg from "@/app/assetes/image/logo.png";

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export default function Sidebar({ isOpen = false, onClose }: SidebarProps) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const { developerMode, setDeveloperMode } = useAppStore();

  const allItems = [
    { href: "/dashboard", label: "Dashboard", icon: FaColumns, roles: ["SUPER_ADMIN", "INSTITUTION_ADMIN", "ISSUER", "AUDITOR"] },
    { href: "/select-type", label: "New Upload", icon: FaPlus, roles: ["SUPER_ADMIN", "INSTITUTION_ADMIN", "ISSUER"] },
    { href: "/repository", label: "Repository", icon: FaList, roles: ["SUPER_ADMIN", "INSTITUTION_ADMIN", "ISSUER", "AUDITOR"] },
    { href: "/audit-trail", label: "Audit Trail", icon: FaShieldAlt, roles: ["SUPER_ADMIN", "INSTITUTION_ADMIN", "ISSUER", "AUDITOR"] },
    { href: "/verify", label: "Verify", icon: FaShieldAlt, roles: ["SUPER_ADMIN", "INSTITUTION_ADMIN", "ISSUER", "AUDITOR", "PUBLIC_VERIFIER"] },
    { href: "/sandbox", label: "Merkle Sandbox", icon: FaFlask, roles: ["SUPER_ADMIN", "INSTITUTION_ADMIN"] },
    { href: "/bulk-ocr", label: "Bulk OCR Ingestion", icon: FaLayerGroup, roles: ["SUPER_ADMIN", "INSTITUTION_ADMIN", "ISSUER"] },
    { href: "/admin/tenants", label: "Tenants", icon: FaBuilding, roles: ["SUPER_ADMIN"] },
  ];

  const navItems = allItems.filter(item => {
    if (!item.roles.includes(session?.user?.role || "")) return false;
    if (item.href === "/sandbox" && !developerMode) return false;
    return true;
  });

  return (
    <aside className={`sidebar ${isOpen ? 'mobile-open' : ''}`}>
      <div className="sidebar-logo" style={{ padding: '24px 20px 16px', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 0 }}>
        <button className="mobile-close-btn" onClick={onClose}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>

      <div style={{ padding: '16px 20px 12px', fontSize: '11px', fontWeight: 700, color: '#607D8B', textTransform: 'uppercase', letterSpacing: '1px' }}>
        Categories
      </div>

      <nav className="sidebar-nav">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`nav-link ${isActive ? "active" : ""}`}
              onClick={() => onClose && onClose()}
            >
              <item.icon />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
      <div style={{ marginTop: 'auto', padding: '0 12px 12px 12px', borderTop: '1px solid var(--border)', paddingTop: 12 }}>
        <button 
          onClick={() => setDeveloperMode(!developerMode)}
          className={`nav-link ${developerMode ? "active" : ""}`}
          style={{ width: '100%', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', marginBottom: 8 }}
        >
          <FaCode />
          <span>Dev Mode {developerMode ? 'ON' : 'OFF'}</span>
        </button>

        <button 
          onClick={() => signOut({ callbackUrl: "/" })}
          className="nav-link"
          style={{ width: '100%', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }}
        >
          <FaSignOutAlt />
          <span>Logout</span>
        </button>
      </div>

    </aside>
  );
}
