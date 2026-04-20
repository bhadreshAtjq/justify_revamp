
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
  const metadata = mapStudentMetadata(record);
  const subjects = discoverSubjects(record);

  // ===== CANONICAL JSON — matches Python's build_canonical_payload =====
  // Strict key order: registration_no -> name -> gpa -> subjects
  // Each subject: code -> title -> credits -> grade
  const payload = {
    registration_no: String(metadata.regNo || ""),
    name: String(metadata.name || ""),
    gpa: String(metadata.gpa || ""),
    subjects: subjects.map(s => ({
      code: String(s.code || ""),
      title: String(s.title || ""),

      credit_points: String(s.credit_points || "")
    }))
  };

  // Compact JSON with no spaces — identical to Python's json.dumps(separators=(',', ':'))
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
