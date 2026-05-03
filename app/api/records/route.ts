import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { mapStudentMetadata } from "@/lib/marksheet";
import { mapCertificatePayload } from "@/lib/certificate";
import { generateStudentHash } from "@/lib/hash";
import { auth } from "@/auth";

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type");

    console.log("Fetching records for user role:", session.user.role, "Institution ID:", session.user.institutionId);

    const where: any = {};
    
    if (session.user.role !== "SUPER_ADMIN") {
      if (session.user.institutionId) {
        where.institutionId = session.user.institutionId;
      } else {
        return NextResponse.json([]);
      }
    }

    if (type) {
      where.type = type;
    }

    const records = await (prisma as any).studentRecord.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: { anchor: true },
      take: 1000 
    });

    return NextResponse.json(records);
  } catch (error: any) {
    console.error("API Error [GET /api/records]:", error);
    return NextResponse.json({ 
      error: "Failed to fetch records", 
      message: error?.message 
    }, { status: 500 });
  }
}




export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { students, type = "marksheet" } = await req.json();

    if (!Array.isArray(students)) {
      return NextResponse.json({ error: "Invalid data format" }, { status: 400 });
    }

    const defaultStrategy = {
      includeName: true,
      includeRegNo: true,
      includeGPA: true,
      includeSubjects: true
    };

    const recordsToCreate = students.map((s: any) => {
      const meta = mapStudentMetadata(s);
      
      let dataToStore = s;
      if (type === "certificate") {
        dataToStore = mapCertificatePayload(s);
      }

      const ingestionHash = s.hash || s.keccak256_hash || generateStudentHash(s, defaultStrategy, type);
      dataToStore.merkle_leaf = ingestionHash;

      return {
        registrationNo: meta.regNo,
        name: meta.name,
        gpa: meta.gpa,
        data: dataToStore,
        keccak256Hash: ingestionHash,
        merkleLeaf: ingestionHash,
        type: type,
        institutionId: session.user.institutionId
      };
    });

    const result = await (prisma as any).studentRecord.createMany({
      data: recordsToCreate,
      skipDuplicates: true,
    });

    return NextResponse.json({ 
      message: `Successfully synced ${result.count} new records`,
      count: result.count 
    });
  } catch (error: any) {
    console.error("Critical Sync error:", error);
    return NextResponse.json({ 
      error: "Failed to sync records", 
      details: error?.message || "Internal Database Error" 
    }, { status: 500 });
  }
}

