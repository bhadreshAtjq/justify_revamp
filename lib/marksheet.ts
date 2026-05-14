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
      .reduce((acc: Subject[], k) => {
        const current = discovered[k];
        const hasData = current.code || current.title || current.credits || current.grade;
        if (!hasData) return acc;

        const creditsNum = parseFloat(current.credits || "0");
        const gradeNum = parseFloat(current.grade || "0");
        let cpValue = current.credit_points;
        
        if (!cpValue || cpValue === "0" || parseFloat(cpValue) === 0) {
          const calculated = creditsNum * gradeNum;
          cpValue = isNaN(calculated) ? "---" : calculated.toFixed(1);
        }

        const subject: Subject = {
          code: current.code || "",
          title: current.title || current.name || "",
          credits: current.credits || "---",
          grade: current.grade || current.points || "---",
          credit_points: (cpValue === "NaN" || !cpValue) ? "---" : cpValue,
          category: current.category || "ALLIED"
        };

        if (subject.code !== "" || subject.title !== "") {
          acc.push(subject);
        }
        
        return acc;
      }, []);
  }
  return list;
}

export function mapStudentMetadata(data: any) {
  const findVal = (patterns: string[]) => {
    // 1. Try structured data keys first
    for (const p of patterns) {
      const match = Object.keys(data).find(k => {
        const tk = k.trim().toLowerCase().replace(/[\s_.]/g, '');
        const tp = p.toLowerCase().replace(/[\s_.]/g, '');
        return tk === tp || tk.includes(tp);
      });
      if (match && data[match] && String(data[match]).trim() !== "" && String(data[match]).trim().toLowerCase() !== "n/a") return data[match];
    }

    // 2. Fallback to regex extraction from raw_text if present
    const rawText = data.raw_text || data.__raw_text;
    if (rawText) {
      const allLabels = ["Faculty", "Academic year", "Degree Course", "Semester", "Major Subject", "Examination held in", "Minor Subject", "Name of College", "Name of Polytechnic", "Registration No", "Reg No", "Full Name", "Student Name", "Name"];
      
      for (const p of patterns) {
        const escapedP = p.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const regex = new RegExp(`${escapedP}\\s*[:\\t\\s-]+\\s*([^\\n\\t\\r|]+)`, 'i');
        const match = rawText.match(regex);
        
        if (match && match[1]) {
          let val = match[1].trim();
          
          // Truncate if we hit another known label
          for (const label of allLabels) {
            // Don't truncate by the label we are currently looking for
            if (label.toLowerCase() === p.toLowerCase()) continue;
            
            const labelRegex = new RegExp(`\\s+${label.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*:`, 'i');
            const labelMatch = val.match(labelRegex);
            if (labelMatch) {
              val = val.substring(0, labelMatch.index).trim();
            }
          }

          // Truncate by other common separators
          const nextLabelIndex = val.search(/[:\t]| {3,}/);
          if (nextLabelIndex !== -1) {
            val = val.substring(0, nextLabelIndex).trim();
          }
          
          if (val && val.length < 100 && val.toLowerCase() !== "semester") return val;
        }
      }
    }

    return null;
  };

  return {
    regNo: findVal(["Registration No", "Reg No", "RegistrationNumber", "registration_no", "reg_no", "student_id", "Registration No."]) || "N/A",
    name: findVal(["Student Name", "Name", "Full Name", "student_name", "full_name"]) || "Unknown Student",
    gpa: findVal(["GPA", "OGPA", "CGPA", "Grade Point Average", "gpa", "ogpa"]) || "0.00",
    faculty: findVal(["Faculty", "faculty", "Department"]) || "Academic Affairs",
    academicYear: findVal(["Academic Year", "academic_year", "Year", "Session"]) || "2017-2018",
    degree: findVal(["Degree Course", "Degree_Course", "degree_course", "Degree", "Program", "Course"]) || "N/A",
    semester: findVal(["Semester", "semester", "Term"]) || "N/A",
    major: findVal(["Major Subject", "Major_Subject", "major_subject", "Major", "Branch", "Specialization"]) || "N/A",
    minor: findVal(["Minor Subject", "Minor_Subject", "minor_subject", "Minor"]) || "N/A",
    college: findVal(["Name of Polytechnic", "Name of College", "College", "college_name", "University", "Institution"]) || "JustifAI Network",
    examination: findVal(["Examination held in", "Examination Held In", "examination_held_in", "Examination", "Exam Session"]) || "N/A",
  };
}
