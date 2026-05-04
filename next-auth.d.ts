import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: string;
      institutionId?: string | null;
      institutionName?: string | null;
    } & DefaultSession["user"];
  }

  interface User {
    role: string;
    institutionId?: string | null;
    institutionName?: string | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role: string;
    institutionId?: string | null;
    institutionName?: string | null;
  }
}
