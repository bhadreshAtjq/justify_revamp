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
    <div className="glass-card animate-slide-up">
      <div style={{ marginBottom: 20 }}>
        <h3 style={{ fontSize: 16 }}>Anchor Payload Configuration</h3>
        <p style={{ opacity: 0.6, fontSize: 12 }}>Select which data points should contribute to the cryptographic hash.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
        {options.map((opt) => (
          <div
            key={opt.id}
            onClick={() => updateHashConfig({ [opt.key]: !hashConfig[opt.key] })}
            className={`inner-card ${hashConfig[opt.key] ? 'border-primary' : ''}`}
            style={{
              cursor: 'pointer',
              transition: 'all 0.2s',
              border: hashConfig[opt.key] ? '2px solid var(--primary)' : '2px solid transparent',
              background: hashConfig[opt.key] ? 'rgba(96, 153, 102, 0.05)' : 'var(--canvas)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ fontSize: 20, color: hashConfig[opt.key] ? 'var(--primary)' : 'rgba(0,0,0,0.1)' }}>
                {hashConfig[opt.key] ? <FaCheckSquare /> : <FaSquare />}
              </div>
              <div>
                <p style={{ fontWeight: 800, fontSize: 13, color: hashConfig[opt.key] ? 'var(--primary)' : 'inherit' }}>{opt.label}</p>
                <p style={{ fontSize: 10, opacity: 0.5 }}>{opt.desc}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ marginTop: 24, padding: '12px 16px', background: 'rgba(64, 81, 59, 0.05)', borderRadius: 12 }}>
        <p style={{ fontSize: 10, fontWeight: 700, color: 'var(--accent)', textAlign: 'center' }}>
          NOTE: Changing these selections will result in a completely different Merkle Root.
        </p>
      </div>
    </div>
  );
}
