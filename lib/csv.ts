/**
 * Parse a CSV string into an array of records.
 * Dynamically determines headers from the first row.
 */
export function parseCSV(csvText: string): {
  headers: string[];
  records: Record<string, string>[];
} {
  const lines = csvText.trim().split("\n");

  if (lines.length < 2) {
    throw new Error("CSV must have at least a header row and one data row");
  }

  const headers = parseLine(lines[0]);
  const uniqueHeaders: string[] = [];
  const headerCounts: Record<string, number> = {};

  headers.forEach(h => {
    const clean = h.trim();
    if (headerCounts[clean] === undefined) {
      headerCounts[clean] = 0;
      uniqueHeaders.push(clean);
    } else {
      headerCounts[clean]++;
      uniqueHeaders.push(`${clean}_${headerCounts[clean]}`);
    }
  });

  const records: Record<string, string>[] = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    const values = parseLine(line);
    const record: Record<string, string> = {};

    uniqueHeaders.forEach((header, index) => {
      record[header] = values[index]?.trim() || "";
    });

    records.push(record);
  }

  return { headers: uniqueHeaders, records };

}

/**
 * Parse a single CSV line, handling quoted fields
 */
function parseLine(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === "," && !inQuotes) {
      result.push(current.trim());
      current = "";
    } else {
      current += char;
    }
  }

  result.push(current.trim());
  return result;
}

/**
 * Validate that CSV contains required columns for hash generation
 */
/**
 * Validate that CSV contains required columns for hash generation
 */
export function validateCSVForHashing(headers: string[], type: string = "marksheet"): {
  valid: boolean;
  missing: string[];
  error?: string;
} {
  const normalizedHeaders = headers.map((h) => h.toLowerCase().replace(/[\s.]+/g, "_"));
  const missing: string[] = [];

  if (type === "certificate") {
    const required = [
      { key: "Student Name", aliases: ["name", "student_name", "full_name", "student_name"] },
      { key: "Certificate/Registration No", aliases: ["certificate_no", "cert_no", "no", "reg_no", "registration_no", "serial_no"] },
      { key: "Degree/Course", aliases: ["degree", "course", "program"] },
      { key: "Year", aliases: ["year", "academic_year", "completion_year", "session"] }
    ];

    for (const req of required) {
      const found = req.aliases.some(alias => normalizedHeaders.includes(alias.toLowerCase()));
      if (!found) missing.push(req.key);
    }

    if (missing.length > 0) return { valid: false, missing };
    
    // Check if it's accidentally a marksheet (has GPA and Subject columns)
    const hasGPA = ["gpa", "ogpa", "cgpa"].some(a => normalizedHeaders.includes(a));
    const hasSubject = headers.some(h => /(?:Subject|Course|Sub|Row|S)[\s_]?\d+/i.test(h));
    const hasSemData = headers.some(h => /^sem\d+_/i.test(h));
    
    if (hasGPA && hasSubject) {
      return { valid: false, missing: [], error: "This looks like a Marksheet CSV. Please select 'Marksheet' type above." };
    }
    if (hasSemData) {
      return { valid: false, missing: [], error: "This looks like a Transcript CSV. Please select 'Transcript' type above." };
    }

    return { valid: true, missing: [] };
  } 

  if (type === "transcript") {
    // Transcripts MUST have Semester-prefixed columns
    const hasSemData = headers.some(h => /^sem\d+_/i.test(h));
    if (!hasSemData) {
      return { valid: false, missing: ["Semester Columns (Sem1_Year, etc.)"], error: "Missing transcript-specific columns (e.g., Sem1_Year, Sem1_C1_Code). This does not appear to be a Transcript CSV." };
    }

    const required = [
      { key: "Registration No", aliases: ["registration_no", "registrationno", "reg_no", "registration_no"] },
      { key: "Student Name", aliases: ["name", "student_name", "full_name"] },
      { key: "Degree", aliases: ["degree", "program"] }
    ];

    for (const req of required) {
      const found = req.aliases.some(alias => normalizedHeaders.includes(alias.toLowerCase()));
      if (!found) missing.push(req.key);
    }

    return { valid: missing.length === 0, missing };
  }

  // Default: Marksheet
  const required = [
    { key: "Registration No", aliases: ["registration_no", "registrationno", "reg_no"] },
    { key: "Student Name", aliases: ["name", "student_name", "full_name"] },
    { key: "GPA/OGPA", aliases: ["gpa", "ogpa", "cgpa"] }
  ];

  for (const req of required) {
    const found = req.aliases.some(alias => normalizedHeaders.includes(alias.toLowerCase()));
    if (!found) missing.push(req.key);
  }

  // Marksheets MUST have indexed columns (Subject 1, Course 1, etc.)
  const hasIndexedColumns = headers.some(h => /(?:Subject|Course|Sub|Row|S)[\s_]?\d+/i.test(h));
  if (!hasIndexedColumns && missing.length === 0) {
    return { valid: false, missing: ["Subject/Course Columns"], error: "Marksheet CSVs must contain indexed columns like 'Subject 1 Name', 'Subject 1 Grade', etc." };
  }

  // Check if it's accidentally a transcript
  const isTranscript = headers.some(h => /^sem\d+_/i.test(h));
  if (isTranscript) {
    return { valid: false, missing: [], error: "This looks like a Transcript CSV. Please select 'Transcript' type above." };
  }

  return { valid: missing.length === 0, missing };
}

