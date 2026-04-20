"use client";

import { useCallback, useState, useRef } from "react";
import { FaUpload, FaTimesCircle, FaFileCsv, FaFileImage, FaFilePdf } from "react-icons/fa";

interface FileUploadDropzoneProps {
  accept: string;
  acceptLabel: string;
  onFileSelect: (file: File) => void;
  currentFile?: File | null;
  onClear?: () => void;
}

export default function FileUploadDropzone({
  accept,
  acceptLabel,
  onFileSelect,
  currentFile,
  onClear,
}: FileUploadDropzoneProps) {
  const [isDragActive, setIsDragActive] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragActive(true);
  };

  const handleDragLeave = () => setIsDragActive(false);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragActive(false);
    if (e.dataTransfer.files.length > 0) {
      onFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onFileSelect(e.target.files[0]);
    }
  };

  if (currentFile) {
    const isImage = currentFile.type.startsWith('image/');
    const isPdf = currentFile.type === 'application/pdf';
    const isCsv = currentFile.name.endsWith('.csv');

    return (
      <div className="inner-card animate-slide-up" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div className="hash-id" style={{ width: 48, height: 48, fontSize: 20 }}>
            {isCsv && <FaFileCsv />}
            {isImage && <FaFileImage />}
            {isPdf && <FaFilePdf />}
            {!isCsv && !isImage && !isPdf && <FaUpload />}
          </div>
          <div>
            <p style={{ fontWeight: 700, fontSize: 16 }}>{currentFile.name}</p>
            <p style={{ opacity: 0.5, fontSize: 13 }}>{(currentFile.size / 1024).toFixed(1)} KB</p>
          </div>
        </div>
        <button onClick={onClear} className="btn-premium btn-outline" style={{ padding: 12 }}>
          <FaTimesCircle />
        </button>
      </div>
    );
  }

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={() => inputRef.current?.click()}
      className="dropzone-premium animate-slide-up"
      style={{ opacity: isDragActive ? 0.8 : 1 }}
    >
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        onChange={handleFileChange}
        style={{ display: "none" }}
      />
      <div className="dropzone-inner">
        <div className="dropzone-circle">
          <FaUpload />
        </div>
        <h3 style={{ marginBottom: 8 }}>{isDragActive ? "Drop to Upload" : "Select Marksheet / CSV"}</h3>
        <p style={{ opacity: 0.6 }}>{acceptLabel} (Max 10MB)</p>
      </div>
    </div>
  );
}
