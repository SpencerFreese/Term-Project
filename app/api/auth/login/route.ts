import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { findAuthUserByEmail } from "@/lib/repositories/userRepository";
import {
  createSessionToken,
  SESSION_COOKIE_NAME,
  sessionCookieOptions,
} from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required." },
        { status: 400 },
      );
    }

    const user = await findAuthUserByEmail(email);

    if (!user) {
      return NextResponse.json(
        { error: "Invalid email or password." },
        { status: 401 },
      );
    }

    if (user.status !== "active") {
      return NextResponse.json(
        { error: "Your account is not active. Please confirm your email first." },
        { status: 403 },
      );
    }

    const passwordMatches = await bcrypt.compare(password, user.passwordHash);

    if (!passwordMatches) {
      return NextResponse.json(
        { error: "Invalid email or password." },
        { status: 401 },
      );
    }

    const token = await createSessionToken({
      userId: user.userId,
      email: user.email,
      role: user.role,
    });

    const redirectTo = user.role === "admin" ? "/admin" : "/profile";

    const response = NextResponse.json({
      message: "Login successful.",
      redirectTo,
    });

    response.cookies.set(SESSION_COOKIE_NAME, token, sessionCookieOptions);

    return response;
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Something went wrong while logging in." },
      { status: 500 },
    );
  }
}