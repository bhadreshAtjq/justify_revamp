"use client";

import React, { useMemo } from "react";
import { mapCertificatePayload } from "@/lib/certificate";
import { QRCodeSVG } from "qrcode.react";

export default function CertificateTemplate({ data, id = "certificate-pdf" }: { data: any, id?: string }) {
  // Use the certificate mapper to get the structured data
  const cert = useMemo(() => mapCertificatePayload(data), [data]);
  
  const verificationUrl = typeof window !== 'undefined' 
    ? `${window.location.origin}/verify/${data.merkle_leaf || data.keccak256_hash}`
    : `https://verification.justifai.com/verify/${data.merkle_leaf || data.keccak256_hash}`;

  const leafHash = data.merkle_leaf || data.keccak256_hash || "PENDING_ANCHOR";

  return (
    <div className="certificate-preview-container" id={id} style={{ background: '#e0e0e0', padding: '50px 0', width: '100%', overflowX: 'auto', display: 'flex', justifyContent: 'center' }}>
      <style dangerouslySetInnerHTML={{
        __html: `
        .certificate-capture-wrapper {
          padding: 0 0 40px 0;
          margin: 0;
          background: #fff;
        }
        .certificate-page {
          width: 950px;
          margin: 0;
          padding: 60px 80px;
          position: relative;
          background: #fff;
          min-height: 700px;
          color: #000;
          font-family: "Garamond", "Baskerville", "Times New Roman", serif;
          box-shadow: 0 0 30px rgba(0,0,0,0.15);
          border: 15px double #1a4d2e;
          outline: 2px solid #1a4d2e;
          outline-offset: -20px;
        }
        .cert-header {
          text-align: center;
          margin-bottom: 40px;
        }
        .cert-logo {
          width: 100px;
          margin-bottom: 15px;
        }
        .cert-uni-name {
          font-size: 32px;
          font-weight: bold;
          text-transform: uppercase;
          color: #1a4d2e;
          margin: 0;
          letter-spacing: 2px;
        }
        .cert-uni-location {
          font-size: 18px;
          margin-top: 5px;
          font-style: italic;
        }
        .cert-body {
          text-align: center;
          margin-top: 30px;
        }
        .cert-title {
          font-size: 48px;
          font-family: "Old English Text MT", "Engravers MT", serif;
          margin-bottom: 20px;
        }
        .cert-text {
          font-size: 22px;
          line-height: 1.6;
          margin: 15px 0;
        }
        .cert-student-name {
          font-size: 36px;
          font-weight: bold;
          text-decoration: underline;
          margin: 20px 0;
          display: block;
        }
        .cert-degree {
          font-size: 32px;
          font-weight: bold;
          color: #1a4d2e;
          margin: 15px 0;
          display: block;
        }
        .cert-meta {
          display: flex;
          justify-content: space-between;
          margin-top: 60px;
          padding: 0 40px;
        }
        .cert-sig-block {
          text-align: center;
          width: 200px;
        }
        .cert-sig-line {
          border-top: 1px solid #000;
          margin-top: 50px;
          padding-top: 5px;
          font-weight: bold;
          text-transform: uppercase;
          font-size: 14px;
        }
        .cert-footer {
          margin-top: 50px;
          border-top: 1px solid #eee;
          padding-top: 20px;
          display: flex;
          align-items: center;
          gap: 20px;
        }
        .cert-qr {
          background: #fff;
          padding: 5px;
          border: 1px solid #ddd;
        }
        .cert-v-details {
          flex: 1;
          font-size: 11px;
          color: #555;
        }
        .cert-hash-box {
          font-family: monospace;
          background: #fdfdfd;
          padding: 4px 8px;
          border: 1px solid #eee;
          font-size: 10px;
          margin-top: 5px;
          word-break: break-all;
        }
      `}} />

      <div className="certificate-capture-wrapper">
        <div className="certificate-page">
          <div className="cert-header">
            <img src="/assets/uni_logo.jpg" alt="Logo" className="cert-logo" onError={(e) => e.currentTarget.style.display='none'} />
            <h1 className="cert-uni-name">Junagadh Agricultural University</h1>
            <div className="cert-uni-location">Junagadh, Gujarat, India</div>
          </div>

          <div className="cert-body">
            <div className="cert-title">Certificate</div>
            <div className="cert-text">This is to certify that</div>
            <div className="cert-student-name">{cert.name}</div>
            <div className="cert-text">having passed the examination held in <b>{cert.year || "2018"}</b></div>
            <div className="cert-text">and having fulfilled all the requirements is hereby awarded the degree of</div>
            <div className="cert-degree">{cert.degree}</div>
            {cert.branch && (
               <div className="cert-text">in the branch of <b>{cert.branch}</b></div>
            )}
            <div className="cert-text">with <b>{cert.class_division || "First Class"}</b></div>
            {cert.ogpa && (
               <div className="cert-text">Overall Grade Point Average: <b>{cert.ogpa} / 10.00</b></div>
            )}
          </div>

          <div className="cert-meta">
            <div className="cert-sig-block">
               <div style={{ fontStyle: 'italic', fontSize: '18px', marginBottom: -10 }}>{cert.date || "02/10/2018"}</div>
               <div className="cert-sig-line">Date of Issue</div>
            </div>
            <div className="cert-sig-block">
               <div style={{ fontFamily: 'Brush Script MT, cursive', fontSize: '32px', marginBottom: -10 }}>QuestVerify</div>
               <div className="cert-sig-line">Registrar</div>
            </div>
            <div className="cert-sig-block">
               <div style={{ fontFamily: 'Brush Script MT, cursive', fontSize: '32px', marginBottom: -10 }}>JAU</div>
               <div className="cert-sig-line">Vice Chancellor</div>
            </div>
          </div>

          <div className="cert-footer">
            <div className="cert-qr">
              <QRCodeSVG value={verificationUrl} size={80} />
            </div>
            <div className="cert-v-details">
              <div style={{ fontWeight: 'bold', color: '#1a4d2e', marginBottom: 2 }}>OFFICIAL DIGITAL CREDENTIAL</div>
              <div>This certificate is a cryptographically secured digital twin. Authenticity can be verified by scanning the QR code or using the Proof ID below on our blockchain verification portal.</div>
              <div className="cert-hash-box">
                 <strong>Proof ID:</strong> {leafHash}
              </div>
            </div>
            <div style={{ textAlign: 'right', minWidth: 100 }}>
               <div style={{ fontSize: 10, fontWeight: 'bold' }}>Certificate No.</div>
               <div style={{ fontSize: 14, fontWeight: 'bold', color: '#d32f2f' }}>{cert.no || cert.certificate_no}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
