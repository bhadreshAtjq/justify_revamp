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
  branch?: string;
  keccak256_hash?: string;
  subjects: OCRSubject[];
}

export interface QualityResponse {
  is_valid: boolean;
  score?: number;
  details?: any;
  message?: string;
}

export interface BulkProcessingResult {
  filename: string;
  doc_type: string;
  status: string;
  data?: any;
  raw_text?: string;
  ledger_hash?: string;
  error?: string;
}

export interface BulkProcessingResponse {
  total_files: number;
  processed_files: number;
  failed_files: number;
  results: BulkProcessingResult[];
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
    branch?: string;
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
  const response = await fetch(`/api/anchor-root`, {
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
 * Log Merkle Root construction to the backend terminal
 */
export async function logMerkle(root: string, leavesCount: number): Promise<void> {
  await fetch(`/api/log-merkle`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ root, leaves_count: leavesCount }),
  });
}

/**
 * Process document image/PDF through OCR based on document type.
 */
export async function processOCR(file: File, type: string = "marksheet"): Promise<OCRResponse> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("type", type);

  const response = await fetch(`/api/ocr`, {
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
 * Process bulk documents from a ZIP file (legacy — streaming mode).
 */
export async function processBulkOCR(file: File): Promise<Response> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("type", "bulk");

  const response = await fetch(`/api/ocr`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => "Unknown error");
    throw new Error(`Bulk OCR failed: ${errorText}`);
  }

  return response;
}

// ─────────────────────────────────────────────────────────────
// ASYNC JOB QUEUE  (production-grade, rate-limit-safe)
// ─────────────────────────────────────────────────────────────

export interface JobFile {
  status: "pending" | "processing" | "success" | "failed" | "error";
  doc_type: string | null;
  error: string | null;
  ledger_hash?: string;
}

export interface JobStatusResponse {
  job_id: string;
  status: "pending" | "running" | "done" | "failed";
  total: number;        // returned by GET /job/{id}
  completed: number;
  failed: number;
  created_at: string;
  updated_at: string;
  files: Record<string, JobFile>;
  results: BulkProcessingResult[];
  completed_parents?: number;
  total_parents?: number;
}

// Separate type for the 202 submit response (different shape from poll response)
export interface JobSubmitResponse {
  job_id: string;
  status: string;
  total_files: number;  // POST /bulk_process_zip_async returns total_files
  filenames: string[];
  message: string;
  poll_url: string;
}

/**
 * Submit a ZIP for async background processing.
 * Returns immediately with a job_id. No connection held open.
 */
export async function processBulkOCRAsync(file: File): Promise<JobSubmitResponse> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("type", "bulk_async");

  const response = await fetch(`/api/ocr`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => "Unknown error");
    throw new Error(`Bulk OCR (async) submission failed: ${errorText}`);
  }

  return await response.json() as JobSubmitResponse;
}

/**
 * Poll the job status endpoint for a given job_id.
 */
export async function pollJobStatus(jobId: string): Promise<JobStatusResponse> {
  const response = await fetch(`/api/ocr-job/${jobId}`);
  if (!response.ok) {
    throw new Error(`Job poll failed: ${response.status}`);
  }
  return await response.json() as JobStatusResponse;
}

/**
 * Validate document quality before OCR
 */
export async function validateQuality(file: File): Promise<QualityResponse> {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(`/api/validate`, {
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
  const response = await fetch(`/api/verify`, {
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
  const response = await fetch(`/api/records`, {
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
  const response = await fetch(`/api/anchor`, {
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
export async function fetchRecordsFromDB(type?: string): Promise<any[]> {
  const url = type ? `/api/records?type=${type}` : `/api/records`;
  const response = await fetch(url);
  if (!response.ok) throw new Error("Fetch failed");
  return await response.json();
}


