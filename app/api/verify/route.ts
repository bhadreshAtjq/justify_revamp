import { NextResponse } from "next/server";
import { verifyOnChain } from "@/lib/blockchain";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { docHash } = await req.json();

    if (!docHash) {
      return NextResponse.json({ error: "Document hash is required" }, { status: 400 });
    }

    // 1. Initial on-chain check for the Leaf itself
    let onChainResult: any = await verifyOnChain(docHash);

    // 2. Fallback check for Merkle Root if DB link exists (internal optimization)
    const dbRecord = await prisma.studentRecord.findUnique({
      where: { keccak256Hash: docHash },
      include: { anchor: true }
    });

    if (!onChainResult.anchored && dbRecord?.anchor?.merkleRoot) {
      const rootResult = await verifyOnChain(dbRecord.anchor.merkleRoot);
      if (rootResult.anchored) {
        onChainResult = { ...rootResult, inherited: true };
      }
    }

    return NextResponse.json({
      hash: docHash,
      onChain: onChainResult,
      // Still return meta for UI display if found, but label it as "Registry Info"
      db: dbRecord ? {
        found: true,
        name: dbRecord.name,
        registrationNo: dbRecord.registrationNo,
        gpa: dbRecord.gpa
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

