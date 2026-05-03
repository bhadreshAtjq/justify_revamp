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
} {
  const normalizedHeaders = headers.map((h) => h.toLowerCase().replace(/\s+/g, "_"));

  let requiredMappings: { key: string; aliases: string[] }[] = [];

  if (type === "certificate") {
    requiredMappings = [
      { key: "name", aliases: ["name", "student_name", "full_name"] }
    ];
    // Check for either certificate_no OR registration_no
    const idAliases = ["certificate_no", "cert_no", "no", "reg_no", "registration_no", "serial_no", "certificate_no"];
    const hasID = idAliases.some(alias => normalizedHeaders.includes(alias.toLowerCase()));
    
    const missing: string[] = [];
    if (!hasID) missing.push("certificate_no/registration_no");
    
    for (const req of requiredMappings) {
      const found = req.aliases.some((alias) => normalizedHeaders.includes(alias));
      if (!found) missing.push(req.key);
    }
    return { valid: missing.length === 0, missing };
  } 

  // For Transcripts and Marksheets
  requiredMappings = [
    { key: "registration_no", aliases: ["registration_no", "registrationno", "reg_no"] },
    { key: "name", aliases: ["name", "student_name", "full_name"] },
  ];

  const missing: string[] = [];

  for (const req of requiredMappings) {
    const found = req.aliases.some((alias) => normalizedHeaders.includes(alias));
    if (!found) {
      missing.push(req.key);
    }
  }

  return { valid: missing.length === 0, missing };
}

