"use client";

import { useState, useCallback, useMemo } from "react";
import { processBulkOCR, BulkProcessingResponse, BulkProcessingResult, anchorRoot } from "@/services/api";
import FileUploadDropzone from "@/components/FileUploadDropzone";
import ActivityLog from "@/components/ActivityLog";
import { 
  FaLayerGroup, 
  FaCheckCircle, 
  FaTimesCircle, 
  FaSpinner, 
  FaHistory, 
  FaSearch, 
  FaChevronLeft, 
  FaChevronRight,
  FaTimes,
  FaDatabase,
  FaLink,
  FaCheck
} from "react-icons/fa";
import { useAppStore } from "@/store/useAppStore";

export default function BulkOCRPage() {
  const store = useAppStore();
  const [isProcessing, setIsProcessing] = useState(false);
  const [zipFile, setZipFile] = useState<File | null>(null);
  const [results, setResults] = useState<BulkProcessingResponse | null>(null);
  const [viewingData, setViewingData] = useState<BulkProcessingResult | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [uploadType, setUploadType] = useState<"marksheet" | "certificate" | "transcript">("marksheet");
  const [anchoringId, setAnchoringId] = useState<string | null>(null);
  const [anchoredHashes, setAnchoredHashes] = useState<Set<string>>(new Set());
  const pageSize = 10;

  const handleBulkUpload = useCallback(async (file: File) => {
    if (!file.name.endsWith('.zip')) {
      store.setError("Please upload a valid ZIP archive containing PDF documents.");
      return;
    }

    setZipFile(file);
    setIsProcessing(true);
    setResults(null);
    setViewingData(null);
    store.setError(null);

    try {
      store.addActivityLog("bulk_ocr_started", `Initializing extraction pipeline for: ${file.name}`);
      const response = await processBulkOCR(file);
      setResults(response);
      store.addActivityLog("bulk_ocr_finished", `Extraction complete. Previewing data for ${response.processed_files} documents.`);
    } catch (err: any) {
      store.setError(err.message || "Bulk processing failed");
      store.addActivityLog("bulk_ocr_error", `Pipeline Error: ${err.message}`);
    } finally {
      setIsProcessing(false);
    }
  }, [store]);

  const handleManualAnchor = async (record: any) => {
    if (!record.__ledger_hash) {
      store.setError("No cryptographic hash available for this record.");
      return;
    }

    setAnchoringId(record.__filename);
    try {
      store.addActivityLog("anchoring_started", `Manually anchoring ${record.__filename} to ledger...`);
      
      // We use the record's ledger_hash as the root for single-document anchoring
      const result = await anchorRoot(
        record.__ledger_hash,
        "JUSTIFAI_PORTAL", // Manual ingestion tag
        new Date().getFullYear().toString(),
        [record.__ledger_hash]
      );

      setAnchoredHashes(prev => new Set(prev).add(record.__ledger_hash));
      store.addActivityLog("anchored", `Record ${record.__filename} successfully anchored. Tx: ${result.txHash.slice(0, 10)}...`);
    } catch (err: any) {
      store.setError(err.message || "Anchoring failed");
      store.addActivityLog("anchor_error", `Anchoring failed for ${record.__filename}: ${err.message}`);
    } finally {
      setAnchoringId(null);
    }
  };

  const clearResults = () => {
    setZipFile(null);
    setResults(null);
    setViewingData(null);
    store.setError(null);
    setAnchoredHashes(new Set());
  };

  // Extract successful records for the table
  const tableData = useMemo(() => {
    if (!results) return [];
    return results.results
      .filter(res => res.status === 'success' && res.data)
      .map(res => ({
        ...res.data,
        __filename: res.filename,
        __doc_type: res.doc_type,
        __ledger_hash: res.ledger_hash
      }));
  }, [results]);

  // Determine dynamic headers
  const headers = useMemo(() => {
    if (tableData.length === 0) return [];
    const keys = new Set<string>();
    const preferredOrder = ["registration_no", "name", "degree", "ogpa", "result"];
    
    tableData.forEach(row => {
      Object.keys(row).forEach(key => {
        if (typeof row[key] !== 'object' && !key.startsWith('__')) {
          keys.add(key);
        }
      });
    });

    const otherKeys = Array.from(keys).filter(k => !preferredOrder.includes(k));
    return [...preferredOrder.filter(k => keys.has(k)), ...otherKeys];
  }, [tableData]);

  const filteredRecords = useMemo(() => {
    const typeFiltered = tableData.filter(record => record.__doc_type === uploadType);
    
    if (!searchQuery) return typeFiltered;
    const lowerQuery = searchQuery.toLowerCase();
    return typeFiltered.filter(record => 
      Object.values(record).some(val => 
        String(val).toLowerCase().includes(lowerQuery)
      )
    );
  }, [tableData, searchQuery, uploadType]);

  const totalPages = Math.ceil(filteredRecords.length / pageSize);
  const currentRecords = filteredRecords.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return (
    <div className="animate-slide-up">
      <div className="page-header">
        <div className="section-meta">UNIVERSITY PORTAL</div>
        <h1 className="page-title">Bulk OCR Ingestion</h1>
        <p className="page-subtitle">Standardize and audit extracted student intelligence from mass PDF ingestion.</p>
      </div>

      {store.error && (
        <div className="glass-card" style={{ background: '#40513B', color: '#EDF1D6', padding: '16px 32px', marginBottom: 32 }}>
          <p style={{ fontWeight: 600 }}>System Notice: {store.error}</p>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 40, alignItems: 'start' }}>
        <div className="space-y-6">
          <div className="glass-card" style={{ padding: '8px', display: 'flex', gap: '8px', marginBottom: '16px' }}>
            <button
              onClick={() => setUploadType("marksheet")}
              className={`btn-premium ${uploadType === "marksheet" ? "btn-solid" : "btn-outline"}`}
              style={{ flex: 1, padding: '12px' }}
            >
              Marksheet
            </button>
            <button
              onClick={() => setUploadType("certificate")}
              className={`btn-premium ${uploadType === "certificate" ? "btn-solid" : "btn-outline"}`}
              style={{ flex: 1, padding: '12px' }}
            >
              Certificate
            </button>
            <button
              onClick={() => setUploadType("transcript")}
              className={`btn-premium ${uploadType === "transcript" ? "btn-solid" : "btn-outline"}`}
              style={{ flex: 1, padding: '12px' }}
            >
              Transcript
            </button>
          </div>

          <section>
            <div className="section-meta">STEP 01 — DATA RECEPTION ({uploadType.toUpperCase()})</div>
            <FileUploadDropzone
              accept=".zip"
              acceptLabel={`ZIP Document Archive Only`}
              onFileSelect={handleBulkUpload}
              currentFile={zipFile}
              onClear={clearResults}
            />
            {isProcessing && (
              <div className="inner-card" style={{ marginTop: 24, textAlign: 'center', background: 'rgba(96, 153, 102, 0.05)', borderColor: 'var(--primary)' }}>
                <FaSpinner className="animate-spin" style={{ fontSize: 32, color: 'var(--primary)', marginBottom: 12 }} />
                <h4 style={{ color: 'var(--primary)' }}>AI Extraction Engine Running...</h4>
                <p style={{ fontSize: 12, opacity: 0.6 }}>Classifying documents and parsing hierarchical data.</p>
              </div>
            )}
          </section>

          {results && (
            <section>
              <div className="section-meta">STEP 02 — RECORD AUDIT & MANUAL ANCHOR</div>
              
              <div className="glass-card" style={{ padding: '16px 24px', marginBottom: 0, borderRadius: 'var(--radius-md) var(--radius-md) 0 0', display: 'flex', gap: 16, alignItems: 'center' }}>
                <div style={{ position: 'relative', flex: 1, maxWidth: 400 }}>
                  <FaSearch style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', opacity: 0.4 }} />
                  <input 
                    type="text" 
                    placeholder="Search extracted records..."
                    value={searchQuery}
                    onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                    style={{ width: '100%', padding: '12px 16px 12px 44px', borderRadius: 12, border: '2px solid var(--accent)', background: 'white', fontSize: 13, fontWeight: 600 }}
                  />
                </div>
              </div>

              <div className="table-container" style={{ borderTop: 'none', borderRadius: 0, background: 'white' }}>
                <table className="premium-table">
                  <thead>
                    <tr>
                      <th style={{ minWidth: 60, width: 60, position: 'sticky', left: 0, zIndex: 10, background: 'var(--accent)', color: 'white' }}>#</th>
                      <th style={{ minWidth: 100 }}>DOC TYPE</th>
                      {headers.map((h) => (
                        <th key={h} style={{ minWidth: 150 }}>{h.replace(/_/g, ' ').toUpperCase()}</th>
                      ))}
                      <th style={{ minWidth: 200, position: 'sticky', right: 0, zIndex: 10, background: 'var(--primary)', color: 'white' }}>ACTIONS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentRecords.map((record: any, idx) => (
                      <tr key={idx}>
                        <td style={{ fontWeight: 800, opacity: 0.3, position: 'sticky', left: 0, zIndex: 5, background: '#f8fafc' }}>
                          {(currentPage - 1) * pageSize + idx + 1}
                        </td>
                        <td>
                          <span className="badge-premium" style={{ 
                            background: record.__doc_type === 'transcript' ? '#3b82f6' : record.__doc_type === 'marksheet' ? '#10b981' : '#f59e0b',
                            color: 'white'
                          }}>
                            {record.__doc_type}
                          </span>
                        </td>
                        {headers.map((h) => (
                          <td key={h}>{String(record[h] || "—")}</td>
                        ))}
                        <td style={{ position: 'sticky', right: 0, zIndex: 5, background: '#f8fafc' }}>
                          <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
                            <button 
                              onClick={() => setViewingData(results.results.find(r => r.filename === record.__filename) || null)} 
                              className="btn-premium btn-outline" 
                              style={{ padding: '6px 12px', fontSize: 10, flex: 1 }}
                            >
                              LOGS
                            </button>
                            {anchoredHashes.has(record.__ledger_hash) ? (
                              <button className="btn-premium btn-solid" style={{ padding: '6px 12px', fontSize: 10, flex: 1, background: '#059669', borderColor: '#059669', cursor: 'default' }}>
                                <FaCheck /> ANCHORED
                              </button>
                            ) : (
                              <button 
                                onClick={() => handleManualAnchor(record)} 
                                disabled={anchoringId === record.__filename}
                                className="btn-premium btn-solid" 
                                style={{ padding: '6px 12px', fontSize: 10, flex: 1 }}
                              >
                                {anchoringId === record.__filename ? <FaSpinner className="animate-spin" /> : <><FaLink /> ANCHOR</>}
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="pagination-bar" style={{ borderRadius: '0 0 var(--radius-md) var(--radius-md)', marginBottom: 32 }}>
                <div className="pagination-info">Page <b>{currentPage}</b> of <b>{totalPages || 1}</b></div>
                <div className="pagination-controls">
                  <button className="page-btn" onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}><FaChevronLeft /></button>
                  <button className="page-btn" onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages || totalPages === 0}><FaChevronRight /></button>
                </div>
              </div>
            </section>
          )}
        </div>

        <div>
          <ActivityLog entries={store.activityLog} />

          <div className="glass-card" style={{ marginTop: 32 }}>
            <h3 style={{ marginBottom: 12 }}>System Status</h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14 }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#609966' }}></div>
              <span>OCR Core Online</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14, marginTop: 12 }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#609966' }}></div>
              <span>Intelligence Matrix Ready</span>
            </div>
          </div>

          {results && (
            <div className="glass-card" style={{ marginTop: 32 }}>
              <div className="section-meta">EXTRACTION SUMMARY</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginTop: 16 }}>
                <div className="inner-card" style={{ textAlign: 'center', padding: 12 }}>
                  <div style={{ fontSize: 10, opacity: 0.5 }}>SUCCESS</div>
                  <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--primary)' }}>{results.processed_files}</div>
                </div>
                <div className="inner-card" style={{ textAlign: 'center', padding: 12 }}>
                  <div style={{ fontSize: 10, opacity: 0.5 }}>FAILED</div>
                  <div style={{ fontSize: 20, fontWeight: 800, color: results.failed_files > 0 ? '#d32f2f' : 'inherit' }}>{results.failed_files}</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {viewingData && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="glass-card" style={{ width: '800px', maxHeight: '90vh', padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column', background: 'white' }}>
            <div style={{ padding: '20px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #eee' }}>
              <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                <FaLayerGroup style={{ color: 'var(--primary)', fontSize: 24 }} />
                <h3 style={{ margin: 0, fontSize: 16 }}>Extraction Proof — {viewingData.filename}</h3>
              </div>
              <button onClick={() => setViewingData(null)} style={{ background: '#eee', border: 'none', borderRadius: '50%', width: 34, height: 34, cursor: 'pointer' }}>
                <FaTimes />
              </button>
            </div>
            <div style={{ flex: 1, overflowY: 'auto', padding: 32 }}>
              <div className="section-meta">CANONICAL PROOF (KECCAK-256)</div>
              <div style={{ padding: 16, background: 'rgba(96, 153, 102, 0.05)', borderRadius: 12, border: '1px solid rgba(96, 153, 102, 0.2)', marginBottom: 32 }}>
                <div style={{ fontSize: 12, fontFamily: 'monospace', wordBreak: 'break-all', color: 'var(--primary)' }}>
                  {viewingData.ledger_hash}
                </div>
              </div>

              <div className="section-meta">EXTRACTED INTELLIGENCE (JSON)</div>
              <pre style={{ 
                padding: 24, 
                background: '#1e1e1e', 
                color: '#d4d4d4', 
                borderRadius: 12, 
                fontSize: 13, 
                fontFamily: 'monospace', 
                lineHeight: 1.6,
                overflowX: 'auto'
              }}>
                {JSON.stringify(viewingData.data, null, 2)}
              </pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
