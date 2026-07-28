import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const institutionId = (session.user as any).institutionId;
    
    const where: any = {};
    if (session.user.role !== "SUPER_ADMIN" && institutionId) {
      where.institutionId = institutionId;
    }

    // Total Records
    const totalRecords = await prisma.studentRecord.count({ where });

    // Active Users
    const activeUsers = await prisma.user.count({ where });

    // Verifications (Total)
    const totalVerifications = await prisma.auditLog.count({
      where: {
        ...where,
        action: "VERIFY"
      }
    });

    // Chart Data (Last 7 Days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const ingestions = await prisma.auditLog.findMany({
      where: { ...where, action: "INGEST", createdAt: { gte: sevenDaysAgo } },
      select: { createdAt: true }
    });

    const verifications = await prisma.auditLog.findMany({
      where: { ...where, action: "VERIFY", createdAt: { gte: sevenDaysAgo } },
      select: { createdAt: true }
    });

    const chartData = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const startOfDay = new Date(d);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(d);
      endOfDay.setHours(23, 59, 59, 999);

      const dayIngestions = ingestions.filter(log => log.createdAt >= startOfDay && log.createdAt <= endOfDay).length;
      const dayVerifications = verifications.filter(log => log.createdAt >= startOfDay && log.createdAt <= endOfDay).length;

      chartData.push({
        name: d.toLocaleDateString('en-US', { weekday: 'short' }),
        ingestions: dayIngestions,
        verifications: dayVerifications
      });
    }

    return NextResponse.json({
      totalRecords,
      activeUsers,
      totalVerifications,
      chartData
    });
  } catch (error: any) {
    console.error("API Error [GET /api/stats]:", error);
    return NextResponse.json({ 
      error: "Failed to fetch stats", 
      message: error?.message 
    }, { status: 500 });
  }
}
