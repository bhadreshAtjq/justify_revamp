"use client";

import { FaUser, FaIdCard, FaGraduationCap, FaBook } from "react-icons/fa";
import type { OCRResponse } from "@/services/api";

interface OCRResultCardProps {
  result: OCRResponse;
}

export default function OCRResultCard({ result }: OCRResultCardProps) {
  return (
    <div className="glass-card animate-slide-up" style={{ padding: 0, overflow: 'hidden' }}>
      <div style={{ padding: '12px 16px', background: 'rgba(64,81,59,0.05)', borderBottom: '1px solid rgba(64,81,59,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span className="section-meta" style={{ fontSize: 10, margin: 0 }}>RAW EXTRACTION PAYLOAD</span>
        <span style={{ fontSize: 10, opacity: 0.5 }}>APPLICATION/JSON</span>
      </div>
      <div style={{ padding: 20, background: '#1e1e1e', color: '#d4d4d4', fontFamily: 'monospace', fontSize: 11, maxHeight: 400, overflowY: 'auto' }}>
        <pre>{JSON.stringify(result, null, 2)}</pre>
      </div>
    </div>
  );
}
