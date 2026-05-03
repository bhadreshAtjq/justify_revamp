import { auth, UserRole } from "@/auth";

export async function getSession() {
  return await auth();
}

export async function hasRole(role: UserRole | UserRole[]) {
  const session = await getSession();
  if (!session?.user?.role) return false;
  
  if (Array.isArray(role)) {
    return role.includes(session.user.role as UserRole);
  }
  
  return session.user.role === role;
}

export async function isAdmin() {
  return await hasRole(["SUPER_ADMIN", "INSTITUTION_ADMIN"]);
}

export async function isSuperAdmin() {
  return await hasRole("SUPER_ADMIN");
}
