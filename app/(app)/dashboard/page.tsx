"use client";

import { useCallback } from "react";
import { useAppStore } from "@/store/useAppStore";
import { parseCSV, validateCSVForHashing } from "@/lib/csv";
import { generateHashesFromRecords } from "@/lib/hash";
import { buildMerkleTree } from "@/lib/merkle";
import { anchorRoot } from "@/services/api";

import FileUploadDropzone from "@/components/FileUploadDropzone";
import CSVPreviewTable from "@/components/CSVPreviewTable";
import HashGeneratorPanel from "@/components/HashGeneratorPanel";
import MerkleTreePanel from "@/components/MerkleTreePanel";
import BlockchainStatusCard from "@/components/BlockchainStatusCard";
import ActivityLog from "@/components/ActivityLog";
import AnchorChecklist from "@/components/AnchorChecklist";
import { FaDownload, FaRocket, FaDatabase } from "react-icons/fa";
import { syncRecordsToDB, fetchRecordsFromDB } from "@/services/api";

export default function DashboardPage() {
  const store = useAppStore();

  const handleCSVUpload = useCallback(
    async (file: File) => {
      store.setError(null);
      store.setLoading("isParsingCSV", true);
      store.setCSVFile(file);

      try {
        const text = await file.text();
        const { headers, records } = parseCSV(text);
        const validation = validateCSVForHashing(headers);
        if (!validation.valid) {
          throw new Error(`Invalid CSV: Missing columns ${validation.missing.join(", ")}`);
        }
        store.setCSVData(headers, records);
        store.addActivityLog("csv_uploaded", `Ingested dataset: ${file.name} (${records.length} records)`);

        // Database Synchronization (Background)
        store.setLoading("isSyncing", true);
        try {
          await syncRecordsToDB(records);
          store.addActivityLog("csv_uploaded", "PostgreSQL Synchronization Successful");
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
    [store]
  );

  const handleGenerateHashes = useCallback(() => {
    store.setError(null);
    store.setLoading("isGeneratingHashes", true);
    try {
      const hashes = generateHashesFromRecords(store.csvRecords, store.hashConfig);
      store.setHashes(hashes);
      store.addActivityLog("hashes_generated", `Proofs generated using strategy: [${Object.entries(store.hashConfig).filter(([_, v]) => v).map(([k]) => k.replace('include', '')).join(', ')}]`);
    } catch (err) {
      store.setError(err instanceof Error ? err.message : "Hashing failed");
    } finally {
      store.setLoading("isGeneratingHashes", false);
    }
  }, [store]);

  const handleGenerateMerkle = useCallback(() => {
    store.setError(null);
    store.setLoading("isGeneratingMerkle", true);
    try {
      const { root, leaves } = buildMerkleTree(store.hashes.map((h) => h.hash));
      store.setMerkleData(root, leaves);
      store.addActivityLog("root_generated", `Merkle Root fixed: ${root.slice(0, 12)}...`);
    } catch (err) {
      store.setError(err instanceof Error ? err.message : "Merkle build failed");
    } finally {
      store.setLoading("isGeneratingMerkle", false);
    }
  }, [store]);

  const handleAnchor = useCallback(async () => {
    if (!store.university.trim()) {
      store.setError("Institutional ID required to anchor root.");
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
      store.addActivityLog("anchored", `Root successfully anchored on chain (Block: ${result.blockNumber})`);
    } catch (err) {
      store.setError(err instanceof Error ? err.message : "Anchoring failed");
    } finally {
      store.setLoading("isAnchoring", false);
    }
  }, [store]);

  const handleDownloadProof = useCallback(() => {
    const proof = {
      merkleRoot: store.merkleRoot,
      anchor: store.anchorResult,
      university: store.university,
      year: store.year,
      timestamp: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(proof, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `proof-${store.university}-${store.year}.json`;
    a.click();
  }, [store]);

  return (
    <div className="animate-slide-up">
      <div className="page-header">
        <div className="section-meta">UNIVERSITY PORTAL</div>
        <h1 className="page-title">Session Management</h1>
        <p className="page-subtitle">Standardize student records and establish immutable truth on-chain.</p>
      </div>

      {store.isSyncing && (
        <div className="glass-card" style={{ background: 'var(--primary)', color: 'white', padding: '12px 32px', marginBottom: 32, display: 'flex', alignItems: 'center', gap: 12 }}>
          <FaDatabase className="animate-pulse" />
          <span style={{ fontWeight: 700, fontSize: 13 }}>PERSISTING TO POSTGRESQL...</span>
        </div>
      )}

      {store.error && (
        <div className="glass-card" style={{ background: '#40513B', color: '#EDF1D6', padding: '16px 32px', marginBottom: 32 }}>
          <p style={{ fontWeight: 600 }}>System Notice: {store.error}</p>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 40, alignItems: 'start' }}>
        <div className="space-y-6">
          <section>
            <div className="section-meta">STEP 01 — DATA RECEPTION</div>
            <FileUploadDropzone
              accept=".csv"
              acceptLabel="CSV Records Only"
              onFileSelect={handleCSVUpload}
              currentFile={store.csvFile}
              onClear={() => store.resetDashboard()}
            />
          </section>

          {store.csvHeaders.length > 0 && (
            <section>
              <div className="section-meta">STEP 02 — RECORD AUDIT</div>
              <CSVPreviewTable headers={store.csvHeaders} records={store.csvRecords} fileName={""} />
            </section>
          )}

          {store.csvRecords.length > 0 && (
            <section>
              <div className="section-meta">STEP 2.5 — DEFINE ANCHOR ATTRIBUTES</div>
              <AnchorChecklist />
            </section>
          )}

          {store.csvRecords.length > 0 && (
            <section>
              <div className="section-meta">STEP 03 — CRYPTOGRAPHIC WORKFLOW</div>
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
            <section>
              <div className="section-meta">STEP 04 — BLOCKCHAIN FINALIZATION</div>
              {!store.anchorResult ? (
                <div className="glass-card">
                  <div className="grid-cols-2" style={{ marginBottom: 24 }}>
                    <div>
                      <label className="section-meta" style={{ fontSize: 10 }}>University ID</label>
                      <input
                        className="inner-card"
                        style={{ width: '100%', border: 'none', padding: 16, fontSize: 14 }}
                        placeholder="e.g. Stanford University"
                        value={store.university}
                        onChange={(e) => store.setUniversity(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="section-meta" style={{ fontSize: 10 }}>Academic Year</label>
                      <input
                        className="inner-card"
                        style={{ width: '100%', border: 'none', padding: 16, fontSize: 14 }}
                        placeholder="2026"
                        value={store.year}
                        onChange={(e) => store.setYear(e.target.value)}
                      />
                    </div>
                  </div>
                  <button onClick={handleAnchor} className="btn-premium btn-solid btn-block" disabled={store.isAnchoring}>
                    <FaRocket /> {store.isAnchoring ? "Broadcasting..." : "Anchor Root to Mainnet"}
                  </button>
                </div>
              ) : (
                <>
                  <BlockchainStatusCard result={store.anchorResult} />
                  <button onClick={handleDownloadProof} className="btn-premium btn-dark btn-block" style={{ marginTop: 24 }}>
                    <FaDownload /> Global Session Proof (JSON)
                  </button>
                </>
              )}
            </section>
          )}
        </div>

        <div>
          <ActivityLog entries={store.activityLog} />

          <div className="glass-card" style={{ marginTop: 32 }}>
            <h3 style={{ marginBottom: 12 }}>System Status</h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14 }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#609966' }}></div>
              <span>Blockchain Core Online</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14, marginTop: 12 }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#609966' }}></div>
              <span>Hash Engine Ready</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
