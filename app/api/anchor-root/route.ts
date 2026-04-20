import { NextResponse } from "next/server";
import { anchorMerkleRoot } from "@/lib/blockchain";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { merkleRoot, university, year } = await req.json();

    if (!merkleRoot) {
      return NextResponse.json({ error: "Merkle root is required" }, { status: 400 });
    }

    // 1. Anchor to Blockchain
    const blockchainResult = await anchorMerkleRoot(merkleRoot);

    // 2. Log to Database
    const anchor = await prisma.merkleAnchor.upsert({
      where: { merkleRoot },
      update: {
        txHash: blockchainResult.txHash,
        status: "confirmed",
        university,
        year
      },
      create: {
        merkleRoot,
        txHash: blockchainResult.txHash,
        university,
        year,
        status: "confirmed"
      }
    });

    return NextResponse.json({
      ...anchor,
      blockNumber: blockchainResult.blockNumber
    });
  } catch (error: any) {
    console.error("Blockchain anchoring failed:", error);
    return NextResponse.json({ 
      error: "Anchoring failed", 
      details: error?.message || "Internal error" 
    }, { status: 500 });
  }
}
