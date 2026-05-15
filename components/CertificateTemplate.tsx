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
      <link href="https://fonts.googleapis.com/css2?family=Libre+Baskerville:ital,wght@0,400;0,700;1,400&family=UnifrakturMaguntia&family=Cinzel:wght@700&display=swap" rel="stylesheet" />
      <style dangerouslySetInnerHTML={{
        __html: `
        .certificate-capture-wrapper {
          padding: 0;
          margin: 0;
          background: #fff;
        }
        .certificate-page {
          width: 820px;
          margin: 0 auto;
          padding: 20px;
          position: relative;
          background: #fff;
          min-height: 1160px;
          height: 1160px;
          color: #000;
          font-family: 'Libre Baskerville', serif;
          box-shadow: 0 0 30px rgba(0,0,0,0.15);
          display: flex;
          flex-direction: column;
          box-sizing: border-box;
          border: 15px double #1a4d2e;
          background-image: radial-gradient(#fdfdfd 0.5px, transparent 0.5px);
          background-size: 10px 10px;
          overflow: hidden;
        }
        .cert-inner-content {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 20px 40px;
          position: relative;
        }
        .cert-top-meta {
          width: 100%;
          display: flex;
          justify-content: space-between;
          font-family: monospace;
          font-size: 14px;
          margin-bottom: 5px;
          opacity: 0.8;
        }
        .arched-header {
          position: relative;
          height: 160px;
          width: 100%;
          display: flex;
          justify-content: center;
          margin-top: -30px;
          margin-bottom: -40px;
          overflow: visible;
        }
        .arched-svg {
          width: 800px;
          height: 200px;
          overflow: visible;
        }
        .arched-text-path {
          font-size: 32px;
          font-weight: 900;
          fill: #1a4d2e;
          text-transform: uppercase;
          font-family: 'Cinzel', serif;
          letter-spacing: 2px;
        }
        .cert-sub-header {
          font-size: 18px;
          font-weight: bold;
          color: #333;
          margin-bottom: 25px;
          text-align: center;
        }
        .cert-main-visuals {
          width: 100%;
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
          padding: 0 40px;
        }
        .cert-logo-center {
          width: 100px;
        }
        .cert-photo-box {
          width: 110px;
          height: 130px;
          border: 1.5px solid #000;
          padding: 2px;
          background: #fff;
          overflow: hidden;
        }
        .cert-body-content {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          width: 100%;
          text-align: center;
        }
        .cert-state-text {
          font-size: 22px;
          font-weight: bold;
          margin-bottom: 10px;
          color: #333;
        }
        .cert-degree-intro {
          font-size: 26px;
          font-family: 'UnifrakturMaguntia', cursive;
          margin-bottom: 5px;
        }
        .cert-degree-name {
          font-size: 28px;
          font-weight: bold;
          color: #8B0000;
          margin: 5px 0;
          line-height: 1.2;
        }
        .cert-conferred-text {
          font-size: 20px;
          margin: 10px 0;
        }
        .cert-student-name-bold {
          font-size: 30px;
          font-weight: bold;
          color: #8B0000;
          margin: 10px 0;
        }
        .cert-legal-text {
          font-size: 17px;
          line-height: 1.5;
          max-width: 95%;
          margin: 15px 0;
        }
        .cert-grade-text {
          font-size: 19px;
          font-weight: bold;
          line-height: 1.6;
          margin: 10px 0;
        }
        .cert-division-box {
          font-size: 20px;
          font-weight: bold;
          margin-top: 10px;
        }
        .cert-footer-section {
          width: 100%;
          margin-top: auto;
          padding-top: 20px;
          display: flex;
          flex-direction: column;
          gap: 20px;
        }
        .cert-footer-row-upper {
          width: 100%;
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
        }
        .cert-bottom-meta {
          text-align: left;
          font-size: 14px;
          line-height: 1.6;
          font-weight: bold;
        }
        .cert-signature-area {
          text-align: right;
        }
        .cert-sig-title {
          font-size: 18px;
          font-weight: bold;
        }
        .cert-footer-row-lower {
          width: 100%;
          display: flex;
          justify-content: center;
          padding-bottom: 20px;
          transform: translateY(-100px);
        }
        .cert-qr-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 5px;
        }
        .cert-seal-box {
          width: 45px;
          height: 45px;
          background-image: url('https://img.icons8.com/color/96/quality-seal.png');
          background-size: contain;
          background-repeat: no-repeat;
        }
      `}} />

        <div className="certificate-page" style={{ margin: '20px' }}>
          <div className="cert-outer-border"></div>
          <div className="cert-double-border"></div>
          <div className="cert-inner-content">
            <div className="cert-top-meta">
              <div></div>
              <div>{cert.certificate_no}</div>
            </div>

            <div className="arched-header">
              <svg className="arched-svg" viewBox="0 0 800 220">
                <defs>
                  <path id="headerPath" d="M 50 180 Q 400 -20 750 180" />
                </defs>
                <text className="arched-text-path">
                  <textPath href="#headerPath" startOffset="50%" textAnchor="middle">
                    JUNAGADH AGRICULTURAL UNIVERSITY
                  </textPath>
                </text>
              </svg>
            </div>

            <div className="cert-sub-header">Junagadh - 362001</div>

            <div className="cert-main-visuals">
              <div style={{ width: 110 }}></div> {/* Placeholder to keep logo centered */}
              <img src="/assets/uni_logo.jpg" alt="Logo" className="cert-logo-center" onError={(e) => e.currentTarget.style.display='none'} />
              <div className="cert-photo-box">
                {data.photo_url ? (
                  <img src={data.photo_url} alt="Student" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <div style={{ textAlign: 'center', fontSize: '10px', opacity: 0.4, marginTop: '50px' }}>PHOTO</div>
                )}
              </div>
            </div>

            <div className="cert-body-content">
              <div className="cert-state-text">Gujarat State</div>
              <div className="cert-degree-intro">The Degree of</div>
              <div className="cert-degree-name">{cert.degree}</div>
              
              <div className="cert-conferred-text">has been conferred upon</div>
              <div className="cert-student-name-bold">{cert.name}</div>

              <div className="cert-legal-text">
                and he/she is entitled to all rights and honours appertaining thereto. In testimony whereof are set the seal of the University and signature of the Vice Chancellor.
              </div>

              <div className="cert-grade-text">
                He/She has passed this examination with<br/>
                an Overall Grade Point Average of<br/>
                {cert.ogpa || "---"} (10.000 basis) during the academic session
              </div>

              <div className="cert-division-box">{cert.year || "2021-2022"} and has been placed in the</div>
              <div className="cert-student-name-bold" style={{ fontSize: '28px', marginTop: '5px' }}>{cert.class_division || "I Division"}.</div>
            </div>

            <div className="cert-footer-section">
              <div className="cert-footer-row-upper">
                <div className="cert-bottom-meta">
                  {cert.no && <div>No. : {cert.no}</div>}
                  {cert.date && <div>Date : {cert.date}</div>}
                  {cert.registration_no && <div>Reg. No. : {cert.registration_no}</div>}
                </div>
                <div className="cert-signature-area">
                  <img src="/assets/vc_sig.png" alt="Signature" style={{ width: '120px', filter: 'grayscale(1) contrast(2)' }} onError={(e) => e.currentTarget.style.display='none'} />
                  <div className="cert-sig-title">Vice Chancellor</div>
                </div>
              </div>
              <div className="cert-footer-row-lower">
                <div className="cert-qr-container">
                  <div style={{ background: '#fff', padding: '5px', border: '1px solid #ddd' }}>
                    <QRCodeSVG value={verificationUrl} size={80} />
                  </div>
                  <div className="cert-seal-box"></div>
                </div>
              </div>
            </div>
        </div>
      </div>
    </div>
  );
}
