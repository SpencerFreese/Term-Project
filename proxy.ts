import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";
import { SESSION_COOKIE_NAME } from "@/lib/auth";

const secret = new TextEncoder().encode(
  process.env.AUTH_SECRET ?? "dev_secret_change_me_please",
);

async function verifyToken(token: string) {
  try {
    const verified = await jwtVerify(token, secret);

    return verified.payload as {
      userId: number;
      email: string;
      role: "customer" | "admin";
    };
  } catch {
    return null;
  }
}

export async function proxy(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  const session = token ? await verifyToken(token) : null;

  if (path.startsWith("/admin")) {
    if (!session) {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    if (session.role !== "admin") {
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  if (path.startsWith("/profile")) {
    if (!session) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  if (path === "/login" && session) {
    if (session.role === "admin") {
      return NextResponse.redirect(new URL("/admin", request.url));
    }

    return NextResponse.redirect(new URL("/profile", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/profile/:path*", "/login"],
};