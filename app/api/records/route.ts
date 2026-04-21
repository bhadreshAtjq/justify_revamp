import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { mapStudentMetadata } from "@/lib/marksheet";
import { generateStudentHash } from "@/lib/hash";

/**
 * Handle fetching all saved records or syncing new ones from CSV.
 */

export async function GET() {
  try {
    const records = await prisma.studentRecord.findMany({
      orderBy: { createdAt: 'desc' },
      take: 1000 
    });
    return NextResponse.json(records);
  } catch (error) {
    console.error("Fetch records error:", error);
    return NextResponse.json({ error: "Failed to fetch records" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { students, type = "marksheet" } = await req.json();

    if (!Array.isArray(students)) {
      return NextResponse.json({ error: "Invalid data format" }, { status: 400 });
    }

    // Default strategy for ingestion
    const defaultStrategy = {
      includeName: true,
      includeRegNo: true,
      includeGPA: true,
      includeSubjects: true
    };

    // Process in batches for performance
    const recordsToCreate = students.map((s: any) => {
      const meta = mapStudentMetadata(s);
      
      // Use the standard strategy to generate the Merkle Leaf
      const ingestionHash = s.hash || s.keccak256_hash || generateStudentHash(s, defaultStrategy, type);

      // Add leaf to JSON data for self-contained auditability
      s.merkle_leaf = ingestionHash;

      return {
        registrationNo: meta.regNo,
        name: meta.name,
        gpa: meta.gpa,
        data: s,
        keccak256Hash: ingestionHash,
        merkleLeaf: ingestionHash // Store as top-level column for indexing
      };
    });

    const result = await prisma.studentRecord.createMany({
      data: recordsToCreate,
      skipDuplicates: true,
    });

    return NextResponse.json({ 
      message: `Successfully synced ${result.count} new records`,
      count: result.count 
    });
  } catch (error: any) {
    console.error("CRITICAL: Sync records error ->", error);
    return NextResponse.json({ 
      error: "Failed to sync records", 
      details: error?.message || "Internal Database Error" 
    }, { status: 500 });
  }
}
