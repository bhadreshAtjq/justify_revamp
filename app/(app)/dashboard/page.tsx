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
import HistorySection from "@/components/HistorySection";
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
  const [activeTab, setActiveTab] = useState<"upload" | "history" | "analytics">("upload");
  const [uploadType, setUploadType] = useState<"marksheet" | "certificate" | "transcript">("marksheet");
  const [refreshTrigger, setRefreshTrigger] = useState(0);

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
          setRefreshTrigger(prev => prev + 1);
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
      setRefreshTrigger(p => p + 1);
    } catch (err) {
      store.setError(err instanceof Error ? err.message : "Anchoring failed");
    } finally {
      store.setLoading("isAnchoring", false);
    }
  }, [store]);

  return (
    <div className="animate-slide-up">
      <div style={{ marginBottom: 32 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <div>
            <div className="section-meta">INSTITUTIONAL HUB</div>
            <h1 className="page-title">Credential Management</h1>
            <p className="page-subtitle">Secure, verify, and anchor academic records to the global ledger.</p>
          </div>
          <div style={{ display: 'flex', gap: 4, padding: 4, background: '#FFFFFF', borderRadius: 10, border: '1px solid rgba(57,62,70,0.08)' }}>
            <button 
              onClick={() => setActiveTab("upload")}
              className={`btn-premium ${activeTab === 'upload' ? 'btn-solid' : ''}`}
              style={{ padding: '8px 16px', fontSize: 12 }}
            >
              <FaPlus /> New Session
            </button>
            <button 
              onClick={() => setActiveTab("history")}
              className={`btn-premium ${activeTab === 'history' ? 'btn-solid' : ''}`}
              style={{ padding: '8px 16px', fontSize: 12 }}
            >
              <FaList /> Repository
            </button>
            <button 
              onClick={() => setActiveTab("analytics")}
              className={`btn-premium ${activeTab === 'analytics' ? 'btn-solid' : ''}`}
              style={{ padding: '8px 16px', fontSize: 12 }}
            >
              <FaChartLine /> Analytics
            </button>
          </div>
        </div>
      </div>

      {store.error && (
        <div style={{ 
          background: 'rgba(192, 57, 43, 0.04)', 
          border: '1px solid rgba(192, 57, 43, 0.12)', 
          color: '#C0392B', 
          padding: '14px 20px', 
          marginBottom: 24, 
          borderRadius: 10,
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          fontSize: 13,
          fontWeight: 500,
        }}>
          <FaShieldAlt style={{ flexShrink: 0 }} />
          <p style={{ margin: 0 }}>{store.error}</p>
          <button 
            onClick={() => store.setError(null)}
            style={{ marginLeft: 'auto', background: 'none', border: 'none', color: '#C0392B', cursor: 'pointer', fontSize: 16, padding: '2px 6px' }}
          >
            x
          </button>
        </div>
      )}

      {activeTab === "upload" && (
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.6fr) minmax(0, 1fr)', gap: 32, alignItems: 'start' }}>
          <div className="space-y-8" style={{ minWidth: 0 }}>
            <div style={{ display: 'flex', gap: 4, padding: 4, background: '#FFFFFF', borderRadius: 10, border: '1px solid rgba(57,62,70,0.08)' }}>
              {(["marksheet", "certificate", "transcript"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => { setUploadType(t); store.resetDashboard(); }}
                  className={`btn-premium ${uploadType === t ? "btn-solid" : ""}`}
                  style={{ flex: 1, padding: '10px', textTransform: 'capitalize', fontSize: 13 }}
                >
                  {t}
                </button>
              ))}
            </div>

            <section className="animate-slide-up">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <div className="section-meta" style={{ marginBottom: 0 }}>STEP 01 -- DATA SOURCE</div>
                <button 
                  onClick={() => downloadSample(uploadType)} 
                  style={{ 
                    background: 'none', border: 'none', color: '#393E46', fontSize: 10, fontWeight: 700, 
                    display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', opacity: 0.6 
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.opacity = "1")}
                  onMouseLeave={(e) => (e.currentTarget.style.opacity = "0.6")}
                >
                  <FaDownload /> DOWNLOAD {uploadType.toUpperCase()} TEMPLATE
                </button>
              </div>
              <FileUploadDropzone
                accept=".csv"
                acceptLabel={`${uploadType.charAt(0).toUpperCase() + uploadType.slice(1)} Data Ingestion (CSV)`}
                onFileSelect={handleCSVUpload}
                currentFile={store.csvFile}
                onClear={() => store.resetDashboard()}
              />
            </section>

            {store.csvHeaders.length > 0 && (
              <section className="animate-slide-up">
                <div className="section-meta">STEP 02 -- DATA VALIDATION</div>
                <CSVPreviewTable headers={store.csvHeaders} records={store.csvRecords} fileName={""} type={uploadType} />
                <div style={{ marginTop: 20 }}>
                  <AnchorChecklist />
                </div>
              </section>
            )}

            {store.csvRecords.length > 0 && (
              <section className="animate-slide-up">
                <div className="section-meta">STEP 03 -- CRYPTOGRAPHIC SEALING</div>
                <HashGeneratorPanel
                  hashes={store.hashes}
                  isGenerating={store.isGeneratingHashes}
                  onGenerate={handleGenerateHashes}
                  canGenerate={true}
                />
                {store.hashes.length > 0 && (
                  <div style={{ marginTop: 20 }}>
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
              <section className="animate-slide-up">
                <div className="section-meta">STEP 04 -- BLOCKCHAIN ANCHORING</div>
                {!store.anchorResult ? (
                  <div className="glass-card">
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
                      <div style={{ position: 'relative' }}>
                        <label style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1.2px', color: '#929AAB', display: 'block', marginBottom: 8 }}>Institution</label>
                        
                        {session?.user?.role === "SUPER_ADMIN" ? (
                          <div style={{ position: 'relative' }}>
                            <div 
                              onClick={() => setShowInstDropdown(!showInstDropdown)}
                              className="inner-card"
                              style={{ 
                                cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                padding: 14, fontSize: 13
                              }}
                            >
                              <span style={{ fontWeight: 600 }}>{store.university || "Select Institution"}</span>
                              <FaPlus style={{ fontSize: 10, transform: showInstDropdown ? 'rotate(45deg)' : 'none', transition: '0.2s', color: '#929AAB' }} />
                            </div>

                            {showInstDropdown && (
                              <div className="glass-card animate-slide-up" style={{ 
                                position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 100, 
                                marginTop: 6, padding: 8, boxShadow: '0 12px 32px rgba(0,0,0,0.12)',
                                maxHeight: 280, overflowY: 'auto'
                              }}>
                                <div style={{ position: 'relative', marginBottom: 8 }}>
                                  <FaSearch style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', opacity: 0.2, fontSize: 11 }} />
                                  <input 
                                    className="inner-card"
                                    style={{ width: '100%', padding: '10px 10px 10px 32px', fontSize: 12, border: '1px solid rgba(57,62,70,0.08)' }}
                                    placeholder="Filter by name..."
                                    value={instSearch}
                                    onChange={(e) => setInstSearch(e.target.value)}
                                    onClick={(e) => e.stopPropagation()}
                                  />
                                </div>
                                {filteredInstitutions.length === 0 ? (
                                  <div style={{ padding: 12, textAlign: 'center', fontSize: 12, color: '#929AAB' }}>No institutions found</div>
                                ) : (
                                  filteredInstitutions.map((inst) => (
                                    <div 
                                      key={inst.id}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        store.setUniversity(inst.name);
                                        setShowInstDropdown(false);
                                      }}
                                      style={{ 
                                        padding: '10px 12px', borderRadius: 8, cursor: 'pointer',
                                        background: store.university === inst.name ? 'rgba(57,62,70,0.04)' : 'transparent',
                                        transition: 'background 0.15s',
                                      }}
                                      onMouseEnter={(e) => { (e.target as HTMLDivElement).style.background = 'rgba(57,62,70,0.04)'; }}
                                      onMouseLeave={(e) => { (e.target as HTMLDivElement).style.background = store.university === inst.name ? 'rgba(57,62,70,0.04)' : 'transparent'; }}
                                    >
                                      <div style={{ fontSize: 13, fontWeight: 600, color: store.university === inst.name ? '#393E46' : '#222831' }}>{inst.name}</div>
                                      <div style={{ fontSize: 10, color: '#929AAB' }}>{inst.slug}</div>
                                    </div>
                                  ))
                                )}
                              </div>
                            )}
                          </div>
                        ) : (
                          <input
                            className="inner-card"
                            style={{ width: '100%', border: 'none', padding: 14, fontSize: 13 }}
                            placeholder="e.g. Stanford University"
                            value={store.university}
                            onChange={(e) => store.setUniversity(e.target.value)}
                            disabled={session?.user?.role !== "SUPER_ADMIN"}
                          />
                        )}
                      </div>
                      <div>
                        <label style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1.2px', color: '#929AAB', display: 'block', marginBottom: 8 }}>Academic Year</label>
                        <input
                          className="inner-card"
                          style={{ width: '100%', border: 'none', padding: 14, fontSize: 13 }}
                          placeholder="2026"
                          value={store.year}
                          onChange={(e) => store.setYear(e.target.value)}
                        />
                      </div>
                    </div>
                    <button 
                      onClick={handleAnchor} 
                      className="btn-premium btn-solid btn-block" 
                      disabled={store.isAnchoring || alreadyAnchored}
                      style={{ padding: 14 }}
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
                      className="btn-premium btn-solid btn-block"
                      style={{ padding: 12 }}
                    >
                      <FaDownload /> Download Session Proof (JSON)
                    </button>
                  </div>
                )}
              </section>
            )}
          </div>

          <div className="space-y-8" style={{ minWidth: 0 }}>
            <ActivityLog entries={store.activityLog} />

            <div className="glass-card">
              <h3 style={{ marginBottom: 16, fontSize: 14, fontWeight: 700 }}>Infrastructure Status</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13 }}>
                    <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#2D6A4F' }}></div>
                    <span>Blockchain Network</span>
                  </div>
                  <span style={{ fontSize: 10, fontWeight: 700, color: '#2D6A4F', letterSpacing: '0.5px' }}>ONLINE</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13 }}>
                    <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#2D6A4F' }}></div>
                    <span>Database Cluster</span>
                  </div>
                  <span style={{ fontSize: 10, fontWeight: 700, color: '#2D6A4F', letterSpacing: '0.5px' }}>SYNCED</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13 }}>
                    <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#2D6A4F' }}></div>
                    <span>Hash Engine (Keccak256)</span>
                  </div>
                  <span style={{ fontSize: 10, fontWeight: 700, color: '#2D6A4F', letterSpacing: '0.5px' }}>READY</span>
                </div>
              </div>
            </div>
            
            {store.isSyncing && (
              <div className="glass-card animate-slide-up" style={{ background: '#393E46', color: '#F7F7F7', display: 'flex', alignItems: 'center', gap: 14, border: 'none' }}>
                <FaDatabase />
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.5px' }}>PERSISTENCE ACTIVE</div>
                  <div style={{ fontSize: 10, opacity: 0.6 }}>Syncing local data to PostgreSQL...</div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === "history" && (
        <div className="space-y-8 animate-slide-up">
           <div style={{ display: 'flex', gap: 4, padding: 4, background: '#FFFFFF', borderRadius: 10, border: '1px solid rgba(57,62,70,0.08)', maxWidth: 500 }}>
              {(["marksheet", "certificate", "transcript"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setUploadType(t)}
                  className={`btn-premium ${uploadType === t ? "btn-solid" : ""}`}
                  style={{ flex: 1, padding: '10px', textTransform: 'capitalize', fontSize: 13 }}
                >
                  {t}
                </button>
              ))}
            </div>
          <HistorySection type={uploadType} refreshTrigger={refreshTrigger} />
        </div>
      )}

      {activeTab === "analytics" && (
        <div className="glass-card animate-slide-up" style={{ padding: '80px', textAlign: 'center' }}>
          <FaChartLine style={{ fontSize: 40, marginBottom: 20, color: '#929AAB' }} />
          <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>Predictive Insights</h2>
          <p style={{ color: '#929AAB', fontSize: 14 }}>Analytics module is currently processing institutional data points.</p>
        </div>
      )}
    </div>
  );
}
