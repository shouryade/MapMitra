import { NextResponse, NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  const path = req.nextUrl.pathname;

  const publicPaths = ["/auth/signin", "/auth/signup", "/public-info", "/home"];

  const protectedRoutes = {
    "/driver-dashboard": "driver",
    "/student-dashboard": "student",
    "/admin-dashboard": "admin",
    "/visitor-dashboard": "visitor",
    "/api/admin": "admin", // Admin-specific API route
    "/api/driver": "driver", // Driver-specific API route
    "/api/student": "student", // Student-specific API route
  };

  if (!token) {
    if (publicPaths.includes(path)) {
      return NextResponse.next();
    }
    return NextResponse.redirect(new URL("/auth/signin", req.url));
  }

  for (const [route, role] of Object.entries(protectedRoutes)) {
    if (path.startsWith(route)) {
      if (token.role !== role) {
        return NextResponse.redirect(new URL("/auth/signin", req.url));
      }
      break;
    }
  }

  if (path === "/auth/signin" && token) {
    const roleDashboard = {
      admin: "/admin-dashboard",
      driver: "/driver-dashboard",
      student: "/student-dashboard",
      visitor: "/visitor-dashboard",
    };
    return NextResponse.redirect(new URL(roleDashboard[token.role], req.url));
  }

  if (publicPaths.includes(path)) {
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/driver-dashboard",
    "/student-dashboard",
    "/admin-dashboard",
    "/visitor-dashboard",
    "/api/admin",
    "/api/driver",
    "/api/student",
    "/auth/*",
  ],
};
