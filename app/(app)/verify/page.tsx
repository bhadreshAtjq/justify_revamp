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
        if (verifyType !== "transcript") {
          store.setLoading("isValidatingQuality", true);
          const quality = await validateQuality(file);
          store.setQualityResult(quality);
          store.addActivityLog("quality_validated", `Quality Check: ${quality.is_valid ? 'PASSED' : 'LOW QUALITY'}`);
          store.setLoading("isValidatingQuality", false);
        } else {
          store.setQualityResult({ is_valid: true, message: "Transcript processing includes inline validation" });
        }

        store.setLoading("isProcessingOCR", true);
        const result = await processOCR(file, verifyType);
        
        const hash = generateStudentHash(result, store.hashConfig, verifyType);
        store.setVerifyHash(hash);
        store.setOCRResult(result);
        store.addActivityLog("ocr_complete", `OCR extraction complete for ${result.name}. Hash: ${hash.slice(0, 12)}...`);
        store.setLoading("isProcessingOCR", false);

        // Auto Verify
        store.setLoading("isVerifying", true);
        const vResult = await verifyDocument(hash);
        store.setVerifyResult(vResult);
        
        const dbStatus = vResult.db.found ? "MATCHED in Registry" : "NOT FOUND in Registry";
        const bcStatus = vResult.onChain.valid ? "ANCHORED on Blockchain" : "NOT ANCHORED";
        
        store.addActivityLog("verified", `Verification Result: ${dbStatus} | ${bcStatus}`);
        store.setLoading("isVerifying", false);

      } catch (err) {
        store.setError(err instanceof Error ? err.message : "Service Unavailable");
        store.setLoading("isValidatingQuality", false);
        store.setLoading("isProcessingOCR", false);
        store.setLoading("isVerifying", false);
      }
    },
    [store, verifyType]
  );


  return (
    <div className="animate-slide-up">
      <div>
        <div className="section-meta">VERIFICATION PORTAL</div>
        <h1 className="page-title">{verifyType.charAt(0).toUpperCase() + verifyType.slice(1)} Authenticator</h1>
        <p className="page-subtitle">Verify the integrity of an academic {verifyType} against blockchain anchors.</p>
      </div>

      <div style={{ display: 'flex', gap: 4, padding: 4, background: '#FFFFFF', borderRadius: 10, border: '1px solid rgba(57,62,70,0.08)', marginBottom: 28, maxWidth: 500 }}>
        <button
          onClick={() => { setVerifyType("marksheet"); store.resetVerify(); }}
          className={`btn-premium ${verifyType === "marksheet" ? "btn-solid" : ""}`}
          style={{ flex: 1, padding: '10px', fontSize: 13 }}
        >
          Marksheet
        </button>
        <button
          onClick={() => { setVerifyType("certificate"); store.resetVerify(); }}
          className={`btn-premium ${verifyType === "certificate" ? "btn-solid" : ""}`}
          style={{ flex: 1, padding: '10px', fontSize: 13 }}
        >
          Certificate
        </button>
        <button
          onClick={() => { setVerifyType("transcript"); store.resetVerify(); }}
          className={`btn-premium ${verifyType === "transcript" ? "btn-solid" : ""}`}
          style={{ flex: 1, padding: '10px', fontSize: 13 }}
        >
          Transcript
        </button>
      </div>

      {store.error && (
        <div className="animate-slide-up" style={{
          marginBottom: 20,
          padding: '12px 16px',
          borderRadius: 10,
          background: 'rgba(192, 57, 43, 0.04)',
          border: '1px solid rgba(192, 57, 43, 0.12)',
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 18, height: 18, borderRadius: '50%', background: '#C0392B', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 10, fontWeight: 'bold' }}>!</div>
            <span style={{ color: '#C0392B', fontWeight: 500, fontSize: 13 }}>{store.error}</span>
          </div>
          <button
            onClick={() => store.setError(null)}
            style={{ background: 'none', border: 'none', color: '#C0392B', cursor: 'pointer', fontSize: 16, padding: '2px 6px' }}
          >
            x
          </button>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 32, alignItems: 'start' }}>
        <div className="space-y-6">
          <section>
            <div className="section-meta">STEP 01 -- DOCUMENT INPUT</div>
            <FileUploadDropzone
              accept="image/*,.pdf"
              acceptLabel={`${verifyType.charAt(0).toUpperCase() + verifyType.slice(1)} Scan (PNG/PDF)`}
              onFileSelect={handleFileUpload}
              currentFile={store.verifyFile}
              onClear={() => store.resetVerify()}
            />
            {store.isValidatingQuality && (
              <div style={{ marginTop: 14, display: 'flex', alignItems: 'center', gap: 10, justifyContent: 'center' }}>
                <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#B8860B', animation: 'pulseSoft 1s infinite' }}></div>
                <span style={{ fontWeight: 500, fontSize: 13, color: '#B8860B' }}>Analyzing Document Quality...</span>
              </div>
            )}
            {store.isProcessingOCR && (
              <div style={{ marginTop: 14, display: 'flex', alignItems: 'center', gap: 10, justifyContent: 'center' }}>
                <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#393E46', animation: 'pulseSoft 1s infinite' }}></div>
                <span style={{ fontWeight: 500, fontSize: 13, color: '#393E46' }}>Extracting Data Points...</span>
              </div>
            )}
            {store.qualityResult && (
              <div 
                className="animate-slide-up"
                style={{ 
                  marginTop: 14, 
                  padding: '10px 14px', 
                  borderRadius: 8, 
                  background: store.qualityResult.is_valid ? 'rgba(45,106,79,0.04)' : 'rgba(184,134,11,0.04)',
                  border: `1px solid ${store.qualityResult.is_valid ? 'rgba(45,106,79,0.12)' : 'rgba(184,134,11,0.12)'}`,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10
                }}
              >
                <div style={{ 
                  width: 6, 
                  height: 6, 
                  borderRadius: '50%', 
                  background: store.qualityResult.is_valid ? '#2D6A4F' : '#B8860B' 
                }}></div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: 11, fontWeight: 700, margin: 0, color: store.qualityResult.is_valid ? '#2D6A4F' : '#B8860B' }}>
                    QUALITY: {store.qualityResult.is_valid ? 'CERTIFIED HIGH' : 'LOW QUALITY WARNING'}
                  </p>
                  {store.qualityResult.message && (
                    <p style={{ fontSize: 11, margin: 0, color: '#929AAB' }}>{store.qualityResult.message}</p>
                  )}
                </div>
              </div>
            )}
          </section>

          {store.ocrResult && (
            <section className="animate-slide-up">
              <div className="section-meta">STEP 02 -- DATA SYNTHESIS</div>
              <OCRResultCard result={store.ocrResult} type={verifyType} />
              
              <div className="root-emphasized" style={{ marginTop: 20 }}>
                <p className="root-label"><FaTerminal /> GENERATED DOCUMENT HASH</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, justifyContent: 'center' }}>
                  <p className="root-value" style={{ fontSize: 12, flex: 1, textAlign: 'left' }}>{store.verifyHash}</p>
                  <CopyButton text={store.verifyHash} />
                </div>
              </div>
            </section>
          )}

          {store.isVerifying && (
            <section className="animate-slide-up glass-card" style={{ textAlign: 'center', padding: '40px 20px' }}>
              <div style={{ width: 40, height: 40, borderRadius: '50%', background: '#393E46', animation: 'pulseSoft 1s infinite', margin: '0 auto 16px' }}></div>
              <h3 style={{ fontSize: 16, fontWeight: 700, margin: '0 0 8px' }}>Contacting Ethereum Nodes...</h3>
              <p style={{ color: '#929AAB', fontSize: 13, margin: 0 }}>Cryptographically verifying the document hash against the global ledger.</p>
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
          
          <div className="glass-card" style={{ marginTop: 24 }}>
            <h3 style={{ marginBottom: 12, fontSize: 14, fontWeight: 700 }}>
               Verification Guide
            </h3>
            <ul style={{ fontSize: 13, color: '#929AAB', paddingLeft: 16, lineHeight: 1.9 }}>
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
