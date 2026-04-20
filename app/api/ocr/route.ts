import { NextResponse } from "next/server";


const OCR_SERVER_URL = process.env.OCR_SERVER_URL || "http://localhost:8000/parse-marksheet";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file");

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Ensure the file is correctly forwarded as a Blob to the Python server
    const bytes = await (file as any).arrayBuffer();
    const contentType = (file as any).type;
    const fileName = (file as any).name;

    const ocrFormData = new FormData();
    ocrFormData.append("file", new Blob([bytes], { type: contentType }), fileName);

    const response = await fetch(OCR_SERVER_URL, {
      method: "POST",
      body: ocrFormData,
    });


    if (!response.ok) {
      const errorText = await response.text();
      console.error("OCR Server Error:", errorText);
      return NextResponse.json(
        { error: "OCR Server failed", details: errorText },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error("OCR API Route Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error in OCR proxy", details: error?.message },
      { status: 500 }
    );
  }
}
