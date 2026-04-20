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
    accentColor = "#FF6B6B";
    label = "Document Revoked";
    subtitle = "SECURITY ALERT";
    description = "This transcript has been explicitly invalidated by the University's registrar.";
  } else if (isAnchored && isDBMatched) {
    icon = <FaCheckCircle />;
    accentColor = "#609966";
    label = "Fully Authenticated";
    subtitle = "DB + BLOCKCHAIN MATCH";
    description = "The document matches our internal registry records and is anchored on the blockchain.";
  } else if (isAnchored && !isDBMatched) {
    icon = <FaCheckCircle />;
    accentColor = "#A4BE7B";
    label = "Anchored but Not in DB";
    subtitle = "BLOCKCHAIN ONLY";
    description = "This document is verified on the blockchain, but no matching student record was found in our local database.";
  } else if (!isAnchored && isDBMatched) {
    icon = <FaExclamationTriangle />;
    accentColor = "#E6BA95";
    label = "Record Found, Not Anchored";
    subtitle = "REGISTRY MATCH ONLY";
    description = "A matching record was found in our database, but it has not been anchored on the blockchain yet.";
  } else {
    icon = <FaTimesCircle />;
    accentColor = "#40513B";
    label = "Verification Failed";
    subtitle = "INVALID DOCUMENT";
    description = "This document hash does not exist in our database or on the blockchain.";
  }

  return (
    <div className="animate-slide-up" style={{ 
      background: 'white', 
      borderRadius: 24, 
      overflow: 'hidden', 
      boxShadow: '0 20px 40px rgba(0,0,0,0.05)',
      border: '1px solid rgba(0,0,0,0.05)'
    }}>
      <div style={{ background: accentColor, padding: '40px 32px', textAlign: 'center', color: 'white' }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>{icon}</div>
        <p style={{ fontSize: 11, fontWeight: 900, letterSpacing: 3, opacity: 0.8, marginBottom: 8 }}>{subtitle}</p>
        <h2 style={{ color: 'white', fontSize: 24 }}>{label}</h2>
      </div>
      
      <div style={{ padding: '32px', textAlign: 'center' }}>
        <p style={{ color: '#40513B', opacity: 0.7, marginBottom: 24 }}>{description}</p>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {result.onChain.blockNumber && isAnchored && (
            <div className="inner-card" style={{ padding: '12px 24px' }}>
              <span style={{ fontSize: 11, fontWeight: 700, opacity: 0.5, textTransform: 'uppercase', marginRight: 12 }}>Blockchain Block</span>
              <span style={{ fontFamily: 'JetBrains Mono', fontWeight: 800 }}>{result.onChain.blockNumber}</span>
            </div>
          )}

          {isDBMatched && result.db.name && (
            <div className="inner-card" style={{ padding: '12px 24px', textAlign: 'left' }}>
              <p style={{ fontSize: 11, fontWeight: 700, opacity: 0.5, textTransform: 'uppercase', marginBottom: 4 }}>Registered Student</p>
              <p style={{ fontWeight: 800 }}>{result.db.name}</p>
              <p style={{ fontSize: 12, opacity: 0.7 }}>Reg No: {result.db.registrationNo}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );

}
