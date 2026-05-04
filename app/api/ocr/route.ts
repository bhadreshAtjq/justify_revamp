import { NextResponse } from "next/server";

// Get OCR server URLs from environment variables
const OCR_SERVERS = [
  process.env.BASE_URL,
  process.env.BASE_URL_1,
  process.env.BASE_URL_2,
  process.env.BASE_URL_3
].filter(Boolean).map(url => url!.trim().replace(/['"]/g, "")) as string[];

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file");
    const type = formData.get("type") || "marksheet";

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Ensure the file is correctly forwarded as a Blob to the Python server
    const bytes = await (file as any).arrayBuffer();
    const contentType = (file as any).type;
    const fileName = (file as any).name;

    let lastError: any = null;

    // Loop through available OCR servers for failover
    for (const baseUrl of OCR_SERVERS) {
      // Remove trailing slash if present to avoid double slashes
      const sanitizedBaseUrl = baseUrl.replace(/\/$/, "");
      
      let OCR_SERVER_URL = `${sanitizedBaseUrl}/api/v1/marksheet_data_extraction`;
      if (type === "certificate") OCR_SERVER_URL = `${sanitizedBaseUrl}/api/v1/certificate`;
      if (type === "transcript") OCR_SERVER_URL = `${sanitizedBaseUrl}/api/v1/transcript`;

      console.log(`Attempting OCR with server: ${OCR_SERVER_URL}`);

      try {
        const ocrFormData = new FormData();
        ocrFormData.append("file", new Blob([bytes], { type: contentType }), fileName);

        const response = await fetch(OCR_SERVER_URL, {
          method: "POST",
          body: ocrFormData,
        });

        if (response.ok) {
          const data = await response.json();
          console.log(`OCR Success with server: ${sanitizedBaseUrl}`);
          return NextResponse.json(data);
        } else {
          const errorText = await response.text();
          console.error(`OCR Server ${sanitizedBaseUrl} returned error:`, errorText);
          lastError = errorText;
          // Continue to next server
        }
      } catch (err: any) {
        console.error(`Failed to reach OCR server ${sanitizedBaseUrl}:`, err.message);
        lastError = err.message;
        // Continue to next server
      }
    }

    // If we reach here, all servers failed
    let errorMessage = "All OCR Services Unavailable";
    if (lastError) {
      try {
        const errorJson = JSON.parse(lastError);
        if (errorJson.detail) {
          errorMessage = errorJson.detail;
        }
      } catch {
        errorMessage = lastError;
      }
    }

    return NextResponse.json({ 
      error: "OCR extraction failed on all available servers", 
      details: errorMessage 
    }, { status: 502 });

  } catch (error: any) {
    console.error("OCR API Route Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error in OCR proxy", details: error?.message },
      { status: 500 }
    );
  }
}

