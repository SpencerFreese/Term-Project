import { NextResponse } from "next/server";

import { getSession } from "@/lib/auth";

import {
  CheckoutConflictError,
  CheckoutValidationError,
  createBookingDraft,
} from "@/lib/services/checkoutService";

type DraftRequestBody = {
  showtimeId?: unknown;

  quantities?: {
    adult?: unknown;
    senior?: unknown;
    child?: unknown;
  };

  seatIds?: unknown;
};

function isDuplicateEntryError(
  error: unknown,
) {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error.code === "ER_DUP_ENTRY"
  );
}

export async function POST(
  request: Request,
) {
  try {
    const session = await getSession();

    const userId =
      session?.role === "customer"
        ? session.userId
        : null;

    const body =
      (await request.json()) as DraftRequestBody;

    const showtimeId =
      typeof body.showtimeId === "number"
        ? body.showtimeId
        : Number(body.showtimeId);

    const quantities = {
      adult:
        typeof body.quantities?.adult ===
        "number"
          ? body.quantities.adult
          : Number(
              body.quantities?.adult,
            ),

      senior:
        typeof body.quantities?.senior ===
        "number"
          ? body.quantities.senior
          : Number(
              body.quantities?.senior,
            ),

      child:
        typeof body.quantities?.child ===
        "number"
          ? body.quantities.child
          : Number(
              body.quantities?.child,
            ),
    };

    const seatIds = Array.isArray(
      body.seatIds,
    )
      ? body.seatIds.map((seatId) =>
          typeof seatId === "number"
            ? seatId
            : Number(seatId),
        )
      : [];

    const draft =
      await createBookingDraft({
        userId,
        showtimeId,
        quantities,
        seatIds,
      });

    return NextResponse.json(
      {
        checkoutToken:
          draft.checkoutToken,

        checkoutUrl:
          `/checkout/${draft.checkoutToken}`,

        expiresAt:
          draft.expiresAt.toISOString(),
      },
      {
        status: 201,
      },
    );
  } catch (error) {
    if (error instanceofCheckoutValidationError) {
      return NextResponse.json(
        {
          error: error.message,
        },
        {
          status: 400,
        },
      );
    }

    if (error instanceof CheckoutConflictError || isDuplicateEntryError(error)) {
      return NextResponse.json(
        {
          error:
            error instanceof Error
              ? error.message
              : "One or more selected seats are no longer available.",
        },
        {
          status: 409,
        },
      );
    }

    if (error instanceof SyntaxError) {
      return NextResponse.json(
        {
          error: "The checkout request is invalid.",
        },
        {
          status: 400,
        },
      );
    }

    console.error("Create booking draft error:", error);

    return NextResponse.json(
      {
        error: "Unable to begin checkout. Please try again.",
      },
      {
        status: 500,
      },
    );
  }
}