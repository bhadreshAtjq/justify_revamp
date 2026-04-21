export function mapCertificatePayload(data: any): any {
  // If the data is already structured (e.g. from OCR JSON response), return it directly
  if (data.certificate_no && data.degree) {
    return {
      certificate_no: String(data.certificate_no || ""),
      no: String(data.no || ""),
      university: String(data.university || data.University || "Junagadh Agricultural University"),
      name: String(data.name || data.Student_Name || data["Student Name"] || ""),
      degree: String(data.degree || data.Degree || ""),
      ogpa: String(data.ogpa || data.Overall_GPA || data.OGPA || data.gpa || ""),
      year: String(data.year || data.Year || data.academic_year || ""),
      date: String(data.date || data.Date || ""),
      class_division: String(data.class_division || data.Class || data.class || "")
    };
  }

  // Helper for matching common CSV header names
  const findVal = (patterns: string[]) => {
    for (const p of patterns) {
      const match = Object.keys(data).find(k => k.trim().toLowerCase() === p.toLowerCase());
      if (match) return data[match];
    }
    return "";
  };

  return {
    certificate_no: findVal(["certificate_no", "certificate no", "cert_no"]),
    no: findVal(["no", "number", "serial_no", "Reg No", "Registration_No"]),
    university: findVal(["university", "University", "College", "college"]) || "Junagadh Agricultural University",
    name: findVal(["Student_Name", "name", "Student Name", "Full_Name"]),
    degree: findVal(["Degree", "degree", "course"]),
    ogpa: findVal(["Overall_GPA", "ogpa", "OGPA", "gpa", "GPA"]),
    year: findVal(["year", "academic_year", "Completion_Year", "completion_year", "Admission_Year"]),
    date: findVal(["date", "issue_date", "Date"]),
    class_division: findVal(["Class", "class_division", "division", "Result", "status"])
  };
}
