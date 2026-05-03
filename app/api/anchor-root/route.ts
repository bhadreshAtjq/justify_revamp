import { NextResponse } from "next/server";
import { anchorMerkleRoot } from "@/lib/blockchain";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const root = searchParams.get("root");

    if (!root) return NextResponse.json({ error: "Root required" }, { status: 400 });

    const anchor = await (prisma as any).merkleAnchor.findUnique({
      where: { merkleRoot: root }
    });

    return NextResponse.json({ exists: !!anchor, anchor });
  } catch (error) {
    return NextResponse.json({ error: "Check failed" }, { status: 500 });
  }
}


export async function POST(req: Request) {
  try {
    const session = await auth();
    const { merkleRoot, university, year, leaves } = await req.json();

    if (!merkleRoot) {
      return NextResponse.json({ error: "Merkle root is required" }, { status: 400 });
    }

    // 0. Check for existing anchored root
    const existing = await (prisma as any).merkleAnchor.findUnique({
      where: { merkleRoot }
    });

    if (existing && existing.status === "confirmed") {
      return NextResponse.json({ 
        error: "Merkle Root already anchored", 
        details: `This batch was already submitted on ${new Date(existing.createdAt).toLocaleDateString()}`,
        txHash: existing.txHash 
      }, { status: 409 });
    }


    // 1. Anchor to Blockchain
    const blockchainResult = await anchorMerkleRoot(merkleRoot);

    const institutionId = session?.user?.institutionId;

    // 2. Log to Database
    const anchor = await (prisma as any).merkleAnchor.upsert({
      where: { merkleRoot },
      update: {
        txHash: blockchainResult.txHash,
        status: "confirmed",
        university,
        year,
        institutionId
      },
      create: {
        merkleRoot,
        txHash: blockchainResult.txHash,
        university,
        year,
        status: "confirmed",
        institutionId
      }
    });

    // 3. Link records to this anchor (ensure we only link records within our institution if not Super Admin)
    if (Array.isArray(leaves) && leaves.length > 0) {
      const updateWhere: any = { keccak256Hash: { in: leaves } };
      if (session?.user?.role !== "SUPER_ADMIN") {
        updateWhere.institutionId = institutionId;
      }

      await (prisma as any).studentRecord.updateMany({
        where: updateWhere,
        data: { anchorId: anchor.id }
      });
    }

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
