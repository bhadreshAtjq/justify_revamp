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
    <div className="history-section animate-slide-up">
      <div className="glass-card" style={{ padding: '16px', marginBottom: 0, borderRadius: '12px 12px 0 0' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center' }}>
          <div style={{ position: 'relative', flex: '1 1 280px' }}>
            <FaSearch style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#929AAB', fontSize: 12 }} />
            <input 
              type="text"
              placeholder={`Search ${type}s...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="inner-card"
              style={{ width: '100%', padding: '12px 14px 12px 40px', border: 'none', fontSize: 13 }}
            />
          </div>
          <div style={{ position: 'relative', flex: '1 1 160px' }}>
            <FaFilter style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#929AAB', fontSize: 10 }} />
            <select 
              value={statusFilter}
              onChange={(e: any) => setStatusFilter(e.target.value)}
              className="inner-card"
              style={{ width: '100%', padding: '12px 14px 12px 36px', border: 'none', fontSize: 12, fontWeight: 600, appearance: 'none', cursor: 'pointer' }}
            >
              <option value="all">Any Status</option>
              <option value="anchored">Anchored</option>
              <option value="pending">Pending</option>
            </select>
          </div>
          <div style={{ position: 'relative', flex: '1 1 160px' }}>
            <FaCalendarAlt style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#929AAB', fontSize: 10 }} />
            <select 
              value={yearFilter}
              onChange={(e) => setYearFilter(e.target.value)}
              className="inner-card"
              style={{ width: '100%', padding: '12px 14px 12px 36px', border: 'none', fontSize: 12, fontWeight: 600, appearance: 'none', cursor: 'pointer' }}
            >
              <option value="all">All Sessions</option>
              {availableYears.map(y => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>
          <button onClick={loadHistory} className="btn-premium btn-outline" style={{ display: 'flex', gap: 8, justifyContent: 'center', padding: '12px', fontSize: 11, fontWeight: 700, flex: '1 1 100px' }}>
             REFRESH
          </button>
        </div>
        {searchTerm || statusFilter !== 'all' || yearFilter !== 'all' ? (
          <div style={{ marginTop: 12, display: 'flex', gap: 6, alignItems: 'center' }}>
            <span style={{ fontSize: 10, fontWeight: 700, color: '#929AAB' }}>ACTIVE FILTERS</span>
            {searchTerm && <span onClick={() => setSearchTerm('')} style={{ cursor: 'pointer', background: '#393E46', color: '#F7F7F7', padding: '3px 10px', borderRadius: 16, fontSize: 10, fontWeight: 600 }}>Search: {searchTerm} x</span>}
            {statusFilter !== 'all' && <span onClick={() => setStatusFilter('all')} style={{ cursor: 'pointer', background: '#393E46', color: '#F7F7F7', padding: '3px 10px', borderRadius: 16, fontSize: 10, fontWeight: 600 }}>Status: {statusFilter} x</span>}
            {yearFilter !== 'all' && <span onClick={() => setYearFilter('all')} style={{ cursor: 'pointer', background: '#393E46', color: '#F7F7F7', padding: '3px 10px', borderRadius: 16, fontSize: 10, fontWeight: 600 }}>Year: {yearFilter} x</span>}
          </div>
        ) : null}
      </div>

      {selectedIds.length > 0 && (
        <div className="glass-card animate-slide-up" style={{ 
          position: 'fixed', bottom: 32, left: '50%', transform: 'translateX(-50%)', 
          zIndex: 1000, background: '#393E46', color: '#F7F7F7', padding: '14px 28px',
          display: 'flex', gap: 20, alignItems: 'center', boxShadow: '0 12px 32px rgba(0,0,0,0.2)', border: 'none',
          borderRadius: 12,
        }}>
          <span style={{ fontSize: 12, fontWeight: 700 }}>{selectedIds.length} SELECTED</span>
          <div style={{ height: 16, width: 1, background: 'rgba(255,255,255,0.15)' }}></div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={() => handleStatusUpdate('ACTIVE')} disabled={isUpdating} className="btn-premium" style={{ background: 'rgba(255,255,255,0.1)', color: 'white', display: 'flex', gap: 6, alignItems: 'center', fontSize: 11 }}>
              <FaCheckCircle /> ACTIVATE
            </button>
            <button onClick={() => handleStatusUpdate('FROZEN')} disabled={isUpdating} className="btn-premium" style={{ background: '#B8860B', color: '#fff', display: 'flex', gap: 6, alignItems: 'center', fontSize: 11 }}>
              <FaLock /> FREEZE
            </button>
            <button onClick={() => handleStatusUpdate('REVOKED')} disabled={isUpdating} className="btn-premium" style={{ background: '#C0392B', color: 'white', display: 'flex', gap: 6, alignItems: 'center', fontSize: 11 }}>
              <FaBan /> REVOKE
            </button>
          </div>
          <button onClick={() => setSelectedIds([])} style={{ fontSize: 18, background: 'none', border: 'none', color: 'rgba(255,255,255,0.5)', cursor: 'pointer', marginLeft: 12 }}>&times;</button>
        </div>
      )}

      <div className="glass-card" style={{ padding: 0, overflow: 'hidden', borderTop: 'none', borderRadius: '0 0 12px 12px', marginTop: -1 }}>
        <div className="table-container" style={{ maxHeight: '600px', overflowY: 'auto' }}>
          <table className="premium-table" style={{ width: '100%', tableLayout: 'auto' }}>
            <thead>
              <tr>
                <th style={{ width: 40 }}>
                  <input type="checkbox" checked={selectedIds.length > 0 && selectedIds.length === filteredRecords.length && filteredRecords.length > 0} onChange={toggleAll} style={{ accentColor: '#393E46' }} />
                </th>
                <th>Registration</th>
                <th>Subject / Name</th>
                <th>Metadata</th>
                <th>Access Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '80px 0' }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: '#929AAB', letterSpacing: '0.1em' }}>SYNCHRONIZING DATABASE...</div>
                  </td>
                </tr>
              ) : filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '80px 0', color: '#929AAB' }}>
                    No matching institutional records found.
                  </td>
                </tr>
              ) : (
                filteredRecords.map((record) => (
                  <tr key={record.id} style={{ opacity: record.status === 'REVOKED' ? 0.4 : 1, transition: 'opacity 0.18s' }}>
                    <td>
                      <input type="checkbox" checked={selectedIds.includes(record.id)} onChange={() => toggleSelect(record.id)} style={{ accentColor: '#393E46' }} />
                    </td>
                    <td style={{ fontWeight: 700, fontFamily: "'JetBrains Mono', monospace", fontSize: 12 }}>{record.registrationNo}</td>
                    <td>
                      <div style={{ fontWeight: 600, color: '#222831' }}>{record.name}</div>
                      <div style={{ fontSize: 9, fontWeight: 700, color: '#929AAB' }}>{record.status}</div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 700, color: '#393E46' }}>{record.gpa}</div>
                      <div style={{ fontSize: 10, color: '#929AAB' }}>{new Date(record.createdAt).toLocaleDateString()}</div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <div style={{ width: 5, height: 5, borderRadius: '50%', background: record.anchorId ? '#2D6A4F' : '#EEEEEE' }}></div>
                          <span style={{ fontSize: 10, fontWeight: 700, color: '#929AAB' }}>{record.anchorId ? 'ON-CHAIN' : 'OFF-CHAIN'}</span>
                        </div>
                        <div style={{ 
                          fontSize: 8, 
                          fontWeight: 700, 
                          padding: '2px 8px', 
                          borderRadius: 4, 
                          letterSpacing: '0.5px',
                          alignSelf: 'start',
                          background: record.status === 'ACTIVE' ? 'rgba(45,106,79,0.06)' : record.status === 'FROZEN' ? 'rgba(184,134,11,0.06)' : 'rgba(192,57,43,0.06)',
                          color: record.status === 'ACTIVE' ? '#2D6A4F' : record.status === 'FROZEN' ? '#B8860B' : '#C0392B'
                        }}>
                          {record.status}
                        </div>
                      </div>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                         {record.status === 'ACTIVE' ? (
                           <button onClick={() => handleStatusUpdate('FROZEN', [record.id])} className="btn-premium" style={{ padding: '6px 8px', fontSize: 11, background: 'var(--canvas)', border: '1px solid var(--border)' }} title="Freeze Record"><FaLock /></button>
                         ) : (
                           <button onClick={() => handleStatusUpdate('ACTIVE', [record.id])} className="btn-premium" style={{ padding: '6px 8px', fontSize: 11, background: 'var(--canvas)', border: '1px solid var(--border)' }} title="Reactivate"><FaUndoAlt /></button>
                         )}
                         <button onClick={() => handleStatusUpdate('REVOKED', [record.id])} className="btn-premium" style={{ padding: '6px 8px', fontSize: 11, background: 'rgba(192,57,43,0.04)', color: '#C0392B', border: '1px solid rgba(192,57,43,0.08)' }} title="Revoke"><FaBan /></button>
                        
                        <button 
                          onClick={() => setPreviewData(record.data)}
                          className="btn-premium" 
                          style={{ padding: '6px 14px', fontSize: 10, fontWeight: 700, background: 'var(--canvas)', border: '1px solid var(--border)' }}
                        >
                          <FaEye /> PREVIEW
                        </button>
                        <button 
                          onClick={() => handleDownload(record.data)}
                          className="btn-premium" 
                          style={{ padding: '6px 14px', fontSize: 10, fontWeight: 700, background: '#393E46', color: '#F7F7F7' }}
                        >
                          <FaDownload /> PDF
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
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
