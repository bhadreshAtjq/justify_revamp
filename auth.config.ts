import type { NextAuthConfig } from "next-auth";

export const authConfig = {
  pages: {
    signIn: "/login",
  },
  session: { strategy: "jwt" },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as any).role;
        token.institutionId = (user as any).institutionId;
        token.institutionName = (user as any).institutionName;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        (session.user as any).role = token.role;
        (session.user as any).institutionId = token.institutionId;
        (session.user as any).institutionName = token.institutionName;
      }
      return session;
    },
  },
  providers: [], // Empty array here, providers will be added in auth.ts
} satisfies NextAuthConfig;
