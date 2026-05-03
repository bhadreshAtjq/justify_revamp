import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { UserRole } from "@/auth";

export async function GET() {
  const session = await auth();
  if (!session || session.user.role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const institutions = await (prisma as any).institution.findMany({
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(institutions);
}

import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  const session = await auth();
  if (!session || session.user.role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const { name, slug, adminEmail, adminPassword } = await req.json();

    if (!name || !slug || !adminEmail || !adminPassword) {
       return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(adminPassword, 10);

    // Create Institution and its first Admin in a transaction
    const result = await (prisma as any).$transaction(async (tx: any) => {
      const inst = await tx.institution.create({
        data: { name, slug }
      });

      const user = await tx.user.create({
        data: {
          email: adminEmail,
          password: hashedPassword,
          name: `${name} Admin`,
          role: "INSTITUTION_ADMIN",
          institutionId: inst.id
        }
      });

      return { inst, user };
    });

    return NextResponse.json({ 
      message: "Institution and Admin created successfully",
      institution: result.inst,
      admin: { email: result.user.email } 
    });
  } catch (err: any) {
    console.error("Institution creation failed:", err);
    return NextResponse.json({ error: "Creation failed", details: err?.message }, { status: 400 });
  }
}

