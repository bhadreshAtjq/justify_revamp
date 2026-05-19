"use client";

import { useState, useCallback, useMemo, useRef } from "react";
import { processBulkOCRAsync, pollJobStatus, JobSubmitResponse, BulkProcessingResponse, BulkProcessingResult, anchorRoot, logMerkle } from "@/services/api";
import { generateHashesFromRecords } from "@/lib/hash";
import { buildMerkleTree } from "@/lib/merkle";
import FileUploadDropzone from "@/components/FileUploadDropzone";
import ActivityLog from "@/components/ActivityLog";
import HashGeneratorPanel from "@/components/HashGeneratorPanel";
import MerkleTreePanel from "@/components/MerkleTreePanel";
import BlockchainStatusCard from "@/components/BlockchainStatusCard";
import AnchorChecklist from "@/components/AnchorChecklist";
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
  FaCheck,
  FaCopy,
  FaRocket,
  FaDownload,
  FaTable,
  FaFileAlt,
  FaCode,
  FaFilePdf,
  FaEye

} from "react-icons/fa";
import { useAppStore } from "@/store/useAppStore";
import MarksheetTemplate from "@/components/MarksheetTemplate";
import CertificateTemplate from "@/components/CertificateTemplate";
import TranscriptTemplate from "@/components/TranscriptTemplate";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";


export default function BulkOCRPage() {
  const store = useAppStore();
  const hashes = useAppStore(s => s.hashes);
  const hashConfig = useAppStore(s => s.hashConfig);
  const university = useAppStore(s => s.university);
  const year = useAppStore(s => s.year);

  const [isProcessing, setIsProcessing] = useState(false);
  const [zipFile, setZipFile] = useState<File | null>(null);
  const [results, setResults] = useState<BulkProcessingResponse | null>(null);
  const [viewingData, setViewingData] = useState<BulkProcessingResult | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [uploadType, setUploadType] = useState<"marksheet" | "certificate" | "transcript">("marksheet");
  const [anchoringId, setAnchoringId] = useState<string | null>(null);
  const [anchoredHashes, setAnchoredHashes] = useState<Set<string>>(new Set());
  const [isGeneratingHashes, setIsGeneratingHashes] = useState(false);
  const [isGeneratingMerkle, setIsGeneratingMerkle] = useState(false);
  const [isAnchoringRoot, setIsAnchoringRoot] = useState(false);
  const [merkleRoot, setMerkleRoot] = useState<string>("");
  const [merkleLeaves, setMerkleLeaves] = useState<string[]>([]);
  const [anchorResult, setAnchorResult] = useState<any>(null);
  const [modalTab, setModalTab] = useState<"structured" | "raw" | "json" | "preview">("structured");
  const [copied, setCopied] = useState(false);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [jobId, setJobId] = useState<string | null>(null);
  const [jobProgress, setJobProgress] = useState<{ completed: number; total: number } | null>(null);
  const pollIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const loggedFilesRef = useRef<Set<string>>(new Set());

  const pageSize = 10;

  const handleDownloadPDF = async () => {
    if (!viewingData) return;
    setIsGeneratingPDF(true);
    try {
      const previewWrapper = document.getElementById("record-preview-content");
      // Find all pages (marksheet-page, etc.)
      const pages = previewWrapper?.querySelectorAll('.marksheet-page, .certificate-page, .transcript-page') as NodeListOf<HTMLElement>;
      
      if (!pages || pages.length === 0) throw new Error("Document pages not found");

      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
        compress: true
      });

      const previewContent = document.getElementById("record-preview-content");
      if (previewContent) {
        previewContent.style.transform = "none";
        previewContent.style.width = "820px";
      }

      for (let i = 0; i < pages.length; i++) {
        const element = pages[i];
        
        // Temporarily prepare element for clean capture
        const originalMargin = element.style.margin;
        const originalBoxShadow = element.style.boxShadow;
        element.style.margin = "0";
        element.style.boxShadow = "none";

        const canvas = await html2canvas(element, {
          scale: 2, 
          useCORS: true,
          logging: false,
          backgroundColor: "#ffffff",
          allowTaint: true,
          windowWidth: 820,
          windowHeight: 1120
        });

        // Restore styles
        element.style.margin = originalMargin;
        element.style.boxShadow = originalBoxShadow;

        const imgData = canvas.toDataURL("image/jpeg", 0.95);
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

        if (i > 0) pdf.addPage();
        pdf.addImage(imgData, "JPEG", 0, 0, pdfWidth, pdfHeight, undefined, 'FAST');
      }

      // Restore preview scaling
      if (previewContent) {
        previewContent.style.transform = "scale(0.70)";
      }

      pdf.save(`Verified_${viewingData.doc_type}_${viewingData.filename.replace('.pdf', '')}.pdf`);

    } catch (err: any) {
      console.error("PDF Export Error:", err);
      store.setError(`PDF Generation failed: ${err.message}`);
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const handleBulkUpload = useCallback(async (file: File) => {
    if (!file.name.endsWith('.zip')) {
      store.setError("Please upload a valid ZIP archive containing PDF documents.");
      return;
    }

    // Stop any existing poll
    if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);

    setZipFile(file);
    setIsProcessing(true);
    setJobId(null);
    setJobProgress(null);
    setResults({ total_files: 0, processed_files: 0, failed_files: 0, results: [] });
    setViewingData(null);
    store.setError(null);
    loggedFilesRef.current.clear();

    try {
      store.addActivityLog("bulk_ocr_started", `Submitting ZIP for async processing: ${file.name}`);

      // Step 1: Submit ZIP — returns 202 instantly with job_id
      const jobData: JobSubmitResponse = await processBulkOCRAsync(file);
      const newJobId = jobData.job_id;
      setJobId(newJobId);
      setJobProgress({ completed: 0, total: jobData.total_files });
      store.addActivityLog("bulk_ocr_queued", `Job ${newJobId.slice(0, 8)}... queued. Processing ${jobData.total_files} PDFs in background.`);

      // Step 2: Poll every 4 seconds for progress
      pollIntervalRef.current = setInterval(async () => {
        try {
          const job = await pollJobStatus(newJobId);
          const compVal = job.completed_parents !== undefined ? job.completed_parents : job.completed;
          const totVal = job.total_parents !== undefined ? job.total_parents : job.total;
          setJobProgress({ completed: compVal, total: totVal });

          // Rebuild results array from job.files map + job.results
          const fileResults: BulkProcessingResult[] = Object.entries(job.files).map(([fname, f]) => ({
            filename: fname,
            doc_type: f.doc_type || "pending",
            status: f.status,
            ledger_hash: f.ledger_hash,
            error: f.error || undefined,
          }));

          // Merge structured data from results array
          for (const r of job.results) {
            const idx = fileResults.findIndex(f => f.filename === r.filename);
            if (idx !== -1) {
              fileResults[idx].data = r.data;
              fileResults[idx].raw_text = r.raw_text;
              
              if (r.raw_text && !loggedFilesRef.current.has(r.filename)) {
                console.log(`\n========== OCR TEXT FOR ${r.filename} ==========\n${r.raw_text}\n=========================================================\n`);
                loggedFilesRef.current.add(r.filename);
              }
            }
          }

          setResults({
            total_files: job.total,
            processed_files: job.completed,
            failed_files: job.failed,
            results: fileResults,
          });

          if (job.status === "done" || job.status === "failed") {
            clearInterval(pollIntervalRef.current!);
            pollIntervalRef.current = null;
            setIsProcessing(false);
            store.addActivityLog("bulk_ocr_finished", `Job complete. ${compVal}/${totVal} succeeded.`);
          }
        } catch (pollErr: any) {
          console.error("Poll error:", pollErr);
        }
      }, 4000);

    } catch (err: any) {
      store.setError(err.message || "Bulk processing submission failed");
      store.addActivityLog("bulk_ocr_error", `Submission Error: ${err.message}`);
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

      const result = await anchorRoot(
        record.__ledger_hash,
        "JUSTIFAI_PORTAL",
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

  const handleGenerateHashes = useCallback(() => {
    store.setError(null);
    setIsGeneratingHashes(true);
    try {
      const currentTableData = results ? results.results
        .filter(res => res.status === 'success' && res.data && res.doc_type !== 'mixed')
        .map(res => ({
          ...res.data,
          __filename: res.filename,
          __doc_type: res.doc_type,
          __ledger_hash: res.ledger_hash
        })) : [];

      const generated = generateHashesFromRecords(currentTableData, hashConfig, uploadType);
      store.setHashes(generated);
      store.addActivityLog("hashes_generated", `Proofs generated using strategy: [${Object.entries(hashConfig).filter(([_, v]) => v).map(([k]) => k.replace('include', '')).join(', ')}]`);
    } catch (err) {
      store.setError(err instanceof Error ? err.message : "Hashing failed");
    } finally {
      setIsGeneratingHashes(false);
    }
  }, [results, hashConfig, uploadType, store]);

  const handleGenerateMerkle = useCallback(async () => {
    if (hashes.length === 0) return;
    store.setError(null);
    setIsGeneratingMerkle(true);
    try {
      const { root, leaves } = buildMerkleTree(hashes.map((h) => h.hash));
      setMerkleRoot(root); // over here we are setting the merkle root in the state
      setMerkleLeaves(leaves);
      store.setMerkleData(root, leaves);
      store.addActivityLog("root_generated", `Merkle Root fixed: ${root.slice(0, 12)}...`);

      // Log to backend terminal (Fire and forget to avoid UI blocking)
      logMerkle(root, leaves.length).catch((e: any) => console.error("Merkle log sync failed:", e));
    } catch (err: any) {
      store.setError(err instanceof Error ? err.message : "Merkle build failed");
    } finally {
      setIsGeneratingMerkle(false);
    }
  }, [hashes, store]);

  const handleAnchorRoot = useCallback(async () => {
    if (!university.trim()) {
      store.setError("Institutional ID required to anchor root.");
      return;
    }
    store.setError(null);
    setIsAnchoringRoot(true);
    try {
      // 1. Sync Records to DB first (so verify API can find them)
      const currentTableData = results ? results.results
        .filter(res => res.status === 'success' && res.data)
        .map(res => ({
          ...res.data,
          doc_type: res.doc_type,
          ledger_hash: res.ledger_hash
        })) : [];

      if (currentTableData.length > 0) {
        console.log("in");
        try {
          console.log("currentTableData", currentTableData);

        } catch (dbErr) {
          console.warn("DB Sync failed but continuing to anchor:", dbErr);

        }
      }

      // 2. Anchor to Blockchain
      const rootToAnchor = merkleRoot.startsWith("0x") ? merkleRoot : `0x${merkleRoot}`;
      const result = await anchorRoot(
        rootToAnchor,
        university,
        year,
        merkleLeaves
      );

      setAnchorResult(result);
      store.setAnchorResult(result);
      store.addActivityLog("anchored", `Root successfully anchored on chain (Block: ${result.blockNumber})`);
    } catch (err) {
      store.setError(err instanceof Error ? err.message : "Anchoring failed");
    } finally {
      setIsAnchoringRoot(false);
    }
  }, [merkleRoot, merkleLeaves, university, year, results, uploadType, store]);

  const clearResults = () => {
    setZipFile(null);
    setResults(null);
    setViewingData(null);
    store.resetDashboard();
    setMerkleRoot("");
    setMerkleLeaves([]);
    setAnchorResult(null);
    setAnchoredHashes(new Set());
  };

  // Determine which headers to show in the main table based on uploadType
  const headers = useMemo(() => {
    if (uploadType === "transcript") {
      return ["registration_no", "name", "degree", "ogpa", "completion_year"];
    } else if (uploadType === "certificate") {
      return ["certificate_no", "name", "degree", "date", "class_division"];
    } else {
      // Marksheet
      return ["registration_no", "name", "gpa"];
    }
  }, [uploadType]);

  const filteredResults = results
    ? results.results.filter(res => {
        // Only show results that match the currently selected tab
        if (res.doc_type !== uploadType) return false;

        // Search filtering
        if (!searchQuery.trim()) return true;
        const q = searchQuery.toLowerCase();
        const d = res.data || {};
        return (
          res.filename?.toLowerCase().includes(q) ||
          res.doc_type?.toLowerCase().includes(q) ||
          String(d.name || "").toLowerCase().includes(q) ||
          String(d.registration_no || "").toLowerCase().includes(q) ||
          String(d.certificate_no || "").toLowerCase().includes(q)
        );
      })
    : [];

  const totalPages = Math.ceil(filteredResults.length / pageSize);
  const currentRecords = filteredResults.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return (
    <div className="animate-slide-up">
      <div className="page-header">
        <div className="section-meta">VERIFICATION PORTAL</div>
        <h1 className="page-title">Bulk OCR Ingestion</h1>
        <p className="page-subtitle">Standardize and audit extracted student intelligence from mass PDF ingestion.</p>
      </div>

      {store.error && (
        <div className="glass-card" style={{ background: '#40513B', color: '#EDF1D6', padding: '16px 32px', marginBottom: 32 }}>
          <p style={{ fontWeight: 600 }}>System Notice: {store.error}</p>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 2fr) minmax(0, 1fr)', gap: 40, alignItems: 'start' }}>
        <div className="space-y-8">
          <section>
            <div className="section-meta">STEP 01 — DATA RECEPTION</div>
            <FileUploadDropzone
              accept=".zip"
              acceptLabel={`ZIP Document Archive Only`}
              onFileSelect={handleBulkUpload}
              currentFile={zipFile}
              onClear={clearResults}
            />

            <div className="glass-card" style={{ 
              padding: '6px', 
              display: 'flex', 
              gap: '6px', 
              marginTop: '16px', 
              background: 'white',
              border: '1px solid #e2e8f0',
              borderRadius: '14px',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)'
            }}>
              {[
                { id: "marksheet", label: "Marksheet" },
                { id: "certificate", label: "Certificate" },
                { id: "transcript", label: "Transcript" }
              ].map((type) => (
                <button
                  key={type.id}
                  onClick={() => setUploadType(type.id as any)}
                  style={{ 
                    flex: 1, 
                    padding: '12px 20px', 
                    borderRadius: '10px',
                    border: 'none',
                    fontSize: '13px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                    background: uploadType === type.id ? 'var(--accent)' : 'transparent',
                    color: uploadType === type.id ? 'white' : '#64748b',
                    boxShadow: uploadType === type.id ? '0 4px 12px rgba(0,0,0,0.1)' : 'none'
                  }}
                >
                  {type.label}
                </button>
              ))}
            </div>

            {isProcessing && (
              <div className="inner-card" style={{ marginTop: 24, textAlign: 'center', background: 'rgba(96, 153, 102, 0.05)', borderColor: 'var(--primary)' }}>
                <FaSpinner className="animate-spin" style={{ fontSize: 32, color: 'var(--primary)', marginBottom: 12 }} />
                <h4 style={{ color: 'var(--primary)' }}>
                  {jobProgress
                    ? `Processing: ${jobProgress.completed} / ${jobProgress.total} PDFs complete`
                    : "Submitting job..."}
                </h4>
                <p style={{ fontSize: 12, opacity: 0.6 }}>
                  {jobId
                    ? `Job ID: ${jobId.slice(0, 8)}... — Polling every 4s`
                    : "Uploading ZIP to server..."}
                </p>
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
                      <th style={{ minWidth: 180 }}>FILENAME</th>
                      {headers.map((h) => (
                        <th key={h} style={{ minWidth: 120 }}>{h.replace(/_/g, ' ').toUpperCase()}</th>
                      ))}
                      <th style={{ minWidth: 200, position: 'sticky', right: 0, zIndex: 10, background: 'var(--primary)', color: 'white' }}>ACTIONS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentRecords.map((record: any, idx) => {
                      const rowData = record.data || {};
                      // Pick display fields based on the RECORD's actual doc_type, not the tab
                      const recordHeaders = record.doc_type === 'transcript'
                        ? ["registration_no", "name", "degree", "ogpa", "completion_year"]
                        : record.doc_type === 'certificate'
                        ? ["certificate_no", "name", "degree", "date", "class_division"]
                        : record.doc_type === 'marksheet'
                        ? ["registration_no", "name", "gpa"]
                        : headers; // fallback to tab headers for pending rows
                      return (
                        <tr key={idx}>
                          <td style={{ fontWeight: 800, opacity: 0.3, position: 'sticky', left: 0, zIndex: 5, background: '#f8fafc' }}>
                            {(currentPage - 1) * pageSize + idx + 1}
                          </td>
                          <td>
                            <span className="badge-premium" style={{
                              background: record.doc_type === 'transcript' ? '#3b82f6' : record.doc_type === 'marksheet' ? '#10b981' : record.doc_type === 'certificate' ? '#f59e0b' : '#94a3b8',
                              color: 'white'
                            }}>
                              {record.doc_type || "pending"}
                            </span>
                          </td>
                          <td style={{ fontSize: 11, opacity: 0.7, maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {record.filename}
                          </td>
                          {recordHeaders.map((h) => (
                            <td key={h}>{String(rowData[h] || "—")}</td>
                          ))}
                          <td style={{ position: 'sticky', right: 0, zIndex: 5, background: '#f8fafc' }}>
                            <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
                              {record.status === "pending" || record.status === "processing" ? (
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--primary)', fontSize: 11, fontWeight: 700 }}>
                                  <FaSpinner className="animate-spin" /> {record.status === "processing" ? "Analyzing..." : "Queued"}
                                </div>
                              ) : record.status === "success" ? (
                                <button
                                  onClick={() => setViewingData(record)}
                                  className="btn-premium btn-solid"
                                  style={{ padding: '8px 20px', fontSize: 11, flex: 1 }}
                                >
                                  INSPECT RECORD
                                </button>
                              ) : (
                                <div style={{ fontSize: 11, color: '#ef4444', fontWeight: 600 }}>
                                  {record.error || "Failed"}
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
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

          {results && results.processed_files > 0 && (
            <section>
              <div className="section-meta">STEP 03 — CRYPTOGRAPHIC WORKFLOW</div>
              <HashGeneratorPanel
                hashes={hashes}
                isGenerating={isGeneratingHashes}
                onGenerate={handleGenerateHashes}
                canGenerate={true}
              />
              {hashes.length > 0 && (
                <div style={{ marginTop: 24 }}>
                  <MerkleTreePanel
                    merkleRoot={merkleRoot}
                    leaves={merkleLeaves}
                    isGenerating={isGeneratingMerkle}
                    onGenerate={handleGenerateMerkle}
                    canGenerate={true}
                  />
                </div>
              )}
            </section>
          )}

          {merkleRoot && (
            <section>
              <div className="section-meta">STEP 04 — BLOCKCHAIN FINALIZATION</div>
              {!anchorResult ? (
                <div className="glass-card">
                  <div className="grid-cols-2" style={{ marginBottom: 24 }}>
                    <div>
                      <label className="section-meta" style={{ fontSize: 10 }}>University ID</label>
                      <input
                        className="inner-card"
                        style={{ width: '100%', border: 'none', padding: 16, fontSize: 14 }}
                        placeholder="e.g. Stanford University"
                        value={university}
                        onChange={(e) => store.setUniversity(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="section-meta" style={{ fontSize: 10 }}>Academic Year</label>
                      <input
                        className="inner-card"
                        style={{ width: '100%', border: 'none', padding: 16, fontSize: 14 }}
                        placeholder="2026"
                        value={year}
                        onChange={(e) => store.setYear(e.target.value)}
                      />
                    </div>
                  </div>
                  <button onClick={handleAnchorRoot} className="btn-premium btn-solid btn-block" disabled={isAnchoringRoot}>
                    <FaRocket /> {isAnchoringRoot ? "Broadcasting..." : "Anchor Root to Mainnet"}
                  </button>
                </div>
              ) : (
                <>
                  <BlockchainStatusCard result={anchorResult} />
                  <button className="btn-premium btn-dark btn-block" style={{ marginTop: 24 }}>
                    <FaDownload /> Bulk OCR Session Proof (JSON)
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
        <div style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(12px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="glass-card" style={{ width: '900px', height: '85vh', padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column', background: 'white' }}>
            {/* Modal Header */}
            <div style={{ padding: '24px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--accent)', color: 'white' }}>
              <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                <FaLayerGroup style={{ fontSize: 24 }} />
                <div>
                  <h3 style={{ margin: 0, fontSize: 18, color: 'white' }}>Record Inspection</h3>
                  <p style={{ margin: 0, fontSize: 12, opacity: 0.8 }}>{viewingData.filename}</p>
                </div>
              </div>
              <button onClick={() => setViewingData(null)} style={{ background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: '50%', width: 36, height: 36, color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <FaTimes />
              </button>
            </div>

            {/* Modal Content Area */}
            <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
              {/* Sidebar / Tabs */}
              <div style={{ width: 220, background: '#f8fafc', borderRight: '1px solid #eee', padding: '24px 16px' }}>
                <div style={{ marginBottom: 24 }}>
                  <div className="section-meta" style={{ marginBottom: 12 }}>VIEWS</div>
                  {[
                    { id: 'structured', label: 'Structured Data', icon: FaTable },
                    { id: 'raw', label: 'Raw OCR Text', icon: FaFileAlt },
                    { id: 'preview', label: 'PDF Preview', icon: FaEye },
                    { id: 'json', label: 'JSON Proof', icon: FaCode }

                  ].map(tab => (
                    <button
                      key={tab.id}
                      onClick={() => setModalTab(tab.id as any)}
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        borderRadius: 10,
                        border: 'none',
                        textAlign: 'left',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 12,
                        marginBottom: 8,
                        cursor: 'pointer',
                        fontSize: 13,
                        fontWeight: 600,
                        background: modalTab === tab.id ? 'var(--primary)' : 'transparent',
                        color: modalTab === tab.id ? 'white' : '#64748b'
                      }}
                    >
                      <tab.icon />
                      {tab.label}
                    </button>
                  ))}
                </div>

                <div className="section-meta" style={{ marginBottom: 12 }}>TRUST ANCHOR</div>
                <div className="inner-card" style={{ padding: 12, fontSize: 10, wordBreak: 'break-all', fontFamily: 'monospace', opacity: 0.7 }}>
                  {viewingData.ledger_hash}
                </div>
              </div>

              {/* Main Tab Content */}
              <div style={{ flex: 1, overflowY: 'auto', padding: 40, background: '#fff' }}>
                {modalTab === 'structured' && (
                  <div className="animate-slide-up">
                    <h4 style={{ marginBottom: 24, display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ width: 4, height: 20, background: 'var(--primary)', borderRadius: 2 }}></div>
                      Extracted Intelligence
                    </h4>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 20 }}>
                      {Object.entries(viewingData.data || {}).map(([key, val]) => (
                        <div key={key} style={{ padding: '16px 24px', borderRadius: 12, border: '1px solid #f1f5f9', background: '#f8fafc' }}>
                          <div className="section-meta" style={{ fontSize: 10, marginBottom: 4 }}>{key.replace(/_/g, ' ').toUpperCase()}</div>
                          <div style={{ fontSize: 15, fontWeight: 600, color: '#334155' }}>
                            {Array.isArray(val) ? (
                              <div style={{ marginTop: 12, display: 'grid', gridTemplateColumns: '1fr', gap: 8 }}>
                                {val.map((item: any, i: number) => (
                                  <div key={i} className="inner-card" style={{ padding: '12px 16px', background: 'white', display: 'grid', gridTemplateColumns: '100px 1fr 60px 60px 80px', gap: 12, alignItems: 'center' }}>
                                    <span style={{ fontWeight: 700, fontSize: 13 }}>{item.code || item.course_number || `#${i + 1}`}</span>
                                    <span style={{ opacity: 0.7, fontSize: 13 }}>{item.title}</span>
                                    <div style={{ textAlign: 'center' }}>
                                      <div style={{ fontSize: 9, opacity: 0.5 }}>CR.</div>
                                      <div style={{ fontWeight: 600 }}>{item.credits || "-"}</div>
                                    </div>
                                    <div style={{ textAlign: 'center' }}>
                                      <div style={{ fontSize: 9, opacity: 0.5 }}>GR.</div>
                                      <div style={{ fontWeight: 600 }}>{item.grade || "-"}</div>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                      <div style={{ fontSize: 9, opacity: 0.5 }}>POINTS</div>
                                      <div style={{ color: 'var(--primary)', fontWeight: 800 }}>{item.credit_points}</div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              String(val)
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {modalTab === 'preview' && (
                  <div className="animate-slide-up" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
                    <div style={{ width: '100%', overflowX: 'hidden', display: 'flex', justifyContent: 'center', background: '#f1f5f9', padding: '20px', borderRadius: '12px' }}>
                      <div id="record-preview-content" style={{ 
                        transform: 'scale(0.70)', 
                        transformOrigin: 'top center',
                        width: '820px',
                        marginBottom: '-350px' // Pull up bottom content to hide the empty scaled space
                      }}>
                        {viewingData.doc_type === 'marksheet' && (
                          <MarksheetTemplate data={{ ...viewingData.data, raw_text: viewingData.raw_text }} />
                        )}
                        {viewingData.doc_type === 'certificate' && (
                          <CertificateTemplate data={{ ...viewingData.data, raw_text: viewingData.raw_text }} />
                        )}
                        {viewingData.doc_type === 'transcript' && (
                          <TranscriptTemplate data={{ ...viewingData.data, raw_text: viewingData.raw_text }} />
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {modalTab === 'raw' && (

                  <div className="animate-slide-up">
                    <h4 style={{ marginBottom: 24, display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ width: 4, height: 20, background: 'var(--primary)', borderRadius: 2 }}></div>
                      Original Extraction Buffer
                    </h4>
                    <div style={{
                      padding: 32,
                      background: '#f8fafc',
                      borderRadius: 16,
                      border: '1px solid #e2e8f0',
                      lineHeight: 1.8,
                      fontSize: 14,
                      color: '#475569',
                      whiteSpace: 'pre-wrap',
                      fontFamily: 'serif',
                      maxHeight: '500px',
                      overflowY: 'auto'
                    }}>
                      {viewingData.raw_text || (viewingData.data && viewingData.data.__raw_text) || "No raw text buffer found for this record."}
                    </div>
                  </div>
                )}

                {modalTab === 'json' && (
                  <div className="animate-slide-up">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                      <h4 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ width: 4, height: 20, background: 'var(--primary)', borderRadius: 2 }}></div>
                        Machine Readable JSON
                      </h4>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(JSON.stringify(viewingData.data, null, 2));
                          setCopied(true);
                          setTimeout(() => setCopied(false), 2000);
                        }}
                        style={{
                          padding: '8px 16px',
                          borderRadius: 8,
                          border: '1px solid var(--primary)',
                          background: copied ? 'rgba(96, 153, 102, 0.1)' : 'transparent',
                          color: 'var(--primary)',
                          fontSize: 12,
                          fontWeight: 600,
                          display: 'flex',
                          alignItems: 'center',
                          gap: 8,
                          cursor: 'pointer',
                          transition: 'all 0.2s'
                        }}
                      >
                        {copied ? <FaCheck /> : <FaCopy />}
                        {copied ? "Copied!" : "Copy JSON"}
                      </button>
                    </div>
                    <pre style={{
                      padding: 24,
                      background: '#1e1e1e',
                      color: '#d4d4d4',
                      borderRadius: 16,
                      fontSize: 13,
                      fontFamily: 'monospace',
                      lineHeight: 1.6,
                      overflowX: 'auto',
                      boxShadow: 'inset 0 2px 8px rgba(0,0,0,0.2)'
                    }}>
                      {JSON.stringify(viewingData.data, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div style={{ padding: '16px 32px', background: '#f8fafc', borderTop: '1px solid #eee', display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
              <button onClick={() => setViewingData(null)} className="btn-premium btn-outline" style={{ padding: '10px 24px' }}>Close Inspector</button>
              <button onClick={handleDownloadPDF} className="btn-premium btn-solid" style={{ padding: '10px 24px' }}>
                {isGeneratingPDF ? <FaSpinner className="animate-spin" /> : <FaDownload />} Generate PDF
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
