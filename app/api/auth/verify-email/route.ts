import { NextResponse } from "next/server";
import {
  findValidVerificationToken,
  markVerificationTokenUsed,
} from "@/lib/repositories/emailVerificationRepository";
import { activateUser } from "@/lib/repositories/userRepository";


function getSafeReturnTo(
  value: string | null,
): string | null {
  if (
    !value ||
    !value.startsWith("/") ||
    value.startsWith("//")
  ) {
    return null;
  }

  return value;
}

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);

  const token =requestUrl.searchParams.get("token");

  const returnTo = getSafeReturnTo(requestUrl.searchParams.get("returnTo"));

  function createLoginUrl(
  verification:
    | "success"
    | "invalid"
    | "error",
  ) {
    const loginUrl =
      new URL("/login", request.url);

    loginUrl.searchParams.set(
      "verification",
      verification,
    );

    if (returnTo) {
      loginUrl.searchParams.set(
        "returnTo",
        returnTo,
      );
    }

    return loginUrl;
  }

  if (!token) {
    return NextResponse.redirect(
      createLoginUrl("invalid"),
    );
  }

  try {
    const verificationToken =
      await findValidVerificationToken(token);

    if (!verificationToken) {
      return NextResponse.redirect(
        createLoginUrl("invalid"),
      );
    }

    await activateUser(verificationToken.userId);

    await markVerificationTokenUsed(
      verificationToken.verificationTokenId,
    );

    return NextResponse.redirect(
      createLoginUrl("success"),
    );
  } catch (error) {
    console.error("Email verification error:", error);

    return NextResponse.redirect(
      createLoginUrl("error"),
    );
  }
}