"use client";

import { FaUser, FaIdCard, FaGraduationCap, FaBook } from "react-icons/fa";
import type { OCRResponse } from "@/services/api";

interface OCRResultCardProps {
  result: OCRResponse;
}

export default function OCRResultCard({ result }: OCRResultCardProps) {
  return (
    <div className="glass-card animate-slide-up">
      <div style={{ marginBottom: 24 }}>
        <h3 style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
          Transcript Intelligence (OCR)
        </h3>
        <p style={{ opacity: 0.6, fontSize: 13 }}>Validated student identity and performance data</p>
      </div>

      <div className="grid-cols-2" style={{ marginBottom: 32 }}>
        <div className="inner-card">
          <p className="section-meta" style={{ fontSize: 10 }}><FaUser /> FULL NAME</p>
          <p style={{ fontWeight: 800, fontSize: 15 }}>{result.name}</p>
        </div>
        <div className="inner-card">
          <p className="section-meta" style={{ fontSize: 10 }}><FaIdCard /> REGISTRATION NO</p>
          <p style={{ fontWeight: 800, fontSize: 15 }}>{result.registration_no}</p>
        </div>
      </div>

      <div className="table-container" style={{ marginBottom: 32, borderRadius: 12, border: '1px solid rgba(64,81,59,0.1)' }}>
        <div style={{ padding: '12px 16px', background: 'rgba(64,81,59,0.03)', borderBottom: '1px solid rgba(64,81,59,0.05)', fontSize: 11, fontWeight: 800, letterSpacing: 1 }}>
          SUBJECT BREAKDOWN
        </div>
        <table className="premium-table" style={{ width: '100%', minWidth: '100%' }}>
          <thead>
            <tr>
              <th style={{ minWidth: 80, fontSize: 10 }}>CODE</th>
              <th style={{ minWidth: 200, fontSize: 10 }}>TITLE</th>
              <th style={{ minWidth: 60, fontSize: 10, textAlign: 'center' }}>CR</th>
              <th style={{ minWidth: 60, fontSize: 10, textAlign: 'center' }}>GRADE</th>
            </tr>
          </thead>
          <tbody>
            {result.subjects.map((sub, idx) => (
              <tr key={idx}>
                <td style={{ fontSize: 12, fontWeight: 700 }}>{sub.code}</td>
                <td style={{ fontSize: 12 }}>{sub.title}</td>
                <td style={{ fontSize: 12, textAlign: 'center' }}>{sub.credits}</td>
                <td style={{ fontSize: 12, textAlign: 'center', fontWeight: 800 }}>{sub.grade}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="card-dark" style={{ background: 'var(--accent)', padding: '20px', borderRadius: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>
            <FaGraduationCap style={{ color: 'white' }} />
          </div>
          <div>
            <p style={{ color: 'white', opacity: 0.6, fontSize: 10, fontWeight: 800, letterSpacing: 1 }}>FINAL CALCULATED GPA</p>
            <p style={{ color: 'white', fontSize: 20, fontWeight: 900 }}>{result.gpa}</p>
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
           <p style={{ color: '#9DC08B', fontSize: 11, fontWeight: 800 }}>SYSTEM VERIFIED</p>
           <p style={{ color: 'white', opacity: 0.4, fontSize: 10 }}>HASH READY</p>
        </div>
      </div>
    </div>
  );
}
