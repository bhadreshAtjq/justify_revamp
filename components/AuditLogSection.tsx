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
    <div className="history-section animate-slide-up">
      <div className="glass-card" style={{ padding: '16px', marginBottom: 0, borderRadius: '12px 12px 0 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <FaShieldAlt style={{ color: '#929AAB' }} />
          <span style={{ fontSize: 13, fontWeight: 700, color: '#393E46' }}>SYSTEM AUDIT TRAIL</span>
        </div>
        <button onClick={fetchLogs} className="btn-premium btn-outline" style={{ display: 'flex', gap: 8, alignItems: 'center', padding: '8px 16px', fontSize: 11, fontWeight: 700 }}>
           <FaSync /> REFRESH
        </button>
      </div>

      <div className="glass-card" style={{ padding: 0, overflow: 'hidden', borderTop: 'none', borderRadius: '0 0 12px 12px', marginTop: -1 }}>
        <div className="table-container" style={{ maxHeight: '600px', overflowY: 'auto' }}>
          <table className="premium-table" style={{ width: '100%', tableLayout: 'auto' }}>
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
                  <td colSpan={5} style={{ textAlign: 'center', padding: '80px 0' }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: '#929AAB', letterSpacing: '0.1em' }}>FETCHING SECURE LOGS...</div>
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', padding: '80px 0', color: '#929AAB' }}>
                    No audit logs available.
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id}>
                    <td style={{ fontSize: 11, color: '#929AAB' }}>{new Date(log.createdAt).toLocaleString()}</td>
                    <td>
                      <span style={{ 
                        fontSize: 10, fontWeight: 700, padding: '4px 8px', borderRadius: 4, 
                        background: 'rgba(57,62,70,0.06)', color: '#393E46'
                      }}>
                        {log.action}
                      </span>
                    </td>
                    <td style={{ fontSize: 12, color: '#222831' }}>{log.details}</td>
                    <td>
                      <div style={{ fontWeight: 600, color: '#222831', fontSize: 12 }}>{log.user?.name || 'System / Public'}</div>
                      <div style={{ fontSize: 9, color: '#929AAB' }}>{log.user?.email || 'N/A'}</div>
                    </td>
                    <td>
                       <span style={{ 
                        fontSize: 10, fontWeight: 700, padding: '4px 8px', borderRadius: 4, 
                        background: log.status === 'SUCCESS' ? 'rgba(45,106,79,0.06)' : 'rgba(192,57,43,0.06)', 
                        color: log.status === 'SUCCESS' ? '#2D6A4F' : '#C0392B'
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
    </div>
  );
}
