import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: string;
      institutionId?: string;
      institutionName?: string;
    } & DefaultSession["user"];
  }

  interface User {
    role: string;
    institutionId?: string;
    institutionName?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role: string;
    institutionId?: string;
    institutionName?: string;
  }
}
