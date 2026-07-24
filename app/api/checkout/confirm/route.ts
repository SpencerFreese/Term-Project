import { NextResponse } from "next/server";

import { getSession } from "@/lib/auth";

import {
  CheckoutConflictError,
  CheckoutValidationError,
  confirmCheckout,
} from "@/lib/services/checkoutService";

type ConfirmCheckoutRequest = {
  checkoutToken?: unknown;
  confirmationEmail?: unknown;
  paymentCardId?: unknown;
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

    if (!session) {
      return NextResponse.json(
        {
          error: "You must be logged in to complete checkout.",
        },
        {
          status: 401,
        },
      );
    }

    if (session.role !== "customer") {
      return NextResponse.json(
        {
          error: "Only customer accounts may complete checkout.",
        },
        {
          status: 403,
        },
      );
    }

    const body = (await request.json()) as ConfirmCheckoutRequest;

    const checkoutToken =
      typeof body.checkoutToken === "string"
        ? body.checkoutToken
        : "";

    const confirmationEmail =
      typeof body.confirmationEmail === "string"
        ? body.confirmationEmail
        : "";

    const paymentCardId =
      typeof body.paymentCardId === "number"
        ? body.paymentCardId
        : Number(body.paymentCardId);

    const order = await confirmCheckout({
      checkoutToken,
      userId: session.userId,
      confirmationEmail,
      paymentCardId,
    });

    return NextResponse.json(
      {
        message:
          "Your order was completed successfully.",

        orderId: order.orderId,

        confirmationCode:
          order.confirmationCode,

        confirmationUrl:
          `/orders/${order.orderId}/confirmation`,
      },
      {
        status: 201,
      },
    );
  } catch (error) {
    if (error instanceof CheckoutValidationError) {
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
              : "One or more seats are no longer available.",
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

    console.error("Confirm checkout error:", error);

    return NextResponse.json(
      {
        error: "Unable to complete checkout. Please try again.",
      },
      {
        status: 500,
      },
    );
  }
}