import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import {
  createCustomer,
  findAuthUserByEmail,
} from "@/lib/repositories/userRepository";
import { createEmailVerificationToken } from "@/lib/repositories/emailVerificationRepository";
import { sendVerificationEmail } from "@/lib/email";
import {
  isValidEmail,
  isValidPhoneNumber,
  validatePassword,
} from "@/lib/validators";

type RegistrationRequest = {
  firstName?: unknown;
  lastName?: unknown;
  email?: unknown;
  phoneNumber?: unknown;
  password?: unknown;
  confirmPassword?: unknown;
  promoSubscribed?: unknown;
};

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as RegistrationRequest;

    const firstName =
      typeof body.firstName === "string" ? body.firstName.trim() : "";

    const lastName =
      typeof body.lastName === "string" ? body.lastName.trim() : "";

    const email =
      typeof body.email === "string"
        ? body.email.trim().toLowerCase()
        : "";

    const phoneNumber =
      typeof body.phoneNumber === "string"
        ? body.phoneNumber.trim()
        : "";

    const password =
      typeof body.password === "string" ? body.password : "";

    const confirmPassword =
      typeof body.confirmPassword === "string"
        ? body.confirmPassword
        : "";

    const promoSubscribed = body.promoSubscribed === true;

    if (!firstName || !lastName || !email || !password || !confirmPassword) {
      return NextResponse.json(
        {
          error:
            "First name, last name, email, password, and password confirmation are required.",
        },
        { status: 400 },
      );
    }

    if (firstName.length > 50 || lastName.length > 50) {
      return NextResponse.json(
        { error: "First and last names cannot exceed 50 characters." },
        { status: 400 },
      );
    }

    if (!isValidEmail(email) || email.length > 255) {
      return NextResponse.json(
        { error: "Enter a valid email address." },
        { status: 400 },
      );
    }

    if (phoneNumber && !isValidPhoneNumber(phoneNumber)) {
      return NextResponse.json(
        { error: "Enter a valid phone number." },
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

    const existingUser = await findAuthUserByEmail(email);

    if (existingUser) {
      return NextResponse.json(
        { error: "An account already exists with this email address." },
        { status: 409 },
      );
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const userId = await createCustomer({
      firstName,
      lastName,
      email,
      phoneNumber: phoneNumber || null,
      passwordHash,
      promoSubscribed,
    });

    const verificationToken =
      await createEmailVerificationToken(userId);

    await sendVerificationEmail(
      email,
      firstName,
      verificationToken,
    );

    return NextResponse.json(
      {
        message:
          "Registration successful. Check your email to confirm your account.",
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Registration error:", error);

    return NextResponse.json(
      {
        error:
          "Registration could not be completed. Please try again.",
      },
      { status: 500 },
    );
  }
}