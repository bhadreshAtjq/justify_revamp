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
    <div className="glass-card animate-slide-up" style={{ padding: 0, overflow: 'hidden' }}>
      {/* Header */}
      <div style={{ 
        padding: '12px 18px', 
        background: 'var(--canvas)', 
        borderBottom: '1px solid var(--border)', 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center' 
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <FaCheckCircle style={{ color: '#2D6A4F', fontSize: 12 }} />
          <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1.2, color: '#929AAB', textTransform: 'uppercase' }}>EXTRACTED DATA</span>
        </div>
        <div style={{ 
          background: '#393E46', 
          color: '#F7F7F7', 
          fontSize: 9, 
          padding: '2px 8px', 
          borderRadius: 4, 
          fontWeight: 700,
          textTransform: 'uppercase',
          letterSpacing: '0.5px',
        }}>
          {type}
        </div>
      </div>

      <div style={{ padding: '20px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px', marginBottom: '20px' }}>
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

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div className="inner-card" style={{ padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 10 }}>
            <FaUniversity style={{ color: '#929AAB', fontSize: 13 }} />
            <div>
              <p style={{ fontSize: 10, margin: 0, color: '#929AAB', fontWeight: 700, textTransform: 'uppercase' }}>Affiliated Institution</p>
              <p style={{ fontSize: 13, margin: 0, fontWeight: 600, color: '#222831' }}>{result.university || result.college || result.College || "Junagadh Agricultural University"}</p>
            </div>
          </div>
          
          <div className="inner-card" style={{ padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 10 }}>
            <FaClipboardList style={{ color: '#929AAB', fontSize: 13 }} />
            <div>
              <p style={{ fontSize: 10, margin: 0, color: '#929AAB', fontWeight: 700, textTransform: 'uppercase' }}>Degree Objective</p>
              <p style={{ fontSize: 13, margin: 0, fontWeight: 600, color: '#222831' }}>{result.degree || result.Degree || "Bachelor of Science"}</p>
            </div>
          </div>
        </div>

        <div style={{ marginTop: 20, paddingTop: 16, borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between' }}>
           <div>
             <span style={{ fontSize: 10, fontWeight: 700, color: '#929AAB' }}>DATA FIDELITY</span>
             <div style={{ display: 'flex', gap: 3, marginTop: 4 }}>
               {[1,2,3,4,5].map(i => <div key={i} style={{ width: 10, height: 3, borderRadius: 2, background: '#393E46' }}></div>)}
             </div>
           </div>
           <div style={{ textAlign: 'right' }}>
              <span style={{ fontSize: 10, fontWeight: 700, color: '#929AAB' }}>{isCertificate ? 'CERTIFICATE NO.' : 'RECORDS'}</span>
              <p style={{ fontSize: 18, fontWeight: 800, margin: 0, color: '#222831' }}>
                {isCertificate ? (result.certificate_no || "VERIFIED") : isTranscript ? "Multi-Semester" : (result.subjects?.length || 0)}
              </p>
           </div>
        </div>
      </div>

      <details style={{ background: 'var(--canvas)', borderTop: '1px solid var(--border)' }}>
        <summary style={{ padding: '10px 18px', fontSize: 10, cursor: 'pointer', color: '#929AAB', fontWeight: 700, letterSpacing: '0.5px' }}>
          VIEW RAW JSON
        </summary>
        <div style={{ padding: 18, background: '#1E1E1E', color: '#D4D4D4', fontFamily: "'JetBrains Mono', monospace", fontSize: 11, maxHeight: 200, overflowY: 'auto' }}>
          <pre style={{ margin: 0 }}>{JSON.stringify(result, null, 2)}</pre>
        </div>
      </details>
    </div>
  );
}

function DetailItem({ icon, label, value }: { icon: any, label: string, value: string }) {
  return (
    <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
      <div style={{ 
        width: 30, 
        height: 30, 
        borderRadius: 8, 
        background: 'var(--canvas)', 
        color: '#929AAB', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        flexShrink: 0,
        fontSize: 12,
        border: '1px solid var(--border)',
      }}>
        {icon}
      </div>
      <div>
        <p style={{ fontSize: 10, margin: 0, color: '#929AAB', fontWeight: 700, textTransform: 'uppercase' }}>{label}</p>
        <p style={{ fontSize: 13, margin: 0, fontWeight: 600, color: '#222831' }}>{value}</p>
      </div>
    </div>
  );
}
