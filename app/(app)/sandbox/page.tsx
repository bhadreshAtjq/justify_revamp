"use client";

import { useState } from "react";
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
      <div>
        <div className="section-meta">DEVELOPER UTILITY</div>
        <h1 className="page-title">Merkle Sandbox</h1>
        <p className="page-subtitle">Experiment with different JSON payloads and cryptographic strategies to see how Merkle Roots are calculated.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(400px, 1fr) 1.2fr', gap: 28, alignItems: 'start' }}>
        <div className="space-y-6">
          <section className="glass-card" style={{ padding: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <div className="section-meta" style={{ margin: 0 }}>JSON PAYLOAD (ARRAY OR OBJECT)</div>
              <button 
                onClick={() => setJsonInput("")} 
                style={{ 
                  padding: '5px 10px', 
                  background: 'rgba(192,57,43,0.05)', 
                  color: '#C0392B', 
                  border: '1px solid rgba(192,57,43,0.1)', 
                  cursor: 'pointer', 
                  borderRadius: 6, 
                  fontSize: 10, 
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                }}
              >
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
                padding: '16px',
                borderRadius: 10,
                border: '1px solid rgba(57,62,70,0.12)',
                background: '#1E1E1E',
                color: '#D4D4D4',
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 12,
                outline: 'none',
                lineHeight: 1.6,
                resize: 'vertical'
              }}
            />
            <div style={{ marginTop: 20 }}>
              <button onClick={calculateMerkle} className="btn-premium btn-solid btn-block" style={{ padding: 14 }}>
                <FaCogs /> CALCULATE MERKLE ARCHITECTURE
              </button>
            </div>
          </section>

          <section className="glass-card" style={{ padding: 20 }}>
            <div className="section-meta">ACTIVE HASH STRATEGY</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 10 }}>
               {Object.entries(store.hashConfig).map(([key, value]) => (
                 <label 
                   key={key} 
                   className="strategy-toggle" 
                   style={{ 
                     opacity: value ? 1 : 0.45, 
                     borderColor: value ? '#D3FFE9' : 'rgba(57,62,70,0.08)',
                     background: value ? 'rgba(57,62,70,0.03)' : '#FFFFFF',
                   }}
                 >
                   <input 
                     type="checkbox" 
                     checked={value} 
                     onChange={() => store.updateHashConfig({ [key]: !value })}
                     style={{ accentColor: '#000000' }}
                   />
                   <span style={{ fontSize: 11, fontWeight: 600 }}>{key.replace('include', '').toUpperCase()}</span>
                 </label>
               ))}
            </div>
          </section>
        </div>

        <div>
          {results ? (
            <div className="space-y-6 animate-slide-up">
              <section className="root-emphasized" style={{ padding: 28 }}>
                <div className="section-meta" style={{ color: 'rgba(255,255,255,0.4)', fontSize: 9 }}>DETERMINISTIC MERKLE ROOT</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginTop: 10 }}>
                  <h2 style={{ fontSize: 20, margin: 0, wordBreak: 'break-all', fontFamily: "'JetBrains Mono', monospace", fontWeight: 500 }}>0x{results.root}</h2>
                  <CopyButton text={`0x${results.root}`} />
                </div>
                <p style={{ margin: '12px 0 0 0', opacity: 0.5, fontSize: 11 }}>
                  Generated from {results.leaves.length} cryptographically hashed leaves using Keccak256.
                </p>
              </section>

              <section className="glass-card" style={{ padding: 20 }}>
                <div className="section-meta">LEAVES AND PRE-IMAGES</div>
                <div className="space-y-4" style={{ marginTop: 14, maxHeight: '600px', overflowY: 'auto', paddingRight: 8 }}>
                   {results.leaves.map((leaf, i) => (
                     <div key={i} className="inner-card" style={{ padding: 14 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                          <span style={{ fontSize: 10, fontWeight: 700, color: '#000000' }}>LEAF #{i+1}</span>
                          <span style={{ fontSize: 9, color: '#929AAB' }}>Keccak256</span>
                        </div>
                        <div style={{ background: '#FFFFFF', padding: 8, borderRadius: 6, fontSize: 11, fontFamily: "'JetBrains Mono', monospace", wordBreak: 'break-all', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 8, border: '1px solid rgba(57,62,70,0.06)' }}>
                          <div style={{ height: 5, width: 5, borderRadius: '50%', background: '#D3FFE9', flexShrink: 0 }}></div>
                          {leaf.hash}
                        </div>
                        <div style={{ fontSize: 9, color: '#929AAB', fontWeight: 600, letterSpacing: '1px', margin: '8px 0 4px', textTransform: 'uppercase' }}>HASHED CONTENT (PRE-IMAGE)</div>
                        <pre style={{ margin: 0, fontSize: 11, background: '#1E1E1E', color: '#D4D4D4', padding: 12, borderRadius: 6, overflowX: 'auto', fontFamily: "'JetBrains Mono', monospace" }}>
                          {leaf.payload}
                        </pre>
                     </div>
                   ))}
                </div>
              </section>
            </div>
          ) : (
            <div className="glass-card" style={{ height: '100%', minHeight: 400, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#929AAB', border: '2px dashed rgba(57,62,70,0.1)' }}>
              <FaProjectDiagram fontSize={40} style={{ marginBottom: 14 }} />
              <p style={{ fontWeight: 600, fontSize: 14, color: '#000000' }}>Calculation Results Pending</p>
              <p style={{ fontSize: 12 }}>Enter JSON and click calculate to generate proofs.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
