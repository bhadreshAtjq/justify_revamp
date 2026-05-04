"use client";

import { useState } from "react";
import { FaCheckCircle, FaHashtag, FaChevronDown, FaChevronUp } from "react-icons/fa";
import CopyButton from "./CopyButton";
import type { HashEntry } from "@/store/useAppStore";

interface HashGeneratorPanelProps {
  hashes: HashEntry[];
  isGenerating: boolean;
  onGenerate: () => void;
  canGenerate: boolean;
}

export default function HashGeneratorPanel({
  hashes,
  isGenerating,
  onGenerate,
  canGenerate,
}: HashGeneratorPanelProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="glass-card animate-slide-up">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <h3 style={{ marginBottom: 4, fontSize: 15, fontWeight: 700 }}>Student Level Hashes</h3>
          <p style={{ color: '#929AAB', fontSize: 12 }}>Generate cryptographic fingerprints for each record</p>
        </div>
        {hashes.length === 0 && (
          <button
            onClick={onGenerate}
            disabled={!canGenerate || isGenerating}
            className="btn-premium btn-solid"
          >
            {isGenerating ? "Processing..." : "Generate Hashes"}
          </button>
        )}
      </div>

      {hashes.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div className="inner-card" style={{ display: 'flex', alignItems: 'center', gap: 10, borderColor: '#2D6A4F' }}>
            <FaCheckCircle style={{ color: '#2D6A4F', fontSize: 16 }} />
            <span style={{ fontWeight: 600, fontSize: 13 }}>Successfully generated {hashes.length} hashes</span>
          </div>

          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="btn-premium btn-outline btn-block"
            style={{ fontSize: 12 }}
          >
            {isExpanded ? <FaChevronUp /> : <FaChevronDown />}
            {isExpanded ? "Hide Individual Hashes" : `View ${hashes.length} Leaf Hashes`}
          </button>

          {isExpanded && (
            <div className="noshadow-scroll" style={{ padding: 10, background: 'var(--canvas)', borderRadius: 10 }}>
              {hashes.map((entry) => (
                <div key={entry.index} className="hash-node">
                  <div className="hash-id">{entry.index + 1}</div>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: 12, fontWeight: 600, marginBottom: 2 }}>Reg: {entry.registrationNo}</p>
                    <p className="hash-label">{entry.hash}</p>
                  </div>
                  <CopyButton text={entry.hash} />
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
