
/**
 * Maps a flat CSV record to a structured Transcript JSON payload.
 * Matches the requested canonical structure for blockchain hashing.
 */
export function mapTranscriptPayload(data: any): any {
  // If the data is already structured properly from the OCR JSON response,
  // we MUST mathematically reconstruct it key-by-key to force deterministic ordering for the hashing engine.
  if (data.years && Array.isArray(data.years) && data.years.length > 0) {
    return {
      registration_no: data.registration_no || data.Registration_No || "",
      name: data.name || data.Student_Name || "",
      degree: data.degree || data.Degree || "",
      admission_year: data.admission_year || "",
      completion_year: data.completion_year || "",
      ogpa: String(data.ogpa || data.Overall_GPA || ""),
      result: String(data.result || ""),
      class_division: String(data.class_division || ""),
      years: data.years.map((y: any) => ({
        year: String(y.year || ""),
        semesters: (y.semesters || []).map((s: any) => ({
          semester: String(s.semester || ""),
          gpa: String(s.gpa || "0.00"),
          cgpa: String(s.cgpa || "0.00"),
          courses: (s.courses || []).map((c: any) => ({
            course_number: String(c.course_number || ""),
            title: String(c.title || ""),
            credit_points: String(c.credit_points || "")
          }))
        }))
      }))
    };
  }
  const findVal = (patterns: string[]) => {
    for (const p of patterns) {
      const match = Object.keys(data).find(k => k.trim().toLowerCase() === p.toLowerCase());
      if (match) return data[match];
    }
    return "";
  };

  const payload: any = {
    registration_no: findVal(["Registration_No", "registration_no", "Reg No"]),
    name: findVal(["Student_Name", "name", "Student Name"]),
    degree: findVal(["Degree", "degree"]),
    admission_year: findVal(["Admission_Year", "admission_year"]),
    completion_year: findVal(["Completion_Year", "completion_year"]),
    ogpa: findVal(["Overall_GPA", "ogpa", "OGPA"]),
    result: findVal(["Result", "result"]),
    class_division: findVal(["Class", "class_division"]),
    years: []
  };

  const yearMap: Record<string, any> = {};

  // Iterating through semesters 1 to 8 as seen in the CSV header
  for (let s = 1; s <= 8; s++) {
    const semPrefix = `Sem${s}_`;
    const yearName = data[`${semPrefix}Year`];
    const semName = data[`${semPrefix}Name`];

    if (!yearName || !semName) continue;

    if (!yearMap[yearName]) {
      yearMap[yearName] = {
        year: yearName,
        semesters: []
      };
    }

    const semester: any = {
      semester: String(semName),
      gpa: String(data[`${semPrefix}GPA`] || "0.00"),
      cgpa: String(data[`${semPrefix}CGPA`] || "0.00"),
      courses: []
    };

    // Extracting courses (C1 to C15 to be safe, CSV had at least 11 in Sem6)
    for (let c = 1; c <= 15; c++) {
      const courseCode = data[`${semPrefix}C${c}_Code`];
      const courseName = data[`${semPrefix}C${c}_Name`];
      const creditPoints = data[`${semPrefix}C${c}_Credit_Points`];

      if (!courseCode && !courseName) continue;

      semester.courses.push({
        course_number: String(courseCode || ""),
        title: String(courseName || ""),
        credit_points: String(creditPoints || "")
      });
    }

    yearMap[yearName].semesters.push(semester);
  }

  payload.years = Object.values(yearMap);
  return payload;
}
