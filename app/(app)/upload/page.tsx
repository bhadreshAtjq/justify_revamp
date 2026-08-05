"use client";

import { useCallback, useState, useEffect, useMemo } from "react";
import { useSession } from "next-auth/react";
import { useAppStore } from "@/store/useAppStore";
import { parseCSV, validateCSVForHashing } from "@/lib/csv";
import { generateHashesFromRecords } from "@/lib/hash";
import { buildMerkleTree } from "@/lib/merkle";
import { anchorRoot, syncRecordsToDB } from "@/services/api";

import FileUploadDropzone from "@/components/FileUploadDropzone";
import CSVPreviewTable from "@/components/CSVPreviewTable";
import HashGeneratorPanel from "@/components/HashGeneratorPanel";
import MerkleTreePanel from "@/components/MerkleTreePanel";
import BlockchainStatusCard from "@/components/BlockchainStatusCard";
import ActivityLog from "@/components/ActivityLog";
import AnchorChecklist from "@/components/AnchorChecklist";
import AnalyticsSection from "@/components/AnalyticsSection";
import { FaDownload, FaRocket, FaDatabase, FaShieldAlt, FaPlus, FaList, FaChartLine, FaSearch } from "react-icons/fa";
import { toast } from "react-hot-toast";
import { downloadSample } from "@/lib/samples";


interface Institution {
  id: string;
  name: string;
}

export default function DashboardPage() {
  const { data: session } = useSession();
  const store = useAppStore();
  const [uploadType, setUploadType] = useState<"marksheet" | "certificate" | "transcript">("marksheet");

  // Super Admin specific state
  const [institutions, setInstitutions] = useState<any[]>([]);
  const [isInstLoading, setIsInstLoading] = useState(false);
  const [instSearch, setInstSearch] = useState("");
  const [showInstDropdown, setShowInstDropdown] = useState(false);


  const fetchInstitutions = useCallback(async () => {
    setIsInstLoading(true);
    try {
      const res = await fetch("/api/admin/tenants");
      const data = await res.json();
      setInstitutions(data);
    } catch (err) {
      console.error("Failed to load institutions", err);
    } finally {
      setIsInstLoading(false);
    }
  }, []);

  // Auto-populate university name from session
  useEffect(() => {
    if (session?.user?.institutionName && !store.university) {
      store.setUniversity(session.user.institutionName);
    }
    
    if (session?.user?.role === "SUPER_ADMIN") {
      fetchInstitutions();
    }
  }, [session, store, fetchInstitutions]);

  const filteredInstitutions = useMemo(() => {
    return institutions.filter(i => 
      i.name.toLowerCase().includes(instSearch.toLowerCase())
    );
  }, [institutions, instSearch]);

  const handleCSVUpload = useCallback(
    async (file: File) => {
      store.setError(null);
      store.setLoading("isParsingCSV", true);
      store.setCSVFile(file);

      try {
        const text = await file.text();
        const { headers, records } = parseCSV(text);
        const validation = validateCSVForHashing(headers, uploadType);
        
        if (!validation.valid) {
          const detail = validation.error || `Missing columns: ${validation.missing.join(", ")}`;
          throw new Error(`Invalid CSV: ${detail}`);
        }
        
        store.setCSVData(headers, records);
        store.addActivityLog("csv_uploaded", `Ingested dataset: ${file.name} (${records.length} records)`);

        store.setLoading("isSyncing", true);
        try {
          await syncRecordsToDB(records, uploadType);
          store.addActivityLog("csv_uploaded", "Database synchronization complete");
        } catch (dbErr) {
          console.error("DB Sync Error:", dbErr);
          store.addActivityLog("csv_uploaded", "Local cache active (DB sync pending)");
        } finally {
          store.setLoading("isSyncing", false);
        }

      } catch (err) {
        store.setError(err instanceof Error ? err.message : "Parse Error");
        store.setCSVFile(null);
      } finally {
        store.setLoading("isParsingCSV", false);
      }
    },
    [store, uploadType]
  );

  const handleGenerateHashes = useCallback(() => {
    store.setError(null);
    store.setLoading("isGeneratingHashes", true);
    try {
      const hashes = generateHashesFromRecords(store.csvRecords, store.hashConfig, uploadType);
      store.setHashes(hashes);
      store.addActivityLog("hashes_generated", `${hashes.length} cryptographic proofs generated`);
    } catch (err) {
      store.setError(err instanceof Error ? err.message : "Hashing failed");
    } finally {
      store.setLoading("isGeneratingHashes", false);
    }
  }, [store, uploadType]);

  const [alreadyAnchored, setAlreadyAnchored] = useState(false);

  const handleGenerateMerkle = useCallback(async () => {
    store.setError(null);
    setAlreadyAnchored(false);
    store.setLoading("isGeneratingMerkle", true);
    try {
      const { root, leaves } = buildMerkleTree(store.hashes.map((h) => h.hash));
      store.setMerkleData(root, leaves);
      store.addActivityLog("root_generated", `Merkle Root fixed: ${root.slice(0, 16)}...`);

      // Check for duplicates
      const res = await fetch(`/api/anchor-root?root=${root}`);
      const checkData = await res.json();
      if (checkData.exists && checkData.anchor.status === "confirmed") {
        setAlreadyAnchored(true);
        const errorMsg = "This batch has already been anchored to the blockchain. Duplicate submissions are restricted.";
        store.setError(errorMsg);
        toast.error(errorMsg, { duration: 6000 });
        store.addActivityLog("anchored", "Pre-validation: Duplicate Merkle Root detected in ledger.");
      }


    } catch (err) {
      store.setError(err instanceof Error ? err.message : "Merkle build failed");
    } finally {
      store.setLoading("isGeneratingMerkle", false);
    }
  }, [store]);


  const handleAnchor = useCallback(async () => {
    if (!store.university.trim()) {
      store.setError("Institutional identity required to anchor root.");
      return;
    }
    store.setError(null);
    store.setLoading("isAnchoring", true);
    try {
      const result = await anchorRoot(
        store.merkleRoot,
        store.university,
        store.year,
        store.merkleLeaves
      );
      store.setAnchorResult(result);
      store.addActivityLog("anchored", `Root anchored on-chain. TX: ${result.txHash.slice(0, 10)}...`);
    } catch (err) {
      store.setError(err instanceof Error ? err.message : "Anchoring failed");
    } finally {
      store.setLoading("isAnchoring", false);
    }
  }, [store]);

  return (
    <div className="dash-wrapper animate-slide-up">
      <header className="dash-header">
        <div className="dash-header-title">
          <div className="dash-meta">INSTITUTIONAL HUB</div>
          <h1>Dashboard</h1>
          <p>Secure, verify, and anchor academic records to the global ledger.</p>
        </div>
      </header>

      {store.error && (
        <div className="dash-alert dash-alert-error animate-slide-up">
          <FaShieldAlt className="dash-alert-icon" />
          <p>{store.error}</p>
          <button onClick={() => store.setError(null)} className="dash-alert-close">×</button>
        </div>
      )}

      <div style={{ marginBottom: '16px' }} className="animate-slide-up">
        <AnalyticsSection />
      </div>

      <div className="dash-grid">
        <div className="dash-main-col">
            <section className="dash-section animate-slide-up">
              <div className="dash-section-header">
                <h2>STEP 01 <span>-- DATA SOURCE</span></h2>
                <button onClick={() => downloadSample(uploadType)} className="dash-download-btn">
                  <FaDownload /> DOWNLOAD {uploadType.toUpperCase()} TEMPLATE
                </button>
              </div>
              <div className="dash-card">
                <FileUploadDropzone
                  accept=".csv"
                  acceptLabel={`${uploadType.charAt(0).toUpperCase() + uploadType.slice(1)} Data Ingestion (CSV)`}
                  onFileSelect={handleCSVUpload}
                  currentFile={store.csvFile}
                  onClear={() => store.resetDashboard()}
                />
              </div>
            </section>

            {store.csvHeaders.length > 0 && (
              <section className="dash-section animate-slide-up">
                <div className="dash-section-header"><h2>STEP 02 <span>-- DATA VALIDATION</span></h2></div>
                <div className="dash-card p-0 overflow-hidden">
                  <CSVPreviewTable headers={store.csvHeaders} records={store.csvRecords} fileName={""} type={uploadType} />
                  <div style={{ borderTop: '1px solid var(--border)', padding: '24px', background: 'var(--surface)' }}>
                    <AnchorChecklist />
                  </div>
                </div>
              </section>
            )}

            {store.csvRecords.length > 0 && (
              <section className="dash-section animate-slide-up">
                <div className="dash-section-header"><h2>STEP 03 <span>-- CRYPTOGRAPHIC SEALING</span></h2></div>
                <HashGeneratorPanel
                  hashes={store.hashes}
                  isGenerating={store.isGeneratingHashes}
                  onGenerate={handleGenerateHashes}
                  canGenerate={true}
                />
                {store.hashes.length > 0 && (
                  <div className="mt-6">
                    <MerkleTreePanel
                      merkleRoot={store.merkleRoot}
                      leaves={store.merkleLeaves}
                      isGenerating={store.isGeneratingMerkle}
                      onGenerate={handleGenerateMerkle}
                      canGenerate={true}
                    />
                  </div>
                )}
              </section>
            )}

            {store.merkleRoot && (
              <section className="dash-section animate-slide-up">
                <div className="dash-section-header"><h2>STEP 04 <span>-- BLOCKCHAIN ANCHORING</span></h2></div>
                {!store.anchorResult ? (
                  <div className="dash-card">
                    <div className="dash-form-grid">
                      <div className="dash-field">
                        <label>Institution</label>
                        {session?.user?.role === "SUPER_ADMIN" ? (
                          <div className="dash-dropdown-container">
                            <div onClick={() => setShowInstDropdown(!showInstDropdown)} className="dash-input dash-dropdown-trigger">
                              <span>{store.university || "Select Institution"}</span>
                              <FaPlus className={`dropdown-icon ${showInstDropdown ? 'open' : ''}`} />
                            </div>

                            {showInstDropdown && (
                              <div className="dash-dropdown-menu animate-slide-up">
                                <div className="dash-search-wrap">
                                  <FaSearch className="search-icon" />
                                  <input 
                                    className="dash-input search-input"
                                    placeholder="Filter by name..."
                                    value={instSearch}
                                    onChange={(e) => setInstSearch(e.target.value)}
                                    onClick={(e) => e.stopPropagation()}
                                  />
                                </div>
                                {filteredInstitutions.length === 0 ? (
                                  <div className="empty-state">No institutions found</div>
                                ) : (
                                  <div className="dash-dropdown-list">
                                    {filteredInstitutions.map((inst) => (
                                      <div 
                                        key={inst.id}
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          store.setUniversity(inst.name);
                                          setShowInstDropdown(false);
                                        }}
                                        className={`dropdown-item ${store.university === inst.name ? 'selected' : ''}`}
                                      >
                                        <div className="inst-name">{inst.name}</div>
                                        <div className="inst-slug">{inst.slug}</div>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        ) : (
                          <input
                            className="dash-input"
                            placeholder="e.g. University Name"
                            value={store.university}
                            onChange={(e) => store.setUniversity(e.target.value)}
                            disabled={session?.user?.role !== "SUPER_ADMIN"}
                          />
                        )}
                      </div>
                      <div className="dash-field">
                        <label>Academic Year</label>
                        <input
                          className="dash-input"
                          placeholder="2026"
                          value={store.year}
                          onChange={(e) => store.setYear(e.target.value)}
                        />
                      </div>
                    </div>
                    <button 
                      onClick={handleAnchor} 
                      className="dash-btn-primary full-width mt-6" 
                      disabled={store.isAnchoring || alreadyAnchored}
                    >
                      <FaRocket /> {store.isAnchoring ? "Broadcasting to Polygon..." : alreadyAnchored ? "Already Anchored" : "Anchor Permanent Proof"}
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <BlockchainStatusCard result={store.anchorResult} />
                    <button 
                      onClick={() => {
                        const proof = { root: store.merkleRoot, anchor: store.anchorResult, university: store.university };
                        const blob = new Blob([JSON.stringify(proof, null, 2)], { type: "application/json" });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement("a");
                        a.href = url;
                        a.download = `proof-${store.university}.json`;
                        a.click();
                      }} 
                      className="dash-btn-primary full-width"
                    >
                      <FaDownload /> Download Session Proof (JSON)
                    </button>
                  </div>
                )}
              </section>
            )}
          </div>

          <div className="dash-side-col">
            <div className="dash-card" style={{ marginBottom: '24px' }}>
              <h3 className="dash-card-title">Document Type</h3>
              <div className="dash-doc-tabs">
                <div className="dash-tabs-bg">
                  <div className="dash-tabs-slider doc-slider" style={{
                    transform: `translateX(${
                      uploadType === 'marksheet' ? '0%' : 
                      uploadType === 'certificate' ? '100%' : '200%'
                    })`
                  }} />
                  {(["marksheet", "certificate", "transcript"] as const).map((t) => (
                    <button
                      key={t}
                      onClick={() => { setUploadType(t); store.resetDashboard(); }}
                      className={`dash-tab doc-tab ${uploadType === t ? "active" : ""}`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>
            </div>

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
          margin-bottom: 16px;
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
          color: #000000;
        }

        /* TABS (Segmented Control) */
        .dash-tabs-bg {
          display: flex;
          position: relative;
          background: #F1F5F9;
          border-radius: 12px;
          padding: 4px;
          border: 1px solid #E2E8F0;
        }
        .dash-tabs-slider {
          position: absolute;
          width: calc(25% - 2px);
          height: calc(100% - 8px);
          background: #FFFFFF;
          border: 1px solid rgba(15, 23, 42, 0.04);
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(15, 23, 42, 0.05);
          transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .dash-tabs-slider.doc-slider {
          width: calc(33.333% - 2.66px);
        }
        .dash-tab {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 10px 16px;
          border: none;
          background: transparent;
          font-size: 13px;
          font-weight: 600;
          color: #607D8B;
          cursor: pointer;
          position: relative;
          z-index: 10;
          font-family: inherit;
          transition: color 0.2s;
        }
        .dash-tab.doc-tab {
          text-transform: capitalize;
        }
        .dash-tab.active {
          color: #000000;
        }
        .dash-tab svg {
          font-size: 12px;
        }

        /* ALERTS */
        .dash-alert {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 16px 20px;
          border-radius: 12px;
          margin-bottom: 32px;
          font-size: 14px;
          font-weight: 500;
        }
        .dash-alert-error {
          background: #FEF2F2;
          border: 1px solid #FEE2E2;
          color: #B91C1C;
        }
        .dash-alert-icon {
          flex-shrink: 0;
          font-size: 16px;
        }
        .dash-alert-close {
          margin-left: auto;
          background: none;
          border: none;
          color: inherit;
          opacity: 0.5;
          cursor: pointer;
          font-size: 20px;
          padding: 0 8px;
          transition: opacity 0.2s;
        }
        .dash-alert-close:hover { opacity: 1; }

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
        .dash-card.p-0 { padding: 0; }
        .dash-card.overflow-hidden { overflow: hidden; }
        
        .dash-card-title {
          font-size: 15px;
          font-weight: 700;
          color: #263238;
          margin-bottom: 20px;
        }

        /* SECTION HEADERS */
        .dash-section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 16px;
        }
        .dash-section-header h2 {
          font-size: 12px;
          font-weight: 700;
          color: #000000;
          letter-spacing: 0.05em;
        }
        .dash-section-header h2 span {
          color: #94A3B8;
        }
        .dash-download-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          background: none;
          border: none;
          color: #607D8B;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.05em;
          cursor: pointer;
          transition: color 0.2s;
        }
        .dash-download-btn:hover { color: #000000; }

        /* FORMS & INPUTS */
        .dash-form-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
        }
        .dash-field label {
          display: block;
          font-size: 11px;
          font-weight: 700;
          color: #607D8B;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          margin-bottom: 8px;
        }
        .dash-input {
          width: 100%;
          padding: 12px 16px;
          background: #F4FAFA;
          border: 1px solid #E2E8F0;
          border-radius: 10px;
          font-size: 14px;
          color: #000000;
          font-family: inherit;
          transition: all 0.2s;
          outline: none;
        }
        .dash-input:focus {
          border-color: #000000;
          background: #FFFFFF;
          box-shadow: 0 0 0 3px rgba(211, 255, 233, 0.1);
        }

        /* BUTTONS */
        .dash-btn-primary {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 14px 24px;
          background: #D3FFE9;
          border: 1px solid #D3FFE9;
          border-radius: 10px;
          font-size: 14px;
          font-weight: 600;
          color: #000000;
          cursor: pointer;
          transition: all 0.2s;
          box-shadow: 0 4px 12px rgba(211, 255, 233, 0.2);
        }
        .dash-btn-primary:hover:not(:disabled) {
          background: linear-gradient(135deg, #D3FFE9, #D3FFE9);
          border-color: #000000;
          transform: translateY(-1px);
          box-shadow: 0 6px 16px rgba(211, 255, 233, 0.3);
        }
        .dash-btn-primary:active:not(:disabled) {
          transform: translateY(1px);
        }
        .dash-btn-primary:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        .full-width { width: 100%; }
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

        /* CUSTOM DROPDOWN */
        .dash-dropdown-container {
          position: relative;
        }
        .dash-dropdown-trigger {
          display: flex;
          justify-content: space-between;
          align-items: center;
          cursor: pointer;
        }
        .dropdown-icon {
          color: #94A3B8;
          transition: transform 0.2s;
        }
        .dropdown-icon.open {
          transform: rotate(45deg);
        }
        .dash-dropdown-menu {
          position: absolute;
          top: calc(100% + 8px);
          left: 0;
          width: 100%;
          background: #FFFFFF;
          border: 1px solid #E2E8F0;
          border-radius: 12px;
          box-shadow: 0 10px 25px rgba(15, 23, 42, 0.1);
          z-index: 100;
          padding: 8px;
        }
        .dash-search-wrap {
          position: relative;
          margin-bottom: 8px;
        }
        .search-icon {
          position: absolute;
          left: 12px;
          top: 50%;
          transform: translateY(-50%);
          color: #94A3B8;
          font-size: 12px;
        }
        .search-input {
          padding-left: 32px;
          padding-top: 10px;
          padding-bottom: 10px;
          border-radius: 8px;
        }
        .dash-dropdown-list {
          max-height: 240px;
          overflow-y: auto;
        }
        .dropdown-item {
          padding: 10px 12px;
          border-radius: 8px;
          cursor: pointer;
          transition: background 0.15s;
        }
        .dropdown-item:hover { background: #F4FAFA; }
        .dropdown-item.selected { background: #EFF6FF; }
        .inst-name {
          font-size: 14px;
          font-weight: 600;
          color: #000000;
          margin-bottom: 2px;
        }
        .inst-slug {
          font-size: 11px;
          color: #607D8B;
        }
        .empty-state {
          padding: 16px;
          text-align: center;
          font-size: 13px;
          color: #607D8B;
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
