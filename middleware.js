import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  (req) => {
    // derive token and pathname defensively to avoid undefined errors in different runtimes
    const token = req.nextauth?.token ?? undefined;
    const pathname = req.nextauth?.pathname ?? (req.nextUrl && req.nextUrl.pathname) ?? (typeof req.url === 'string' ? new URL(req.url).pathname : undefined);

    // admin routes protection
    if (typeof pathname === 'string' && pathname.startsWith("/admin")) {
      if (!token || token.role !== "admin") {
        return NextResponse.redirect(new URL("/dashboard", req.url));
      }
    }

    // instructor routes protection
    if (typeof pathname === 'string' && pathname.startsWith("/instructor")) {
      if (!token || (token.role !== "instructor" && token.role !== "admin")) {
        return NextResponse.redirect(new URL("/dashboard", req.url));
      }
    }

    // dashboard route protection
    if (typeof pathname === 'string' && pathname.startsWith("/dashboard")) {
      if (!token) {
        return NextResponse.redirect(new URL("/signin", req.url));
      }
    }

    // learning routes protection
    if (typeof pathname === 'string' && pathname.startsWith("/learn")) {
      if (!token) {
        return NextResponse.redirect(new URL("/signin", req.url));
      }
    }
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const { pathname } = req.nextUrl;
        // public routes 
        if (
          pathname.startsWith("/auth") ||
          pathname.startsWith("/signin") ||
          pathname === "/" ||
          pathname.startsWith("/courses") ||
          pathname.startsWith("/api/auth") ||
          pathname.startsWith("/api/courses") ||
          pathname.startsWith("/_next") ||
          pathname.startsWith("/images") ||
          pathname.includes(".")
        ) {
          return true;
        }
        // other routes 
        return !!token;
      }
    }
  }
);

export const config = {
    matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"]
}