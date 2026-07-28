"use client";

import React, { useState, useEffect, useMemo } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, BarChart, Bar } from "recharts";
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
        <h2 style={{ fontSize: 20, fontWeight: 700, color: '#929AAB' }}>Loading Analytics...</h2>
      </div>
    );
  }

  const data = stats?.chartData || [];

  return (
    <div className="space-y-8 animate-slide-up">
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 24 }}>
        <div className="glass-card" style={{ padding: 24, display: 'flex', alignItems: 'center', gap: 20 }}>
          <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'rgba(57,62,70,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#393E46', fontSize: 20 }}>
            <FaFileInvoice />
          </div>
          <div>
            <p style={{ fontSize: 11, fontWeight: 700, color: '#929AAB', letterSpacing: 1, margin: '0 0 4px' }}>TOTAL RECORDS</p>
            <h3 style={{ fontSize: 24, fontWeight: 700, color: '#222831', margin: 0 }}>{stats?.totalRecords?.toLocaleString() || 0}</h3>
          </div>
        </div>
        
        <div className="glass-card" style={{ padding: 24, display: 'flex', alignItems: 'center', gap: 20 }}>
          <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'rgba(45,106,79,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2D6A4F', fontSize: 20 }}>
            <FaShieldAlt />
          </div>
          <div>
            <p style={{ fontSize: 11, fontWeight: 700, color: '#929AAB', letterSpacing: 1, margin: '0 0 4px' }}>VERIFICATIONS</p>
            <h3 style={{ fontSize: 24, fontWeight: 700, color: '#222831', margin: 0 }}>{stats?.totalVerifications?.toLocaleString() || 0}</h3>
          </div>
        </div>

        <div className="glass-card" style={{ padding: 24, display: 'flex', alignItems: 'center', gap: 20 }}>
          <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'rgba(242,201,76,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#F2C94C', fontSize: 20 }}>
            <FaUsers />
          </div>
          <div>
            <p style={{ fontSize: 11, fontWeight: 700, color: '#929AAB', letterSpacing: 1, margin: '0 0 4px' }}>ACTIVE USERS</p>
            <h3 style={{ fontSize: 24, fontWeight: 700, color: '#222831', margin: 0 }}>{stats?.activeUsers?.toLocaleString() || 0}</h3>
          </div>
        </div>
      </div>

      <div className="glass-card" style={{ padding: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <h3 style={{ fontSize: 14, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}><FaChartLine /> Network Activity (7 Days)</h3>
        </div>
        <div style={{ height: 300, width: '100%' }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#393E46" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#393E46" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorPv" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2D6A4F" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#2D6A4F" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#929AAB' }} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#929AAB' }} />
              <Tooltip 
                contentStyle={{ borderRadius: 8, border: '1px solid rgba(57,62,70,0.08)', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}
                itemStyle={{ fontSize: 12, fontWeight: 600 }}
                labelStyle={{ fontSize: 11, color: '#929AAB', marginBottom: 4 }}
              />
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(57,62,70,0.05)" />
              <Area type="monotone" dataKey="ingestions" stroke="#393E46" strokeWidth={3} fillOpacity={1} fill="url(#colorUv)" name="Ingestions" />
              <Area type="monotone" dataKey="verifications" stroke="#2D6A4F" strokeWidth={3} fillOpacity={1} fill="url(#colorPv)" name="Verifications" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
