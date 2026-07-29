import {
  notFound,
  redirect,
} from "next/navigation";

import { getSession } from "@/lib/auth";
import { lastFourDigits } from "@/lib/cardEncryption";

import {findBookingDraftDetailsByToken} from "@/lib/repositories/bookingDraftRepository";

import {findCardsByUserId} from "@/lib/repositories/paymentCardRepository";

import {findUserProfileById} from "@/lib/repositories/userRepository";

import {claimBookingDraftForUser} from "@/lib/services/checkoutService";

import {getSeatsForShowtime} from "@/lib/services/seatService";

import CheckoutExperience from "./CheckoutExperience";

export const dynamic = "force-dynamic";

export default async function CheckoutPage({params}: {params: Promise<{checkoutToken: string;}>;}) {
  const { checkoutToken } = await params;

  const returnTo = `/checkout/${checkoutToken}`;

  const session = await getSession();

  if (!session) {
    redirect(`/login?returnTo=${encodeURIComponent(returnTo)}`);
  }

  if (session.role !== "customer") {
    redirect("/admin");
  }

  /*
   * Assign a guest-created draft to the
   * customer as soon as they reach checkout.
   */
  try {
    await claimBookingDraftForUser(checkoutToken, session.userId);
  } catch {
    notFound();
  }

  const draft = await findBookingDraftDetailsByToken(checkoutToken);

  /*
   * A missing draft means the token is invalid
   * or the one-hour reservation expired.
   */
  if (!draft) {
    notFound();
  }

  const [user, cards, seats] =
    await Promise.all([
      findUserProfileById(session.userId),

      findCardsByUserId(session.userId),

      getSeatsForShowtime(draft.showtimeId, session.userId),
    ]);

  if (!user) {
    redirect("/login");
  }

  /*
   * Only send masked card information to
   * the client component.
   */
  const maskedCards = cards.map(
    (card) => ({
      cardId: card.cardId,

      cardholderName: card.cardholderName,

      cardType: card.cardType,

      expiryMonth: card.expiryMonth,

      expiryYear: card.expiryYear,

      lastFour: lastFourDigits(card.cardNumberEncrypted),
    }),
  );

  /*
   * Convert MySQL rows into plain objects
   * before sending them to a client component.
   */
  const checkoutSeats = seats.map(
    (seat) => ({
      seatId:seat.seatId,

      rowLabel:seat.rowLabel,

      seatNumber:seat.seatNumber,

      seatType: seat.seatType,

      availability:seat.availability,
    }),
  );

  const selectedSeats =
    draft.selectedSeats.map(
      (seat) => ({
        seatId:seat.seatId,

        rowLabel:seat.rowLabel,

        seatNumber:seat.seatNumber,

        seatType:seat.seatType,
      }),
    );

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-6 px-6 py-12">
      <CheckoutExperience
        checkoutToken={checkoutToken}
        accountEmail={user.email}
        movieTitle={draft.movieTitle}
        startTime={draft.startTime}
        roomName={draft.roomName}
        formatType={draft.formatType}
        quantities={draft.quantities}
        seats={checkoutSeats }
        selectedSeats={ selectedSeats}
        cards={maskedCards}
        expiresAt={draft.expiresAt}
      />
    </main>
  );
}