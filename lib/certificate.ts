/**
 * Maps raw certificate data to a canonical payload for hashing.
 *
 * CRITICAL: The key ORDER here must exactly match the Python backend's
 * `build_certificate_canonical_payload` OrderedDict in service.py:
 *   top_left_no → certificate_no → no → registration_no → name → degree
 *   → branch → ogpa → year → date → class_division
 */
export function mapCertificatePayload(data: any): any {
  // Helper for matching common field name variants (case-insensitive)
  const findVal = (patterns: string[]): string => {
    for (const p of patterns) {
      const match = Object.keys(data).find(k => k.trim().toLowerCase() === p.toLowerCase());
      if (match !== undefined) {
        const v = data[match];
        if (v !== null && v !== undefined && String(v).toLowerCase() !== "none") {
          return String(v).trim();
        }
      }
    }
    return "";
  };

  const certNo = findVal(["certificate_no", "Certificate_No", "cert_no"]);
  const noVal  = findVal(["no", "number", "serial_no"]);

  // Return keys in the EXACT same order as Python's OrderedDict
  return {
    top_left_no:     findVal(["top_left_no", "Top_Left_No", "sr_no", "sr. no", "serial_no", "Sr_No"]),
    certificate_no:  certNo,
    no:              noVal || certNo,
    registration_no: findVal(["registration_no", "Registration_No", "Reg No", "enrollment_no", "enrollment"]),
    name:            findVal(["name", "Student_Name", "Student Name", "Full_Name", "Name"]),
    degree:          findVal(["degree", "Degree", "course"]),
    branch:          findVal(["branch", "Branch", "Major", "major"]),
    ogpa:            findVal(["ogpa", "OGPA", "Overall_GPA", "gpa", "GPA", "CGPA"]),
    year:            findVal(["year", "academic_year", "Completion_Year", "completion_year", "Admission_Year", "Session"]),
    date:            findVal(["date", "issue_date", "Date"]),
    class_division:  findVal(["class_division", "Class", "division", "Result", "status"])
  };
}

