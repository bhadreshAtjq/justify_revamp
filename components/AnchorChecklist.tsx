"use client";

import { useAppStore } from "@/store/useAppStore";
import { FaCheckSquare, FaSquare } from "react-icons/fa";

export default function AnchorChecklist() {
  const store = useAppStore();
  const { hashConfig, updateHashConfig } = store;

  const options = [
    { id: 'includeRegNo', label: 'Registration Number', desc: 'Main student identifier', key: 'includeRegNo' as const },
    { id: 'includeName', label: 'Full Legal Name', desc: 'Verify identity on-chain', key: 'includeName' as const },
    { id: 'includeGPA', label: 'Final GPA', desc: 'Overall performance score', key: 'includeGPA' as const },
    { id: 'includeSubjects', label: 'Detailed Subjects', desc: 'Include all course marks (Complex)', key: 'includeSubjects' as const },
  ];

  return (
    <div className="animate-slide-up">
      <div style={{ marginBottom: 16 }}>
        <h3 style={{ fontSize: 15, fontWeight: 700 }}>Anchor Payload Configuration</h3>
        <p style={{ color: '#929AAB', fontSize: 12 }}>Select which data points should contribute to the cryptographic hash.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
        {options.map((opt) => (
          <div
            key={opt.id}
            onClick={() => updateHashConfig({ [opt.key]: !hashConfig[opt.key] })}
            className="inner-card payload-card"
            style={{
              cursor: 'pointer',
              transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
              border: hashConfig[opt.key] ? '1.5px solid var(--secondary)' : '1.5px solid var(--border)',
              background: hashConfig[opt.key] ? 'rgba(0, 123, 62, 0.04)' : 'var(--surface)',
              boxShadow: hashConfig[opt.key] ? '0 4px 12px rgba(0, 123, 62, 0.05)' : 'none'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ fontSize: 20, color: hashConfig[opt.key] ? 'var(--secondary)' : 'var(--border-strong)', transition: 'color 0.2s' }}>
                {hashConfig[opt.key] ? <FaCheckSquare /> : <FaSquare />}
              </div>
              <div>
                <p style={{ fontWeight: 600, fontSize: 13, color: hashConfig[opt.key] ? 'var(--secondary)' : 'var(--text-primary)', transition: 'color 0.2s', marginBottom: 2 }}>{opt.label}</p>
                <p style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{opt.desc}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ marginTop: 16, padding: '10px 14px', background: 'var(--canvas)', borderRadius: 8, border: '1px solid var(--border)' }}>
        <p style={{ fontSize: 10, fontWeight: 600, color: '#929AAB', textAlign: 'center', letterSpacing: '0.3px' }}>
          NOTE: Changing these selections will result in a completely different Merkle Root.
        </p>
      </div>
    </div>
  );
}
