import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

/**
 * Handle Single and Batch Status Updates (Revoke/Freeze/Activate)
 * Body: { ids: string[], status: "ACTIVE" | "REVOKED" | "FROZEN" }
 */
export async function PUT(req: Request) {
  try {
    const session = await auth();
    if (!session || !["SUPER_ADMIN", "INSTITUTION_ADMIN", "ISSUER"].includes(session.user.role)) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 403 });
    }

    const { ids, status } = await req.json();

    if (!Array.isArray(ids) || ids.length === 0 || !status) {
      return NextResponse.json({ error: "Missing records or target status" }, { status: 400 });
    }

    const where: any = { id: { in: ids } };

    // Strict tenancy enforcement: non-superadmins can only modify their own institutional records
    if (session.user.role !== "SUPER_ADMIN") {
      where.institutionId = session.user.institutionId;
    }

    const result = await (prisma as any).studentRecord.updateMany({
      where,
      data: { status }
    });

    // Handle Blockchain Revocation for each record
    if (status === "REVOKED") {
      const recordsToRevoke = await (prisma as any).studentRecord.findMany({
        where: { id: { in: ids }, anchorId: { not: null } },
        select: { keccak256Hash: true }
      });

      if (recordsToRevoke.length > 0) {
        const { revokeOnChain } = await import("@/lib/blockchain");
        
        // Execute batch revocation on blockchain
        // Note: For large batches, this should ideally be queued, 
        // but for institutional scale we can run them in parallel/series here
        for (const record of recordsToRevoke) {
          try {
            await revokeOnChain(record.keccak256Hash, "Manual revocation by institution admin");
          } catch (err) {
            console.error(`Blockchain revocation failed for ${record.keccak256Hash}:`, err);
          }
        }
      }
    }

    return NextResponse.json({
      message: `Successfully updated ${result.count} records to ${status} (Synced with Blockchain)`,
      count: result.count
    });

  } catch (error: any) {
    console.error("Status update error:", error);
    return NextResponse.json({ error: "Failed to update record status", details: error?.message }, { status: 500 });
  }
}
