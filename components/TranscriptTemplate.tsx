"use client";

import React, { useMemo } from "react";
import { mapTranscriptPayload } from "@/lib/transcript";
import { QRCodeSVG } from "qrcode.react";

export default function TranscriptTemplate({ data, id = "transcript-pdf" }: { data: any, id?: string }) {
  // Use the transcript mapper to get the structured data
  const transcript = useMemo(() => mapTranscriptPayload(data), [data]);

  // Split years into 2 pages - first 2 years on page 1, remaining on page 2
  const page1Years = transcript.years.slice(0, 2);
  const page2Years = transcript.years.slice(2);

  const verificationUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/verify/${data.merkle_leaf || data.keccak256_hash}`
    : `https://verification.justifai.com/verify/${data.merkle_leaf || data.keccak256_hash}`;

  const leafHash = data.merkle_leaf || data.keccak256_hash || "PENDING_ANCHOR";

  const renderPage = (years: any[], pageNum: number, isLastPage: boolean) => (
    <div className="transcript-page" style={{ pageBreakAfter: isLastPage ? 'auto' : 'always' }}>
      {pageNum === 1 && (
        <>
          <div className="transcript-header">
            <img src="/assets/uni_logo.jpg" alt="Logo" className="transcript-logo" onError={(e) => e.currentTarget.style.display='none'} />
            <div className="transcript-titles">
              <h1>Junagadh Agricultural University</h1>
              <h2>Junagadh</h2>
              <h3>Transcript of Academic Record</h3>
            </div>
            <div className="transcript-student-photo">
              {data.photo_url ? (
                <img src={data.photo_url} alt="Student" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <div style={{ textAlign: 'center', fontSize: '10px', opacity: 0.4 }}>PHOTO</div>
              )}
            </div>
          </div>

          <table className="transcript-info-grid">
            <tbody>
              <tr>
                <td className="label">Full Name of Student</td><td className="sep">:</td><td className="val" colSpan={4}>{transcript.name}</td>
              </tr>
              <tr>
                <td className="label">Registration No.</td><td className="sep">:</td><td className="val">{transcript.registration_no}</td>
                <td></td>
                <td className="label">Admission Year</td><td className="sep">:</td><td className="val">{transcript.admission_year}</td>
              </tr>
              <tr>
                <td className="label">Degree</td><td className="sep">:</td><td className="val">{transcript.degree}</td>
                <td></td>
                <td className="label">Completion Year</td><td className="sep">:</td><td className="val">{transcript.completion_year}</td>
              </tr>
            </tbody>
          </table>
        </>
      )}

      {pageNum === 2 && (
        <div style={{ fontSize: '12px', marginBottom: '15px', color: '#666' }}>
          <strong>Student:</strong> {transcript.name} | <strong>Reg No:</strong> {transcript.registration_no}
        </div>
      )}

      <table className="transcript-main-table">
        <thead>
          <tr>
            <th style={{ width: '120px' }}>Course Number</th>
            <th>Title of the course</th>
            <th style={{ width: '100px' }}>Credit Points</th>
          </tr>
        </thead>
        <tbody>
          {years.map((yearObj: any, yIdx: number) => (
            <React.Fragment key={yIdx}>
              {yearObj.semesters.map((semObj: any, sIdx: number) => (
                <React.Fragment key={`${yIdx}-${sIdx}`}>
                  <tr className="sem-header-row">
                    <td style={{ borderBottom: 'none' }}>{sIdx === 0 ? yearObj.year : ""}</td>
                    <td colSpan={2} style={{ textAlign: 'right', textTransform: 'uppercase' }}>{semObj.semester}</td>
                  </tr>
                  {semObj.courses.map((course: any, cIdx: number) => (
                    <tr key={cIdx} className="course-row">
                      <td>{course.course_number}</td>
                      <td style={{ textAlign: 'left' }}>{course.title}</td>
                      <td style={{ textAlign: 'center' }}>{course.credit_points}</td>
                    </tr>
                  ))}
                  <tr className="sem-footer-row">
                    <td></td>
                    <td colSpan={2} style={{ borderTop: '2px solid #000', padding: '6px' }}>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '30px' }}>
                        <span>G.P.A. : {semObj.gpa}</span>
                        <span>C.G.P.A. : {semObj.cgpa}</span>
                      </div>
                    </td>
                  </tr>
                </React.Fragment>
              ))}
            </React.Fragment>
          ))}
        </tbody>
      </table>

      {isLastPage && (
        <>
          <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ fontSize: '13px' }}>
              <div><strong>Result:</strong> {transcript.result || "Pass"}</div>
              <div style={{ marginTop: '4px' }}><strong>Class / Division:</strong> {transcript.class_division || "First Class"}</div>
            </div>
            <div style={{ fontWeight: 'bold', fontSize: '14px', textAlign: 'right' }}>
              OVERALL G.P.A. : {transcript.ogpa}
            </div>
          </div>

          {/* Verification Footer */}
          <div className="verification-footer">
            <div className="qr-section">
              <QRCodeSVG value={verificationUrl} size={65} />
            </div>
            <div className="v-text">
              <div style={{ fontWeight: 'bold', fontSize: '12px', color: '#1a4d2e', marginBottom: '2px' }}>
                OFFICIAL BLOCKCHAIN VERIFIED TRANSCRIPT
              </div>
              <div>
                This transcript is a digital twin anchored on the blockchain. Any tampering with the course records or grades will invalidate the Merkle Leaf proof. Verify authenticity at the URL above.
              </div>
              <div className="v-hash">
                <strong>Proof ID:</strong> {leafHash}
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '10px', fontWeight: 'bold', opacity: 0.7 }}>Date Generated</div>
              <div style={{ fontSize: '12px' }}>{new Date().toLocaleDateString('en-GB')}</div>
            </div>
          </div>
        </>
      )}
    </div>
  );

  return (
    <div className="transcript-preview-container" id={id} style={{ background: '#f5f5f5', padding: '40px 0', width: '100%', overflowX: 'auto' }}>
      <style dangerouslySetInnerHTML={{
        __html: `
        .transcript-page {
          width: 840px;
          margin: 0 auto 30px auto;
          padding: 30px 40px;
          position: relative;
          background: #fff;
          min-height: 1120px;
          color: #000;
          font-family: "Times New Roman", Times, serif;
          box-shadow: 0 0 20px rgba(0,0,0,0.1);
          overflow: visible;
        }
        .transcript-header {
          display: flex;
          align-items: flex-start;
          justify-content: center;
          margin-bottom: 20px;
          position: relative;
        }
        .transcript-logo {
          position: absolute;
          left: 0;
          top: 0;
          width: 80px;
        }
        .transcript-titles {
          text-align: center;
          flex: 1;
        }
        .transcript-titles h1 {
          font-size: 22px;
          margin: 0;
          color: #1a4d2e;
          text-transform: uppercase;
        }
        .transcript-titles h2 {
          font-size: 18px;
          margin: 2px 0;
          text-transform: uppercase;
        }
        .transcript-titles h3 {
          font-size: 16px;
          margin: 10px 0;
          text-decoration: underline;
          font-weight: bold;
        }
        .transcript-student-photo {
          position: absolute;
          right: 0;
          top: 0;
          width: 90px;
          height: 110px;
          border: 1px solid #000;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #fafafa;
          overflow: hidden;
        }
        .transcript-info-grid {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 15px;
          font-size: 13px;
        }
        .transcript-info-grid td {
          padding: 2px 4px;
        }
        .transcript-info-grid .label {
          width: 140px;
          white-space: nowrap;
        }
        .transcript-info-grid .sep {
          width: 10px;
        }
        .transcript-info-grid .val {
          font-weight: bold;
        }

        .transcript-main-table {
          width: 100%;
          border-collapse: collapse;
          border: 1px solid #000;
        }
        .transcript-main-table th, .transcript-main-table td {
          border: 1px solid #000;
          padding: 4px 6px;
          font-size: 12px;
        }
        .transcript-main-table th {
          background: #f0f0f0;
          text-align: center;
        }
        .sem-header-row {
          background: #fdfdfd;
          font-weight: bold;
        }
        .sem-footer-row {
          font-weight: bold;
          text-align: right;
        }
        .course-row td {
          padding: 2px 6px;
        }

        .verification-footer {
          margin-top: 30px;
          border-top: 1px solid #000;
          padding-top: 15px;
          display: flex;
          align-items: center;
          gap: 20px;
        }
        .qr-section {
          background: #fff;
          padding: 5px;
          border: 1px solid #ddd;
          flex-shrink: 0;
        }
        .v-text {
          font-size: 11px;
          color: #333;
          flex: 1;
        }
        .v-hash {
          font-family: monospace;
          background: #f4f4f4;
          padding: 3px 6px;
          border-radius: 4px;
          display: block;
          margin-top: 3px;
          font-size: 10px;
          word-break: break-all;
        }
      `}} />

      {renderPage(page1Years, 1, page2Years.length === 0)}
      {page2Years.length > 0 && renderPage(page2Years, 2, true)}
    </div>
  );
}
