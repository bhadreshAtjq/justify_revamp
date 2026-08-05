"use client";

import React, { useState, useEffect, useCallback } from "react";
import { FaShieldAlt, FaSync } from "react-icons/fa";

export default function AuditLogSection() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/audit");
      const data = await res.json();
      setLogs(data);
    } catch (err) {
      console.error("Failed to fetch audit logs", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  return (
    <div className="history-section animate-slide-up" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      <div style={{ 
        display: 'flex', justifyContent: 'space-between', alignItems: 'center', 
        background: '#FFFFFF', padding: '20px 24px', borderRadius: '12px',
        border: '1px solid #E5E7EB', boxShadow: '0 1px 2px rgba(0, 0, 0, 0.04)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 32, height: 32, background: '#F3F4F6', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <FaShieldAlt style={{ color: '#6B7280', fontSize: 14 }} />
          </div>
          <span style={{ fontSize: 14, fontWeight: 600, color: '#111827' }}>System Audit Trail</span>
        </div>
        <button onClick={fetchLogs} style={{ 
          display: 'flex', gap: 8, alignItems: 'center', justifyContent: 'center', 
          padding: '8px 16px', borderRadius: '8px', fontSize: 13, fontWeight: 500, 
          background: '#FFFFFF', border: '1px solid #E5E7EB', color: '#374151', cursor: 'pointer',
          boxShadow: '0 1px 2px rgba(0, 0, 0, 0.02)', transition: 'all 0.2s'
        }}
        onMouseOver={(e) => (e.currentTarget.style.background = '#F9FAFB')}
        onMouseOut={(e) => (e.currentTarget.style.background = '#FFFFFF')}
        >
           <FaSync size={12} /> Refresh
        </button>
      </div>

      <div className="table-container">
        <table className="premium-table">
          <thead>
            <tr>
              <th>Timestamp</th>
              <th>Action</th>
              <th>Details</th>
              <th>User / Agent</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} style={{ textAlign: 'center', padding: '60px 0' }}>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: 12, fontSize: 14, fontWeight: 500, color: '#6B7280' }}>
                    <div style={{ width: 16, height: 16, borderRadius: '50%', border: '2px solid #E5E7EB', borderTopColor: '#3B82F6', animation: 'spin 0.8s linear infinite' }} />
                    Fetching secure logs...
                  </div>
                </td>
              </tr>
            ) : logs.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ textAlign: 'center', padding: '60px 0', color: '#6B7280', fontSize: 14 }}>
                  No audit logs available.
                </td>
              </tr>
            ) : (
              logs.map((log) => (
                <tr key={log.id}>
                  <td style={{ fontSize: 13, color: '#6B7280', fontWeight: 500 }}>
                    {new Date(log.createdAt).toLocaleString(undefined, { 
                      year: 'numeric', month: 'short', day: 'numeric', 
                      hour: 'numeric', minute: '2-digit', second: '2-digit' 
                    })}
                  </td>
                  <td>
                    <span style={{ 
                      fontSize: 11, fontWeight: 600, padding: '4px 10px', borderRadius: 12, 
                      background: '#F3F4F6', color: '#374151', letterSpacing: '0.02em'
                    }}>
                      {log.action}
                    </span>
                  </td>
                  <td style={{ fontSize: 13, color: '#111827' }}>{log.details}</td>
                  <td>
                    <div style={{ fontWeight: 500, color: '#111827', fontSize: 13, marginBottom: 4 }}>{log.user?.name || 'System / Public'}</div>
                    <div style={{ fontSize: 11, color: '#9CA3AF' }}>{log.user?.email || 'N/A'}</div>
                  </td>
                  <td>
                     <span style={{ 
                      fontSize: 11, fontWeight: 600, padding: '4px 10px', borderRadius: 12, letterSpacing: '0.02em',
                      background: log.status === 'SUCCESS' ? '#ECFDF5' : '#FEF2F2', 
                      color: log.status === 'SUCCESS' ? '#007B3E' : '#E53935'
                    }}>
                      {log.status}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
