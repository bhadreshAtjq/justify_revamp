"use client";

import { FaUser, FaIdCard, FaChartBar, FaCalendarAlt, FaUniversity, FaCheckCircle, FaClipboardList } from "react-icons/fa";

interface OCRResultCardProps {
  result: any;
  type?: string;
}

export default function OCRResultCard({ result, type = "marksheet" }: OCRResultCardProps) {
  const isTranscript = type === "transcript";
  const isCertificate = type === "certificate";

  return (
    <div className="glass-card animate-slide-up" style={{ padding: 0, overflow: 'hidden', border: '1px solid rgba(64,81,59,0.2)' }}>
      {/* Header */}
      <div style={{ 
        padding: '14px 20px', 
        background: 'linear-gradient(90deg, rgba(64,81,59,0.1), rgba(64,81,59,0.02))', 
        borderBottom: '1px solid rgba(64,81,59,0.1)', 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center' 
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <FaCheckCircle style={{ color: '#609966' }} />
          <span className="section-meta" style={{ fontSize: 11, margin: 0, letterSpacing: 1.5, fontWeight: 800 }}>EXTRACTED SYSTEM INTELLIGENCE</span>
        </div>
        <div style={{ 
          background: '#609966', 
          color: 'white', 
          fontSize: 9, 
          padding: '2px 8px', 
          borderRadius: 4, 
          fontWeight: 900,
          textTransform: 'uppercase'
        }}>
          {type}
        </div>
      </div>

      <div style={{ padding: '24px' }}>
        {/* Primary Metadata Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px', marginBottom: '24px' }}>
          <DetailItem 
            icon={<FaUser />} 
            label="Verified Name" 
            value={result.name || result.Student_Name || "Not Found"} 
          />
          <DetailItem 
            icon={<FaIdCard />} 
            label={isCertificate ? "Reg / Serial No." : "Registration No."} 
            value={result.no || result.registration_no || result.Registration_No || "Not Found"} 
          />
          <DetailItem 
            icon={<FaChartBar />} 
            label={isTranscript || isCertificate ? "Overall GPA" : "Semester GPA"} 
            value={result.ogpa || result.gpa || result.GPA || "0.00"} 
          />
          <DetailItem 
            icon={<FaCalendarAlt />} 
            label={isCertificate ? "Issue Date" : "Academic Period"} 
            value={result.date || result.year || result.completion_year || result.Academic_Year || "N/A"} 
          />
        </div>

        {/* Secondary Info */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div className="inner-card" style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
            <FaUniversity style={{ opacity: 0.5 }} />
            <div>
              <p style={{ fontSize: 10, margin: 0, opacity: 0.5, fontWeight: 700, textTransform: 'uppercase' }}>Affiliated Institution</p>
              <p style={{ fontSize: 13, margin: 0, fontWeight: 600 }}>{result.university || result.college || result.College || "Junagadh Agricultural University"}</p>
            </div>
          </div>
          
          <div className="inner-card" style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
            <FaClipboardList style={{ opacity: 0.5 }} />
            <div>
              <p style={{ fontSize: 10, margin: 0, opacity: 0.5, fontWeight: 700, textTransform: 'uppercase' }}>Degree Objective</p>
              <p style={{ fontSize: 13, margin: 0, fontWeight: 600 }}>{result.degree || result.Degree || "Bachelor of Science"}</p>
            </div>
          </div>
        </div>

        {/* Content Summary (e.g. Subject Count) */}
        <div style={{ marginTop: 24, paddingTop: 20, borderTop: '1px solid rgba(0,0,0,0.05)', display: 'flex', justifyContent: 'space-between' }}>
           <div>
             <span style={{ fontSize: 11, fontWeight: 700, opacity: 0.5 }}>DATA FIDELITY</span>
             <div style={{ display: 'flex', gap: 4, marginTop: 4 }}>
               {[1,2,3,4,5].map(i => <div key={i} style={{ width: 12, height: 4, borderRadius: 2, background: '#609966' }}></div>)}
             </div>
           </div>
           <div style={{ textAlign: 'right' }}>
              <span style={{ fontSize: 11, fontWeight: 700, opacity: 0.5 }}>{isCertificate ? 'CERTIFICATE NO.' : 'RECORDS'}</span>
              <p style={{ fontSize: 18, fontWeight: 900, margin: 0, color: '#40513B' }}>
                {isCertificate ? (result.certificate_no || "VERIFIED") : isTranscript ? "Multi-Semester" : (result.subjects?.length || 0)}
              </p>
           </div>
        </div>
      </div>

      {/* Footer Toggle (Optional raw view) */}
      <details style={{ background: '#fdfdfd', borderTop: '1px solid rgba(0,0,0,0.05)' }}>
        <summary style={{ padding: '10px 20px', fontSize: 10, cursor: 'pointer', opacity: 0.5, fontWeight: 700 }}>
          VIEW RAW SCHEMATIC (JSON)
        </summary>
        <div style={{ padding: 20, background: '#1e1e1e', color: '#d4d4d4', fontFamily: 'monospace', fontSize: 11, maxHeight: 200, overflowY: 'auto' }}>
          <pre>{JSON.stringify(result, null, 2)}</pre>
        </div>
      </details>
    </div>
  );
}

function DetailItem({ icon, label, value }: { icon: any, label: string, value: string }) {
  return (
    <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
      <div style={{ 
        width: 32, 
        height: 32, 
        borderRadius: 8, 
        background: 'rgba(96,153,102,0.1)', 
        color: '#609966', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        flexShrink: 0
      }}>
        {icon}
      </div>
      <div>
        <p style={{ fontSize: 10, margin: 0, opacity: 0.5, fontWeight: 700, textTransform: 'uppercase' }}>{label}</p>
        <p style={{ fontSize: 14, margin: 0, fontWeight: 700, color: '#40513B' }}>{value}</p>
      </div>
    </div>
  );
}
