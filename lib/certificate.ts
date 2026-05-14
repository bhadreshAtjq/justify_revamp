export function mapCertificatePayload(data: any): any {
  // Helper for matching common CSV header names
  const findVal = (patterns: string[]) => {
    for (const p of patterns) {
      const match = Object.keys(data).find(k => k.trim().toLowerCase() === p.toLowerCase());
      if (match) return data[match];
    }
    return "";
  };

  // Extract values with fallbacks
  const certNo = findVal(["certificate_no", "Certificate_No", "cert_no"]);
  const noVal = findVal(["no", "number", "serial_no", "Reg No", "Registration_No"]);
  const finalNo = (noVal && noVal !== "null" && noVal !== null) ? noVal : certNo;

  // Return in exact order for consistent hash generation
  return {
    certificate_no: String(certNo || ""),
    no: String(finalNo || ""),
    registration_no: String(findVal(["registration_no", "Reg No", "Registration_No", "enrollment_no", "enrollment"]) || ""),
    name: String(findVal(["Student_Name", "name", "Student Name", "Full_Name", "Name"]) || ""),
    degree: String(findVal(["Degree", "degree", "course"]) || ""),
    branch: String(findVal(["Branch", "branch", "Major", "major"]) || ""),
    ogpa: String(findVal(["Overall_GPA", "ogpa", "OGPA", "gpa", "GPA", "CGPA"]) || ""),
    year: String(findVal(["year", "academic_year", "Completion_Year", "completion_year", "Admission_Year", "Session"]) || ""),
    date: String(findVal(["date", "issue_date", "Date"]) || ""),
    class_division: String(findVal(["Class", "class_division", "division", "Result", "status"]) || "")
  };
}


