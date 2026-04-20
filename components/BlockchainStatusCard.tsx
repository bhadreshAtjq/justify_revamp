"use client";

import { FaCheckCircle, FaLink, FaCopy } from "react-icons/fa";
import CopyButton from "./CopyButton";
import type { AnchorResponse } from "@/services/api";

interface BlockchainStatusCardProps {
  result: AnchorResponse;
}

export default function BlockchainStatusCard({ result }: BlockchainStatusCardProps) {
  return (
    <div className="glass-card animate-slide-up" style={{ borderLeft: '8px solid #609966' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h3 style={{ marginBottom: 4 }}>Transaction Record</h3>
          <p style={{ opacity: 0.6, fontSize: 13 }}>Finalized immutable anchor on Ethereal Chain</p>
        </div>
        <div className="success-indicator" style={{ background: 'rgba(96,153,102,0.1)', padding: '8px 16px', borderRadius: 12 }}>
          <FaCheckCircle /> <span style={{ textTransform: 'uppercase', fontSize: 12 }}>{result.status}</span>
        </div>
      </div>

      <div className="space-y-4">
        <div className="inner-card">
          <p className="section-meta" style={{ fontSize: 10 }}>TRANSACTION HASH</p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <p className="hash-label" style={{ fontSize: 13 }}>{result.txHash}</p>
            <CopyButton text={result.txHash} />
          </div>
        </div>

        <div style={{ display: 'flex', gap: 16 }}>
          <div className="inner-card" style={{ flex: 1 }}>
            <p className="section-meta" style={{ fontSize: 10 }}>BLOCK HEIGHT</p>
            <p style={{ fontWeight: 800, fontSize: 18 }}>{result.blockNumber}</p>
          </div>
          <div className="inner-card" style={{ flex: 1 }}>
            <p className="section-meta" style={{ fontSize: 10 }}>NETWORK</p>
            <p style={{ fontWeight: 800, fontSize: 18 }}>ETH-MAINNET</p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 12, marginTop: 12 }}>
          <a
            href={`https://etherscan.io/tx/${result.txHash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-premium btn-solid"
            style={{ flex: 1 }}
          >
            <FaLink /> Verified Explorer
          </a>
        </div>
      </div>
    </div>
  );
}
