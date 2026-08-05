"use client";

import React, { useState, useEffect } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from "recharts";
import { FaChartLine, FaUsers, FaFileInvoice, FaShieldAlt } from "react-icons/fa";

export default function AnalyticsSection() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await fetch('/api/stats');
        const data = await res.json();
        setStats(data);
      } catch (err) {
        console.error("Failed to fetch stats", err);
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="glass-card" style={{ padding: '80px', textAlign: 'center' }}>
        <div style={{ width: 24, height: 24, margin: '0 auto 16px', borderRadius: '50%', border: '2.5px solid #E2E8F0', borderTopColor: '#000000', animation: 'spin 0.6s linear infinite' }} />
        <h2 style={{ fontSize: 15, fontWeight: 600, color: '#607D8B' }}>Loading Analytics...</h2>
      </div>
    );
  }

  const data = stats?.chartData || [];

  return (
    <div className="space-y-4 animate-slide-up">
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
        
        {/* Total Records Card */}
        <div className="glass-card" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '16px', position: 'relative', overflow: 'hidden' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <p style={{ fontSize: '13px', fontWeight: 600, color: '#607D8B', margin: 0, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total Records</p>
            <div style={{ width: 36, height: 36, borderRadius: '10px', background: 'rgba(211, 255, 233, 0.1)', color: '#000000', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px' }}>
              <FaFileInvoice />
            </div>
          </div>
          <div>
            <h3 style={{ fontSize: '36px', fontWeight: 800, color: '#263238', margin: 0, letterSpacing: '-0.04em', lineHeight: 1 }}>
              {stats?.totalRecords?.toLocaleString() || 0}
            </h3>
          </div>
          {/* Subtle decorative glow */}
          <div style={{ position: 'absolute', top: -30, right: -30, width: 100, height: 100, background: 'rgba(211, 255, 233, 0.05)', borderRadius: '50%', filter: 'blur(20px)', pointerEvents: 'none' }} />
        </div>
        
        {/* Verifications Card */}
        <div className="glass-card" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '16px', position: 'relative', overflow: 'hidden' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <p style={{ fontSize: '13px', fontWeight: 600, color: '#607D8B', margin: 0, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Verifications</p>
            <div style={{ width: 36, height: 36, borderRadius: '10px', background: 'rgba(16, 185, 129, 0.1)', color: '#000000', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px' }}>
              <FaShieldAlt />
            </div>
          </div>
          <div>
            <h3 style={{ fontSize: '36px', fontWeight: 800, color: '#263238', margin: 0, letterSpacing: '-0.04em', lineHeight: 1 }}>
              {stats?.totalVerifications?.toLocaleString() || 0}
            </h3>
          </div>
          {/* Subtle decorative glow */}
          <div style={{ position: 'absolute', top: -30, right: -30, width: 100, height: 100, background: 'rgba(16, 185, 129, 0.05)', borderRadius: '50%', filter: 'blur(20px)', pointerEvents: 'none' }} />
        </div>

        {/* Active Users Card */}
        <div className="glass-card" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '16px', position: 'relative', overflow: 'hidden' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <p style={{ fontSize: '13px', fontWeight: 600, color: '#607D8B', margin: 0, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Active Users</p>
            <div style={{ width: 36, height: 36, borderRadius: '10px', background: 'rgba(251, 140, 0, 0.1)', color: '#FB8C00', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px' }}>
              <FaUsers />
            </div>
          </div>
          <div>
            <h3 style={{ fontSize: '36px', fontWeight: 800, color: '#263238', margin: 0, letterSpacing: '-0.04em', lineHeight: 1 }}>
              {stats?.activeUsers?.toLocaleString() || 0}
            </h3>
          </div>
          {/* Subtle decorative glow */}
          <div style={{ position: 'absolute', top: -30, right: -30, width: 100, height: 100, background: 'rgba(251, 140, 0, 0.05)', borderRadius: '50%', filter: 'blur(20px)', pointerEvents: 'none' }} />
        </div>
      </div>

      <div className="glass-card" style={{ padding: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 10, color: '#263238', letterSpacing: '-0.01em' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 28, height: 28, background: '#EFF6FF', color: '#000000', borderRadius: 6 }}>
              <FaChartLine size={12} />
            </div>
            Network Activity (7 Days)
          </h3>
        </div>
        <div style={{ height: 250, width: '100%' }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#D3FFE9" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#D3FFE9" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorPv" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#007B3E" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#007B3E" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#607D8B' }} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#607D8B' }} />
              <Tooltip 
                contentStyle={{ borderRadius: 12, border: '1px solid #E2E8F0', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)', padding: '12px 16px' }}
                itemStyle={{ fontSize: 13, fontWeight: 600, padding: '2px 0' }}
                labelStyle={{ fontSize: 12, color: '#607D8B', marginBottom: 8, fontWeight: 500, borderBottom: '1px solid #F1F5F9', paddingBottom: 8 }}
              />
              <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="#F1F5F9" />
              <Area type="monotone" dataKey="ingestions" stroke="#D3FFE9" strokeWidth={3} fillOpacity={1} fill="url(#colorUv)" name="Ingestions" activeDot={{ r: 6, strokeWidth: 0, fill: '#D3FFE9' }} />
              <Area type="monotone" dataKey="verifications" stroke="#007B3E" strokeWidth={3} fillOpacity={1} fill="url(#colorPv)" name="Verifications" activeDot={{ r: 6, strokeWidth: 0, fill: '#007B3E' }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
