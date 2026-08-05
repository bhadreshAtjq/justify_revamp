"use client";

import { useState, useMemo, useRef, useEffect } from "react";
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

function PageSizeSelect({ value, onChange }: { value: number, onChange: (val: number) => void }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '8px',
          padding: '6px 10px',
          backgroundColor: '#FFFFFF',
          border: '1px solid #CBD5E1',
          borderRadius: '6px',
          fontSize: '12px',
          fontWeight: 600,
          color: '#006064',
          minWidth: '64px',
          flexShrink: 0,
          cursor: 'pointer',
          outline: 'none'
        }}
      >
        <span>{value}</span>
        <svg className={`w-3 h-3 text-[#006064] transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
      </button>
      
      {isOpen && (
        <>
          <style>{`
            .custom-dropdown-item {
              padding: 8px 12px;
              font-size: 12px;
              cursor: pointer;
              transition: background-color 0.2s;
              color: #006064;
            }
            .custom-dropdown-item:hover {
              background-color: #F4FAFA;
            }
            .custom-dropdown-item.active {
              background-color: #006064;
              color: #FFFFFF;
              font-weight: 500;
            }
            .custom-dropdown-item.active:hover {
              background-color: #006064;
            }
          `}</style>
          <div style={{
            position: 'absolute',
            top: '100%',
            marginTop: '4px',
            right: 0,
            width: '100%',
            minWidth: '70px',
            backgroundColor: '#FFFFFF',
            border: '1px solid #D3FFE9',
            borderRadius: '6px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            zIndex: 50,
            overflow: 'hidden',
            padding: '4px 0'
          }}>
            {[10, 20, 50, 100].map(size => (
              <div 
                key={size}
                onClick={() => { onChange(size); setIsOpen(false); }}
                className={`custom-dropdown-item ${value === size ? 'active' : ''}`}
              >
                {size}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
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

      const isLandscape = false; 
      const isMultiPage = type === "transcript";

      // Get all transcript pages
      const pages = input.querySelectorAll('.transcript-page');
      const singlePage = input.querySelector('.certificate-page') || input.querySelector('.marksheet-page');

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

      // Base A4 width in points
      const pdfWidth = isLandscape ? 841.89 : 595.28;
      const pdf = new jsPDF({
        orientation: isLandscape ? "l" : "p",
        unit: "pt",
        format: isLandscape ? [pdfWidth, 595.28] : "a4",
        compress: true
      });

      if (isMultiPage && pages.length > 0) {
        // Handle multi-page transcript
        for (let i = 0; i < pages.length; i++) {
          if (i > 0) pdf.addPage();

          const page = pages[i] as HTMLElement;
          const clone = page.cloneNode(true) as HTMLElement;
          clone.style.position = "absolute";
          clone.style.left = "-9999px";
          clone.style.top = "0";
          clone.style.width = "840px";
          clone.style.height = "auto";
          clone.style.background = "white";
          clone.style.boxShadow = "none";
          clone.style.margin = "0";
          clone.style.overflow = "visible";
          document.body.appendChild(clone);

          // Get actual height after rendering
          const actualHeight = page.offsetHeight;

          const canvas = await html2canvas(page, {
            scale: 1.5, // High quality but managed
            useCORS: true,
            logging: false,
            backgroundColor: "#ffffff",
          });

          const imgData = canvas.toDataURL("image/jpeg", 0.8);
          
          // Calculate the height in PDF points based on the canvas aspect ratio
          // pdfWidth is already calculated correctly
          const canvasAspectRatio = canvas.height / canvas.width;
          const imgHeight = pdfWidth * canvasAspectRatio;

          pdf.addImage(imgData, "JPEG", 0, 0, pdfWidth, imgHeight, undefined, 'FAST');

          // Embed JSON on last page
          if (i === pages.length - 1) {
            pdf.setFontSize(2);
            pdf.setTextColor(255, 255, 255);
            const jsonStr = JSON.stringify(exportJson);
            pdf.text(jsonStr, 5, imgHeight - 5, { maxWidth: pdfWidth - 10 });
          }
        }
      } else {
        // Handle single page (certificate or marksheet)
        const targetPage = singlePage || input;
        const clone = targetPage.cloneNode(true) as HTMLElement;
        clone.style.position = "absolute";
        clone.style.left = "-9999px";
        clone.style.top = "0";
        clone.style.width = isLandscape ? "1100px" : "900px";
        clone.style.height = "auto";
        clone.style.background = "white";
        clone.style.overflow = "visible";
        document.body.appendChild(clone);

        const innerPage = (clone.querySelector('.certificate-page') ||
                           clone.querySelector('.marksheet-page') ||
                           clone.querySelector('.transcript-page')) as HTMLElement;
        if (innerPage) {
          innerPage.style.boxShadow = "none";
          innerPage.style.margin = "0";
          innerPage.style.display = "block";
        }

        // Get actual height after rendering
        const actualHeight = clone.offsetHeight;

        const canvas = await html2canvas(clone, {
          scale: 1.5,
          useCORS: true,
          logging: false,
          backgroundColor: "#ffffff",
          windowWidth: isLandscape ? 1200 : 1000,
          windowHeight: Math.max(actualHeight + 100, 4000),
        });

        document.body.removeChild(clone);

        const imgData = canvas.toDataURL("image/jpeg", 0.8);
        const canvasHeight = (pdfWidth * canvas.height) / canvas.width;

        pdf.addImage(imgData, "JPEG", 0, 0, pdfWidth, canvasHeight, undefined, 'FAST');


        pdf.setFontSize(2);
        pdf.setTextColor(255, 255, 255);
        const jsonStr = JSON.stringify(exportJson);
        pdf.text(jsonStr, 5, canvasHeight - 5, { maxWidth: pdfWidth - 10 });
      }

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
      <div className="glass-card" style={{ 
        padding: '14px 20px', marginBottom: 0, borderRadius: '12px 12px 0 0', 
        display: 'flex', gap: 14, alignItems: 'center', justifyContent: 'space-between',
        flexWrap: 'wrap',
        position: 'relative',
        zIndex: 20
      }}>
        <div style={{ display: 'flex', gap: 14, alignItems: 'center', flex: '1 1 300px' }}>
          <div style={{ position: 'relative', flex: 1, maxWidth: 400 }}>
            <FaSearch style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#929AAB', fontSize: 12 }} />
            <input 
              type="text" 
              placeholder="Search records..."
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
              style={{ width: '100%', padding: '12px 14px 12px 40px', borderRadius: 8, border: '1px solid rgba(57,62,70,0.1)', background: '#FFFFFF', fontSize: 13, fontWeight: 500, fontFamily: 'inherit' }}
            />
          </div>
          <button onClick={handleExportCSV} className="btn-premium btn-outline" style={{ padding: '10px 16px', fontSize: 11, display: 'flex', alignItems: 'center', gap: 6, fontWeight: 700 }}>
            <FaFileCsv /> EXPORT CSV
          </button>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 10, fontWeight: 700, color: '#929AAB' }}>ROWS</span>
          <PageSizeSelect 
            value={pageSize} 
            onChange={(newSize) => { setPageSize(newSize); setCurrentPage(1); }} 
          />
        </div>
      </div>

      <div className="table-container" style={{ borderTop: 'none', borderRadius: 0, maxHeight: '500px', overflowY: 'auto' }}>
        <table className="premium-table" style={{ width: '100%', tableLayout: 'auto' }}>
          <thead>
            <tr>
              <th style={{ minWidth: 60, width: 60, position: 'sticky', left: 0, zIndex: 10, background: 'rgba(250, 252, 251, 1)', boxShadow: '2px 0 5px -2px rgba(0,0,0,0.05)' }}>#</th>
              {headers.map((header) => (
                <th key={header} style={{ minWidth: 120 }}>{header.replace(/_/g, ' ')}</th>
              ))}
              <th style={{ minWidth: 100, position: 'sticky', right: 0, zIndex: 10, background: 'rgba(250, 252, 251, 1)', textAlign: 'center', boxShadow: '-2px 0 5px -2px rgba(0,0,0,0.05)' }}>ACTION</th>
            </tr>
          </thead>
          <tbody>
            {currentRecords.map((record, idx) => (
              <tr key={idx}>
                <td style={{ fontWeight: 700, color: '#929AAB', position: 'sticky', left: 0, zIndex: 5, background: '#FFFFFF', boxShadow: '2px 0 5px -2px rgba(0,0,0,0.05)' }}>
                  {(currentPage - 1) * pageSize + idx + 1}
                </td>
                {headers.map((header) => (
                  <td key={`${idx}-${header}`}>{record[header] || "-"}</td>
                ))}
                <td style={{ position: 'sticky', right: 0, zIndex: 5, background: '#FFFFFF', textAlign: 'center', boxShadow: '-2px 0 5px -2px rgba(0,0,0,0.05)' }}>
                  <button onClick={() => handlePreview(record)} style={{ padding: '6px 14px', background: 'rgba(0, 123, 62, 0.06)', color: 'var(--secondary)', border: 'none', borderRadius: 6, fontSize: 10, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, margin: '0 auto', transition: 'background 0.2s' }}
                    onMouseOver={(e) => e.currentTarget.style.background = 'rgba(0, 123, 62, 0.12)'}
                    onMouseOut={(e) => e.currentTarget.style.background = 'rgba(0, 123, 62, 0.06)'}
                  >
                    <FaFileAlt /> VIEW
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="pagination-bar">
        <div className="pagination-info">Page <b>{currentPage}</b> of <b>{totalPages || 1}</b></div>
        <div className="pagination-controls">
          <button className="page-btn" onClick={() => goToPage(currentPage - 1)} disabled={currentPage === 1}><FaChevronLeft /></button>
          <button className="page-btn" onClick={() => goToPage(currentPage + 1)} disabled={currentPage === totalPages || totalPages === 0}><FaChevronRight /></button>
        </div>
      </div>

      {selectedStudent && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ 
            width: '95%',
            maxWidth: type === "certificate" ? '1100px' : '900px', 
            maxHeight: '95vh', 
            padding: 0, 
            overflow: 'hidden', 
            display: 'flex', 
            flexDirection: 'column', 
            background: '#FFFFFF',
            borderRadius: 12,
            border: '1px solid rgba(57,62,70,0.08)',
          }}>
            <div style={{ padding: '14px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(57,62,70,0.06)' }}>
              <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                <FaFilePdf style={{ color: '#C0392B', fontSize: 20 }} />
                <h3 style={{ margin: 0, fontSize: 14, fontWeight: 700 }}>Blockchain Verified {type.charAt(0).toUpperCase() + type.slice(1)}</h3>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button 
                  onClick={handleDownloadPDF} 
                  disabled={isGenerating}
                  className="btn-premium btn-solid" 
                  style={{ padding: '8px 18px', fontSize: 11, fontWeight: 700 }}
                >
                  <FaDownload /> {isGenerating ? "GENERATING..." : "DOWNLOAD PDF"}
                </button>
                <button onClick={() => setSelectedStudent(null)} style={{ background: 'var(--canvas)', border: '1px solid var(--border)', borderRadius: 8, width: 30, height: 30, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>
                  <FaTimes />
                </button>
              </div>
            </div>
            <div style={{ flex: 1, overflowY: 'auto', background: '#F7F7F7', padding: '20px' }}>
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
