import { NextResponse } from "next/server";

const BASE_URL = process.env.OCR_BACKEND_URL || "http://localhost:8000";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file");
    const type = formData.get("type") || "marksheet";
    //this is in the form-data form as the file 

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    let OCR_SERVER_URL = `${BASE_URL}/api/v1/marksheet_data_extraction`;
    if (type === "certificate") OCR_SERVER_URL = `${BASE_URL}/api/v1/certificate`;
    if (type === "transcript") OCR_SERVER_URL = `${BASE_URL}/api/v1/transcript`;
    if (type === "bulk") OCR_SERVER_URL = `${BASE_URL}/api/v1/bulk_process_zip`;

    // Ensure the file is correctly forwarded as a Blob to the Python server
    const bytes = await (file as any).arrayBuffer();
    const contentType = (file as any).type;
    const fileName = (file as any).name;

    const ocrFormData = new FormData();
    ocrFormData.append("file", new Blob([bytes], { type: contentType }), fileName);

    const response = await fetch(OCR_SERVER_URL, {
      method: "POST",
      body: ocrFormData,
    }).catch(err => {
      console.error("Fetch to OCR server failed:", err);
      return null;
    });

    if (!response || !response.ok) {
      const errorText = response ? await response.text() : "No response from Render";
      console.error("OCR Server Error:", errorText);

      // Parse error message from OCR server if available
      let errorMessage = "OCR Service Unavailable";
      try {
        const errorJson = JSON.parse(errorText);
        if (errorJson.detail) {
          errorMessage = errorJson.detail;
        }
      } catch {
        // If not JSON, use raw error text
        if (errorText && errorText !== "No response from Render") {
          errorMessage = errorText;
        }
      }

      return NextResponse.json({ error: errorMessage }, { status: 400 });
    }

    const data = await response.json();
    console.log("OCR Response Data:", JSON.stringify(data, null, 2));
    return NextResponse.json(data);
  } catch (error: any) {
    console.error("OCR API Route Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error in OCR proxy", details: error?.message },
      { status: 500 }
    );
  }
}
