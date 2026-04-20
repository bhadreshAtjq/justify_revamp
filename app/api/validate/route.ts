import { NextResponse } from "next/server";

const VALIDATE_SERVER_URL = process.env.VALIDATE_SERVER_URL || "https://final-ocr.onrender.com/api/v1/validate";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file");

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const bytes = await (file as any).arrayBuffer();
    const contentType = (file as any).type;
    const fileName = (file as any).name;

    const validateFormData = new FormData();
    validateFormData.append("file", new Blob([bytes], { type: contentType }), fileName);

    const response = await fetch(VALIDATE_SERVER_URL, {
      method: "POST",
      body: validateFormData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Validation Server Error:", errorText);
      return NextResponse.json(
        { error: "Validation Server failed", details: errorText },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error("Validation API Route Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error in Validation proxy", details: error?.message },
      { status: 500 }
    );
  }
}
