import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const sessionCookie = request.cookies.get("session")?.value;
  const roleCookie = request.cookies.get("role")?.value;

  // Protect coordinator dashboard — require session + admin role
  if (pathname.startsWith("/dashboard")) {
    if (!sessionCookie) {
      return NextResponse.redirect(new URL("/auth/admin/login", request.url));
    }
    // Volunteers cannot access admin dashboard
    if (roleCookie === "volunteer") {
      return NextResponse.redirect(new URL("/volunteer/dashboard", request.url));
    }
  }

  // Protect volunteer dashboard — require session
  if (pathname.startsWith("/volunteer/dashboard")) {
    if (!sessionCookie) {
      return NextResponse.redirect(new URL("/auth/volunteer", request.url));
    }
    // Admins cannot access volunteer dashboard
    if (roleCookie === "admin") {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/volunteer/dashboard/:path*"],
};
