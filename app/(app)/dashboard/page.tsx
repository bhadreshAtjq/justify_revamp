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


  // Auto-populate university name from session
  useEffect(() => {
    if (session?.user?.institutionName && !store.university) {
      store.setUniversity(session.user.institutionName);
    }
    
    if (session?.user?.role === "SUPER_ADMIN") {
      fetchInstitutions();
    }
  }, [session, store]);

  const fetchInstitutions = async () => {
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
  };

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
          throw new Error(`Invalid CSV: Missing columns ${validation.missing.join(", ")}`);
        }
        
        store.setCSVData(headers, records);
        store.addActivityLog("csv_uploaded", `Ingested dataset: ${file.name} (${records.length} records)`);

        store.setLoading("isSyncing", true);
        try {
          await syncRecordsToDB(records, uploadType);
          store.addActivityLog("csv_uploaded", "Database Synchronization Successful");
          setRefreshTrigger(prev => prev + 1);
        } catch (dbErr) {
          console.error("DB Sync Error:", dbErr);
          store.addActivityLog("csv_uploaded", "Local cache active (DB Sync Pending)");
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
        toast.error(errorMsg, {
          duration: 6000,
          icon: '🛡️',
          style: {
            borderLeft: '4px solid #ef4444',
            fontSize: '14px',
            fontWeight: 600
          }
        });
        store.addActivityLog("anchored", "PRE-VALIDATION: Duplicate Merkle Root detected in ledger.");
      }


    } catch (err) {
      store.setError(err instanceof Error ? err.message : "Merkle build failed");
    } finally {
      store.setLoading("isGeneratingMerkle", false);
    }
  }, [store]);


  const handleAnchor = useCallback(async () => {
    if (!store.university.trim()) {
      store.setError("Institutional Identity required to anchor root.");
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
      <div className="page-header" style={{ marginBottom: 40 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <div>
            <div className="section-meta">INSTITUTIONAL HUB</div>
            <h1 className="page-title">Credential Management</h1>
            <p className="page-subtitle">Secure, verify, and anchor academic records to the global ledger.</p>
          </div>
          <div className="glass-card" style={{ display: 'flex', gap: 8, padding: 6 }}>
            <button 
              onClick={() => setActiveTab("upload")}
              className={`btn-premium ${activeTab === 'upload' ? 'btn-solid' : ''}`}
              style={{ padding: '8px 16px', fontSize: 13, display: 'flex', alignItems: 'center', gap: 8 }}
            >
              <FaPlus /> New Session
            </button>
            <button 
              onClick={() => setActiveTab("history")}
              className={`btn-premium ${activeTab === 'history' ? 'btn-solid' : ''}`}
              style={{ padding: '8px 16px', fontSize: 13, display: 'flex', alignItems: 'center', gap: 8 }}
            >
              <FaList /> Repository
            </button>
            <button 
              onClick={() => setActiveTab("analytics")}
              className={`btn-premium ${activeTab === 'analytics' ? 'btn-solid' : ''}`}
              style={{ padding: '8px 16px', fontSize: 13, display: 'flex', alignItems: 'center', gap: 8 }}
            >
              <FaChartLine /> Analytics
            </button>
          </div>
        </div>
      </div>

      {store.error && (
        <div className="glass-card" style={{ background: 'rgba(255, 100, 100, 0.1)', border: '1px solid rgba(255, 0, 0, 0.2)', color: '#d32f2f', padding: '16px 24px', marginBottom: 32 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <FaShieldAlt />
            <p style={{ fontWeight: 600 }}>System Alert: {store.error}</p>
          </div>
        </div>
      )}

      {activeTab === "upload" && (
        <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: 40, alignItems: 'start' }}>
          <div className="space-y-8">
            <div className="glass-card" style={{ padding: '8px', display: 'flex', gap: '8px' }}>
              {(["marksheet", "certificate", "transcript"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => { setUploadType(t); store.resetDashboard(); }}
                  className={`btn-premium ${uploadType === t ? "btn-solid" : "btn-outline"}`}
                  style={{ flex: 1, padding: '12px', textTransform: 'capitalize' }}
                >
                  {t}
                </button>
              ))}
            </div>

            <section className="animate-slide-up">
              <div className="section-meta">STEP 01 — DATA SOURCE</div>
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
                <div className="section-meta">STEP 02 — DATA VALIDATION</div>
                <CSVPreviewTable headers={store.csvHeaders} records={store.csvRecords} fileName={""} type={uploadType} />
                <div style={{ marginTop: 24 }}>
                  <AnchorChecklist />
                </div>
              </section>
            )}

            {store.csvRecords.length > 0 && (
              <section className="animate-slide-up">
                <div className="section-meta">STEP 03 — CRYPTOGRAPHIC SEALING</div>
                <HashGeneratorPanel
                  hashes={store.hashes}
                  isGenerating={store.isGeneratingHashes}
                  onGenerate={handleGenerateHashes}
                  canGenerate={true}
                />
                {store.hashes.length > 0 && (
                  <div style={{ marginTop: 24 }}>
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
                <div className="section-meta">STEP 04 — BLOCKCHAIN ANCHORING</div>
                {!store.anchorResult ? (
                  <div className="glass-card">
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 24 }}>
                      <div style={{ position: 'relative' }}>
                        <label className="section-meta" style={{ fontSize: 10 }}>Institution</label>
                        
                        {session?.user?.role === "SUPER_ADMIN" ? (
                          <div style={{ position: 'relative' }}>
                            <div 
                              onClick={() => setShowInstDropdown(!showInstDropdown)}
                              className="inner-card"
                              style={{ 
                                cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                padding: 16, fontSize: 14, background: 'var(--canvas)', borderRadius: 8
                              }}
                            >
                              <span style={{ fontWeight: 600 }}>{store.university || "Select Institution"}</span>
                              <FaPlus style={{ fontSize: 10, transform: showInstDropdown ? 'rotate(45deg)' : 'none', transition: '0.3s' }} />
                            </div>

                            {showInstDropdown && (
                              <div className="glass-card animate-slide-up" style={{ 
                                position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 100, 
                                marginTop: 8, padding: 8, boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
                                maxHeight: 300, overflowY: 'auto'
                              }}>
                                <div style={{ position: 'relative', marginBottom: 8 }}>
                                  <FaSearch style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', opacity: 0.3 }} />
                                  <input 
                                    className="inner-card"
                                    style={{ width: '100%', padding: '10px 10px 10px 36px', fontSize: 12, background: 'rgba(0,0,0,0.02)', border: '1px solid rgba(0,0,0,0.05)' }}
                                    placeholder="Filter by name or slug..."
                                    value={instSearch}
                                    onChange={(e) => setInstSearch(e.target.value)}
                                    onClick={(e) => e.stopPropagation()}
                                  />
                                </div>
                                {filteredInstitutions.length === 0 ? (
                                  <div style={{ padding: 12, textAlign: 'center', fontSize: 12, opacity: 0.5 }}>No institutions found</div>
                                ) : (
                                  filteredInstitutions.map((inst) => (
                                    <div 
                                      key={inst.id}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        store.setUniversity(inst.name);
                                        setShowInstDropdown(false);
                                      }}
                                      className="hover:bg-slate-50 transition-colors"
                                      style={{ 
                                        padding: '10px 12px', borderRadius: 6, cursor: 'pointer',
                                        background: store.university === inst.name ? 'rgba(96,153,102,0.1)' : 'transparent'
                                      }}
                                    >
                                      <div style={{ fontSize: 13, fontWeight: 700, color: store.university === inst.name ? 'var(--primary)' : 'inherit' }}>{inst.name}</div>
                                      <div style={{ fontSize: 10, opacity: 0.5 }}>{inst.slug}</div>
                                    </div>
                                  ))
                                )}
                              </div>
                            )}
                          </div>
                        ) : (
                          <input
                            className="inner-card"
                            style={{ width: '100%', border: 'none', padding: 16, fontSize: 14, background: 'var(--canvas)' }}
                            placeholder="e.g. Stanford University"
                            value={store.university}
                            onChange={(e) => store.setUniversity(e.target.value)}
                            disabled={session?.user?.role !== "SUPER_ADMIN"}
                          />
                        )}
                      </div>
                      <div>
                        <label className="section-meta" style={{ fontSize: 10 }}>Academic Year</label>
                        <input
                          className="inner-card"
                          style={{ width: '100%', border: 'none', padding: 16, fontSize: 14, background: 'var(--canvas)' }}
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
                    >
                      <FaRocket /> {store.isAnchoring ? "Broadcasting to Polygon..." : alreadyAnchored ? "Already Anchored to Ledger" : "Anchor Permanent Proof"}
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
                      className="btn-premium btn-dark btn-block"
                    >
                      <FaDownload /> Global Session Proof (JSON)
                    </button>
                  </div>
                )}
              </section>
            )}
          </div>

          <div className="space-y-8">
            <ActivityLog entries={store.activityLog} />

            <div className="glass-card">
              <h3 style={{ marginBottom: 16, fontSize: 15, fontWeight: 700 }}>Infrastructure Pipeline</h3>
              <div className="space-y-4">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13 }}>
                    <div className="animate-pulse" style={{ width: 8, height: 8, borderRadius: '50%', background: '#609966' }}></div>
                    <span>Blockchain Network</span>
                  </div>
                  <span style={{ fontSize: 11, fontWeight: 700, color: '#609966' }}>ONLINE</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13 }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#609966' }}></div>
                    <span>Database Cluster</span>
                  </div>
                  <span style={{ fontSize: 11, fontWeight: 700, color: '#609966' }}>SYNCED</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13 }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#609966' }}></div>
                    <span>Hash Engine (Keccak256)</span>
                  </div>
                  <span style={{ fontSize: 11, fontWeight: 700, color: '#609966' }}>READY</span>
                </div>
              </div>
            </div>
            
            {store.isSyncing && (
              <div className="glass-card animate-slide-up" style={{ background: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', gap: 16 }}>
                <FaDatabase className="animate-spin" />
                <div>
                  <div style={{ fontSize: 12, fontWeight: 800 }}>PERSISTENCE ACTIVE</div>
                  <div style={{ fontSize: 10, opacity: 0.8 }}>Syncing local data to PostgreSQL...</div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === "history" && (
        <div className="space-y-8 animate-slide-up">
           <div className="glass-card" style={{ padding: '8px', display: 'flex', gap: '8px', maxWidth: '600px' }}>
              {(["marksheet", "certificate", "transcript"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setUploadType(t)}
                  className={`btn-premium ${uploadType === t ? "btn-solid" : "btn-outline"}`}
                  style={{ flex: 1, padding: '12px', textTransform: 'capitalize' }}
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
          <FaChartLine style={{ fontSize: 48, marginBottom: 24, opacity: 0.2 }} />
          <h2>Predictive Insights</h2>
          <p style={{ opacity: 0.6 }}>Analytics module is currently processing institutional data points.</p>
        </div>
      )}
    </div>
  );
}
