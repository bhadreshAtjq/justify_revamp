"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
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

  useEffect(() => {
    loadHistory();
  }, [type, refreshTrigger]);

  const loadHistory = async () => {
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
  };

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
      loading: `Broadcasting ${status} update to network...`,
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
      loading: "Generating high-fidelity PDF...",
      success: "Download started!",
      error: "PDF generation failed.",
    });
  };

  return (
    <div className="history-section animate-slide-up">
      <div className="glass-card" style={{ padding: '20px', marginBottom: 24, borderRadius: 'var(--radius-md) var(--radius-md) 0 0' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 1.5fr) 180px 180px 140px', gap: 16, alignItems: 'center' }}>
          <div style={{ position: 'relative' }}>
            <FaSearch style={{ position: 'absolute', left: 20, top: '50%', transform: 'translateY(-50%)', opacity: 0.2 }} />
            <input 
              type="text"
              placeholder={`Quick search ${type}s...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="inner-card"
              style={{ width: '100%', padding: '14px 16px 14px 52px', border: 'none', fontSize: 13, background: '#f8fafc' }}
            />
          </div>
          <div style={{ position: 'relative' }}>
            <FaFilter style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', opacity: 0.2, fontSize: 12 }} />
            <select 
              value={statusFilter}
              onChange={(e: any) => setStatusFilter(e.target.value)}
              className="inner-card"
              style={{ width: '100%', padding: '14px 16px 14px 40px', border: 'none', fontSize: 12, fontWeight: 700, appearance: 'none' }}
            >
              <option value="all">Any Status</option>
              <option value="anchored">Anchored</option>
              <option value="pending">Pending</option>
            </select>
          </div>
          <div style={{ position: 'relative' }}>
            <FaCalendarAlt style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', opacity: 0.2, fontSize: 12 }} />
            <select 
              value={yearFilter}
              onChange={(e) => setYearFilter(e.target.value)}
              className="inner-card"
              style={{ width: '100%', padding: '14px 16px 14px 40px', border: 'none', fontSize: 12, fontWeight: 700, appearance: 'none' }}
            >
              <option value="all">All Sessions</option>
              {availableYears.map(y => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>
          <button onClick={loadHistory} className="btn-premium btn-outline" style={{ display: 'flex', gap: 10, justifyContent: 'center', padding: '14px' }}>
             <span style={{ fontSize: 12, fontWeight: 800 }}>REFRESH</span>
          </button>
        </div>
        {searchTerm || statusFilter !== 'all' || yearFilter !== 'all' ? (
          <div style={{ marginTop: 16, display: 'flex', gap: 8, alignItems: 'center' }}>
            <span style={{ fontSize: 11, fontWeight: 800, opacity: 0.4 }}>ACTIVE FILTERS</span>
            {searchTerm && <span onClick={() => setSearchTerm('')} style={{ cursor: 'pointer', background: 'var(--accent)', color: 'white', padding: '4px 10px', borderRadius: 20, fontSize: 10, fontWeight: 700 }}>Search: {searchTerm} ×</span>}
            {statusFilter !== 'all' && <span onClick={() => setStatusFilter('all')} style={{ cursor: 'pointer', background: 'var(--accent)', color: 'white', padding: '4px 10px', borderRadius: 20, fontSize: 10, fontWeight: 700 }}>Status: {statusFilter} ×</span>}
            {yearFilter !== 'all' && <span onClick={() => setYearFilter('all')} style={{ cursor: 'pointer', background: 'var(--accent)', color: 'white', padding: '4px 10px', borderRadius: 20, fontSize: 10, fontWeight: 700 }}>Year: {yearFilter} ×</span>}
          </div>
        ) : null}
      </div>

      {selectedIds.length > 0 && (
        <div className="glass-card animate-slide-up" style={{ 
          position: 'fixed', bottom: 40, left: '50%', transform: 'translateX(-50%)', 
          zIndex: 1000, background: 'var(--primary)', color: 'white', padding: '16px 32px',
          display: 'flex', gap: 24, alignItems: 'center', boxShadow: '0 20px 40px rgba(0,0,0,0.2)'
        }}>
          <FaShieldAlt style={{ opacity: 0.5 }} />
          <span style={{ fontSize: 13, fontWeight: 800 }}>{selectedIds.length} RECORDS SELECTED</span>
          <div style={{ height: 20, width: 1, background: 'rgba(255,255,255,0.2)' }}></div>
          <div style={{ display: 'flex', gap: 12 }}>
            <button onClick={() => handleStatusUpdate('ACTIVE')} disabled={isUpdating} className="btn-premium" style={{ background: 'rgba(255,255,255,0.1)', color: 'white', display: 'flex', gap: 8, alignItems: 'center' }}>
              <FaCheckCircle /> ACTIVATE
            </button>
            <button onClick={() => handleStatusUpdate('FROZEN')} disabled={isUpdating} className="btn-premium" style={{ background: '#FFD93D', color: '#000', display: 'flex', gap: 8, alignItems: 'center' }}>
              <FaLock /> FREEZE
            </button>
            <button onClick={() => handleStatusUpdate('REVOKED')} disabled={isUpdating} className="btn-premium" style={{ background: '#FF6B6B', color: 'white', display: 'flex', gap: 8, alignItems: 'center' }}>
              <FaBan /> REVOKE
            </button>
          </div>
          <button onClick={() => setSelectedIds([])} style={{ fontSize: 20, background: 'none', border: 'none', color: 'white', cursor: 'pointer', marginLeft: 20 }}>&times;</button>
        </div>
      )}

      <div className="glass-card" style={{ padding: 0, overflow: 'hidden', borderTop: 'none' }}>
        <div className="table-container" style={{ maxHeight: 'calc(100vh - 400px)', overflowY: 'auto' }}>
          <table className="premium-table">
            <thead>
              <tr>
                <th style={{ width: 40 }}>
                  <input type="checkbox" checked={selectedIds.length > 0 && selectedIds.length === filteredRecords.length && filteredRecords.length > 0} onChange={toggleAll} />
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
                  <td colSpan={6} style={{ textAlign: 'center', padding: '100px 0' }}>
                    <div className="animate-pulse" style={{ fontSize: 13, fontWeight: 800, opacity: 0.3, letterSpacing: '0.1em' }}>SYNCHRONIZING DATABASE...</div>
                  </td>
                </tr>
              ) : filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '100px 0', opacity: 0.3 }}>
                    No matching institutional records found.
                  </td>
                </tr>
              ) : (
                filteredRecords.map((record) => (
                  <tr key={record.id} className={`hover:bg-slate-50 transition-colors ${record.status === 'REVOKED' ? 'opacity-50 grayscale' : ''}`}>
                    <td>
                      <input type="checkbox" checked={selectedIds.includes(record.id)} onChange={() => toggleSelect(record.id)} />
                    </td>
                    <td style={{ fontWeight: 800, fontFamily: 'var(--font-mono)', fontSize: 12 }}>{record.registrationNo}</td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{record.name}</div>
                      <div style={{ fontSize: 9, fontWeight: 800, opacity: 0.3 }}>{record.status}</div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 800, color: 'var(--primary)' }}>{record.gpa}</div>
                      <div style={{ fontSize: 10, opacity: 0.5 }}>{new Date(record.createdAt).toLocaleDateString()}</div>
                    </td>
                    <td>
                      <div className="flex flex-col gap-1">
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <div style={{ width: 6, height: 6, borderRadius: '50%', background: record.anchorId ? '#609966' : '#ccc' }}></div>
                          <span style={{ fontSize: 10, fontWeight: 800, opacity: 0.6 }}>{record.anchorId ? 'ON-CHAIN' : 'OFF-CHAIN'}</span>
                        </div>
                        <div style={{ 
                          fontSize: 8, 
                          fontWeight: 900, 
                          padding: '3px 8px', 
                          borderRadius: 6, 
                          letterSpacing: '0.05em',
                          alignSelf: 'start',
                          background: record.status === 'ACTIVE' ? 'rgba(96,153,102,0.1)' : record.status === 'FROZEN' ? 'rgba(255,217,61,0.1)' : 'rgba(255,107,107,0.1)',
                          color: record.status === 'ACTIVE' ? '#609966' : record.status === 'FROZEN' ? '#B8860B' : '#FF6B6B'
                        }}>
                          {record.status}
                        </div>
                      </div>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                         {record.status === 'ACTIVE' ? (
                           <button onClick={() => handleStatusUpdate('FROZEN', [record.id])} className="btn-premium" style={{ padding: '8px', fontSize: 12, background: '#f1f5f9' }} title="Freeze Record"><FaLock /></button>
                         ) : (
                           <button onClick={() => handleStatusUpdate('ACTIVE', [record.id])} className="btn-premium" style={{ padding: '8px', fontSize: 12, background: '#f1f5f9' }} title="Reactivate"><FaUndoAlt /></button>
                         )}
                         <button onClick={() => handleStatusUpdate('REVOKED', [record.id])} className="btn-premium" style={{ padding: '8px', fontSize: 12, background: '#fef2f2', color: '#ef4444' }} title="Revoke Forever"><FaBan /></button>
                        
                        <button 
                          onClick={() => setPreviewData(record.data)}
                          className="btn-premium" 
                          style={{ padding: '8px 16px', fontSize: 11, fontWeight: 800, background: 'var(--surface)' }}
                        >
                          <FaEye /> PREVIEW
                        </button>
                        <button 
                          onClick={() => handleDownload(record.data)}
                          className="btn-premium" 
                          style={{ padding: '8px 16px', fontSize: 11, fontWeight: 800, background: 'var(--accent)', color: 'white' }}
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
        <div style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div className="glass-card animate-slide-up" style={{ width: '100%', maxWidth: '400px', padding: '32px', textAlign: 'center' }}>
            <div style={{ 
              width: 64, height: 64, borderRadius: '50%', margin: '0 auto 20px', 
              background: confirmModal.status === 'REVOKED' ? '#fef2f2' : confirmModal.status === 'FROZEN' ? '#fffbeb' : '#f0fdf4',
              display: 'flex', alignItems: 'center', justifyContent: 'center', 
              fontSize: 24, color: confirmModal.status === 'REVOKED' ? '#ef4444' : confirmModal.status === 'FROZEN' ? '#f59e0b' : '#22c55e'
            }}>
              {confirmModal.status === 'REVOKED' ? <FaBan /> : confirmModal.status === 'FROZEN' ? <FaLock /> : <FaCheckCircle />}
            </div>
            <h3 style={{ margin: '0 0 8px', fontSize: 18, color: 'var(--text-primary)' }}>Are you sure?</h3>
            <p style={{ margin: '0 0 24px', fontSize: 14, opacity: 0.6, lineHeight: 1.6 }}>
              You are about to set {confirmModal.ids.length} record(s) to <b>{confirmModal.status}</b>. 
              {confirmModal.status === 'REVOKED' && " This action will be broadcasted to the blockchain and is permanent."}
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <button onClick={() => setConfirmModal({ ...confirmModal, show: false })} className="btn-premium btn-outline">CANCEL</button>
              <button 
                onClick={executeStatusUpdate} 
                className="btn-premium" 
                style={{ background: confirmModal.status === 'REVOKED' ? '#ef4444' : confirmModal.status === 'FROZEN' ? '#f59e0b' : 'var(--primary)', color: 'white' }}
              >
                CONFIRM
              </button>
            </div>
          </div>
        </div>
      )}

      {previewData && !isExporting && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 9000, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px' }}>
          <div className="glass-card" style={{ width: '100%', maxWidth: '900px', maxHeight: '90vh', overflow: 'hidden', display: 'flex', flexDirection: 'column', background: 'white' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 24px', borderBottom: '1px solid #eee' }}>
              <h3 style={{ margin: 0 }}>Institutional Preview</h3>
              <button onClick={() => setPreviewData(null)} style={{ background: '#eee', border: 'none', borderRadius: '50%', width: 32, height: 32, cursor: 'pointer' }}>&times;</button>
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
