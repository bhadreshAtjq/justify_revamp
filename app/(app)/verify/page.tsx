"use client";

import { useCallback } from "react";
import { useAppStore } from "@/store/useAppStore";
import { generateStudentHash } from "@/lib/hash";
import { processOCR, verifyDocument } from "@/services/api";

import FileUploadDropzone from "@/components/FileUploadDropzone";
import OCRResultCard from "@/components/OCRResultCard";
import VerificationCard from "@/components/VerificationCard";
import ActivityLog from "@/components/ActivityLog";
import CopyButton from "@/components/CopyButton";
import { FaShieldAlt, FaTerminal } from "react-icons/fa";

export default function VerifyPage() {
  const store = useAppStore();

  const handleFileUpload = useCallback(
    async (file: File) => {
      store.setError(null);
      store.resetVerify();
      store.setVerifyFile(file);
      store.setLoading("isProcessingOCR", true);

      try {
        const result = await processOCR(file);
        console.log("DEBUG: Raw OCR Result JSON ->", JSON.stringify(result, null, 2));
        
        // 1. Recalculate hash in frontend (DETERMINISTIC)

        const hash = generateStudentHash(result, store.hashConfig);
        store.setVerifyHash(hash);

        // 2. Remove hash and raw_json but KEEP gpa for display
        const { keccak256_hash, raw_json, ...cleanResult } = result as any;
        store.setOCRResult(cleanResult);

        
        store.addActivityLog("ocr_complete", `OCR extraction complete. Generated Proof: ${hash.slice(0, 12)}...`);
      } catch (err) {
        store.setError(err instanceof Error ? err.message : "OCR Service Unavailable");
      } finally {
        store.setLoading("isProcessingOCR", false);
      }
    },
    [store]
  );

  const handleVerify = useCallback(async () => {
    store.setError(null);
    store.setLoading("isVerifying", true);
    try {
      const result = await verifyDocument(store.verifyHash);
      store.setVerifyResult(result);
      
      const dbStatus = result.db.found ? "MATCHED in Registry" : "NOT FOUND in Registry";
      const bcStatus = result.onChain.valid ? "ANCHORED on Blockchain" : "NOT ANCHORED";
      
      store.addActivityLog("verified", `Verification Result: ${dbStatus} | ${bcStatus}`);
    } catch (err) {
      store.setError(err instanceof Error ? err.message : "Verification Node Error");
    } finally {
      store.setLoading("isVerifying", false);
    }
  }, [store]);


  return (
    <div className="animate-slide-up">
      <div className="page-header">
        <div className="section-meta">VERIFICATION PORTAL</div>
        <h1 className="page-title">Marksheet Authenticator</h1>
        <p className="page-subtitle">Instantly verify the integrity of an academic transcript against blockchain anchors.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 40, alignItems: 'start' }}>
        <div className="space-y-6">
          <section>
            <div className="section-meta">STEP 01 — DOCUMENT INPUT</div>
            <FileUploadDropzone
              accept="image/*,.pdf"
              acceptLabel="Transcript Scan (PNG/PDF)"
              onFileSelect={handleFileUpload}
              currentFile={store.verifyFile}
              onClear={() => store.resetVerify()}
            />
            {store.isProcessingOCR && (
              <div style={{ marginTop: 16, display: 'flex', alignItems: 'center', gap: 12, justifyContent: 'center' }}>
                <div style={{ width: 14, height: 14, borderRadius: '50%', background: '#609966', animation: 'pulseSoft 1s infinite' }}></div>
                <span style={{ fontWeight: 600, fontSize: 13 }}>OCR Processing...</span>
              </div>
            )}
          </section>

          {store.ocrResult && (
            <section className="animate-slide-up">
              <div className="section-meta">STEP 02 — DATA SYNTHESIS</div>
              <OCRResultCard result={store.ocrResult} />
              
              <div className="root-emphasized" style={{ marginTop: 24, padding: 24, background: '#40513B' }}>
                <p className="root-label" style={{ marginBottom: 10 }}><FaTerminal /> GENERATED DOCUMENT HASH</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, justifyContent: 'center' }}>
                  <p className="root-value" style={{ fontSize: 13, flex: 1, textAlign: 'left' }}>{store.verifyHash}</p>
                  <CopyButton text={store.verifyHash} />
                </div>
              </div>
            </section>
          )}

          {store.verifyHash && !store.verifyResult && (
            <section>
              <div className="section-meta">STEP 03 — ANCHOR CROSS-CHECK</div>
              <button onClick={handleVerify} className="btn-premium btn-solid btn-block" disabled={store.isVerifying}>
                <FaShieldAlt /> {store.isVerifying ? "Contacting Ethereum Nodes..." : "Perform Blockchain Verification"}
              </button>
            </section>
          )}

          {store.verifyResult && (
            <section>
              <div className="section-meta">FINAL DETERMINATION</div>
              <VerificationCard result={store.verifyResult} />
            </section>
          )}
        </div>

        <div>
          <ActivityLog entries={store.activityLog} />
          
          <div className="glass-card" style={{ marginTop: 32 }}>
            <h3 style={{ marginBottom: 12, display: 'flex', alignItems: 'center', gap: 10 }}>
               Verification Guide
            </h3>
            <ul style={{ fontSize: 13, opacity: 0.7, paddingLeft: 16, lineHeight: 1.8 }}>
              <li>Ensure the scan is clear and well-lit.</li>
              <li>Hash is calculated from Reg No, GPA, and Credits.</li>
              <li>Verification checks if this hash exists in any anchored Merkle Tree.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
