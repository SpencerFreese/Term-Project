import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import {
  findPasswordHashById,
  findUserProfileById,
  updateUserPassword,
} from "@/lib/repositories/userRepository";
import { sendProfileUpdatedEmail } from "@/lib/email";
import { validatePassword } from "@/lib/validators";

type ChangePasswordRequest = {
  currentPassword?: unknown;
  newPassword?: unknown;
  confirmNewPassword?: unknown;
};

export async function POST(request: Request) {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json(
        { error: "You must be logged in to change your password." },
        { status: 401 },
      );
    }

    const body = (await request.json()) as ChangePasswordRequest;

    const currentPassword =
      typeof body.currentPassword === "string" ? body.currentPassword : "";

    const newPassword =
      typeof body.newPassword === "string" ? body.newPassword : "";

    const confirmNewPassword =
      typeof body.confirmNewPassword === "string"
        ? body.confirmNewPassword
        : "";

    if (!currentPassword || !newPassword || !confirmNewPassword) {
      return NextResponse.json(
        {
          error:
            "Current password, new password, and confirmation are required.",
        },
        { status: 400 },
      );
    }

    const passwordHash = await findPasswordHashById(session.userId);

    if (!passwordHash) {
      return NextResponse.json(
        { error: "Account could not be found." },
        { status: 404 },
      );
    }

    const currentPasswordMatches = await bcrypt.compare(
      currentPassword,
      passwordHash,
    );

    if (!currentPasswordMatches) {
      return NextResponse.json(
        { error: "Current password is incorrect." },
        { status: 401 },
      );
    }

    const passwordError = validatePassword(newPassword);

    if (passwordError) {
      return NextResponse.json(
        { error: passwordError },
        { status: 400 },
      );
    }

    if (newPassword !== confirmNewPassword) {
      return NextResponse.json(
        { error: "New passwords do not match." },
        { status: 400 },
      );
    }

    if (newPassword === currentPassword) {
      return NextResponse.json(
        {
          error:
            "New password must be different from your current password.",
        },
        { status: 400 },
      );
    }

    const newPasswordHash = await bcrypt.hash(newPassword, 10);

    await updateUserPassword(session.userId, newPasswordHash);

    const user = await findUserProfileById(session.userId);

    if (user) {
      await sendProfileUpdatedEmail(user.email, user.firstName);
    }

    return NextResponse.json({
      message: "Password changed successfully.",
    });
  } catch (error) {
    console.error("Password change error:", error);

    return NextResponse.json(
      { error: "Password could not be changed. Please try again." },
      { status: 500 },
    );
  }
}
