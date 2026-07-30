import { jwtVerify } from "jose";
import { SESSION_COOKIE_NAME } from "@/lib/auth";
import { NextRequest } from "next/server";

const secret = new TextEncoder().encode(
  process.env.AUTH_SECRET ?? "dev_secret_change_me_please",
);

export type Session = {
  userId: number;
  email: string;
  role: "customer" | "admin";
};

export async function getSession(request: NextRequest): Promise<Session | null> {
  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  if (!token) return null;

  try {
    const verified = await jwtVerify(token, secret);
    return verified.payload as Session;
  } catch {
    return null;
  }
}

export function hasRole(session: Session, role: "customer" | "admin"): boolean {
  return session.role === role;
}