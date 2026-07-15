import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import {
  addCard,
  countCardsByUserId,
  MAX_CARDS_PER_USER,
} from "@/lib/repositories/paymentCardRepository";
import { findUserProfileById } from "@/lib/repositories/userRepository";
import { sendProfileUpdatedEmail } from "@/lib/email";
import { encryptCardNumber } from "@/lib/cardEncryption";
import {
  detectCardType,
  isCardExpired,
  isValidCardNumber,
  isValidExpiryMonth,
  isValidExpiryYear,
  normalizeCardNumber,
} from "@/lib/validators";

type AddCardRequest = {
  cardNumber?: unknown;
  cardholderName?: unknown;
  expiryMonth?: unknown;
  expiryYear?: unknown;
};

export async function POST(request: Request) {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json(
        { error: "You must be logged in to add a payment card." },
        { status: 401 },
      );
    }

    const body = (await request.json()) as AddCardRequest;

    const cardNumber =
      typeof body.cardNumber === "string"
        ? normalizeCardNumber(body.cardNumber)
        : "";

    const cardholderName =
      typeof body.cardholderName === "string"
        ? body.cardholderName.trim()
        : "";

    const expiryMonth =
      typeof body.expiryMonth === "string" ? body.expiryMonth.trim() : "";

    const expiryYear =
      typeof body.expiryYear === "string" ? body.expiryYear.trim() : "";

    if (!cardNumber || !cardholderName || !expiryMonth || !expiryYear) {
      return NextResponse.json(
        {
          error:
            "Card number, cardholder name, and expiration date are required.",
        },
        { status: 400 },
      );
    }

    if (!isValidCardNumber(cardNumber)) {
      return NextResponse.json(
        { error: "Enter a valid card number." },
        { status: 400 },
      );
    }

    if (!isValidExpiryMonth(expiryMonth) || !isValidExpiryYear(expiryYear)) {
      return NextResponse.json(
        { error: "Enter a valid expiration date." },
        { status: 400 },
      );
    }

    if (isCardExpired(expiryMonth, expiryYear)) {
      return NextResponse.json(
        { error: "This card has already expired." },
        { status: 400 },
      );
    }

    const existingCount = await countCardsByUserId(session.userId);

    if (existingCount >= MAX_CARDS_PER_USER) {
      return NextResponse.json(
        {
          error: `You can only store up to ${MAX_CARDS_PER_USER} payment cards.`,
        },
        { status: 409 },
      );
    }

    await addCard(session.userId, {
      cardNumberEncrypted: encryptCardNumber(cardNumber),
      cardholderName,
      expiryMonth,
      expiryYear,
      cardType: detectCardType(cardNumber),
    });

    const user = await findUserProfileById(session.userId);

    if (user) {
      await sendProfileUpdatedEmail(user.email, user.firstName);
    }

    return NextResponse.json(
      { message: "Payment card added successfully." },
      { status: 201 },
    );
  } catch (error) {
    if (error instanceof Error && error.message === "MAX_CARDS_REACHED") {
      return NextResponse.json(
        {
          error: `You can only store up to ${MAX_CARDS_PER_USER} payment cards.`,
        },
        { status: 409 },
      );
    }

    console.error("Add payment card error:", error);

    return NextResponse.json(
      { error: "Payment card could not be saved. Please try again." },
      { status: 500 },
    );
  }
}
