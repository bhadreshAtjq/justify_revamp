
import { discoverSubjects, mapStudentMetadata } from "./marksheet";

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
  strategy: HashStrategy
): string {
  // 1. Extract values with strict prioritization for the Render API format
  const regNo = record.registration_no || record.Registration_No || mapStudentMetadata(record).regNo;
  const name = record.name || record.Student_Name || mapStudentMetadata(record).name;
  const gpa = record.gpa || record.GPA || mapStudentMetadata(record).gpa;
  
  // 2. Extract subjects - either from structured 'subjects' array or discovered from flat keys
  const rawSubjects = Array.isArray(record.subjects) ? record.subjects : discoverSubjects(record);

  // ===== CANONICAL JSON — MUST match Python exactly =====
  // Payload: registration_no, name, gpa, subjects (code, title, credit_points)
  const payload = {
    registration_no: String(regNo || ""),
    name: String(name || ""),
    gpa: String(gpa || ""),
    subjects: rawSubjects.map((s: any) => ({
      code: String(s.code || ""),
      title: String(s.title || ""),
      credit_points: String(s.credit_points || s.Credit_Points || "")
    }))
  };

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
  strategy: HashStrategy
): { hash: string; registrationNo: string; index: number }[] {
  return records.map((record, index) => {
    const registrationNo =
      record["registration_no"] ||
      record["Registration_No"] ||
      record["RegistrationNo"] ||
      record["Reg_No"] ||
      `UNNAMED_${index}`;

    const hash = generateStudentHash(record, strategy);

    return {
      hash,
      registrationNo: String(registrationNo),
      index,
    };
  });
}
