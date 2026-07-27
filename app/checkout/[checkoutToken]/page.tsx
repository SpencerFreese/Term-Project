import {
  notFound,
  redirect,
} from "next/navigation";

import { getSession } from "@/lib/auth";

import {findBookingDraftDetailsByToken} from "@/lib/repositories/bookingDraftRepository";

import {findUserProfileById} from "@/lib/repositories/userRepository";

import {claimBookingDraftForUser} from "@/lib/services/checkoutService";

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

  const user = await findUserProfileById(session.userId);

  if (!user) {
    redirect("/login");
  }

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
        selectedSeats={ selectedSeats}
        expiresAt={draft.expiresAt}
      />
    </main>
  );
}
