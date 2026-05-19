import { NextResponse } from "next/server";

export async function GET() {
  const url = process.env.OCR_BACKEND_URL || process.env.BASE_URL || "https://final-ocr.onrender.com";
  // Clean up any quotes or trailing slashes
  const cleanUrl = url.trim().replace(/['"]/g, "").replace(/\/$/, "");
  return NextResponse.json({ url: cleanUrl });
}
