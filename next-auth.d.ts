import { UserRole } from "@prisma/client";
import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface User {
    role?: UserRole;
    institutionId?: string | null;
    institutionName?: string | null;
  }

  interface Session {
    user: {
      role?: UserRole;
      institutionId?: string | null;
      institutionName?: string | null;
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: UserRole;
    institutionId?: string | null;
    institutionName?: string | null;
  }
}
