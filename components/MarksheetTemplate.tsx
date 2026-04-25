"use client";

import React, { useMemo } from "react";
import { discoverSubjects, mapStudentMetadata } from "@/lib/marksheet";
import { QRCodeSVG } from "qrcode.react";
export default function MarksheetTemplate({ data, id = "marksheet-pdf" }: { data: any, id?: string }) {
  const subjects = useMemo(() => discoverSubjects(data), [data]);
  const metadata = mapStudentMetadata(data);
  const { regNo, name, gpa, faculty, academicYear, degree, semester, major, minor, college, examination } = metadata;
  const verificationUrl = typeof window !== 'undefined' 
    ? `${window.location.origin}/verify/${data.merkle_leaf || data.keccak256_hash}`
    : `https://verification.justifai.com/verify/${data.merkle_leaf || data.keccak256_hash}`;
  const leafHash = data.merkle_leaf || data.keccak256_hash || "PENDING_ANCHOR";
  return (
    <div className="marksheet-preview-container" id={id} style={{ background: '#f0f0f0', padding: '40px 0', width: '100%', overflowX: 'auto' }}>
      <style dangerouslySetInnerHTML={{
        __html: `
        .marksheet-page {
          width: 820px;
          margin: 0 auto;
          padding: 18px 28px 28px 28px;
          position: relative;
          background: #fff;
          min-height: 1100px;
          color: #000;
          font-family: Arial, sans-serif;
          box-shadow: 0 0 20px rgba(0,0,0,0.1);
        }
        .marksheet-page .watermark {
          position: absolute;
          inset: 0;
          overflow: hidden;
          pointer-events: none;
          z-index: 0;
        }
        .marksheet-page .watermark span {
          position: absolute;
          font-size: 10.5px;
          color: rgba(0,100,0,0.08);
          white-space: nowrap;
          font-weight: bold;
          letter-spacing: 1.5px;
          transform: rotate(-20deg);
          user-select: none;
        }
        .marksheet-page .content { position: relative; z-index: 1; }
        .marksheet-page .header {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          margin-bottom: 4px;
        }
        .marksheet-page .logo-circle {
          width: 78px;
          height: 90px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .marksheet-page .header-titles { text-align: center; flex: 1; }
        .marksheet-page .header-titles .line1 { font-size: 19px; font-weight: bold; text-transform: uppercase; line-height: 1.25; }
        .marksheet-page .header-titles .line2 { font-size: 15px; font-weight: bold; text-transform: uppercase; }
        .marksheet-page .header-titles .line3 { font-size: 13.5px; font-weight: bold; text-transform: uppercase; letter-spacing: 1.5px; text-decoration: underline; margin-top: 2px; }
        
        .marksheet-page .barcode-wrap { margin: 8px 0 6px 0; display: flex; align-items: flex-end; height: 38px; }
        .marksheet-page .barcode-wrap div { background: #000; display: inline-block; margin-right: 1px; }

        .marksheet-page .info-section { border-top: 1px solid #777; padding-top: 5px; margin-bottom: 10px; }
        .marksheet-page .info-table { width: 100%; border-collapse: collapse; }
        .marksheet-page .info-table td { font-size: 12.5px; padding: 1.5px 4px; vertical-align: top; }
        .marksheet-page .info-table .lbl { font-weight: normal; width: 148px; }

        .marksheet-page .main-table { width: 100%; border-collapse: collapse; font-size: 12px; }
        .marksheet-page .main-table th, .marksheet-page .main-table td { border: 1px solid #000; padding: 4px 5px; text-align: center; }
        .marksheet-page .main-table th { font-weight: bold; }
        .marksheet-page .main-table td.left { text-align: left; }
        .marksheet-page .main-table .total-row td { font-weight: bold; }

        .marksheet-page .medium-gpa {
          display: flex;
          justify-content: space-between;
          align-items: center;
          border: 1px solid #000;
          border-top: none;
          padding: 4px 8px;
          font-size: 12.5px;
        }
        .marksheet-page .gpa-val { border: 1px solid #000; padding: 2px 14px; font-weight: bold; font-size: 13px; }

        .marksheet-page .bottom { display: flex; gap: 20px; margin-top: 14px; align-items: flex-start; }
        .marksheet-page .summary-table { border-collapse: collapse; font-size: 11.5px; width: 100%; }
        .marksheet-page .summary-table th, .marksheet-page .summary-table td { border: 1px solid #000; padding: 3px 6px; text-align: center; }
        
        .marksheet-page .signature-block { text-align: right; margin-top: 20px; }
        .marksheet-page .sig-text { font-family: 'Brush Script MT', cursive; font-size: 28px; line-height: 1; }
        .marksheet-page .sig-label { font-weight: bold; font-size: 12px; text-transform: uppercase; margin-top: 2px; }
        
        .marksheet-page .bg-logo-watermark {
          position: absolute;
          inset: 0;
          pointer-events: none;
          z-index: 0;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .marksheet-page .bg-logo-watermark img { width: 420px; opacity: 0.06; }

        .verification-footer {
          margin-top: 30px;
          border-top: 2px solid #1a4d2e;
          padding-top: 15px;
          display: flex;
          align-items: center;
          gap: 20px;
        }
        .qr-section {
          background: #fff;
          padding: 8px;
          border: 1px solid #ddd;
          flex-shrink: 0;
        }
        .v-text {
          font-size: 10px;
          color: #444;
          line-height: 1.4;
          flex: 1;
        }
        .v-hash {
          font-family: monospace;
          background: #f8f8f8;
          padding: 4px 8px;
          border-radius: 4px;
          display: block;
          margin-top: 4px;
          color: #222;
          font-size: 9px;
          word-break: break-all;
          border: 1px solid #eee;
        }
      `}} />

      <div className="marksheet-page">
        {/* Tiled Watermark Background */}
        <div className="watermark">
          {Array.from({ length: 60 }).map((_, i) => (
            <span key={i} style={{
              top: Math.floor(i / 5) * 80 + 20,
              left: (i % 5) * 220 - 50
            }}>JUNAGADH AGRICULTURAL UNIVERSITY</span>
          ))}
        </div>

        <div className="bg-logo-watermark">
          <img src="/assets/uni_logo.jpg" alt="watermark" />
        </div>

        <div className="content">
          {/* Header */}
          <div className="header">
            <div style={{ width: 70 }}></div>
            <div className="header-titles">
              <div className="line1">Junagadh Agricultural University</div>
              <div className="line2">Junagadh &ndash; Gujarat (India)</div>
              <div className="line3">Student's Evaluation Report</div>
            </div>
            <div className="logo-circle">
              <img src="/assets/uni_logo2.png" alt="University logo" style={{ width: '74px', height: '86px', objectFit: 'contain' }} />
            </div>
          </div>

          {/* Barcode Mock */}
          <div className="barcode-wrap">
            {Array.from({ length: 50 }).map((_, i) => (
              <div key={i} style={{ width: (i % 3 === 0 ? 3 : 1.5), height: (i % 7 === 0 ? 38 : 30) }}></div>
            ))}
          </div>

          {/* Info Section */}
          <div className="info-section">
            <table className="info-table">
              <tbody>
                <tr>
                  <td className="lbl">Faculty</td><td style={{ width: 10 }}>:</td><td className="val">{faculty}</td>
                  <td className="lbl">Academic year</td><td style={{ width: 10 }}>:</td><td className="val">{academicYear}</td>
                </tr>
                <tr>
                  <td className="lbl">Degree Course</td><td>:</td><td className="val">{degree}</td>
                  <td className="lbl">Semester</td><td>:</td><td className="val">{semester}</td>
                </tr>
                <tr>
                  <td className="lbl">Major Subject</td><td>:</td><td className="val">{major}</td>
                  <td className="lbl">Examination held in</td><td>:</td><td className="val">{examination}</td>
                </tr>
                <tr>
                  <td className="lbl">Minor Subject</td><td>:</td><td className="val">{minor}</td>
                  <td className="lbl">Registration No.</td><td>:</td><td className="val" style={{ fontWeight: 'bold', color: '#d00' }}>{regNo}</td>
                </tr>
                <tr>
                  <td className="lbl">Name of College</td><td>:</td><td className="val" colSpan={4}>{college}</td>
                </tr>
                <tr>
                  <td className="lbl">Full Name of Student</td><td>:</td><td className="val" colSpan={4}><strong>{name}</strong></td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Main Table */}
          <table className="main-table">
            <thead>
              <tr>
                <th style={{ width: 32 }}>Sr. No.</th>
                <th style={{ width: 110 }}>Course Category</th>
                <th style={{ width: 78 }}>Course Number</th>
                <th>Title of Courses</th>
                <th style={{ width: 54 }}>Credit Hours</th>
                <th style={{ width: 54 }}>Grade Points</th>
                <th style={{ width: 58 }}>Credit Points</th>
              </tr>
            </thead>
            <tbody>
              {subjects.map((sub, i) => (
                <tr key={i}>
                  <td>{i + 1}</td>
                  <td>ALLIED</td>
                  <td>{sub.code}</td>
                  <td className="left">{sub.title}</td>
                  <td>{sub.credits || "-"}</td>
                  <td>{sub.grade || "-"}</td>
                  <td>
                    {sub.credit_points && sub.credit_points !== "NaN" ? sub.credit_points : (
                      (() => {
                        const pts = parseFloat(sub.credits || "0") * parseFloat(sub.grade || "0");
                        return isNaN(pts) ? (sub.credit_points || "-") : pts.toFixed(1);
                      })()
                    )}
                  </td>
                </tr>
              ))}
              <tr className="total-row">
                <td colSpan={4} style={{ textAlign: 'right', paddingRight: 10 }}>Total :</td>
                <td>{subjects.reduce((acc, s) => {
                  const val = parseFloat(s.credits);
                  return acc + (isNaN(val) ? 0 : val);
                }, 0).toFixed(1)}</td>
                <td>&mdash;</td>
                <td>{subjects.reduce((acc, s) => {
                  const cp = parseFloat(s.credit_points);
                  if (!isNaN(cp)) return acc + cp;
                  const calc = parseFloat(s.credits || "0") * parseFloat(s.grade || "0");
                  return acc + (isNaN(calc) ? 0 : calc);
                }, 0).toFixed(1)}</td>
              </tr>
            </tbody>
          </table>

          {/* Medium + GPA */}
          <div className="medium-gpa">
            <div><strong>Medium of Instruction &nbsp;:&nbsp;</strong> ENGLISH</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 'bold' }}>
              <span>G.P.A. :</span>
              <span className="gpa-val">{gpa}</span>
            </div>
          </div>

          <div style={{ border: '1px solid #111', borderTop: 'none', padding: '3px 8px', fontSize: '12.5px', minHeight: 22 }}>
            <strong>Remarks :</strong> {data.Status || data.status || ""}
          </div>

          {/* Bottom Area */}
          <div className="bottom">
            <div style={{ flex: 1.2 }}>
              <div style={{ fontSize: 12.5, fontWeight: 'bold', textAlign: 'center', textDecoration: 'underline', marginBottom: 4 }}>
                Summary of Student's Performance
              </div>
              <table className="summary-table">
                <thead>
                  <tr>
                    <th>Year</th><th>Semester</th><th>Cr. Hr.</th><th>Cr. Pt.</th><th>GPA</th><th>OGPA</th>
                  </tr>
                </thead>
                <tbody>
                  <tr><td rowSpan={2}>I</td><td>FIRST</td><td>18</td><td>121.7</td><td>6.76</td><td>6.76</td></tr>
                  <tr><td>SECOND</td><td>17</td><td>124.5</td><td>7.32</td><td>7.03</td></tr>
                  <tr>
                    <td>II</td>
                    <td>{semester}</td>
                    <td>{subjects.reduce((acc, s) => {
                      const val = parseFloat(s.credits);
                      return acc + (isNaN(val) ? 0 : val);
                    }, 0).toFixed(1)}</td>
                    <td>{subjects.reduce((acc, s) => {
                      const cp = parseFloat(s.credit_points);
                      if (!isNaN(cp)) return acc + cp;
                      const calc = parseFloat(s.credits || "0") * parseFloat(s.grade || "0");
                      return acc + (isNaN(calc) ? 0 : calc);
                    }, 0).toFixed(1)}</td>
                    <td>{gpa}</td>
                    <td>{gpa}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 'bold', textDecoration: 'underline', marginBottom: 3, fontSize: 11.5 }}>NOTE :</div>
              <div style={{ fontSize: 10, lineHeight: 1.4 }}>
                <p><b>@</b> Non-Credit Course</p>
                <p><b>S</b> Satisfactory | <b>US</b> Unsatisfactory</p>
              </div>
              <div className="signature-block">
                <div className="sig-text">QuestVerify</div>
                <div className="sig-label">Registrar</div>
              </div>
              <div style={{ fontWeight: 'bold', marginTop: 15, fontSize: 12 }}>DATE: {new Date().toLocaleDateString()}</div>
            </div>
          </div>

          {/* --- Blockchain Verification Footer --- */}
          <div className="verification-footer">
            <div className="qr-section">
              <QRCodeSVG value={verificationUrl} size={70} />
            </div>
            <div className="v-text">
              <div style={{ fontWeight: 'bold', fontSize: 11, color: '#1a4d2e', textTransform: 'uppercase', marginBottom: 2 }}>
                Digital Authenticity Proof
              </div>
              <div>
                This document is crypographically signed and anchored on the Polygon Blockchain. Scan the QR code or visit the URL below to verify the original record integrity against the Merkle Root.
              </div>
              <div className="v-hash">
                <strong>Merkle Leaf:</strong> {leafHash}
              </div>
            </div>
            <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', opacity: 0.8 }}>
               <div style={{ background: '#1a4d2e', color: '#fff', padding: '3px 8px', fontSize: 10, borderRadius: 4, fontWeight: 'bold' }}>VERIFIED</div>
               <div style={{ fontSize: 7, marginTop: 4, letterSpacing: 1 }}>BLOCKCHAIN SECURED</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
