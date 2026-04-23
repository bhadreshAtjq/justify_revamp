
/**
 * Maps a flat CSV record to a structured Transcript JSON payload.
 * Matches the requested canonical structure for blockchain hashing.
 */
export function mapTranscriptPayload(data: any): any {
  // Helper to clean credit points - handle OCR errors like "--", "20./", "4l.y", "16.x"
  const cleanCreditPoints = (val: any): string => {
    if (!val) return "";
    const str = String(val).trim();
    // Remove non-numeric characters except decimal point
    const cleaned = str.replace(/[^0-9.]/g, "");
    // If result is empty or invalid, return empty string
    if (!cleaned || cleaned === "." || isNaN(parseFloat(cleaned))) return "";
    return cleaned;
  };

  // Helper to find value with flexible pattern matching
  const findVal = (patterns: string[]) => {
    for (const p of patterns) {
      const match = Object.keys(data).find(k => k.trim().toLowerCase() === p.toLowerCase());
      if (match) return data[match];
    }
    return "";
  };

  // If the data is already structured properly from the OCR JSON response,
  // we MUST mathematically reconstruct it key-by-key to force deterministic ordering for the hashing engine.
  if (data.years && Array.isArray(data.years) && data.years.length > 0) {
    return {
      registration_no: findVal(["registration_no", "Registration_No", "reg_no", "Reg No", "registration number"]),
      name: findVal(["name", "Student_Name", "student_name", "Student Name", "full_name"]),
      degree: findVal(["degree", "Degree", "program", "course"]),
      admission_year: findVal(["admission_year", "Admission_Year", "admission", "session"]),
      completion_year: findVal(["completion_year", "Completion_Year", "passing_year", "year"]),
      ogpa: String(findVal(["ogpa", "OGPA", "Overall_GPA", "overall_gpa", "cgpa", "CGPA"]) || "0.00"),
      result: String(findVal(["result", "Result", "status"]) || "Pass"),
      class_division: String(findVal(["class_division", "class_division", "Class", "division"]) || ""),
      years: data.years.map((y: any) => ({
        year: String(y.year || ""),
        semesters: (y.semesters || []).map((s: any) => ({
          semester: String(s.semester || s.name || ""),
          gpa: String(s.gpa || s.GPA || "0.00"),
          cgpa: String(s.cgpa || s.CGPA || "0.00"),
          courses: (s.courses || []).map((c: any) => ({
            course_number: String(c.course_number || c.code || c.Course_Number || ""),
            title: String(c.title || c.name || c.Course_Name || ""),
            credit_points: cleanCreditPoints(c.credit_points || c.credits || c.Credit_Points || "")
          }))
        }))
      }))
    };
  }

  const payload: any = {
    registration_no: findVal(["Registration_No", "registration_no", "Reg No", "reg_no", "registration number"]),
    name: findVal(["Student_Name", "name", "Student Name", "student_name", "full_name"]),
    degree: findVal(["Degree", "degree", "program", "course"]),
    admission_year: findVal(["Admission_Year", "admission_year", "admission", "session"]),
    completion_year: findVal(["Completion_Year", "completion_year", "passing_year", "year"]),
    ogpa: findVal(["Overall_GPA", "ogpa", "OGPA", "overall_gpa", "cgpa", "CGPA"]),
    result: findVal(["Result", "result", "status"]),
    class_division: findVal(["Class", "class_division", "division"]),
    years: []
  };

  const yearMap: Record<string, any> = {};

  // Iterating through semesters 1 to 8 as seen in the CSV header
  for (let s = 1; s <= 8; s++) {
    const semPrefix = `Sem${s}_`;
    const yearName = data[`${semPrefix}Year`] || data[`${semPrefix}year`];
    const semName = data[`${semPrefix}Name`] || data[`${semPrefix}name`];

    if (!yearName || !semName) continue;

    if (!yearMap[yearName]) {
      yearMap[yearName] = {
        year: yearName,
        semesters: []
      };
    }

    const semester: any = {
      semester: String(semName),
      gpa: String(data[`${semPrefix}GPA`] || data[`${semPrefix}gpa`] || "0.00"),
      cgpa: String(data[`${semPrefix}CGPA`] || data[`${semPrefix}cgpa`] || "0.00"),
      courses: []
    };

    // Extracting courses (C1 to C15 to be safe, CSV had at least 11 in Sem6)
    for (let c = 1; c <= 15; c++) {
      const courseCode = data[`${semPrefix}C${c}_Code`] || data[`${semPrefix}C${c}_code`] || data[`${semPrefix}c${c}_code`];
      const courseName = data[`${semPrefix}C${c}_Name`] || data[`${semPrefix}C${c}_name`] || data[`${semPrefix}c${c}_name`];
      const creditPoints = data[`${semPrefix}C${c}_Credit_Points`] || data[`${semPrefix}C${c}_credit_points`] || data[`${semPrefix}c${c}_credit_points`];

      if (!courseCode && !courseName) continue;

      semester.courses.push({
        course_number: String(courseCode || ""),
        title: String(courseName || ""),
        credit_points: cleanCreditPoints(creditPoints || "")
      });
    }

    yearMap[yearName].semesters.push(semester);
  }

  payload.years = Object.values(yearMap);
  return payload;
}
