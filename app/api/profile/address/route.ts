import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import {
  deleteAddress,
  upsertAddress,
} from "@/lib/repositories/addressRepository";
import { findUserProfileById } from "@/lib/repositories/userRepository";
import { sendProfileUpdatedEmail } from "@/lib/email";
import { isValidZipCode } from "@/lib/validators";

type AddressRequest = {
  street?: unknown;
  city?: unknown;
  state?: unknown;
  zipCode?: unknown;
  country?: unknown;
};

export async function PUT(request: Request) {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json(
        { error: "You must be logged in to update your address." },
        { status: 401 },
      );
    }

    const body = (await request.json()) as AddressRequest;

    const street =
      typeof body.street === "string" ? body.street.trim() : "";

    const city = typeof body.city === "string" ? body.city.trim() : "";

    const state =
      typeof body.state === "string" ? body.state.trim() : "";

    const zipCode =
      typeof body.zipCode === "string" ? body.zipCode.trim() : "";

    const country =
      typeof body.country === "string" && body.country.trim()
        ? body.country.trim()
        : "US";

    if (!street || !city || !state || !zipCode) {
      return NextResponse.json(
        { error: "Street, city, state, and zip code are required." },
        { status: 400 },
      );
    }

    if (!isValidZipCode(zipCode)) {
      return NextResponse.json(
        { error: "Enter a valid zip code." },
        { status: 400 },
      );
    }

    await upsertAddress(session.userId, {
      street,
      city,
      state,
      zipCode,
      country,
    });

    const user = await findUserProfileById(session.userId);

    if (user) {
      await sendProfileUpdatedEmail(user.email, user.firstName);
    }

    return NextResponse.json({ message: "Address saved successfully." });
  } catch (error) {
    console.error("Address update error:", error);

    return NextResponse.json(
      { error: "Address could not be saved. Please try again." },
      { status: 500 },
    );
  }
}

export async function DELETE() {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json(
        { error: "You must be logged in to remove your address." },
        { status: 401 },
      );
    }

    await deleteAddress(session.userId);

    const user = await findUserProfileById(session.userId);

    if (user) {
      await sendProfileUpdatedEmail(user.email, user.firstName);
    }

    return NextResponse.json({ message: "Address removed." });
  } catch (error) {
    console.error("Address delete error:", error);

    return NextResponse.json(
      { error: "Address could not be removed. Please try again." },
      { status: 500 },
    );
  }
}
