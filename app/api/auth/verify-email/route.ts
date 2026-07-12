import { NextResponse } from "next/server";
import {
  findValidVerificationToken,
  markVerificationTokenUsed,
} from "@/lib/repositories/emailVerificationRepository";
import { activateUser } from "@/lib/repositories/userRepository";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const token = requestUrl.searchParams.get("token");

  if (!token) {
    return NextResponse.redirect(
      new URL("/login?verification=invalid", request.url),
    );
  }

  try {
    const verificationToken =
      await findValidVerificationToken(token);

    if (!verificationToken) {
      return NextResponse.redirect(
        new URL("/login?verification=invalid", request.url),
      );
    }

    await activateUser(verificationToken.userId);

    await markVerificationTokenUsed(
      verificationToken.verificationTokenId,
    );

    return NextResponse.redirect(
      new URL("/login?verification=success", request.url),
    );
  } catch (error) {
    console.error("Email verification error:", error);

    return NextResponse.redirect(
      new URL("/login?verification=error", request.url),
    );
  }
}