import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { merkleRoot, txHash, university, year } = await req.json();

    const anchor = await prisma.merkleAnchor.upsert({
      where: { merkleRoot },
      update: {
        txHash,
        status: "confirmed"
      },
      create: {
        merkleRoot,
        txHash,
        university,
        year,
        status: "confirmed"
      }
    });

    return NextResponse.json(anchor);
  } catch (error) {
    console.error("Anchor DB error:", error);
    return NextResponse.json({ error: "Failed to log anchor" }, { status: 500 });
  }
}
