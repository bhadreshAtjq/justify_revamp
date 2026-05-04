"use client";

import { FaCheckCircle, FaLink } from "react-icons/fa";
import CopyButton from "./CopyButton";
import type { AnchorResponse } from "@/services/api";

interface BlockchainStatusCardProps {
  result: AnchorResponse;
}

export default function BlockchainStatusCard({ result }: BlockchainStatusCardProps) {
  return (
    <div className="glass-card animate-slide-up" style={{ borderLeft: '3px solid #2D6A4F' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <h3 style={{ marginBottom: 4, fontSize: 15, fontWeight: 700 }}>Transaction Record</h3>
          <p style={{ color: '#929AAB', fontSize: 12 }}>Finalized immutable anchor on Polygon Chain</p>
        </div>
        <div style={{ background: 'rgba(45,106,79,0.06)', padding: '6px 14px', borderRadius: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
          <FaCheckCircle style={{ color: '#2D6A4F', fontSize: 12 }} />
          <span style={{ textTransform: 'uppercase', fontSize: 10, fontWeight: 700, color: '#2D6A4F', letterSpacing: '0.5px' }}>{result.status}</span>
        </div>
      </div>

      <div className="space-y-4">
        <div className="inner-card">
          <p style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1.2px', color: '#929AAB', marginBottom: 6 }}>TRANSACTION HASH</p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <p className="hash-label" style={{ fontSize: 12 }}>{result.txHash}</p>
            <CopyButton text={result.txHash} />
          </div>
        </div>

        <div style={{ display: 'flex', gap: 12 }}>
          <div className="inner-card" style={{ flex: 1 }}>
            <p style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1.2px', color: '#929AAB', marginBottom: 4 }}>BLOCK HEIGHT</p>
            <p style={{ fontWeight: 700, fontSize: 18, color: '#222831' }}>{result.blockNumber}</p>
          </div>
          <div className="inner-card" style={{ flex: 1 }}>
            <p style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1.2px', color: '#929AAB', marginBottom: 4 }}>NETWORK</p>
            <p style={{ fontWeight: 700, fontSize: 18, color: '#222831' }}>AMOY-POLYGON</p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
          <a
            href={`https://amoy.polygonscan.com/tx/${result.txHash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-premium btn-solid"
            style={{ flex: 1, padding: 12 }}
          >
            <FaLink /> View on Explorer
          </a>
        </div>
      </div>
    </div>
  );
}
