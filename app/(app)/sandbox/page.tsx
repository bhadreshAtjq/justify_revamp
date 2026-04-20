"use client";

import { useState, useMemo } from "react";
import { useAppStore } from "@/store/useAppStore";
import { generateStudentHash } from "@/lib/hash";
import { buildMerkleTree } from "@/lib/merkle";
import { FaTerminal, FaCogs, FaProjectDiagram, FaTrash } from "react-icons/fa";
import CopyButton from "@/components/CopyButton";

export default function SandboxPage() {
  const store = useAppStore();
  const [jsonInput, setJsonInput] = useState(`[
  {
    "name": "PATEL RITESHKUMAR",
    "registration_no": "2072116024",
    "gpa": "7.5",
    "subjects": [
      { "code": "ENG101", "grade": "8.0" }
    ]
  },
  {
    "name": "SHAH DEEP",
    "registration_no": "2072116025",
    "gpa": "8.2"
  }
]`);

  const [results, setResults] = useState<{
    leaves: { hash: string; payload: string }[];
    root: string;
  } | null>(null);

  const calculateMerkle = () => {
    try {
      const data = JSON.parse(jsonInput);
      const records = Array.isArray(data) ? data : [data];
      
      const leaves = records.map(r => {
        // We simulate the hashing process and capture the payload
        // This logic mirrors generateStudentHash but we want to see the "pre-image"
        const hash = generateStudentHash(r, store.hashConfig);
        return { hash, payload: JSON.stringify(r, null, 2) };
      });

      const { root } = buildMerkleTree(leaves.map(l => l.hash));
      setResults({ leaves, root });
    } catch (err: any) {
      alert("Invalid JSON: " + err.message);
    }
  };

  return (
    <div className="animate-slide-up">
      <div className="page-header">
        <div className="section-meta">DEVELOPER UTILITY</div>
        <h1 className="page-title">Merkle Sandbox</h1>
        <p className="page-subtitle">Experiment with different JSON payloads and cryptographic strategies to see how Merkle Roots are calculated.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(400px, 1fr) 1.2fr', gap: 32, alignItems: 'start' }}>
        <div className="space-y-6">
          <section className="glass-card" style={{ padding: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div className="section-meta" style={{ margin: 0 }}>JSON PAYLOAD (ARRAY OR OBJECT)</div>
              <button onClick={() => setJsonInput("")} className="inner-card" style={{ padding: '6px 12px', background: 'rgba(211, 47, 47, 0.1)', color: '#d32f2f', border: 'none', cursor: 'pointer', borderRadius: 6, fontSize: 10, fontWeight: 800 }}>
                <FaTrash /> CLEAR
              </button>
            </div>
            <textarea
              value={jsonInput}
              onChange={(e) => setJsonInput(e.target.value)}
              placeholder="Paste student JSON records here..."
              spellCheck={false}
              style={{
                width: '100%',
                height: '400px',
                padding: '20px',
                borderRadius: 12,
                border: '2px solid var(--accent)',
                background: '#1e1e1e',
                color: '#d4d4d4',
                fontFamily: 'monospace',
                fontSize: 13,
                outline: 'none',
                lineHeight: 1.6,
                resize: 'vertical'
              }}
            />
            <div style={{ marginTop: 24 }}>
              <button onClick={calculateMerkle} className="btn-premium btn-solid btn-block">
                <FaCogs /> CALCULATE MERKLE ARCHITECTURE
              </button>
            </div>
          </section>

          <section className="glass-card" style={{ padding: '24px' }}>
            <div className="section-meta">ACTIVE HASH STRATEGY</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 12 }}>
               {Object.entries(store.hashConfig).map(([key, value]) => (
                 <label key={key} className="strategy-toggle" style={{ opacity: value ? 1 : 0.5, border: value ? '1px solid var(--primary)' : '1px solid transparent' }}>
                   <input 
                     type="checkbox" 
                     checked={value} 
                     onChange={() => store.updateHashConfig({ [key]: !value })}
                   />
                   <span style={{ fontSize: 11, fontWeight: 700 }}>{key.replace('include', '').toUpperCase()}</span>
                 </label>
               ))}
            </div>
          </section>
        </div>

        <div>
          {results ? (
            <div className="space-y-6 animate-slide-up">
              <section className="root-emphasized" style={{ padding: 32 }}>
                <div className="section-meta" style={{ color: 'rgba(255,255,255,0.6)' }}>DETERMINISTIC MERKLE ROOT</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginTop: 12 }}>
                  <h2 style={{ fontSize: 24, margin: 0, wordBreak: 'break-all', fontFamily: 'monospace' }}>0x{results.root}</h2>
                  <CopyButton text={`0x${results.root}`} />
                </div>
                <p style={{ margin: '15px 0 0 0', opacity: 0.7, fontSize: 12 }}>
                  Generated from {results.leaves.length} cryptographically hashed leaves using Keccak256.
                </p>
              </section>

              <section className="glass-card" style={{ padding: 24 }}>
                <div className="section-meta">LEAVES & PRE-IMAGES</div>
                <div className="space-y-4" style={{ marginTop: 16, maxHeight: '600px', overflowY: 'auto', paddingRight: 8 }}>
                   {results.leaves.map((leaf, i) => (
                     <div key={i} className="inner-card" style={{ padding: 16, background: '#fff' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                          <span style={{ fontSize: 10, fontWeight: 900, color: 'var(--primary)' }}>LEAF #{i+1}</span>
                          <span style={{ fontSize: 9, opacity: 0.4 }}>Keccak256</span>
                        </div>
                        <div style={{ background: 'var(--canvas)', padding: 8, borderRadius: 6, fontSize: 11, fontFamily: 'monospace', wordBreak: 'break-all', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
                          <div style={{ height: 6, width: 6, borderRadius: '50%', background: 'var(--primary)', flexShrink: 0 }}></div>
                          {leaf.hash}
                        </div>
                        <div className="section-meta" style={{ fontSize: 9, opacity: 0.4, margin: '8px 0' }}>HASHED CONTENT (PRE-IMAGE)</div>
                        <pre style={{ margin: 0, fontSize: 11, background: '#f8f8f8', padding: 12, borderRadius: 6, overflowX: 'auto' }}>
                          {leaf.payload}
                        </pre>
                     </div>
                   ))}
                </div>
              </section>
            </div>
          ) : (
            <div className="glass-card" style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', opacity: 0.5, borderStyle: 'dashed' }}>
              <FaProjectDiagram fontSize={48} style={{ marginBottom: 16 }} />
              <p style={{ fontWeight: 700 }}>Calculation Results Pending</p>
              <p style={{ fontSize: 12 }}>Enter JSON and click calculate to generate proofs.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
