import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

// Use a type instead of direct enum import to avoid transient Prisma generation issues
export type UserRole = "SUPER_ADMIN" | "INSTITUTION_ADMIN" | "ISSUER" | "AUDITOR" | "PUBLIC_VERIFIER";

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        // otp: { label: "OTP", type: "text" }, // Placeholder for future OTP
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const user = await (prisma as any).user.findUnique({
          where: { email: credentials.email as string },
          include: { institution: true },
        });

        if (!user || !user.password) return null;

        const isPasswordCorrect = await bcrypt.compare(
          credentials.password as string,
          user.password
        );

        if (!isPasswordCorrect) return null;

        // OTP Bypass as requested
        // In the future, we would check OTP here if enabled for the user/role.

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          institutionId: user.institutionId,
          institutionName: user.institution?.name,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.institutionId = user.institutionId;
        token.institutionName = user.institutionName;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.role = token.role as UserRole;
        session.user.institutionId = token.institutionId as string;
        session.user.institutionName = token.institutionName as string;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
});
