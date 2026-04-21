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
  credit_points: string;
  // Optional legacy fields
  credits?: string;
  grade?: string;
}

export interface OCRResponse {
  name: string;
  registration_no: string;
  gpa: string;
  keccak256_hash?: string;
  subjects: OCRSubject[];
}

export interface QualityResponse {
  is_valid: boolean;
  score?: number;
  details?: any;
  message?: string;
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
  year: string,
  leaves: string[]
): Promise<AnchorResponse> {
  const response = await fetch(`${API_BASE}/api/anchor-root`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ merkleRoot, university, year, leaves }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.details || errorData.error || `Anchor failed: ${response.statusText}`);
  }

  return await response.json();
}

/**
 * Process document image/PDF through OCR based on document type.
 */
export async function processOCR(file: File, type: string = "marksheet"): Promise<OCRResponse> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("type", type);

  const response = await fetch(`${API_BASE}/api/ocr`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => "Unknown error");
    throw new Error(`OCR failed: ${errorText}`);
  }

  const data = await response.json();
  return data as OCRResponse;
}

/**
 * Validate document quality before OCR
 */
export async function validateQuality(file: File): Promise<QualityResponse> {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(`${API_BASE}/api/validate`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => "Unknown error");
    throw new Error(`Quality Validation failed: ${errorText}`);
  }

  return await response.json();
}

/**
 * Verify a document hash against the blockchain
 */
export async function verifyDocument(docHash: string): Promise<VerifyResponse> {
  const response = await fetch(`${API_BASE}/api/verify`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ docHash }),
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => "Unknown error");
    throw new Error(`Verification failed: ${errorText}`);
  }

  return await response.json();
}

/**
 * Sync student records to DB
 */
export async function syncRecordsToDB(students: any[], type: string = "marksheet"): Promise<{ count: number }> {
  const response = await fetch(`${API_BASE}/api/records`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ students, type }),
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

