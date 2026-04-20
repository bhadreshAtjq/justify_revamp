import { keccak256 } from "js-sha3";
import { discoverSubjects, mapStudentMetadata } from "./marksheet";

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
  const payload: any = {};

  if (strategy.includeRegNo) {
    payload.registration_no = metadata.regNo;
  }

  if (strategy.includeName) {
    payload.name = metadata.name;
  }

  if (strategy.includeGPA) {
    payload.gpa = metadata.gpa;
  }

  if (strategy.includeSubjects) {
    payload.subjects = discoverSubjects(record);
  }

  // Canonical JSON stringification with sorted keys and no whitespace to match Python's json.dumps separators=(',', ':')
  const sortedPayload: any = {};
  Object.keys(payload).sort().forEach(key => {
    sortedPayload[key] = payload[key];
  });
  
  const combined = JSON.stringify(sortedPayload); 

  // Debug log for the user to see the exact payload being hashed
  console.log("DEBUG: Final Hash Payload JSON ->", combined);

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
