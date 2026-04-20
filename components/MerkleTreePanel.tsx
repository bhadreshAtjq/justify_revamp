"use client";

import { useState } from "react";
import { FaFingerprint, FaChevronDown, FaChevronUp } from "react-icons/fa";
import CopyButton from "./CopyButton";

interface MerkleTreePanelProps {
  merkleRoot: string;
  leaves: string[];
  isGenerating: boolean;
  onGenerate: () => void;
  canGenerate: boolean;
}

export default function MerkleTreePanel({
  merkleRoot,
  leaves,
  isGenerating,
  onGenerate,
  canGenerate,
}: MerkleTreePanelProps) {
  const [showLeaves, setShowLeaves] = useState(false);

  return (
    <div className="glass-card animate-slide-up">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h3 style={{ marginBottom: 4 }}>Merkle Root Construction</h3>
          <p style={{ opacity: 0.6, fontSize: 13 }}>Final anchor point for this university session</p>
        </div>
        {!merkleRoot && (
          <button
            onClick={onGenerate}
            disabled={!canGenerate || isGenerating}
            className="btn-premium btn-solid"
          >
            {isGenerating ? "Building Tree..." : "Execute Merkle Build"}
          </button>
        )}
      </div>

      {merkleRoot && (
        <div className="space-y-4">
          <div className="root-emphasized">
            <p className="root-label"><FaFingerprint /> SECURE MERKLE ROOT</p>
            <p className="root-value">{merkleRoot}</p>
            <div style={{ marginTop: 24 }}>
              <CopyButton text={merkleRoot} label="Copy Root" />
            </div>
          </div>

          <button
            onClick={() => setShowLeaves(!showLeaves)}
            className="btn-premium btn-outline btn-block"
            style={{ fontSize: 12 }}
          >
            {showLeaves ? <FaChevronUp /> : <FaChevronDown />}
            {showLeaves ? "Hide Structure" : `Show Tree Structure (${leaves.length} Leaves)`}
          </button>

          {showLeaves && (
            <div className="noshadow-scroll" style={{ padding: 12, background: 'rgba(0,0,0,0.02)', borderRadius: 12 }}>
              {leaves.map((leaf, idx) => (
                <div key={idx} className="hash-node">
                  <div className="hash-id">{idx + 1}</div>
                  <div className="hash-label">{leaf}</div>
                  <CopyButton text={leaf} />
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
