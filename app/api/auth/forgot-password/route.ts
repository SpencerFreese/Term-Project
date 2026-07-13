import { NextResponse } from "next/server";
import { findAuthUserByEmail } from "@/lib/repositories/userRepository";
import { createPasswordResetToken } from "@/lib/repositories/passwordResetRepository";
import { sendPasswordResetEmail } from "@/lib/email";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const email =
      typeof body.email === "string"
        ? body.email.trim().toLowerCase()
        : "";

    if (!email) {
      return NextResponse.json(
        { error: "Email is required." },
        { status: 400 },
      );
    }

    const user = await findAuthUserByEmail(email);

    const successMessage =
      "If an account exists for that email, a password reset link has been sent.";

    // Do not reveal whether an email is registered.
    if (!user) {
      return NextResponse.json({
        message: successMessage,
      });
    }

    const resetToken = await createPasswordResetToken(
      user.userId,
    );

    await sendPasswordResetEmail(
      user.email,
      user.firstName,
      resetToken,
    );

    return NextResponse.json({
      message: successMessage,
    });
  } catch (error) {
    console.error("Forgot-password error:", error);

    return NextResponse.json(
      {
        error:
          "The password reset request could not be completed.",
      },
      { status: 500 },
    );
  }
}