import { NextResponse } from "next/server";
import { verifyOnChain } from "@/lib/blockchain";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { docHash } = await req.json();

    if (!docHash) {
      return NextResponse.json({ error: "Document hash is required" }, { status: 400 });
    }

    // 1. Check local Database
    const dbRecord = await prisma.studentRecord.findUnique({
      where: { keccak256Hash: docHash },
      include: { anchor: true }
    });

    // 2. Check Blockchain
    const onChainResult = await verifyOnChain(docHash);

    return NextResponse.json({
      hash: docHash,
      onChain: onChainResult,
      db: dbRecord ? {
        found: true,
        name: dbRecord.name,
        registrationNo: dbRecord.registrationNo,
        gpa: dbRecord.gpa,
        createdAt: dbRecord.createdAt,
        anchor: dbRecord.anchor
      } : { found: false }
    });
  } catch (error: any) {
    console.error("Verification error:", error);
    return NextResponse.json({ 
      error: "Verification failed", 
      details: error?.message 
    }, { status: 500 });
  }
}

