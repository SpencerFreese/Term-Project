import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import {
  deleteCard,
  findCardById,
} from "@/lib/repositories/paymentCardRepository";
import { findUserProfileById } from "@/lib/repositories/userRepository";
import { sendProfileUpdatedEmail } from "@/lib/email";

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ cardId: string }> },
) {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json(
        { error: "You must be logged in to remove a payment card." },
        { status: 401 },
      );
    }

    const { cardId } = await params;
    const cardIdNumber = Number(cardId);

    if (!Number.isInteger(cardIdNumber)) {
      return NextResponse.json(
        { error: "Invalid card id." },
        { status: 400 },
      );
    }

    const card = await findCardById(cardIdNumber, session.userId);

    if (!card) {
      return NextResponse.json(
        { error: "Payment card not found." },
        { status: 404 },
      );
    }

    await deleteCard(cardIdNumber, session.userId);

    const user = await findUserProfileById(session.userId);

    if (user) {
      await sendProfileUpdatedEmail(user.email, user.firstName);
    }

    return NextResponse.json({ message: "Payment card removed." });
  } catch (error) {
    console.error("Delete payment card error:", error);

    return NextResponse.json(
      { error: "Payment card could not be removed. Please try again." },
      { status: 500 },
    );
  }
}
