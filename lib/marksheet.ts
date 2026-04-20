export interface Subject {
  code: string;
  title: string;

  credit_points?: string;
}

export function discoverSubjects(data: any): Subject[] {
  let list: Subject[] = typeof data.subjects === 'string'
    ? (data.subjects.trim().startsWith('[') ? JSON.parse(data.subjects) : [])
    : data.subjects || [];

  if (list.length === 0) {
    const discovered: Record<string, Partial<Subject>> = {};
    Object.keys(data).forEach(key => {
      const trimmedKey = key.trim();
      // Match patterns like Course_1_Code, Course_1_Credit_Points, Course_1_Grade_Points
      const match = trimmedKey.match(/(Subject|Course|Sub)[\s_]?(\d+)[\s_]?(Credits_Points|Credit_Points|Grade_Points|Code|Title|Name|Number|Credits|Grade|Points)/i);
      if (match) {
        const index = match[2];
        const type = match[3].toLowerCase();

        if (!discovered[index]) discovered[index] = {};

        const val = String(data[key] || "").trim();
        if (type === 'code' || type === 'number') discovered[index].code = val;
        if (type === 'title' || type === 'name') discovered[index].title = val;

        if (type === 'credit_points' || type === 'credits_points') discovered[index].credit_points = val;


      }
    });

    list = Object.keys(discovered)
      .sort((a, b) => parseInt(a) - parseInt(b))
      .map(k => ({
        code: discovered[k].code || "N/A",
        title: discovered[k].title || "Unknown Subject",

        credit_points: discovered[k].credit_points || "-"
      }))
      .filter(s => s.code !== "N/A" || s.title !== "Unknown Subject");
  }
  return list;
}

export function mapStudentMetadata(data: any) {
  const findVal = (patterns: string[]) => {
    for (const p of patterns) {
      const match = Object.keys(data).find(k => k.trim().toLowerCase() === p.toLowerCase());
      if (match) return data[match];
    }
    return null;
  };

  const nameVal = String(findVal(["Student Name", "Full Name", "Student_Name", "name"]) || "N/A");

  return {
    regNo: findVal(["Registration No", "Registration No.", "reg_no", "registration_no"]) || "N/A",
    name: nameVal,
    gpa: findVal(["GPA", "G.P.A", "gpa"]) || "0.00",
    // Additional fields used by the PDF marksheet preview (NOT used in hash generation)
    faculty: findVal(["Faculty", "faculty"]) || "POST-GRADUATE STUDIES",
    academicYear: findVal(["Academic Year", "Academic_Year"]) || "2017-2018",
    degree: findVal(["Degree Course", "degree", "Degree_Course"]) || "M.B.A. (AB)",
    semester: findVal(["Semester", "semester"]) || "THIRD",
    major: findVal(["Major Subject", "major", "Major_Subject"]) || "AGRI BUSINESS MANAGEMENT",
    minor: findVal(["Minor Subject", "minor", "Minor_Subject"]) || "AGRI BUSINESS MANAGEMENT",
    college: findVal(["College", "Name of College", "college"]) || "P.G. INSTITUTE OF AGRI - BUSINESS MANAGEMENT, JAU, JUNAGADH",
    examination: findVal(["Examination Held In", "Examination_held_in", "examination"]) || "Dec.2017-Jan.2018",
  };
}
