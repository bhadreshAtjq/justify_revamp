"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import { FaBuilding, FaPlus, FaCalendarAlt, FaLink, FaUserShield } from "react-icons/fa";

export default function TenantsPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [tenants, setTenants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [adminEmail, setAdminEmail] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [creating, setCreating] = useState(false);

  const fetchTenants = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/tenants");
      const data = await res.json();
      setTenants(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (session?.user?.role !== "SUPER_ADMIN") {
      router.push("/dashboard");
    } else {
      fetchTenants();
    }
  }, [session, router, fetchTenants]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    try {
      const res = await fetch("/api/admin/tenants", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, slug, adminEmail, adminPassword }),
      });
      if (res.ok) {
        setName("");
        setSlug("");
        setAdminEmail("");
        setAdminPassword("");
        fetchTenants();
        toast.success("Tenant created successfully.");
      } else {
        const error = await res.json();
        toast.error(error.details || error.error);
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to create tenant.");
    } finally {
      setCreating(false);
    }
  };

  if (loading) return (
    <div style={{ padding: 40, color: 'var(--accent)', fontSize: 13, fontWeight: 600 }}>
      <div style={{ width: 16, height: 16, border: '2px solid var(--border)', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 0.6s linear infinite', marginBottom: 12 }} />
      Contacting Registry...
    </div>
  );

  return (
    <div className="animate-slide-up">
      <div className="section-meta">PLATFORM ADMINISTRATION</div>
      
      <div style={{ marginBottom: 32 }}>
        <h1 className="page-title">Tenant Management</h1>
        <p className="page-subtitle">Configure and audit institution-wide tenants on the network.</p>
      </div>
      
      <div className="glass-card">
        <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 24, display: 'flex', alignItems: 'center', gap: 10 }}>
          <FaPlus style={{ fontSize: 12, opacity: 0.5 }} /> Provision New Institution
        </h2>

        <form onSubmit={handleCreate}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 24, marginBottom: 32 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: '#393E46' }}>Institution Name</label>
              <input 
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="btn-outline"
                style={{ width: '100%', padding: '12px', borderRadius: 8, background: '#F7F7F7', cursor: 'text', textAlign: 'left' }}
                placeholder="e.g. Stanford University"
                required
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: '#393E46' }}>Unique Slug</label>
              <input 
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                className="btn-outline"
                style={{ width: '100%', padding: '12px', borderRadius: 8, background: '#F7F7F7', cursor: 'text', textAlign: 'left' }}
                placeholder="e.g. stanford"
                required
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: '#393E46' }}>Admin Email</label>
              <input 
                type="email"
                value={adminEmail}
                onChange={(e) => setAdminEmail(e.target.value)}
                className="btn-outline"
                style={{ width: '100%', padding: '12px', borderRadius: 8, background: '#F7F7F7', cursor: 'text', textAlign: 'left' }}
                placeholder="admin@university.edu"
                required
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: '#393E46' }}>Temporary Password</label>
              <input 
                type="password"
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                className="btn-outline"
                style={{ width: '100%', padding: '12px', borderRadius: 8, background: '#F7F7F7', cursor: 'text', textAlign: 'left' }}
                placeholder="••••••••"
                required
              />
            </div>
          </div>
          
          <div style={{ display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid #EEEEEE', paddingTop: 24 }}>
            <button 
              type="submit" 
              disabled={creating}
              className="btn-premium btn-solid"
              style={{ minWidth: 200 }}
            >
              {creating ? "Provisioning..." : "Create Tenant"}
            </button>
          </div>
        </form>
      </div>

      <div className="section-meta">ACTIVE TENANT REGISTRY</div>
      <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
        <div className="table-container" style={{ maxHeight: '500px', overflowY: 'auto' }}>
          <table className="premium-table">
            <thead>
              <tr>
                <th style={{ paddingLeft: 24 }}>Institution</th>
                <th>Access Slug</th>
                <th>Registry Date</th>
                <th style={{ textAlign: 'right', paddingRight: 24 }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {tenants.map((t) => (
                <tr key={t.id}>
                  <td style={{ paddingLeft: 24 }}>
                    <div style={{ fontWeight: 600 }}>{t.name}</div>
                  </td>
                  <td>
                    <code style={{ background: '#EEEEEE', padding: '2px 6px', borderRadius: 4, fontSize: 12 }}>{t.slug}</code>
                  </td>
                  <td style={{ color: '#929AAB' }}>
                    {new Date(t.createdAt).toLocaleDateString()}
                  </td>
                  <td style={{ textAlign: 'right', paddingRight: 24 }}>
                    <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--success)', background: 'rgba(45,106,79,0.1)', padding: '4px 8px', borderRadius: 4 }}>ACTIVE</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {tenants.length === 0 && (
            <div style={{ padding: 40, textAlign: 'center', color: '#929AAB' }}>No institutions found.</div>
          )}
        </div>
      </div>
    </div>
  );
}
