"use client";

import { useCallback, useState } from "react";
import { FaFileImage, FaFilePdf, FaUpload } from "react-icons/fa";

interface BulkOCRUploadProps {
  uploadType: "marksheet" | "certificate" | "transcript";
  onFilesSelect: (files: File[]) => void;
  isProcessing?: boolean;
}

export default function BulkOCRUpload({ uploadType, onFilesSelect, isProcessing = false }: BulkOCRUploadProps) {
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const files = Array.from(e.dataTransfer.files);
      onFilesSelect(files);
    }
  }, [onFilesSelect]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      const files = Array.from(e.target.files);
      onFilesSelect(files);
    }
  }, [onFilesSelect]);

  return (
    <div
      className={`glass-card ${dragActive ? "border-primary" : ""}`}
      style={{
        padding: "40px 32px",
        border: dragActive ? "2px dashed var(--primary)" : "2px dashed rgba(64,81,59,0.3)",
        textAlign: "center",
        cursor: "pointer",
        transition: "all 0.3s ease",
        background: dragActive ? "rgba(64,81,59,0.05)" : "transparent"
      }}
      onDragEnter={handleDrag}
      onDragLeave={handleDrag}
      onDragOver={handleDrag}
      onDrop={handleDrop}
    >
      <input
        type="file"
        multiple
        accept="image/*,.pdf"
        onChange={handleChange}
        style={{ display: "none" }}
        id="bulk-ocr-upload"
        disabled={isProcessing}
      />
      
      <label htmlFor="bulk-ocr-upload" style={{ cursor: isProcessing ? "not-allowed" : "pointer" }}>
        <div style={{ marginBottom: 16 }}>
          {isProcessing ? (
            <div style={{ width: 48, height: 48, borderRadius: "50%", background: "var(--primary)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto", animation: "pulseSoft 1s infinite" }}>
              <FaUpload style={{ color: "white", fontSize: 20 }} />
            </div>
          ) : (
            <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
              <FaFileImage style={{ fontSize: 32, color: "var(--primary)", opacity: 0.7 }} />
              <FaFilePdf style={{ fontSize: 32, color: "var(--primary)", opacity: 0.7 }} />
            </div>
          )}
        </div>
        
        <h3 style={{ margin: 0, marginBottom: 8, fontSize: 16, fontWeight: 700, color: "var(--primary)" }}>
          {isProcessing ? "Processing OCR..." : `Bulk ${uploadType.charAt(0).toUpperCase() + uploadType.slice(1)} Upload`}
        </h3>
        
        <p style={{ margin: 0, fontSize: 13, opacity: 0.7, lineHeight: 1.5 }}>
          {isProcessing 
            ? "Extracting data from documents..."
            : `Drag & drop multiple ${uploadType} files here, or click to select`
          }
        </p>
        
        {!isProcessing && (
          <div style={{ marginTop: 12, fontSize: 11, opacity: 0.5 }}>
            Supported: PNG, JPG, PDF • Multiple files allowed
          </div>
        )}
      </label>
    </div>
  );
}
