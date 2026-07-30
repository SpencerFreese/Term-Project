import "server-only";

import { randomBytes } from "crypto";

import { lastFourDigits } from "@/lib/cardEncryption";
import { withTransaction } from "@/lib/db";

import {
  assignBookingDraftToUser,
  deleteBookingDraft,
  deleteExpiredCheckoutData,
  deleteUserDraftsForShowtime,
  findBookingDraftForUpdate,
  findBookingDraftSeatIdsForUpdate,
  findCheckoutSeatsForUpdate,
  findCheckoutShowtimeForUpdate,
  insertBookingDraft,
  insertBookingDraftSeats,
  markCheckoutSeatsBooked,
  reserveCheckoutSeats,
} from "@/lib/repositories/bookingDraftRepository";

import {
  findCardByIdForUpdate,
} from "@/lib/repositories/paymentCardRepository";

import {
  insertOrder,
  insertOrderSeats,
  insertOrderTicketItems,
  updateOrderEmailStatus,
  type OrderTicketItem,
} from "@/lib/repositories/orderRepository";

import {
  type CheckoutCoordinator,
  type CheckoutInput,
  type OrderResult,
} from "@/lib/services/checkoutCoordinator";

import {
  sendBookingConfirmation,
} from "@/lib/services/notificationService";

import {
  TICKET_PRICES,
  calculateTicketSubtotal,
  getTotalTicketCount,
  type TicketQuantities,
} from "@/lib/ticketPricing";

import {
  isCardExpired,
  isValidEmail,
} from "@/lib/validators";

const MAX_TICKETS_PER_ORDER = 10;

/*
 * Domain errors thrown by the checkout Facade.
 *
 * The API route can translate these errors into
 * appropriate HTTP responses.
 */
export class CheckoutValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "CheckoutValidationError";
  }
}

export class CheckoutConflictError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "CheckoutConflictError";
  }
}

/*
 * Input used when initially creating a checkout draft
 * and reserving the customer's selected seats.
 */
export type CreateBookingDraftInput = {
  userId: number | null;
  showtimeId: number;
  quantities: TicketQuantities;
  seatIds: number[];
};

/*
 * CheckoutInput and OrderResult are defined on the
 * CheckoutCoordinator interface and re-exported here so
 * existing callers can keep importing them from the
 * Facade module.
 */
export type {
  CheckoutInput,
  OrderResult,
};

function validateQuantity(
  value: number,
  label: string,
): void {
  if (!Number.isInteger(value) || value < 0) {
    throw new CheckoutValidationError(
      `${label} ticket quantity is invalid.`,
    );
  }
}

function createConfirmationCode(): string {
  return `CE-${randomBytes(6)
    .toString("hex")
    .toUpperCase()}`;
}

/*
 * Notification failures should not undo or misrepresent
 * an order that has already committed successfully.
 */
async function sendBookingConfirmationSafely(
  order: OrderResult,
): Promise<void> {
  try {
    await sendBookingConfirmation(order);
  } catch (error) {
    console.error(
      `Order ${order.orderId} completed, but the ` +
        "booking-confirmation email could not be sent.",
      error,
    );
  }
}

/*
 * Creates a temporary checkout draft and reserves the
 * selected seats.
 */
export async function createBookingDraft(
  input: CreateBookingDraftInput,
) {
  if (
    !Number.isInteger(input.showtimeId) ||
    input.showtimeId <= 0
  ) {
    throw new CheckoutValidationError(
      "Invalid showtime.",
    );
  }

  validateQuantity(
    input.quantities.adult,
    "Adult",
  );

  validateQuantity(
    input.quantities.senior,
    "Senior",
  );

  validateQuantity(
    input.quantities.child,
    "Child",
  );

  const totalTickets = getTotalTicketCount(
    input.quantities,
  );

  if (totalTickets === 0) {
    throw new CheckoutValidationError(
      "Select at least one ticket.",
    );
  }

  if (totalTickets > MAX_TICKETS_PER_ORDER) {
    throw new CheckoutValidationError(
      `A maximum of ${MAX_TICKETS_PER_ORDER} tickets ` +
        "may be purchased in one order.",
    );
  }

  const uniqueSeatIds = Array.from(
    new Set(input.seatIds),
  );

  const containsInvalidSeatId =
    uniqueSeatIds.some(
      (seatId) =>
        !Number.isInteger(seatId) ||
        seatId <= 0,
    );

  if (containsInvalidSeatId) {
    throw new CheckoutValidationError(
      "One or more selected seats are invalid.",
    );
  }

  if (uniqueSeatIds.length !== totalTickets) {
    throw new CheckoutValidationError(
      "The number of selected seats must match " +
        "the number of tickets.",
    );
  }

  return withTransaction(
    async (connection) => {
      /*
       * Remove expired drafts and reservations before
       * checking the current seat availability.
       */
      await deleteExpiredCheckoutData(connection);

      const showtime =
        await findCheckoutShowtimeForUpdate(
          connection,
          input.showtimeId,
        );

      if (!showtime) {
        throw new CheckoutValidationError(
          "The selected showtime does not exist.",
        );
      }

      if (showtime.status !== "scheduled") {
        throw new CheckoutValidationError(
          "This showtime is not available for booking.",
        );
      }

      const showtimeStart =
        new Date(showtime.startTime).getTime();

      if (showtimeStart <= Date.now()) {
        throw new CheckoutValidationError(
          "This showtime has already started.",
        );
      }

      /*
       * A signed-in customer should have only one active
       * draft for a particular showtime.
       */
      if (input.userId !== null) {
        await deleteUserDraftsForShowtime(
          connection,
          {
            userId: input.userId,
            showtimeId: input.showtimeId,
          },
        );
      }

      const seats =
        await findCheckoutSeatsForUpdate(
          connection,
          {
            showtimeId: input.showtimeId,
            theaterRoomId:
              showtime.theaterRoomId,
            seatIds: uniqueSeatIds,
          },
        );

      /*
       * If fewer rows are returned, at least one selected
       * seat does not belong to the showtime's room.
       */
      if (
        seats.length !== uniqueSeatIds.length
      ) {
        throw new CheckoutValidationError(
          "One or more seats do not belong to " +
            "this showtime's theater room.",
        );
      }

      const unavailableSeat = seats.find(
        (seat) =>
          seat.status === "booked" ||
          seat.status === "reserved",
      );

      if (unavailableSeat) {
        throw new CheckoutConflictError(
          "One or more selected seats are no longer " +
            "available. Return to the seat map and " +
            "select different seats.",
        );
      }

      const checkoutToken = randomBytes(32)
        .toString("hex");

      const {
        bookingDraftId,
        expiresAt,
      } = await insertBookingDraft(
        connection,
        {
          userId: input.userId,
          checkoutToken,
          showtimeId: input.showtimeId,
          quantities: input.quantities,
        },
      );

      await insertBookingDraftSeats(
        connection,
        bookingDraftId,
        uniqueSeatIds,
      );

      await reserveCheckoutSeats(
        connection,
        {
          bookingDraftId,
          showtimeId: input.showtimeId,
          seatIds: uniqueSeatIds,
        },
      );

      return {
        bookingDraftId,
        checkoutToken,
        expiresAt,
      };
    },
  );
}

/*
 * Associates an anonymous checkout draft with the
 * customer after the customer logs in.
 */
export async function claimBookingDraftForUser(
  checkoutToken: string,
  userId: number,
) {
  const normalizedToken =
    checkoutToken.trim();

  if (!normalizedToken) {
    throw new CheckoutValidationError(
      "The checkout token is required.",
    );
  }

  if (
    !Number.isInteger(userId) ||
    userId <= 0
  ) {
    throw new CheckoutValidationError(
      "A valid customer account is required.",
    );
  }

  return withTransaction(
    async (connection) => {
      await deleteExpiredCheckoutData(
        connection,
      );

      const draft =
        await findBookingDraftForUpdate(
          connection,
          normalizedToken,
        );

      if (!draft) {
        throw new CheckoutValidationError(
          "This checkout has expired or is no " +
            "longer available.",
        );
      }

      if (
        draft.userId !== null &&
        draft.userId !== userId
      ) {
        throw new CheckoutValidationError(
          "This checkout belongs to another customer.",
        );
      }

      if (draft.userId === null) {
        await assignBookingDraftToUser(
          connection,
          draft.bookingDraftId,
          userId,
        );
      }

      return {
        bookingDraftId:
          draft.bookingDraftId,
        userId,
      };
    },
  );
}

/*
 * Facade operation
 *
 * This is the single high-level operation called by the
 * Checkout API Route. It hides the repository calls and
 * checkout sequence from the controller.
 */
export async function completeCheckout(
  input: CheckoutInput,
): Promise<OrderResult> {
  const checkoutToken =
    input.checkoutToken.trim();

  const confirmationEmail =
    input.confirmationEmail
      .trim()
      .toLowerCase();

  /*
   * Validate basic request data before opening a
   * database transaction.
   */
  if (!checkoutToken) {
    throw new CheckoutValidationError(
      "The checkout token is required.",
    );
  }

  if (
    !Number.isInteger(input.userId) ||
    input.userId <= 0
  ) {
    throw new CheckoutValidationError(
      "You must be logged in to complete checkout.",
    );
  }

  if (!isValidEmail(confirmationEmail)) {
    throw new CheckoutValidationError(
      "Enter a valid confirmation email.",
    );
  }

  if (
    !Number.isInteger(input.paymentCardId) ||
    input.paymentCardId <= 0
  ) {
    throw new CheckoutValidationError(
      "Select a valid payment card.",
    );
  }

  /*
   * All database changes required for checkout are
   * performed atomically within one transaction.
   */
  const order = await withTransaction(
    async (
      connection,
    ): Promise<OrderResult> => {
      /*
       * 1. Remove expired checkout records.
       */
      await deleteExpiredCheckoutData(
        connection,
      );

      /*
       * 2. Retrieve and lock the booking draft.
       */
      const draft =
        await findBookingDraftForUpdate(
          connection,
          checkoutToken,
        );

      if (!draft) {
        throw new CheckoutValidationError(
          "This checkout has expired or is no " +
            "longer available.",
        );
      }

      /*
       * 3. Verify draft ownership.
       */
      if (
        draft.userId !== null &&
        draft.userId !== input.userId
      ) {
        throw new CheckoutValidationError(
          "This checkout does not belong to the " +
            "currently logged-in customer.",
        );
      }

      if (draft.userId === null) {
        await assignBookingDraftToUser(
          connection,
          draft.bookingDraftId,
          input.userId,
        );
      }

      /*
       * 4. Reconstruct and validate the ticket order.
       */
      const quantities: TicketQuantities = {
        adult: draft.adultQuantity,
        senior: draft.seniorQuantity,
        child: draft.childQuantity,
      };

      const totalTickets =
        getTotalTicketCount(quantities);

      if (totalTickets <= 0) {
        throw new CheckoutValidationError(
          "The checkout does not contain any tickets.",
        );
      }

      if (
        totalTickets >
        MAX_TICKETS_PER_ORDER
      ) {
        throw new CheckoutValidationError(
          `A maximum of ${MAX_TICKETS_PER_ORDER} ` +
            "tickets may be purchased in one order.",
        );
      }

      /*
       * 5. Retrieve the seats stored in the draft.
       */
      const seatIds =
        await findBookingDraftSeatIdsForUpdate(
          connection,
          draft.bookingDraftId,
        );

      if (
        seatIds.length !== totalTickets
      ) {
        throw new CheckoutValidationError(
          "The number of selected seats does not " +
            "match the number of tickets.",
        );
      }

      /*
       * 6. Retrieve and validate the showtime.
       */
      const showtime =
        await findCheckoutShowtimeForUpdate(
          connection,
          draft.showtimeId,
        );

      if (!showtime) {
        throw new CheckoutValidationError(
          "The selected showtime no longer exists.",
        );
      }

      if (showtime.status !== "scheduled") {
        throw new CheckoutValidationError(
          "This showtime is no longer available.",
        );
      }

      const showtimeStart =
        new Date(showtime.startTime).getTime();

      if (showtimeStart <= Date.now()) {
        throw new CheckoutValidationError(
          "This showtime has already started.",
        );
      }

      /*
       * 7. Retrieve and lock the selected seats.
       */
      const seats =
        await findCheckoutSeatsForUpdate(
          connection,
          {
            showtimeId: draft.showtimeId,
            theaterRoomId:
              showtime.theaterRoomId,
            seatIds,
          },
        );

      if (seats.length !== seatIds.length) {
        throw new CheckoutValidationError(
          "One or more selected seats are invalid.",
        );
      }

      /*
       * Every selected seat must still be reserved and
       * its reservation must not have expired.
       */
      const invalidReservation = seats.find(
        (seat) => {
          if (seat.status !== "reserved") {
            return true;
          }

          if (!seat.reservedUntil) {
            return true;
          }

          const reservationExpiration =
            new Date(
              seat.reservedUntil,
            ).getTime();

          return (
            reservationExpiration <= Date.now()
          );
        },
      );

      if (invalidReservation) {
        throw new CheckoutConflictError(
          "One or more seats are no longer reserved. " +
            "Return to the seat map and select your " +
            "seats again.",
        );
      }

      /*
       * 8. Retrieve and validate the customer's card.
       */
      const card =
        await findCardByIdForUpdate(
          connection,
          input.paymentCardId,
          input.userId,
        );

      if (!card) {
        throw new CheckoutValidationError(
          "The selected payment card was not found.",
        );
      }

      if (
        isCardExpired(
          card.expiryMonth,
          card.expiryYear,
        )
      ) {
        throw new CheckoutValidationError(
          "The selected payment card has expired.",
        );
      }

      /*
       * 9. Calculate authoritative server-side prices.
       */
      const subtotal =
        calculateTicketSubtotal(quantities);

      /*
       * No tax rule has been specified yet.
       * Keep tax at zero until the project defines
       * a required tax rate.
       */
      const taxAmount = 0;
      const totalAmount =
        subtotal + taxAmount;

      const confirmationCode =
        createConfirmationCode();

      const cardLastFour =
        lastFourDigits(
          card.cardNumberEncrypted,
        );

      /*
       * 10. Create the order.
       */
      const orderId = await insertOrder(
        connection,
        {
          confirmationCode,
          userId: input.userId,
          showtimeId:
            draft.showtimeId,
          confirmationEmail,
          paymentCardId:
            card.cardId,
          cardType:
            card.cardType,
          cardLastFour,
          subtotal,
          taxAmount,
          totalAmount,
        },
      );

      /*
       * 11. Create the order's ticket-category items.
       */
      const ticketItems: OrderTicketItem[] = [
        {
          ticketCategory: "adult",
          quantity:
            quantities.adult,
          unitPrice:
            TICKET_PRICES.adult,
        },
        {
          ticketCategory: "senior",
          quantity:
            quantities.senior,
          unitPrice:
            TICKET_PRICES.senior,
        },
        {
          ticketCategory: "child",
          quantity:
            quantities.child,
          unitPrice:
            TICKET_PRICES.child,
        },
      ].filter(
        (item) => item.quantity > 0,
      );

      await insertOrderTicketItems(
        connection,
        orderId,
        ticketItems,
      );

      /*
       * 12. Save a snapshot of the booked seats on the
       * order so order history does not depend on future
       * changes to the theater-seat records.
       */
      await insertOrderSeats(
        connection,
        orderId,
        draft.showtimeId,
        seats.map((seat) => ({
          seatId: seat.seatId,
          rowLabel: seat.rowLabel,
          seatNumber:
            seat.seatNumber,
          seatType: seat.seatType,
        })),
      );

      /*
       * 13. Convert the seat reservations into permanent
       * bookings.
       */
      const bookedSeatCount =
        await markCheckoutSeatsBooked(
          connection,
          {
            showtimeId:
              draft.showtimeId,
            seatIds,
          },
        );

      if (
        bookedSeatCount !== seatIds.length
      ) {
        throw new CheckoutConflictError(
          "One or more seats could not be booked. " +
            "No payment was completed.",
        );
      }

      /*
       * 14. Remove the completed booking draft.
       */
      await deleteBookingDraft(
        connection,
        draft.bookingDraftId,
      );

      return {
        orderId,
        confirmationCode,
        confirmationEmail,
        subtotal,
        taxAmount,
        totalAmount,
        cardType: card.cardType,
        cardLastFour,
      };
    },
  );

  /*
   * withTransaction() has committed successfully at this
   * point. Attempt the notification without holding
   * database locks.
   */
  await sendBookingConfirmationSafely(order);

  return order;
}

/*
 * The Facade, exposed through the CheckoutCoordinator
 * interface. The Checkout API Route depends on this
 * object typed as CheckoutCoordinator rather than on the
 * module's individual exports.
 */
export const checkoutService: CheckoutCoordinator = {
  completeCheckout,
};
