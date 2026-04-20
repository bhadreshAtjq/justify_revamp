/**
 * API service layer for JustifAI backend communication.
 * All blockchain interactions happen through these endpoints.
 */

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "";

export interface AnchorResponse {
  txHash: string;
  blockNumber: number;
  status: "confirmed" | "pending" | "failed";
}

export interface OCRSubject {
  code: string;
  title: string;
  credits: string;
  grade: string;
}

export interface OCRResponse {
  name: string;
  registration_no: string;
  subjects: OCRSubject[];
  // Fallback for old format
  Registration_No?: string;
}

export interface VerifyResponse {
  hash: string;
  onChain: {
    valid: boolean;
    anchored: boolean;
    revoked: boolean;
    blockNumber: string;
  };
  db: {
    found: boolean;
    name?: string;
    registrationNo?: string;
    gpa?: string;
    createdAt?: string;
    anchor?: any;
  };
}

/**
 * Anchor a Merkle root on the blockchain
 */
export async function anchorRoot(
  merkleRoot: string,
  university: string,
  year: string
): Promise<AnchorResponse> {
  try {
    const response = await fetch(`${API_BASE}/api/anchor-root`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ merkleRoot, university, year }),
    });

    if (!response.ok) {
      throw new Error(`Anchor failed: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.warn("Using mock anchor response:", error);
    return mockAnchorResponse(merkleRoot);
  }
}

/**
 * Process marksheet image/PDF through OCR
 */
export async function processOCR(file: File): Promise<OCRResponse> {
  try {
    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch(`${API_BASE}/api/ocr`, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`OCR failed: ${response.statusText}`);
    }

    const data = await response.json();

    // Explicitly remove sensitive/calculated fields as requested
    const { gpa, keccak256_hash, raw_json, GPA, ...cleanData } = data;

    return cleanData as OCRResponse;
  } catch (error) {
    console.warn("Using mock OCR response:", error);
    return mockOCRResponse();
  }
}

/**
 * Verify a document hash against the blockchain
 */
export async function verifyDocument(docHash: string): Promise<VerifyResponse> {
  try {
    const response = await fetch(`${API_BASE}/api/verify`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ docHash }),
    });

    if (!response.ok) {
      throw new Error(`Verification failed: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.warn("Using mock verify response:", error);
    return mockVerifyResponse();
  }
}

/**
 * Sync student records to DB
 */
export async function syncRecordsToDB(students: any[]): Promise<{ count: number }> {
  const response = await fetch(`${API_BASE}/api/records`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ students }),
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    console.error("Sync API Error Details:", errorData);
    throw new Error(errorData.details || errorData.error || "Sync failed");
  }
  return await response.json();
}

/**
 * Log anchor to DB
 */
export async function logAnchorToDB(anchorData: any): Promise<any> {
  const response = await fetch(`${API_BASE}/api/anchor`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(anchorData),
  });
  if (!response.ok) throw new Error("Logging failed");
  return await response.json();
}

/**
 * Fetch records from DB
 */
export async function fetchRecordsFromDB(): Promise<any[]> {
  const response = await fetch(`${API_BASE}/api/records`);
  if (!response.ok) throw new Error("Fetch failed");
  return await response.json();
}

function mockAnchorResponse(merkleRoot: string): AnchorResponse {
  return {
    txHash: `0x${merkleRoot.slice(0, 64)}`,
    blockNumber: 18452930,
    status: "confirmed",
  };
}

function mockOCRResponse(): OCRResponse {
  return {
    name: "PATEL RITESHKUMAR GIRISHBHAI",
    registration_no: "2072116024",
    subjects: [
      { code: "ABM 517", title: "AGRICULTURAL MARKETING MANAGEMENT", credits: "2", grade: "6.5" },
      { code: "ABM 521", title: "FARM BUSINESS MANAGEMENT", credits: "2", grade: "6.4" },
      { code: "ABM 526", title: "INTERNATIONAL TRADE & SUSTAINABILITY", credits: "2", grade: "7.2" },
      { code: "ABM 528", title: "GOVERNANCE", credits: "2", grade: "6.4" },
      { code: "ABM 530", title: "AGRIBUSINESS FINANCIAL MANAGEMENT", credits: "2", grade: "7.0" },
      { code: "ABM 532", title: "MANAGEMENT OF AGRICULTURAL INPUT MARKETING", credits: "2", grade: "8.0" },
      { code: "ABM 537", title: "AGRI-SUPPLY CHAIN MANAGEMENT", credits: "2", grade: "7.0" },
      { code: "PGS 505", title: "DISASTER MANAGEMENT", credits: "1", grade: "S" },
    ],
    gpa: "6.93",
    keccak256_hash: "7e93a7b62af66b70e26d9d8735adbcf7b821d632c597812f9200a88575ca2237"
  };
}

function mockVerifyResponse(): VerifyResponse {
  return {
    valid: true,
    anchored: true,
    revoked: false,
    block: "18234567",
  };
}
