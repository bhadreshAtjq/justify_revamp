"use client";

import React, { useMemo } from "react";
import { mapTranscriptPayload } from "@/lib/transcript";
import { QRCodeSVG } from "qrcode.react";

export default function TranscriptTemplate({ data, id = "transcript-pdf" }: { data: any, id?: string }) {
  // Use the transcript mapper to get the structured data
  const transcript = useMemo(() => mapTranscriptPayload(data), [data]);

  // --- DYNAMIC PAGE SPLITTING LOGIC (3 PAGES MAX) ---
  const pages = useMemo(() => {
    const result: any[][] = [];
    let currentPage: any[] = [];
    let currentRows = 0;
    
    // Base Page constraints (Standard A4 capacity)
    const MAX_ROWS_FIRST_PAGE = 22; 
    const MAX_ROWS_SUBSEQUENT = 32;

    // Calculate total estimated rows for the entire transcript
    let totalRows = 0;
    transcript.years.forEach((year: any) => {
      totalRows += 1; // Year Name
      (year.semesters || []).forEach((sem: any) => {
        totalRows += 2 + (sem.courses || []).length; // Sem Name + Footer + Course Rows
      });
    });

    // Determine the max allowed rows over 3 pages
    const TOTAL_CAPACITY = MAX_ROWS_FIRST_PAGE + (2 * MAX_ROWS_SUBSEQUENT);

    // If we exceed capacity, calculate how much we need to "squeeze" rows per page
    // to force everything into 3 pages.
    const squeezeRatio = totalRows > TOTAL_CAPACITY ? totalRows / TOTAL_CAPACITY : 1;
    
    const p1Limit = Math.ceil(MAX_ROWS_FIRST_PAGE * squeezeRatio);
    const pSubLimit = Math.ceil(MAX_ROWS_SUBSEQUENT * squeezeRatio);

    transcript.years.forEach((year: any) => {
      let yearRows = 1; 
      (year.semesters || []).forEach((sem: any) => {
        yearRows += 2 + (sem.courses || []).length;
      });

      const limit = (result.length === 0) ? p1Limit : pSubLimit;

      // Logic: If adding this year exceeds the dynamic limit, start a new page
      // EXCEPT: if we are already on Page 2, Page 3 MUST take everything else.
      if (result.length < 2 && currentRows + yearRows > limit && currentPage.length > 0) {
        result.push(currentPage);
        currentPage = [year];
        currentRows = yearRows;
      } else {
        currentPage.push(year);
        currentRows += yearRows;
      }
    });

    if (currentPage.length > 0) result.push(currentPage);
    return result;
  }, [transcript]);

  const verificationUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/verify/${data.merkle_leaf || data.keccak256_hash}`
    : `https://verification.justifai.com/verify/${data.merkle_leaf || data.keccak256_hash}`;

  const leafHash = data.merkle_leaf || data.keccak256_hash || "PENDING_ANCHOR";

  const renderPage = (years: any[], pageNum: number, isLastPage: boolean) => (
    <div className="transcript-page" key={pageNum} style={{ pageBreakAfter: isLastPage ? 'auto' : 'always' }}>
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

      {pageNum > 1 && (
        <div style={{ fontSize: '11px', marginBottom: '10px', color: '#666', borderBottom: '1px solid #ddd', paddingBottom: '3px' }}>
          <strong>Student:</strong> {transcript.name} | <strong>Reg No:</strong> {transcript.registration_no} | <span style={{ float: 'right' }}>Page {pageNum} of {pages.length}</span>
        </div>
      )}

      <table className="transcript-main-table">
        <thead>
          <tr>
            <th style={{ width: '110px' }}>Course Number</th>
            <th>Title of the course</th>
            <th style={{ width: '90px' }}>Credit Points</th>
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
                    <td colSpan={2} style={{ borderTop: '2.5px solid #000', padding: '5px' }}>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '25px' }}>
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
          <div style={{ marginTop: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1.5px solid #000', paddingTop: '8px' }}>
            <div style={{ fontSize: '12px' }}>
              <div><strong>Result:</strong> {transcript.result || "Pass"}</div>
              <div style={{ marginTop: '2px' }}><strong>Class / Division:</strong> {transcript.class_division || "First Class"}</div>
            </div>
            <div style={{ fontWeight: 'bold', fontSize: '13px', textAlign: 'right' }}>
              OVERALL G.P.A. : {transcript.ogpa}
            </div>
          </div>

          {/* Verification Footer */}
          <div className="verification-footer">
            <div className="qr-section">
              <QRCodeSVG value={verificationUrl} size={55} />
            </div>
            <div className="v-text">
              <div style={{ fontWeight: 'bold', fontSize: '10px', color: '#1a4d2e', marginBottom: '1px' }}>
                OFFICIAL BLOCKCHAIN VERIFIED TRANSCRIPT
              </div>
              <div style={{ lineHeight: '1.1' }}>
                Anchored on the blockchain for immutable verification. Tampering invalidates the Merkle proof. Verify at the URL above.
              </div>
              <div className="v-hash">
                <strong>Proof ID:</strong> {leafHash}
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '8px', fontWeight: 'bold', opacity: 0.6 }}>Date Generated</div>
              <div style={{ fontSize: '10px' }}>{new Date().toLocaleDateString('en-GB')}</div>
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
          padding: 30px 45px;
          position: relative;
          background: #fff;
          min-height: 1120px;
          color: #000;
          font-family: "Times New Roman", Times, serif;
          box-shadow: 0 0 20px rgba(0,0,0,0.1);
          overflow: visible;
          box-sizing: border-box;
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
        }
        @media print {
          body { margin: 0 !important; padding: 0 !important; }
          .transcript-preview-container { padding: 0 !important; background: none !important; width: auto !important; }
          .transcript-page { 
            margin: 0 !important; 
            box-shadow: none !important; 
            width: 100% !important; 
            height: 1120px !important;
            padding: 40px 50px !important;
          }
          .transcript-main-table th { background-color: #f0f0f0 !important; }
          .sem-header-row { background-color: #fdfdfd !important; }
          tr { page-break-inside: avoid !important; }
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
          width: 75px;
        }
        .transcript-titles {
          text-align: center;
          flex: 1;
        }
        .transcript-titles h1 {
          font-size: 21px;
          margin: 0;
          color: #1a4d2e;
          text-transform: uppercase;
        }
        .transcript-titles h2 {
          font-size: 17px;
          margin: 2px 0;
          text-transform: uppercase;
        }
        .transcript-titles h3 {
          font-size: 15px;
          margin: 8px 0;
          text-decoration: underline;
          font-weight: bold;
        }
        .transcript-student-photo {
          position: absolute;
          right: 0;
          top: 0;
          width: 85px;
          height: 105px;
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
          margin-bottom: 12px;
          font-size: 12px;
        }
        .transcript-info-grid td {
          padding: 2px 4px;
        }
        .transcript-info-grid .label {
          width: 135px;
          white-space: nowrap;
        }
        .transcript-info-grid .sep {
          width: 8px;
        }
        .transcript-info-grid .val {
          font-weight: bold;
        }

        .transcript-main-table {
          width: 100%;
          border-collapse: collapse;
          border: 1.5px solid #000;
        }
        .transcript-main-table th, .transcript-main-table td {
          border: 1px solid #000;
          padding: 4px 6px;
          font-size: 12.5px;
          line-height: 1.3;
        }
        .transcript-main-table th {
          background: #f0f0f0;
          text-align: center;
          font-weight: bold;
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
          padding: 3px 6px;
          font-size: 13px;
        }

        .verification-footer {
          margin-top: 15px;
          border-top: 1px solid #000;
          padding-top: 8px;
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .qr-section {
          background: #fff;
          padding: 4px;
          border: 1px solid #ddd;
          flex-shrink: 0;
        }
        .v-text {
          font-size: 9.5px;
          color: #333;
          flex: 1;
        }
        .v-hash {
          font-family: monospace;
          background: #f4f4f4;
          padding: 2px 5px;
          border-radius: 4px;
          display: block;
          margin-top: 2px;
          font-size: 8.5px;
          word-break: break-all;
        }
      `}} />

      {pages.map((yearGroup, index) => (
        renderPage(yearGroup, index + 1, index === pages.length - 1)
      ))}
    </div>
  );
}
