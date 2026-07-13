import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import {
  findValidPasswordResetToken,
  markPasswordResetTokenUsed,
} from "@/lib/repositories/passwordResetRepository";
import { updateUserPassword } from "@/lib/repositories/userRepository";

function validatePassword(password: string) {
  if (password.length < 8) {
    return "Password must contain at least 8 characters.";
  }

  if (!/[A-Z]/.test(password)) {
    return "Password must contain at least one uppercase letter.";
  }

  if (!/[a-z]/.test(password)) {
    return "Password must contain at least one lowercase letter.";
  }

  if (!/[0-9]/.test(password)) {
    return "Password must contain at least one number.";
  }

  if (!/[^A-Za-z0-9]/.test(password)) {
    return "Password must contain at least one special character.";
  }

  return null;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const token =
      typeof body.token === "string"
        ? body.token.trim()
        : "";

    const password =
      typeof body.password === "string"
        ? body.password
        : "";

    const confirmPassword =
      typeof body.confirmPassword === "string"
        ? body.confirmPassword
        : "";

    if (!token || !password || !confirmPassword) {
      return NextResponse.json(
        {
          error:
            "Reset token, password, and password confirmation are required.",
        },
        { status: 400 },
      );
    }

    const passwordError = validatePassword(password);

    if (passwordError) {
      return NextResponse.json(
        { error: passwordError },
        { status: 400 },
      );
    }

    if (password !== confirmPassword) {
      return NextResponse.json(
        { error: "Passwords do not match." },
        { status: 400 },
      );
    }

    const resetToken =
      await findValidPasswordResetToken(token);

    if (!resetToken) {
      return NextResponse.json(
        {
          error:
            "This password reset link is invalid or has expired.",
        },
        { status: 400 },
      );
    }

    const passwordHash = await bcrypt.hash(
      password,
      10,
    );

    await updateUserPassword(
      resetToken.userId,
      passwordHash,
    );

    await markPasswordResetTokenUsed(
      resetToken.passwordResetTokenId,
    );

    return NextResponse.json({
      message:
        "Your password has been reset successfully.",
    });
  } catch (error) {
    console.error("Reset-password error:", error);

    return NextResponse.json(
      {
        error:
          "Your password could not be reset. Please try again.",
      },
      { status: 500 },
    );
  }
}