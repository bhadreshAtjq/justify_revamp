import NextAuth from "next-auth";
import { authConfig } from "./auth.config";
import { NextResponse } from "next/server";

const { auth } = NextAuth(authConfig);

export default auth((req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;

  const isApiAuthRoute = nextUrl.pathname.startsWith("/api/auth");
  const isPublicRoute = ["/", "/login", "/verify"].includes(nextUrl.pathname);
  const isAuthRoute = ["/login"].includes(nextUrl.pathname);

  if (isApiAuthRoute) {
    return NextResponse.next();
  }

  // Homepage: always accessible
  if (nextUrl.pathname === "/") {
    return NextResponse.next();
  }

  if (isAuthRoute) {
    if (isLoggedIn) {
      const userRole = req.auth?.user?.role;
      const destination = userRole === "PUBLIC_VERIFIER" ? "/verify" : "/dashboard";
      return NextResponse.redirect(new URL(destination, nextUrl));
    }
    return NextResponse.next();
  }

  if (!isLoggedIn && !isPublicRoute) {
    return NextResponse.redirect(new URL("/login", nextUrl));
  }

  // Role-based access control (RBAC)
  if (isLoggedIn) {
    const userRole = req.auth?.user?.role;

    if (nextUrl.pathname.startsWith("/admin") && userRole !== "SUPER_ADMIN") {
      return NextResponse.redirect(new URL("/dashboard", nextUrl));
    }

    if (nextUrl.pathname.startsWith("/dashboard") && userRole === "PUBLIC_VERIFIER") {
      return NextResponse.redirect(new URL("/verify", nextUrl));
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};
