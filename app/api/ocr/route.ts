import { NextResponse } from "next/server";

const BASE_URL = "https://final-ocr.onrender.com";

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

      // Fallback: Return empty structure with error flag so UI can handle it gracefully
      if (type === "certificate") {
        return NextResponse.json({
          error: "OCR Service Unavailable",
          certificate_no: "",
          no: "",
          name: "",
          degree: "",
          branch: "",
          ogpa: "",
          year: "",
          date: "",
          class_division: ""
        });
      } else if (type === "transcript") {
        return NextResponse.json({
          error: "OCR Service Unavailable",
          registration_no: "",
          name: "",
          degree: "",
          admission_year: "",
          completion_year: "",
          ogpa: "",
          result: "",
          class_division: "",
          years: []
        });
      } else {
        return NextResponse.json({
          error: "OCR Service Unavailable",
          registration_no: "",
          name: "",
          gpa: "",
          subjects: []
        });
      }
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
