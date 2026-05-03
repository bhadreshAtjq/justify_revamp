"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

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

  useEffect(() => {
    if (session?.user?.role !== "SUPER_ADMIN") {
      router.push("/dashboard");
    } else {
      fetchTenants();
    }
  }, [session, router]);

  const fetchTenants = async () => {
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
  };

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
        alert("Tenant created successfully! Use the provided credentials to login.");
      } else {
        const error = await res.json();
        alert("Error: " + error.details || error.error);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setCreating(false);
    }
  };

  if (loading) return <div className="p-8">Loading tenants...</div>;

  return (
    <div className="animate-slide-up">
      <div className="section-meta">Administrative Control</div>
      <h1 className="page-title">Tenant Management</h1>
      <p className="page-subtitle">Configure institutions and platform-wide tenants.</p>
      
      <div className="glass-card">
        <h2 className="text-lg font-semibold mb-6" style={{ color: 'var(--text-primary)' }}>Register New Institution</h2>
        <form onSubmit={handleCreate} className="space-y-6">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
            <div>
              <label className="section-meta" style={{ display: 'block', fontSize: '11px', marginBottom: '8px' }}>Institution Name</label>
              <input 
                value={name}
                onChange={(e) => setName(e.target.value)}
                style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid rgba(0,0,0,0.1)', background: 'var(--canvas)' }}
                placeholder="e.g. Stanford University"
                required
              />
            </div>
            <div>
              <label className="section-meta" style={{ display: 'block', fontSize: '11px', marginBottom: '8px' }}>Unique Slug</label>
              <input 
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid rgba(0,0,0,0.1)', background: 'var(--canvas)' }}
                placeholder="e.g. stanford"
                required
              />
            </div>
            <div>
              <label className="section-meta" style={{ display: 'block', fontSize: '11px', marginBottom: '8px' }}>Admin Login Email</label>
              <input 
                type="email"
                value={adminEmail}
                onChange={(e) => setAdminEmail(e.target.value)}
                style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid rgba(0,0,0,0.1)', background: 'var(--canvas)' }}
                placeholder="admin@university.edu"
                required
              />
            </div>
            <div>
              <label className="section-meta" style={{ display: 'block', fontSize: '11px', marginBottom: '8px' }}>Administrative Password</label>
              <input 
                type="password"
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid rgba(0,0,0,0.1)', background: 'var(--canvas)' }}
                placeholder="••••••••"
                required
              />
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button 
              type="submit" 
              disabled={creating}
              className="btn-premium btn-solid"
              style={{ padding: '12px 40px' }}
            >
              {creating ? "Creating Assets..." : "Finalize & Register Tenant"}
            </button>
          </div>
        </form>
      </div>


      <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
        <div className="table-container">
          <table className="premium-table">
            <thead>
              <tr>
                <th>Institution Name</th>
                <th>Slug</th>
                <th>Created At</th>
              </tr>
            </thead>
            <tbody>
              {tenants.map((t) => (
                <tr key={t.id}>
                  <td style={{ fontWeight: 600 }}>{t.name}</td>
                  <td style={{ fontFamily: 'JetBrains Mono, monospace', opacity: 0.7 }}>{t.slug}</td>
                  <td>{new Date(t.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
              {tenants.length === 0 && (
                <tr>
                  <td colSpan={3} style={{ textAlign: 'center', padding: '40px', opacity: 0.5 }}>
                    No tenants found. Create your first institution above.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

