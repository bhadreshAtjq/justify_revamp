export interface Subject {
  code: string;
  title: string;
  credits: string;
  grade: string;
  credit_points?: string;
  category?: string;
}

export function discoverSubjects(data: any): Subject[] {
  let list: Subject[] = typeof data.subjects === 'string'
    ? (data.subjects.trim().startsWith('[') ? JSON.parse(data.subjects) : [])
    : data.subjects || [];

  if (list.length === 0) {
    const discovered: Record<string, any> = {};
    
    const globalBlacklist = [
      "registration", "regno", "studentname", "fullname", "name", "gpa", "ogpa", "cgpa", 
      "faculty", "academicyear", "year", "degree", "semester", "major", "minor", "college", 
      "institution", "examination", "total", "summary", "remarks", "status"
    ];

    Object.keys(data).forEach(key => {
      const k = key; // Use raw key for index extraction
      const lowerKey = k.toLowerCase().replace(/[\s_.]/g, '');
      
      // Extract numeric index or use trailing spaces as a fallback index
      const indexMatch = k.match(/(?:Subject|Course|Sub|Row|S)[\s_]?(\d+)/i) || 
                         k.match(/[\s_.]?(\d+)$/) ||
                         k.match(/(\s+)$/);
      
      const index = indexMatch ? (indexMatch[1] || String(indexMatch[0].length)) : "0";

      // Skip global metadata if NOT explicitly indexed (Subject 1 Name is ok, but Name is not)
      if (!indexMatch && globalBlacklist.some(term => lowerKey.includes(term))) return;

      if (!discovered[index]) discovered[index] = {};
      const val = String(data[key] || "").trim();
      const attrKey = k.toLowerCase();

      if (attrKey.includes('code') || attrKey.includes('number')) {
        discovered[index].code = val;
      } else if (attrKey.includes('title') || attrKey.includes('name')) {
        discovered[index].title = val;
      } else if (attrKey.includes('category')) {
        discovered[index].category = val;
      } else if (attrKey.includes('credit') && attrKey.includes('point')) {
        discovered[index].credit_points = val;
      } else if (attrKey.includes('grade') && attrKey.includes('point')) {
        discovered[index].grade = val;
      } else if (attrKey.includes('credit') || attrKey.includes('hour')) {
        discovered[index].credits = val;
      } else if (attrKey.includes('grade')) {
        discovered[index].grade = val;
      }
    });

    list = Object.keys(discovered)
      .sort((a, b) => parseInt(a) - parseInt(b))
      .map(k => {
        const current = discovered[k];
        const hasData = current.code || current.title || current.credits || current.grade;
        if (!hasData) return null;

        const creditsNum = parseFloat(current.credits || "0");
        const gradeNum = parseFloat(current.grade || "0");
        let cpValue = current.credit_points;
        
        if (!cpValue || cpValue === "0" || parseFloat(cpValue) === 0) {
          const calculated = creditsNum * gradeNum;
          cpValue = isNaN(calculated) ? "---" : calculated.toFixed(1);
        }

        return {
          code: current.code || "",
          title: current.title || current.name || "",
          credits: current.credits || "---",
          grade: current.grade || current.points || "---",
          credit_points: (cpValue === "NaN" || !cpValue) ? "---" : cpValue,
          category: current.category || "ALLIED"
        };
      })
      .filter((s): s is Subject => s !== null && (s.code !== "" || s.title !== ""));
  }
  return list;
}

export function mapStudentMetadata(data: any) {
  const findVal = (patterns: string[]) => {
    for (const p of patterns) {
      const match = Object.keys(data).find(k => {
        const tk = k.trim().toLowerCase().replace(/[\s_.]/g, '');
        const tp = p.toLowerCase().replace(/[\s_.]/g, '');
        return tk === tp || tk.includes(tp);
      });
      if (match) return data[match];
    }
    return null;
  };

  return {
    regNo: findVal(["Registration No", "Reg No", "RegistrationNumber", "registration_no", "reg_no", "student_id", "Registration No."]) || "N/A",
    name: findVal(["Student Name", "Name", "Full Name", "student_name", "full_name"]) || "Unknown Student",
    gpa: findVal(["GPA", "OGPA", "CGPA", "Grade Point Average", "gpa", "ogpa"]) || "0.00",
    faculty: findVal(["Faculty", "Department"]) || "Academic Affairs",
    academicYear: findVal(["Academic Year", "Year", "Session"]) || "2017-2018",
    degree: findVal(["Degree Course", "Degree_Course", "Degree", "Program", "Course"]) || "N/A",
    semester: findVal(["Semester", "Term"]) || "N/A",
    major: findVal(["Major Subject", "Major_Subject", "Major", "Branch", "Specialization"]) || "N/A",
    minor: findVal(["Minor Subject", "Minor_Subject", "Minor"]) || "N/A",
    college: findVal(["College", "Name of College", "University", "Institution"]) || "JustifAI Network",
    examination: findVal(["Examination held in", "Examination Held In", "Examination", "Exam Session"]) || "N/A",
  };
}
