import { NextResponse } from "next/server";

const OCR_SERVERS = [
  process.env.OCR_BACKEND_URL,
  process.env.BASE_URL,
  process.env.BASE_URL_1,
  process.env.BASE_URL_2,
  process.env.BASE_URL_3
].filter(Boolean).map(url => url!.trim().replace(/['\"]/g, "")) as string[];

/**
 * GET /api/ocr-job/[jobId]
 * Proxies the job status poll to the Python backend.
 */
export async function GET(
  req: Request,
  context: { params: Promise<{ jobId: string }> }
) {
  const { jobId } = await context.params;

  for (const baseUrl of OCR_SERVERS) {
    const sanitizedBaseUrl = baseUrl.replace(/\/$/, "");
    const url = `${sanitizedBaseUrl}/api/v1/job/${jobId}`;

    try {
      const response = await fetch(url, { method: "GET" });

      if (response.ok) {
        const data = await response.json();
        return NextResponse.json(data);
      }

      if (response.status === 404) {
        return NextResponse.json({ error: `Job '${jobId}' not found.` }, { status: 404 });
      }
    } catch (err: any) {
      console.error(`Failed to reach OCR server ${sanitizedBaseUrl}:`, err.message);
    }
  }

  return NextResponse.json(
    { error: "All OCR servers unavailable." },
    { status: 502 }
  );
}
