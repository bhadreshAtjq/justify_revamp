"use client";

import { useCallback, useState } from "react";
import { useAppStore } from "@/store/useAppStore";
import { generateStudentHash } from "@/lib/hash";
import { processOCR, verifyDocument, validateQuality } from "@/services/api";

import FileUploadDropzone from "@/components/FileUploadDropzone";
import OCRResultCard from "@/components/OCRResultCard";
import VerificationCard from "@/components/VerificationCard";
import ActivityLog from "@/components/ActivityLog";
import CopyButton from "@/components/CopyButton";
import { FaShieldAlt, FaTerminal } from "react-icons/fa";

export default function VerifyPage() {
  const store = useAppStore();
  const [verifyType, setVerifyType] = useState<"marksheet" | "certificate" | "transcript">("marksheet");

  const handleFileUpload = useCallback(
    async (file: File) => {
      store.setError(null);
      store.resetVerify();
      store.setVerifyFile(file);
      
      try {
        // 1. Initial Quality Validation (Skip for transcripts)
        if (verifyType !== "transcript") {
          store.setLoading("isValidatingQuality", true);
          const quality = await validateQuality(file);
          store.setQualityResult(quality);
          store.addActivityLog("quality_validated", `Quality Check: ${quality.is_valid ? 'PASSED' : 'LOW QUALITY'}`);
          store.setLoading("isValidatingQuality", false);
        } else {
          store.setQualityResult({ is_valid: true, message: "Transcript processing includes inline validation" });
        }

        // 2. OCR Extraction
        store.setLoading("isProcessingOCR", true);
        const result = await processOCR(file, verifyType);
        console.log("DEBUG: Raw OCR Result JSON ->", JSON.stringify(result, null, 2));
        
        // Ensure result fields are present
        if (!result.registration_no || !result.name) {
          console.warn("DEBUG: OCR result missing critical fields (reg_no or name)");
        }

        // 3. Recalculate hash in frontend (DETERMINISTIC)
        const hash = generateStudentHash(result, store.hashConfig, verifyType);
        console.log(`DEBUG: Final Generated Hash (${verifyType}) ->`, hash);
        store.setVerifyHash(hash);

        // 4. Set result for display
        store.setOCRResult(result);
        
        store.addActivityLog("ocr_complete", `OCR extraction complete for ${result.name}. Hash: ${hash.slice(0, 12)}...`);
      } catch (err) {
        store.setError(err instanceof Error ? err.message : "Service Unavailable");
      } finally {
        store.setLoading("isValidatingQuality", false);
        store.setLoading("isProcessingOCR", false);
      }
    },
    [store, verifyType]
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
        <h1 className="page-title">{verifyType.charAt(0).toUpperCase() + verifyType.slice(1)} Authenticator</h1>
        <p className="page-subtitle">Instantly verify the integrity of an academic {verifyType} against blockchain anchors.</p>
      </div>

      <div className="glass-card" style={{ padding: '8px', display: 'flex', gap: '8px', marginBottom: '32px', maxWidth: '600px' }}>
        <button
          onClick={() => { setVerifyType("marksheet"); store.resetVerify(); }}
          className={`btn-premium ${verifyType === "marksheet" ? "btn-solid" : "btn-outline"}`}
          style={{ flex: 1, padding: '10px' }}
        >
          Marksheet
        </button>
        <button
          onClick={() => { setVerifyType("certificate"); store.resetVerify(); }}
          className={`btn-premium ${verifyType === "certificate" ? "btn-solid" : "btn-outline"}`}
          style={{ flex: 1, padding: '10px' }}
        >
          Certificate
        </button>
        <button
          onClick={() => { setVerifyType("transcript"); store.resetVerify(); }}
          className={`btn-premium ${verifyType === "transcript" ? "btn-solid" : "btn-outline"}`}
          style={{ flex: 1, padding: '10px' }}
        >
          Transcript
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 40, alignItems: 'start' }}>
        <div className="space-y-6">
          <section>
            <div className="section-meta">STEP 01 — DOCUMENT INPUT</div>
            <FileUploadDropzone
              accept="image/*,.pdf"
              acceptLabel={`${verifyType.charAt(0).toUpperCase() + verifyType.slice(1)} Scan (PNG/PDF)`}
              onFileSelect={handleFileUpload}
              currentFile={store.verifyFile}
              onClear={() => store.resetVerify()}
            />
            {store.isValidatingQuality && (
              <div style={{ marginTop: 16, display: 'flex', alignItems: 'center', gap: 12, justifyContent: 'center' }}>
                <div style={{ width: 14, height: 14, borderRadius: '50%', background: '#ffc107', animation: 'pulseSoft 1s infinite' }}></div>
                <span style={{ fontWeight: 600, fontSize: 13, color: '#856404' }}>Analyzing Document Quality...</span>
              </div>
            )}
            {store.isProcessingOCR && (
              <div style={{ marginTop: 16, display: 'flex', alignItems: 'center', gap: 12, justifyContent: 'center' }}>
                <div style={{ width: 14, height: 14, borderRadius: '50%', background: '#609966', animation: 'pulseSoft 1s infinite' }}></div>
                <span style={{ fontWeight: 600, fontSize: 13 }}>Extracting Data Points...</span>
              </div>
            )}
            {store.qualityResult && (
              <div 
                className="animate-slide-up"
                style={{ 
                  marginTop: 16, 
                  padding: '12px 16px', 
                  borderRadius: 12, 
                  background: store.qualityResult.is_valid ? 'rgba(96,153,102,0.1)' : 'rgba(255,193,7,0.1)',
                  border: `1px solid ${store.qualityResult.is_valid ? 'rgba(96,153,102,0.2)' : 'rgba(255,193,7,0.2)'}`,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12
                }}
              >
                <div style={{ 
                  width: 8, 
                  height: 8, 
                  borderRadius: '50%', 
                  background: store.qualityResult.is_valid ? '#609966' : '#ffc107' 
                }}></div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: 12, fontWeight: 800, margin: 0, color: store.qualityResult.is_valid ? '#609966' : '#856404' }}>
                    QUALITY: {store.qualityResult.is_valid ? 'CERTIFIED HIGH' : 'LOW QUALITY WARNING'}
                  </p>
                  {store.qualityResult.message && (
                    <p style={{ fontSize: 11, margin: 0, opacity: 0.7 }}>{store.qualityResult.message}</p>
                  )}
                </div>
              </div>
            )}
          </section>

          {store.ocrResult && (
            <section className="animate-slide-up">
              <div className="section-meta">STEP 02 — DATA SYNTHESIS</div>
              <OCRResultCard result={store.ocrResult} type={verifyType} />
              
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
              <li>Hash is calculated from {verifyType === "transcript" ? "the full academic history" : "Reg No, GPA, and Credits"}.</li>
              <li>Verification checks if this hash exists in any anchored Merkle Tree.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
