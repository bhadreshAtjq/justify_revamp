"use client";

import { useState } from "react";
import { FaCheckCircle, FaHashtag, FaChevronDown, FaChevronUp } from "react-icons/fa";
import CopyButton from "./CopyButton";
import type { HashEntry } from "@/store/useAppStore";
import { keccak256 } from "ethers";

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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h3 style={{ marginBottom: 4 }}>Student Level Hashes</h3>
          <p style={{ opacity: 0.6, fontSize: 13 }}>Generate cryptographic fingerprints for each record</p>
        </div>
        {hashes.length === 0 && (
          <button
            onClick={onGenerate}
            disabled={!canGenerate || isGenerating}
            className="btn-premium btn-solid"
          >
            {isGenerating ? "Processing..." : "Generate 256 Hashes"}
          </button>
        )}
      </div>

      {hashes.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="inner-card" style={{ display: 'flex', alignItems: 'center', gap: 12, borderColor: '#609966' }}>
            <FaCheckCircle style={{ color: '#609966', fontSize: 20 }} />
            <span style={{ fontWeight: 700 }}>Successfully generated {hashes.length} hashes</span>
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
            <div className="noshadow-scroll" style={{ padding: 12, background: 'rgba(0,0,0,0.02)', borderRadius: 12 }}>
              {hashes.map((entry) => (
                <div key={entry.index} className="hash-node">
                  <div className="hash-id">{entry.index + 1}</div>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: 13, fontWeight: 700, marginBottom: 4 }}>Reg: {entry.registrationNo}</p>
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
