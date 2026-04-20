"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FaColumns, FaShieldAlt, FaFlask } from "react-icons/fa";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: FaColumns },
  { href: "/verify", label: "Verify", icon: FaShieldAlt },
  { href: "/sandbox", label: "Merkle Sandbox", icon: FaFlask },
];

export default function Sidebar() {
  const pathname = usePathname();

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

      <div style={{ padding: '24px 32px', opacity: 0.3, fontSize: '10px' }}>
        &copy; 2026 JUSTIFAI V1.2
      </div>
    </aside>
  );
}
