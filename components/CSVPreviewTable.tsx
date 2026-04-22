"use client";

import { useState, useMemo } from "react";
import { 
  FaChevronLeft, 
  FaChevronRight, 
  FaAngleDoubleLeft, 
  FaAngleDoubleRight,
  FaSearch, 
  FaFileAlt,
  FaTimes,
  FaDownload,
  FaFileCsv,
  FaFilePdf
} from "react-icons/fa";
import MarksheetTemplate from "./MarksheetTemplate";
import TranscriptTemplate from "./TranscriptTemplate";
import CertificateTemplate from "./CertificateTemplate";
import { discoverSubjects, mapStudentMetadata } from "@/lib/marksheet";
import { mapTranscriptPayload } from "@/lib/transcript";
import { mapCertificatePayload } from "@/lib/certificate";
import { generateStudentHash } from "@/lib/hash";
import { useAppStore } from "@/store/useAppStore";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

interface CSVPreviewTableProps {
  headers: string[];
  records: Record<string, string>[];
  fileName: string;
  type?: string;
}

export default function CSVPreviewTable({
  headers,
  records,
  fileName,
  type = "marksheet"
}: CSVPreviewTableProps) {
  const store = useAppStore();
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStudent, setSelectedStudent] = useState<Record<string, string> | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  // PDF Generation Logic
  const handleDownloadPDF = async () => {
    if (!selectedStudent) return;
    setIsGenerating(true);
    
    try {
      let templateId = "marksheet-pdf";
      if (type === "transcript") templateId = "transcript-pdf";
      if (type === "certificate") templateId = "certificate-pdf";

      const input = document.getElementById(templateId);
      if (!input) throw new Error("Template not found");

      const isLandscape = type === "certificate";

      // 1. Create a clone and isolate it on the body to avoid parent clipping/scroll issues
      const clone = input.cloneNode(true) as HTMLElement;
      clone.style.position = "absolute";
      clone.style.left = "-9999px";
      clone.style.top = "0";
      clone.style.width = isLandscape ? "1100px" : "900px"; // Fixed width for capture stability
      clone.style.height = "auto";
      clone.style.background = "white";
      document.body.appendChild(clone);

      // Force unroll styles on the clone
      clone.style.maxHeight = "none";
      clone.style.overflow = "visible";
      const innerPage = (clone.querySelector('.certificate-page') || 
                         clone.querySelector('.marksheet-page') || 
                         clone.querySelector('.transcript-page')) as HTMLElement;
      if (innerPage) {
        innerPage.style.boxShadow = "none";
        innerPage.style.margin = "0 auto 60px auto";
        innerPage.style.display = "block";
      }

      const canvas = await html2canvas(clone, {
        scale: 4, 
        useCORS: true,
        logging: false,
        backgroundColor: "#ffffff",
        windowWidth: isLandscape ? 1200 : 1000,
        windowHeight: 4000,
      });

      // 2. Clean up clone
      document.body.removeChild(clone);

      const imgData = canvas.toDataURL("image/png");
      const canvasWidth = canvas.width;
      const canvasHeight = canvas.height;

      // Base A4 width in points
      const pdfWidth = isLandscape ? 841.89 : 595.28; 
      const pdfHeight = (canvasHeight * pdfWidth) / canvasWidth;

      // Use 'p' with custom format [w, h] to avoid orientation flipping confusion
      const pdf = new jsPDF({
        orientation: "p",
        unit: "pt",
        format: [pdfWidth, pdfHeight]
      });

      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      
      let exportJson: any = selectedStudent;
      if (type === "transcript") {
        const { mapTranscriptPayload } = await import("@/lib/transcript");
        exportJson = mapTranscriptPayload(selectedStudent);
      } else if (type === "certificate") {
        const { mapCertificatePayload } = await import("@/lib/certificate");
        exportJson = mapCertificatePayload(selectedStudent);
      } else {
        const { mapStudentMetadata, discoverSubjects } = await import("@/lib/marksheet");
        exportJson = {
          ...mapStudentMetadata(selectedStudent),
          subjects: discoverSubjects(selectedStudent)
        };
      }

      // Embed JSON metadata invisibly on the SAME page to keep it as a single page
      pdf.setFontSize(2);
      pdf.setTextColor(255, 255, 255); 
      const jsonStr = JSON.stringify(exportJson);
      // Place at the very bottom edge
      pdf.text(jsonStr, 5, pdfHeight - 5, { maxWidth: pdfWidth - 10 });

      const name = (selectedStudent.name || selectedStudent.Student_Name || "document").replace(/\s+/g, '_');
      pdf.save(`${name}_${type}.pdf`);

    } catch (err) {

      console.error("PDF Export failed:", err);
      alert("Failed to generate PDF. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };


  // CSV Export Logic
  const handleExportCSV = () => {
    if (filteredRecords.length === 0) return;
    
    const csvRows = [];
    csvRows.push(headers.join(","));
    
    for (const record of filteredRecords) {
      const values = headers.map(header => {
        const val = String(record[header] || "");
        return `"${val.replace(/"/g, '""')}"`;
      });
      csvRows.push(values.join(","));
    }
    
    const csvString = csvRows.join("\n");
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Exported_Records_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePreview = (record: any) => {
    setSelectedStudent(record);
  };

  // Filter logic
  const filteredRecords = useMemo(() => {
    if (!searchQuery) return records;
    const lowerQuery = searchQuery.toLowerCase();
    return records.filter(record => 
      Object.values(record).some(val => 
        String(val).toLowerCase().includes(lowerQuery)
      )
    );
  }, [records, searchQuery]);

  const totalPages = Math.ceil(filteredRecords.length / pageSize);
  
  const currentRecords = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredRecords.slice(start, start + pageSize);
  }, [filteredRecords, currentPage, pageSize]);

  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages || 1)));
  };

  return (
    <div className="animate-slide-up" style={{ width: '100%', maxWidth: '100%' }}>
      {/* Header Bar */}
      <div className="glass-card" style={{ padding: '16px 24px', marginBottom: 0, borderRadius: 'var(--radius-md) var(--radius-md) 0 0', display: 'flex', gap: 16, alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', gap: 16, alignItems: 'center', flex: 1 }}>
          <div style={{ position: 'relative', flex: 1, maxWidth: 400 }}>
            <FaSearch style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', opacity: 0.4 }} />
            <input 
              type="text" 
              placeholder="Search records..."
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
              style={{ width: '100%', padding: '12px 16px 12px 44px', borderRadius: 12, border: '2px solid var(--accent)', background: 'white', fontSize: 13, fontWeight: 600 }}
            />
          </div>
          <button onClick={handleExportCSV} className="btn-premium" style={{ padding: '10px 18px', fontSize: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
            <FaFileCsv /> EXPORT CSV
          </button>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 11, fontWeight: 800, opacity: 0.5 }}>ROWS</span>
          <select value={pageSize} onChange={(e) => { setPageSize(Number(e.target.value)); setCurrentPage(1); }} className="inner-card" style={{ padding: '8px 12px', border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 700 }}>
            {[10, 20, 50, 100].map(size => <option key={size} value={size}>{size}</option>)}
          </select>
        </div>
      </div>

      <div className="table-container" style={{ borderTop: 'none', borderRadius: 0 }}>
        <table className="premium-table" style={{ width: 'max-content', minWidth: '100%' }}>
          <thead>
            <tr>
              <th style={{ minWidth: 60, width: 60, position: 'sticky', left: 0, zIndex: 10, background: 'var(--accent)', color: 'white' }}>#</th>
              {headers.map((header) => (
                <th key={header} style={{ minWidth: 120 }}>{header.replace(/_/g, ' ')}</th>
              ))}
              <th style={{ minWidth: 100, position: 'sticky', right: 0, zIndex: 10, background: 'var(--primary)', color: 'white' }}>ACTION</th>
            </tr>
          </thead>
          <tbody>
            {currentRecords.map((record, idx) => (
              <tr key={idx}>
                <td style={{ fontWeight: 800, opacity: 0.3, position: 'sticky', left: 0, zIndex: 5, background: 'var(--canvas)' }}>
                  {(currentPage - 1) * pageSize + idx + 1}
                </td>
                {headers.map((header) => (
                  <td key={`${idx}-${header}`}>{record[header] || "—"}</td>
                ))}
                <td style={{ position: 'sticky', right: 0, zIndex: 5, background: 'var(--canvas)', textAlign: 'center' }}>
                  <button onClick={() => handlePreview(record)} style={{ padding: '8px 14px', background: 'var(--primary)', color: 'white', border: 'none', borderRadius: 8, fontSize: 11, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <FaFileAlt /> VIEW
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="pagination-bar" style={{ borderTop: '2px solid rgba(0,0,0,0.05)' }}>
        <div className="pagination-info">Page <b>{currentPage}</b> of <b>{totalPages || 1}</b></div>
        <div className="pagination-controls">
          <button className="page-btn" onClick={() => goToPage(currentPage - 1)} disabled={currentPage === 1}><FaChevronLeft /></button>
          <button className="page-btn" onClick={() => goToPage(currentPage + 1)} disabled={currentPage === totalPages || totalPages === 0}><FaChevronRight /></button>
        </div>
      </div>

      {selectedStudent && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="glass-card" style={{ 
            width: type === "certificate" ? '1100px' : '900px', 
            maxHeight: '95vh', 
            padding: 0, 
            overflow: 'hidden', 
            display: 'flex', 
            flexDirection: 'column', 
            background: 'white' 
          }}>
            <div style={{ padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #eee' }}>
              <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                <FaFilePdf style={{ color: '#d32f2f', fontSize: 24 }} />
                <h3 style={{ margin: 0, fontSize: 16 }}>Blockchain Verified {type.charAt(0).toUpperCase() + type.slice(1)}</h3>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button 
                  onClick={handleDownloadPDF} 
                  disabled={isGenerating}
                  className="btn-premium" 
                  style={{ padding: '8px 20px', fontSize: 12, background: isGenerating ? '#999' : 'var(--primary)' }}
                >
                  <FaDownload /> {isGenerating ? "GENERATING..." : "DOWNLOAD PDF"}
                </button>
                <button onClick={() => setSelectedStudent(null)} style={{ background: '#eee', border: 'none', borderRadius: '50%', width: 34, height: 34, cursor: 'pointer' }}>
                  <FaTimes />
                </button>
              </div>
            </div>
            <div style={{ flex: 1, overflowY: 'auto', background: '#f5f5f5', padding: '20px' }}>
              {type === "transcript" ? (
                <TranscriptTemplate data={selectedStudent} />
              ) : type === "certificate" ? (
                <CertificateTemplate data={selectedStudent} />
              ) : (
                <MarksheetTemplate data={{
                  ...selectedStudent,
                  name: selectedStudent.name || selectedStudent.Student_Name || selectedStudent.Full_Name || "Unknown Student",
                  registration_no: selectedStudent.registration_no || selectedStudent.Registration_No || "N/A",
                  gpa: selectedStudent.gpa || selectedStudent.GPA || "0.00",
                  faculty: selectedStudent.faculty || selectedStudent.Faculty,
                  degree: selectedStudent.degree || selectedStudent.Degree || selectedStudent.Degree_Course,
                  semester: selectedStudent.semester || selectedStudent.Semester,
                  major: selectedStudent.major || selectedStudent.Major_Subject,
                  minor: selectedStudent.minor || selectedStudent.Minor_Subject,
                  college: selectedStudent.college || selectedStudent.Name_of_College || selectedStudent.College,
                  academic_year: selectedStudent.academic_year || selectedStudent.Academic_Year,
                  examination: selectedStudent.examination || selectedStudent.Examination_held_in,
                  status: selectedStudent.Status || selectedStudent.status,
                  subjects: selectedStudent.subjects || []
                }} />
              )}
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
