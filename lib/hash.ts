
import { discoverSubjects, mapStudentMetadata } from "./marksheet";
import { mapTranscriptPayload } from "./transcript";
import { mapCertificatePayload } from "./certificate";

import { keccak256 } from "web3-utils";

export interface HashStrategy {
  includeName: boolean;
  includeRegNo: boolean;
  includeGPA: boolean;
  includeSubjects: boolean;
}

/**
 * Generate Keccak256 hash from student record fields based on a specific strategy.
 * This now uses a structured JSON payload for better auditability.
 */
export function generateStudentHash(
  record: Record<string, any>,
  strategy: HashStrategy,
  type: string = "marksheet"
): string {
  let payload: any;

  if (type === "transcript") {
    // 1. Full Transcript Structured Payload
    payload = mapTranscriptPayload(record);
  } else if (type === "certificate") {
    // 2. Certificate Payload
    payload = mapCertificatePayload(record);
  } else {
    // 3. Marksheet/Standard Payload
    const regNo = record.registration_no || record.Registration_No || mapStudentMetadata(record).regNo;
    const name = record.name || record.Student_Name || mapStudentMetadata(record).name;
    const gpa = record.gpa || record.GPA || mapStudentMetadata(record).gpa;
    
    const rawSubjects = Array.isArray(record.subjects) ? record.subjects : discoverSubjects(record);

    payload = {
      registration_no: String(regNo || ""),
      name: String(name || ""),
      gpa: String(gpa || ""),
    
      subjects: rawSubjects.map((s: any) => ({
        code: String(s.code || ""),
        title: String(s.title || ""),
        credit_points: String(s.credit_points || s.Credit_Points || "")
      }))
    };

  }

  const combined = JSON.stringify(payload);

  // Debug log
  console.log("DEBUG: Canonical Hash Input ->", combined);

  // 0x prefix matches Python's Web3.to_hex()
  return keccak256(combined);
}

/**
 * Generate hashes for all student records in a dataset using the selected strategy.
 */
export function generateHashesFromRecords(
  records: Record<string, any>[],
  strategy: HashStrategy,
  type: string = "marksheet"
): { hash: string; registrationNo: string; index: number }[] {
  return records.map((record, index) => {
    const docType = record.__doc_type || record.doc_type || type;
    const registrationNo = (docType === "certificate")
      ? (record["registration_no"] || record["Registration_No"] || record["RegistrationNo"] || record["Reg_No"] || "")
      : (record["Registration_No"] ||
         record["registration_no"] ||
         record["RegistrationNo"] ||
         record["Reg_No"] ||
         record["Certificate_No"] ||
         record["Certificate No"] ||
         record["no"] ||
         `UNNAMED_${index}`);

    // Use pre-calculated ledger hash from backend if available for 100% parity
    const hash = record.__ledger_hash || record.ledger_hash || generateStudentHash(record, strategy, docType);

    return {
      hash,
      registrationNo: String(registrationNo),
      index,
    };
  });
}
