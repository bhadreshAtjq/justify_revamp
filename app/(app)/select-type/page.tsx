"use client";

import { useRouter } from "next/navigation";
import { useAppStore } from "@/store/useAppStore";
import ActivityLog from "@/components/ActivityLog";
import { FaFileAlt, FaCertificate, FaGraduationCap, FaDatabase } from "react-icons/fa";

export default function SelectTypePage() {
  const router = useRouter();
  const store = useAppStore();

  const handleSelect = (type: "marksheet" | "certificate" | "transcript") => {
    store.setUploadType(type);
    store.resetDashboard();
    router.push("/dashboard");
  };

  return (
    <div className="dash-wrapper animate-slide-up">
      <header className="dash-header">
        <div className="dash-header-title">
          <div className="dash-meta">NEW UPLOAD</div>
          <h1>Select Document Type</h1>
          <p>Choose the type of document you want to upload and anchor to the blockchain.</p>
        </div>
      </header>

      <div className="dash-grid">
        <div className="dash-main-col">
          <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
            {[
              { id: 'marksheet', label: 'Marksheet', icon: FaFileAlt, desc: 'Upload student marksheets containing grades and subjects for verification.' },
              { id: 'certificate', label: 'Certificate', icon: FaCertificate, desc: 'Upload degree or completion certificates for permanent blockchain anchoring.' },
              { id: 'transcript', label: 'Transcript', icon: FaGraduationCap, desc: 'Upload full academic transcripts with multiple semesters of records.' }
            ].map((item) => (
              <div 
                key={item.id}
                onClick={() => handleSelect(item.id as any)}
                className="dash-card"
                style={{ 
                  flex: '1 1 calc(50% - 24px)',
                  minWidth: 260,
                  cursor: 'pointer', 
                  transition: 'all 0.2s', 
                  display: 'flex', 
                  flexDirection: 'column', 
                  alignItems: 'center', 
                  textAlign: 'center',
                  padding: '40px 32px'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.transform = 'translateY(-6px)';
                  e.currentTarget.style.boxShadow = '0 12px 24px -4px rgba(0, 0, 0, 0.08), 0 4px 6px -2px rgba(0, 0, 0, 0.04)';
                  e.currentTarget.style.borderColor = '#000000';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.02), 0 2px 4px -1px rgba(0, 0, 0, 0.02)';
                  e.currentTarget.style.borderColor = '#E2E8F0';
                }}
              >
                <div style={{ width: 72, height: 72, borderRadius: '50%', background: '#F4FAFA', border: '1px solid #D3FFE9', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 24 }}>
                  <item.icon style={{ fontSize: 32, color: '#000000' }} />
                </div>
                <h3 style={{ fontSize: 20, fontWeight: 700, color: '#000000', marginBottom: 12 }}>{item.label}</h3>
                <p style={{ fontSize: 14, color: '#607D8B', lineHeight: 1.5 }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="dash-side-col">
            <ActivityLog entries={store.activityLog} />

            <div className="dash-card mt-8">
              <h3 className="dash-card-title">Infrastructure Status</h3>
              <div className="status-list">
                <div className="status-item">
                  <div className="status-label">
                    <div className="status-dot green"></div>
                    <span>Blockchain Network</span>
                  </div>
                  <span className="status-badge green">ONLINE</span>
                </div>
                <div className="status-item">
                  <div className="status-label">
                    <div className="status-dot green"></div>
                    <span>Database Cluster</span>
                  </div>
                  <span className="status-badge green">SYNCED</span>
                </div>
                <div className="status-item">
                  <div className="status-label">
                    <div className="status-dot green"></div>
                    <span>Hash Engine (Keccak256)</span>
                  </div>
                  <span className="status-badge green">READY</span>
                </div>
              </div>
            </div>
            
            {store.isSyncing && (
              <div className="dash-card sync-card animate-slide-up mt-6">
                <FaDatabase className="sync-icon" />
                <div>
                  <div className="sync-title">PERSISTENCE ACTIVE</div>
                  <div className="sync-desc">Syncing local data to PostgreSQL...</div>
                </div>
              </div>
            )}
        </div>
      </div>

      <style jsx>{`
        .dash-wrapper {
          padding-bottom: 60px;
        }

        /* HEADER */
        .dash-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          margin-bottom: 32px;
        }
        .dash-meta {
          font-size: 12px;
          font-weight: 700;
          color: #000000;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          margin-bottom: 8px;
        }
        .dash-header-title h1 {
          font-size: 32px;
          font-weight: 800;
          color: #000000;
          letter-spacing: -0.03em;
          margin-bottom: 8px;
        }
        .dash-header-title p {
          font-size: 15px;
          color: #607D8B;
        }

        /* GRID LAYOUT */
        .dash-grid {
          display: grid;
          grid-template-columns: minmax(0, 1.6fr) minmax(0, 1fr);
          gap: 32px;
          align-items: start;
        }
        @media (max-width: 1024px) {
          .dash-grid {
            grid-template-columns: 1fr;
          }
        }
        .dash-main-col {
          display: flex;
          flex-direction: column;
          gap: 40px;
        }

        /* CARDS */
        .dash-card {
          background: #FFFFFF;
          border: 1px solid #E2E8F0;
          border-radius: 16px;
          padding: 24px;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.02), 0 2px 4px -1px rgba(0, 0, 0, 0.02);
        }
        .dash-card-title {
          font-size: 15px;
          font-weight: 700;
          color: #263238;
          margin-bottom: 20px;
        }

        .mt-6 { margin-top: 24px; }
        .mt-8 { margin-top: 32px; }

        /* STATUS LIST */
        .status-list {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .status-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .status-label {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 14px;
          font-weight: 500;
          color: #334155;
        }
        .status-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
        }
        .status-dot.green { background: #D3FFE9; }
        .status-badge {
          font-size: 11px;
          font-weight: 700;
          padding: 4px 10px;
          border-radius: 20px;
          letter-spacing: 0.05em;
        }
        .status-badge.green {
          background: #D1FAE5;
          color: #000000;
        }

        /* SYNC CARD */
        .sync-card {
          background: #D3FFE9;
          color: #000000;
          border: none;
          display: flex;
          align-items: center;
          gap: 16px;
        }
        .sync-icon {
          font-size: 20px;
          color: #3B82F6;
        }
        .sync-title {
          font-size: 12px;
          font-weight: 700;
          letter-spacing: 0.05em;
          margin-bottom: 2px;
        }
        .sync-desc {
          font-size: 13px;
          color: #94A3B8;
        }
      `}</style>
    </div>
  );
}
