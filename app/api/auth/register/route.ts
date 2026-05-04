import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { sendWelcomeEmail } from "@/lib/mail";

export async function POST(req: Request) {
  try {
    const { name, email, role } = await req.json();

    if (!email || !name) {
      return NextResponse.json(
        { error: "Name and email are required" },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existing = await (prisma as any).user.findUnique({
      where: { email },
    });

    if (existing) {
      return NextResponse.json(
        { error: "An account with this email already exists. Please sign in." },
        { status: 409 }
      );
    }

    // Generate a random password
    const rawPassword = crypto.randomBytes(6).toString("hex"); // 12 char
    const hashedPassword = await bcrypt.hash(rawPassword, 10);

    // Create verifier user (no institution)
    const user = await (prisma as any).user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: role || "PUBLIC_VERIFIER",
      },
    });

    // Send email with password
    try {
      await sendWelcomeEmail(email, name, rawPassword);
      console.log(`[REGISTER] Welcome email sent to: ${email}`);
    } catch (mailError) {
      console.error(`[REGISTER] Failed to send email to ${email}:`, mailError);
      // We don't fail the whole request because the user was created, but we log it.
    }
    return NextResponse.json({
      message: "Account created successfully",
      userId: user.id,
      // Only include password in development mode
      ...(process.env.NODE_ENV === "development" ? { temporaryPassword: rawPassword } : {}),
    });
  } catch (error: any) {
    console.error("[REGISTER] Error:", error);
    return NextResponse.json(
      { error: "Registration failed. Please try again." },
      { status: 500 }
    );
  }
}
