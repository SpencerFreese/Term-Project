import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import {
  findUserProfileById,
  updateUserProfile,
} from "@/lib/repositories/userRepository";
import { sendProfileUpdatedEmail } from "@/lib/email";
import { isValidPhoneNumber } from "@/lib/validators";

type UpdateProfileRequest = {
  firstName?: unknown;
  lastName?: unknown;
  phoneNumber?: unknown;
  promoSubscribed?: unknown;
};

export async function PATCH(request: Request) {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json(
        { error: "You must be logged in to update your profile." },
        { status: 401 },
      );
    }

    const body = (await request.json()) as UpdateProfileRequest;

    const firstName =
      typeof body.firstName === "string" ? body.firstName.trim() : "";

    const lastName =
      typeof body.lastName === "string" ? body.lastName.trim() : "";

    const phoneNumber =
      typeof body.phoneNumber === "string" ? body.phoneNumber.trim() : "";

    const promoSubscribed = body.promoSubscribed === true;

    if (!firstName || !lastName) {
      return NextResponse.json(
        { error: "First name and last name are required." },
        { status: 400 },
      );
    }

    if (firstName.length > 50 || lastName.length > 50) {
      return NextResponse.json(
        { error: "First and last names cannot exceed 50 characters." },
        { status: 400 },
      );
    }

    if (phoneNumber && !isValidPhoneNumber(phoneNumber)) {
      return NextResponse.json(
        { error: "Enter a valid phone number." },
        { status: 400 },
      );
    }

    await updateUserProfile(session.userId, {
      firstName,
      lastName,
      phoneNumber: phoneNumber || null,
      promoSubscribed,
    });

    const user = await findUserProfileById(session.userId);

    if (user) {
      await sendProfileUpdatedEmail(user.email, user.firstName);
    }

    return NextResponse.json({
      message: "Profile updated successfully.",
      user,
    });
  } catch (error) {
    console.error("Profile update error:", error);

    return NextResponse.json(
      { error: "Profile could not be updated. Please try again." },
      { status: 500 },
    );
  }
}
