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
      <div style={{ marginBottom: 16 }}>
        <h3 style={{ fontSize: 15, fontWeight: 700 }}>Anchor Payload Configuration</h3>
        <p style={{ color: '#929AAB', fontSize: 12 }}>Select which data points should contribute to the cryptographic hash.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
        {options.map((opt) => (
          <div
            key={opt.id}
            onClick={() => updateHashConfig({ [opt.key]: !hashConfig[opt.key] })}
            className="inner-card"
            style={{
              cursor: 'pointer',
              transition: 'all 0.18s',
              border: hashConfig[opt.key] ? '1.5px solid #393E46' : '1.5px solid transparent',
              background: hashConfig[opt.key] ? 'rgba(57, 62, 70, 0.03)' : 'var(--canvas)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ fontSize: 18, color: hashConfig[opt.key] ? '#393E46' : '#EEEEEE' }}>
                {hashConfig[opt.key] ? <FaCheckSquare /> : <FaSquare />}
              </div>
              <div>
                <p style={{ fontWeight: 600, fontSize: 13, color: hashConfig[opt.key] ? '#222831' : '#929AAB' }}>{opt.label}</p>
                <p style={{ fontSize: 10, color: '#929AAB' }}>{opt.desc}</p>
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
