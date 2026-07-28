import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const where: any = {};
    if (session.user.role !== "SUPER_ADMIN") {
      if (session.user.institutionId) {
        where.institutionId = session.user.institutionId;
      } else {
        return NextResponse.json([]);
      }
    }

    const logs = await prisma.auditLog.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 200,
      include: {
        user: { select: { name: true, email: true } },
      }
    });

    return NextResponse.json(logs);
  } catch (error: any) {
    console.error("API Error [GET /api/audit]:", error);
    return NextResponse.json({ 
      error: "Failed to fetch audit logs", 
      message: error?.message 
    }, { status: 500 });
  }
}
