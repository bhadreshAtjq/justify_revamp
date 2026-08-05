"use client";

import React, { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { fetchRecordsFromDB } from "@/services/api";
import { 
  FaEye, 
  FaDownload, 
  FaHistory, 
  FaSearch, 
  FaFilter, 
  FaCalendarAlt,
  FaBan,
  FaLock,
  FaCheckCircle,
  FaShieldAlt,
  FaUndoAlt,
  FaInfoCircle,
  FaExclamationTriangle
} from "react-icons/fa";
import MarksheetTemplate from "./MarksheetTemplate";
import CertificateTemplate from "./CertificateTemplate";
import TranscriptTemplate from "./TranscriptTemplate";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { toast } from "react-hot-toast";

interface HistorySectionProps {
  type: "marksheet" | "certificate" | "transcript";
  refreshTrigger?: number;
}

export default function HistorySection({ type, refreshTrigger }: HistorySectionProps) {
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "anchored" | "pending">("all");
  const [yearFilter, setYearFilter] = useState("all");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isUpdating, setIsUpdating] = useState(false);
  const [previewData, setPreviewData] = useState<any | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  
  const [confirmModal, setConfirmModal] = useState<{
    show: boolean;
    status: string;
    ids: string[];
  }>({ show: false, status: "", ids: [] });

  const loadHistory = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchRecordsFromDB(type);
      setRecords(data);
    } catch (err) {
      console.error("Failed to load history:", err);
      toast.error("Database connection failed. Please refresh.");
    } finally {
      setLoading(false);
    }
  }, [type]);

  useEffect(() => {
    loadHistory();
  }, [loadHistory, refreshTrigger]);

  const handleStatusUpdate = (status: string, ids: string[] = selectedIds) => {
    setConfirmModal({ show: true, status, ids });
  };

  const executeStatusUpdate = async () => {
    const { status, ids } = confirmModal;
    setConfirmModal({ ...confirmModal, show: false });
    
    setIsUpdating(true);
    
    const promise = fetch("/api/records/status", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids, status })
    }).then(async (res) => {
      if (!res.ok) throw new Error("API failed");
      await loadHistory();
      setSelectedIds([]);
      return res.json();
    });

    toast.promise(promise, {
      loading: `Broadcasting ${status} update...`,
      success: `Successfully updated ${ids.length} records.`,
      error: "Transaction failed. Check network status.",
    });

    try {
      await promise;
    } catch (err) {
      console.error("Update failed:", err);
    } finally {
      setIsUpdating(false);
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const toggleAll = () => {
    if (selectedIds.length === filteredRecords.length && filteredRecords.length > 0) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredRecords.map(r => r.id));
    }
  };

  const availableYears = useMemo(() => {
    const years = new Set<string>();
    records.forEach(r => {
      if (r.data?.academicYear || r.data?.year) {
         years.add(r.data.academicYear || r.data.year);
      }
    });
    return Array.from(years).sort().reverse();
  }, [records]);

  const filteredRecords = useMemo(() => {
    return records.filter((r) => {
      const matchesSearch = 
        r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.registrationNo.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = 
        statusFilter === "all" || 
        (statusFilter === "anchored" ? r.anchorId : !r.anchorId);

      const recordYear = r.data?.academicYear || r.data?.year || "";
      const matchesYear = yearFilter === "all" || recordYear === yearFilter;

      return matchesSearch && matchesStatus && matchesYear;
    });
  }, [records, searchTerm, statusFilter, yearFilter]);

  const handleDownload = async (record: any) => {
    setIsExporting(true);
    setPreviewData(record);
    
    const downloadPromise = new Promise(async (resolve, reject) => {
      setTimeout(async () => {
        try {
          const element = document.getElementById("hidden-preview-container");
          if (element) {
            const canvas = await html2canvas(element, {
              scale: 1.5,
              useCORS: true,
              logging: false,
              backgroundColor: "#ffffff"
            });
            const imgData = canvas.toDataURL("image/jpeg", 0.8);
            const pdf = new jsPDF({
              orientation: "portrait",
              unit: "px",
              format: [canvas.width, canvas.height],
            });
            pdf.addImage(imgData, "JPEG", 0, 0, canvas.width, canvas.height, undefined, 'FAST');
            pdf.save(`${record.registrationNo || 'record'}_${type}.pdf`);
            resolve(true);
          } else reject("Template not found");
        } catch (e) { reject(e); }
        finally {
          setIsExporting(false);
          setPreviewData(null);
        }
      }, 800);
    });

    toast.promise(downloadPromise, {
      loading: "Generating PDF...",
      success: "Download started!",
      error: "PDF generation failed.",
    });
  };

  return (
    <div className="history-section animate-slide-up" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      <div style={{ 
        display: 'flex', flexWrap: 'wrap', gap: 16, alignItems: 'center', 
        background: '#FFFFFF', padding: '20px 24px', borderRadius: '12px',
        border: '1px solid #E5E7EB', boxShadow: '0 1px 2px rgba(0, 0, 0, 0.04)'
      }}>
        <div style={{ position: 'relative', flex: '1 1 280px' }}>
          <FaSearch style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF', fontSize: 14 }} />
          <input 
            type="text"
            placeholder={`Search ${type}s by name or ID...`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ width: '100%', padding: '10px 16px 10px 42px', border: '1px solid #E5E7EB', borderRadius: '8px', fontSize: 14, outline: 'none', transition: 'border-color 0.2s', boxShadow: '0 1px 2px rgba(0, 0, 0, 0.02)' }}
            onFocus={(e) => e.target.style.borderColor = '#3B82F6'}
            onBlur={(e) => e.target.style.borderColor = '#E5E7EB'}
          />
        </div>
        
        <div style={{ display: 'flex', gap: 12, flex: '1 1 auto' }}>
          <div style={{ position: 'relative', flex: '1 1 140px' }}>
            <FaFilter style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF', fontSize: 12 }} />
            <select 
              value={statusFilter}
              onChange={(e: any) => setStatusFilter(e.target.value)}
              style={{ width: '100%', padding: '10px 14px 10px 36px', border: '1px solid #E5E7EB', borderRadius: '8px', fontSize: 13, fontWeight: 500, appearance: 'none', cursor: 'pointer', background: '#FFFFFF', boxShadow: '0 1px 2px rgba(0, 0, 0, 0.02)' }}
            >
              <option value="all">Any Status</option>
              <option value="anchored">Anchored</option>
              <option value="pending">Pending</option>
            </select>
          </div>
          <div style={{ position: 'relative', flex: '1 1 140px' }}>
            <FaCalendarAlt style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF', fontSize: 12 }} />
            <select 
              value={yearFilter}
              onChange={(e) => setYearFilter(e.target.value)}
              style={{ width: '100%', padding: '10px 14px 10px 36px', border: '1px solid #E5E7EB', borderRadius: '8px', fontSize: 13, fontWeight: 500, appearance: 'none', cursor: 'pointer', background: '#FFFFFF', boxShadow: '0 1px 2px rgba(0, 0, 0, 0.02)' }}
            >
              <option value="all">All Sessions</option>
              {availableYears.map(y => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>
          <button onClick={loadHistory} style={{ 
            display: 'flex', gap: 8, alignItems: 'center', justifyContent: 'center', 
            padding: '10px 20px', borderRadius: '8px', fontSize: 13, fontWeight: 600, 
            background: '#FFFFFF', border: '1px solid #E5E7EB', color: '#374151', cursor: 'pointer',
            boxShadow: '0 1px 2px rgba(0, 0, 0, 0.02)', transition: 'all 0.2s'
          }}
          onMouseOver={(e) => (e.currentTarget.style.background = '#F9FAFB')}
          onMouseOut={(e) => (e.currentTarget.style.background = '#FFFFFF')}
          >
            REFRESH
          </button>
        </div>

        {(searchTerm || statusFilter !== 'all' || yearFilter !== 'all') && (
          <div style={{ width: '100%', display: 'flex', gap: 8, alignItems: 'center', paddingTop: 8 }}>
            <span style={{ fontSize: 11, fontWeight: 600, color: '#6B7280' }}>ACTIVE FILTERS:</span>
            {searchTerm && <span onClick={() => setSearchTerm('')} style={{ cursor: 'pointer', background: '#F3F4F6', color: '#374151', padding: '4px 10px', borderRadius: 16, fontSize: 12, fontWeight: 500, display: 'flex', alignItems: 'center', gap: 6 }}>Search: {searchTerm} <span style={{ color: '#9CA3AF' }}>&times;</span></span>}
            {statusFilter !== 'all' && <span onClick={() => setStatusFilter('all')} style={{ cursor: 'pointer', background: '#F3F4F6', color: '#374151', padding: '4px 10px', borderRadius: 16, fontSize: 12, fontWeight: 500, display: 'flex', alignItems: 'center', gap: 6 }}>Status: {statusFilter} <span style={{ color: '#9CA3AF' }}>&times;</span></span>}
            {yearFilter !== 'all' && <span onClick={() => setYearFilter('all')} style={{ cursor: 'pointer', background: '#F3F4F6', color: '#374151', padding: '4px 10px', borderRadius: 16, fontSize: 12, fontWeight: 500, display: 'flex', alignItems: 'center', gap: 6 }}>Year: {yearFilter} <span style={{ color: '#9CA3AF' }}>&times;</span></span>}
          </div>
        )}
      </div>

      {selectedIds.length > 0 && (
        <div className="animate-slide-up" style={{ 
          position: 'fixed', bottom: 40, left: '50%', transform: 'translateX(-50%)', 
          zIndex: 1000, background: '#111827', color: '#FFFFFF', padding: '12px 24px',
          display: 'flex', gap: 24, alignItems: 'center', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)', 
          borderRadius: 16, border: '1px solid #374151'
        }}>
          <span style={{ fontSize: 14, fontWeight: 600 }}>{selectedIds.length} Selected</span>
          <div style={{ height: 20, width: 1, background: '#374151' }}></div>
          <div style={{ display: 'flex', gap: 12 }}>
            <button onClick={() => handleStatusUpdate('ACTIVE')} disabled={isUpdating} style={{ background: '#D3FFE9', border: 'none', color: '#007B3E', display: 'flex', gap: 8, alignItems: 'center', fontSize: 13, fontWeight: 500, padding: '8px 16px', borderRadius: 8, cursor: 'pointer' }}>
              <FaCheckCircle /> Activate
            </button>
            <button onClick={() => handleStatusUpdate('FROZEN')} disabled={isUpdating} style={{ background: '#FB8C00', border: 'none', color: 'white', display: 'flex', gap: 8, alignItems: 'center', fontSize: 13, fontWeight: 500, padding: '8px 16px', borderRadius: 8, cursor: 'pointer' }}>
              <FaLock /> Freeze
            </button>
            <button onClick={() => handleStatusUpdate('REVOKED')} disabled={isUpdating} style={{ background: '#E53935', border: 'none', color: 'white', display: 'flex', gap: 8, alignItems: 'center', fontSize: 13, fontWeight: 500, padding: '8px 16px', borderRadius: 8, cursor: 'pointer' }}>
              <FaBan /> Revoke
            </button>
          </div>
          <button onClick={() => setSelectedIds([])} style={{ fontSize: 20, background: 'none', border: 'none', color: '#9CA3AF', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center' }}>&times;</button>
        </div>
      )}

      <div className="table-container">
        <table className="premium-table">
          <thead>
            <tr>
              <th style={{ width: 40, paddingRight: 0 }}>
                <input type="checkbox" checked={selectedIds.length > 0 && selectedIds.length === filteredRecords.length && filteredRecords.length > 0} onChange={toggleAll} style={{ width: 16, height: 16, cursor: 'pointer', accentColor: '#000000' }} />
              </th>
              <th>Registration ID</th>
              <th>Student Details</th>
              <th>Data</th>
              <th>Security Status</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', padding: '60px 0' }}>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: 12, fontSize: 14, fontWeight: 500, color: '#6B7280' }}>
                    <div style={{ width: 16, height: 16, borderRadius: '50%', border: '2px solid #E5E7EB', borderTopColor: '#3B82F6', animation: 'spin 0.8s linear infinite' }} />
                    Loading records...
                  </div>
                </td>
              </tr>
            ) : filteredRecords.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', padding: '60px 0', color: '#6B7280', fontSize: 14 }}>
                  No matching institutional records found.
                </td>
              </tr>
            ) : (
              filteredRecords.map((record) => (
                <tr key={record.id} style={{ opacity: record.status === 'REVOKED' ? 0.5 : 1 }}>
                  <td style={{ paddingRight: 0 }}>
                    <input type="checkbox" checked={selectedIds.includes(record.id)} onChange={() => toggleSelect(record.id)} style={{ width: 16, height: 16, cursor: 'pointer', accentColor: '#000000' }} />
                  </td>
                  <td style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 13, color: '#111827', fontWeight: 500 }}>
                    {record.registrationNo}
                  </td>
                  <td>
                    <div style={{ fontWeight: 600, color: '#111827', marginBottom: 4 }}>{record.name}</div>
                    <div style={{ fontSize: 12, color: '#6B7280' }}>{type.charAt(0).toUpperCase() + type.slice(1)}</div>
                  </td>
                  <td>
                    <div style={{ fontWeight: 500, color: '#111827', marginBottom: 4 }}>{record.gpa ? `GPA/CGPA: ${record.gpa}` : 'N/A'}</div>
                    <div style={{ fontSize: 12, color: '#6B7280' }}>{new Date(record.createdAt).toLocaleDateString()}</div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, alignItems: 'flex-start' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: record.anchorId ? '#ECFDF5' : '#F3F4F6', padding: '4px 8px', borderRadius: '12px' }}>
                        <div style={{ width: 6, height: 6, borderRadius: '50%', background: record.anchorId ? '#D3FFE9' : '#9CA3AF' }}></div>
                        <span style={{ fontSize: 11, fontWeight: 600, color: record.anchorId ? '#065F46' : '#4B5563' }}>
                          {record.anchorId ? 'ANCHORED' : 'PENDING'}
                        </span>
                      </div>
                      <div style={{ 
                        fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: '4px', letterSpacing: '0.05em',
                        background: record.status === 'ACTIVE' ? '#EFF6FF' : record.status === 'FROZEN' ? '#FFFBEB' : '#FEF2F2',
                        color: record.status === 'ACTIVE' ? '#007B3E' : record.status === 'FROZEN' ? '#FB8C00' : '#E53935'
                      }}>
                        {record.status}
                      </div>
                    </div>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                      <div style={{ display: 'flex', background: '#F9FAFB', border: '1px solid #E5E7EB', borderRadius: 8, overflow: 'hidden' }}>
                        {record.status === 'ACTIVE' ? (
                          <button onClick={() => handleStatusUpdate('FROZEN', [record.id])} style={{ padding: '8px 10px', background: 'transparent', border: 'none', color: '#6B7280', cursor: 'pointer', transition: 'background 0.2s' }} onMouseOver={e=>e.currentTarget.style.background='#F3F4F6'} onMouseOut={e=>e.currentTarget.style.background='transparent'} title="Freeze Record"><FaLock size={12} /></button>
                        ) : (
                          <button onClick={() => handleStatusUpdate('ACTIVE', [record.id])} style={{ padding: '8px 10px', background: 'transparent', border: 'none', color: '#6B7280', cursor: 'pointer', transition: 'background 0.2s' }} onMouseOver={e=>e.currentTarget.style.background='#F3F4F6'} onMouseOut={e=>e.currentTarget.style.background='transparent'} title="Reactivate"><FaUndoAlt size={12} /></button>
                        )}
                        <div style={{ width: 1, background: '#E5E7EB' }}></div>
                        <button onClick={() => handleStatusUpdate('REVOKED', [record.id])} style={{ padding: '8px 10px', background: 'transparent', border: 'none', color: '#E53935', cursor: 'pointer', transition: 'background 0.2s' }} onMouseOver={e=>e.currentTarget.style.background='#FEF2F2'} onMouseOut={e=>e.currentTarget.style.background='transparent'} title="Revoke"><FaBan size={12} /></button>
                      </div>
                      
                      <button 
                        onClick={() => setPreviewData(record.data)}
                        style={{ padding: '8px 14px', fontSize: 12, fontWeight: 500, background: '#FFFFFF', border: '1px solid #E5E7EB', color: '#374151', borderRadius: 8, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, transition: 'background 0.2s' }}
                        onMouseOver={e=>e.currentTarget.style.background='#F9FAFB'} onMouseOut={e=>e.currentTarget.style.background='#FFFFFF'}
                      >
                        <FaEye size={12} /> Preview
                      </button>
                      <button 
                        onClick={() => handleDownload(record.data)}
                        style={{ padding: '8px 14px', fontSize: 12, fontWeight: 500, background: '#111827', border: '1px solid #111827', color: '#FFFFFF', borderRadius: 8, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, transition: 'opacity 0.2s' }}
                        onMouseOver={e=>e.currentTarget.style.opacity='0.9'} onMouseOut={e=>e.currentTarget.style.opacity='1'}
                      >
                        <FaDownload size={12} /> PDF
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {confirmModal.show && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div className="glass-card animate-slide-up" style={{ width: '100%', maxWidth: '380px', padding: '28px', textAlign: 'center' }}>
            <div style={{ 
              width: 56, height: 56, borderRadius: '50%', margin: '0 auto 16px', 
              background: confirmModal.status === 'REVOKED' ? 'rgba(192,57,43,0.06)' : confirmModal.status === 'FROZEN' ? 'rgba(184,134,11,0.06)' : 'rgba(45,106,79,0.06)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', 
              fontSize: 20, color: confirmModal.status === 'REVOKED' ? '#C0392B' : confirmModal.status === 'FROZEN' ? '#B8860B' : '#2D6A4F'
            }}>
              {confirmModal.status === 'REVOKED' ? <FaBan /> : confirmModal.status === 'FROZEN' ? <FaLock /> : <FaCheckCircle />}
            </div>
            <h3 style={{ margin: '0 0 8px', fontSize: 17, fontWeight: 700, color: '#222831' }}>Are you sure?</h3>
            <p style={{ margin: '0 0 20px', fontSize: 13, color: '#929AAB', lineHeight: 1.6 }}>
              You are about to set {confirmModal.ids.length} record(s) to <b style={{ color: '#222831' }}>{confirmModal.status}</b>. 
              {confirmModal.status === 'REVOKED' && " This action will be broadcasted to the blockchain and is permanent."}
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <button onClick={() => setConfirmModal({ ...confirmModal, show: false })} className="btn-premium btn-outline">CANCEL</button>
              <button 
                onClick={executeStatusUpdate} 
                className="btn-premium" 
                style={{ background: confirmModal.status === 'REVOKED' ? '#C0392B' : confirmModal.status === 'FROZEN' ? '#B8860B' : '#2D6A4F', color: 'white' }}
              >
                CONFIRM
              </button>
            </div>
          </div>
        </div>
      )}

      {previewData && !isExporting && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 9000, background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '32px' }}>
          <div style={{ width: '95%', maxWidth: '900px', maxHeight: '90vh', overflow: 'hidden', display: 'flex', flexDirection: 'column', background: '#FFFFFF', borderRadius: 12, border: '1px solid rgba(57,62,70,0.08)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 20px', borderBottom: '1px solid rgba(57,62,70,0.06)' }}>
              <h3 style={{ margin: 0, fontSize: 14, fontWeight: 700 }}>Institutional Preview</h3>
              <button onClick={() => setPreviewData(null)} style={{ background: 'var(--canvas)', border: '1px solid var(--border)', borderRadius: 8, width: 30, height: 30, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>&times;</button>
            </div>
            <div style={{ flex: 1, overflowY: 'auto' }}>
              {type === "marksheet" && <MarksheetTemplate data={previewData} />}
              {type === "certificate" && <CertificateTemplate data={previewData} />}
              {type === "transcript" && <TranscriptTemplate data={previewData} />}
            </div>
          </div>
        </div>
      )}

      <div style={{ position: 'absolute', left: '-9999px', top: '-9999px' }}>
        <div id="hidden-preview-container" style={{ width: '840px', background: 'white' }}>
          {previewData && isExporting && (
            <>
              {type === "marksheet" && <MarksheetTemplate data={previewData} />}
              {type === "certificate" && <CertificateTemplate data={previewData} />}
              {type === "transcript" && <TranscriptTemplate data={previewData} />}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
