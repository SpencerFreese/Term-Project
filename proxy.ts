import { NextRequest, NextResponse } from "next/server";
import { getSession, hasRole } from "@/lib/sessionService";

const PROTECTED_ROUTES: {
  prefix: string;
  requiresAuth: boolean;
  requiresAdmin: boolean;
}[] = [
  { prefix: "/admin",    requiresAuth: true, requiresAdmin: true  },
  { prefix: "/profile",  requiresAuth: true, requiresAdmin: false },
  { prefix: "/checkout", requiresAuth: true, requiresAdmin: false },
  { prefix: "/orders",   requiresAuth: true, requiresAdmin: false },
];

function matchRoute(path: string) {
  return PROTECTED_ROUTES.find((route) => path.startsWith(route.prefix));
}

function redirectToLogin(request: NextRequest) {
  const loginUrl = new URL("/login", request.url);
  loginUrl.searchParams.set("returnTo", request.nextUrl.pathname);
  return NextResponse.redirect(loginUrl);
}

export async function proxy(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const session = await getSession(request);
  const matchedRoute = matchRoute(path);

  if (matchedRoute) {
    if (!session) {
      return redirectToLogin(request);
    }

    if (matchedRoute.requiresAdmin && !hasRole(session, "admin")) {
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  if (path === "/login" && session) {
    if (hasRole(session, "admin")) {
      return NextResponse.redirect(new URL("/admin", request.url));
    }
    return NextResponse.redirect(new URL("/profile", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/profile/:path*",
    "/checkout/:path*",
    "/orders/:path*",
    "/login",
  ],
};