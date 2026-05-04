"use client";

import { FaCheckCircle, FaTimesCircle, FaExclamationTriangle } from "react-icons/fa";
import type { VerifyResponse } from "@/services/api";

interface VerificationCardProps {
  result: VerifyResponse;
}

export default function VerificationCard({ result }: VerificationCardProps) {
  let icon: React.ReactNode;
  let accentColor: string;
  let label: string;
  let description: string;
  let subtitle: string;

  const isRevoked = result.onChain.revoked;
  const isAnchored = result.onChain.anchored;
  const isDBMatched = result.db.found;

  if (isRevoked) {
    icon = <FaExclamationTriangle />;
    accentColor = "#C0392B";
    label = "Blockchain Revoked";
    subtitle = "SECURITY ALERT";
    description = "This credential hash has been explicitly revoked on the public blockchain.";
  } else if (isAnchored) {
    icon = <FaCheckCircle />;
    accentColor = "#2D6A4F";
    label = "Verified On-Chain";
    subtitle = "POLYGON AMOY ANCHOR";
    description = "Deterministic proof: This document's hash is securely anchored on the immutable ledger.";
  } else if (isDBMatched) {
    icon = <FaExclamationTriangle />;
    accentColor = "#B8860B";
    label = "Registry Found, Not Anchored";
    subtitle = "PENDING ON-CHAIN";
    description = "Legacy Match: We found a matching administrative record, but it lacks an on-chain anchor.";
  } else {
    icon = <FaTimesCircle />;
    accentColor = "#393E46";
    label = "Verification Failed";
    subtitle = "HASH NOT FOUND";
    description = "This document hash does not exist on the public blockchain or in the central registry.";
  }

  return (
    <div className="animate-slide-up" style={{ 
      background: '#FFFFFF', 
      borderRadius: 12, 
      overflow: 'hidden', 
      border: '1px solid rgba(57,62,70,0.08)',
    }}>
      <div style={{ background: accentColor, padding: '32px 24px', textAlign: 'center', color: 'white' }}>
        <div style={{ fontSize: 40, marginBottom: 12 }}>{icon}</div>
        <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: 2.5, opacity: 0.7, marginBottom: 6 }}>{subtitle}</p>
        <h2 style={{ color: 'white', fontSize: 20, fontWeight: 700 }}>{label}</h2>
      </div>
      
      <div style={{ padding: '24px', textAlign: 'center' }}>
        <p style={{ color: '#929AAB', marginBottom: 20, fontSize: 13 }}>{description}</p>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {result.onChain.blockNumber && isAnchored && (
            <div className="inner-card" style={{ padding: '10px 20px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
              <span style={{ fontSize: 10, fontWeight: 700, color: '#929AAB', textTransform: 'uppercase' }}>Blockchain Block</span>
              <span style={{ fontFamily: "'JetBrains Mono', monospace", fontWeight: 700, color: '#222831' }}>{result.onChain.blockNumber}</span>
            </div>
          )}

          {isDBMatched && result.db.name && (
            <div className="inner-card" style={{ padding: '10px 20px', textAlign: 'left' }}>
              <p style={{ fontSize: 10, fontWeight: 700, color: '#929AAB', textTransform: 'uppercase', marginBottom: 4 }}>Registered Student</p>
              <p style={{ fontWeight: 700, color: '#222831' }}>{result.db.name}</p>
              <p style={{ fontSize: 12, color: '#929AAB' }}>Reg No: {result.db.registrationNo}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );

}
