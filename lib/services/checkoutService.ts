import "server-only";

import { randomBytes } from "crypto";

import { withTransaction } from "@/lib/db";
import { lastFourDigits } from "@/lib/cardEncryption";

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


import {findCardByIdForUpdate} from "@/lib/repositories/paymentCardRepository";


import {
  insertOrder,
  insertOrderSeats,
  insertOrderTicketItems,
  type OrderTicketItem,
} from "@/lib/repositories/orderRepository";

import {
  TICKET_PRICES,
  calculateTicketSubtotal,
  getTotalTicketCount,
  type TicketQuantities,
} from "@/lib/ticketPricing";

import {isCardExpired, isValidEmail} from "@/lib/validators";

const MAX_TICKETS_PER_ORDER = 10;

export class CheckoutValidationError
  extends Error {
  constructor(message: string) {
    super(message);
    this.name =
      "CheckoutValidationError";
  }
}

export class CheckoutConflictError
  extends Error {
  constructor(message: string) {
    super(message);
    this.name =
      "CheckoutConflictError";
  }
}

export type CreateBookingDraftInput = {
  userId: number | null;
  showtimeId: number;
  quantities: TicketQuantities;
  seatIds: number[];
};

function validateQuantity(
  value: number,
  label: string,
) {
  if (!Number.isInteger(value) || value < 0) {
    throw new CheckoutValidationError(`${label} ticket quantity is invalid.`);
  }
}

export async function createBookingDraft(input: CreateBookingDraftInput) {
  if (!Number.isInteger(input.showtimeId) || input.showtimeId <= 0) {
    throw new CheckoutValidationError("Invalid showtime.");
  }

  validateQuantity(input.quantities.adult, "Adult");

  validateQuantity(input.quantities.senior, "Senior");

  validateQuantity(input.quantities.child, "Child");

  const totalTickets =getTotalTicketCount(input.quantities);

  if (totalTickets === 0) {
    throw new CheckoutValidationError("Select at least one ticket.");
  }

  if (totalTickets >MAX_TICKETS_PER_ORDER) {
    throw new CheckoutValidationError(`A maximum of ${MAX_TICKETS_PER_ORDER} tickets may be purchased in one order.`);
  }

  const uniqueSeatIds = Array.from(new Set(input.seatIds));

  if (uniqueSeatIds.some((seatId) => !Number.isInteger(seatId) || seatId <= 0)) {
    throw new CheckoutValidationError("One or more selected seats are invalid.");
  }

  if (uniqueSeatIds.length !== totalTickets) {
    throw new CheckoutValidationError("The number of selected seats must match the number of tickets.");
  }

  return withTransaction(
    async (connection) => {
      /*
       * Remove expired drafts and expired
       * reservations before checking availability.
       */
      await deleteExpiredCheckoutData(connection,);

  
      const showtime = await findCheckoutShowtimeForUpdate(connection,input.showtimeId);

      if (!showtime) {
        throw new CheckoutValidationError("The selected showtime does not exist.");
      }

      if (showtime.status !== "scheduled") {
        throw new CheckoutValidationError("This showtime is not available for booking.");
      }

      if (new Date(showtime.startTime).getTime() <= Date.now()) {
        throw new CheckoutValidationError("This showtime has already started.");
      }

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
            showtimeId:
              input.showtimeId,

            theaterRoomId:
              showtime.theaterRoomId,

            seatIds:
              uniqueSeatIds,
          },
        );

      /*
       * If fewer rows are returned, at least one
       * selected seat does not belong to this room.
       */
      if (seats.length !==uniqueSeatIds.length) {
        throw new CheckoutValidationError("One or more seats do not belong to this showtime's theater room.");
      }

      const unavailableSeat =seats.find((seat) => seat.status === "booked" || seat.status === "reserved");

      if (unavailableSeat) {
        throw new CheckoutConflictError("One or more selected seats are no longer available. Return to the seat map and select different seats.");
      }

      const checkoutToken = randomBytes(32).toString("hex");

  

      const {bookingDraftId,expiresAt } = await insertBookingDraft(
        connection,
        {
          userId: input.userId,
          checkoutToken,
          showtimeId: input.showtimeId,
          quantities: input.quantities,
        },
      );

      await insertBookingDraftSeats(connection, bookingDraftId, uniqueSeatIds);

      await reserveCheckoutSeats(
        connection,
        {
          bookingDraftId,
          showtimeId:
            input.showtimeId,
          seatIds:
            uniqueSeatIds,
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

export type ConfirmCheckoutInput = {
  checkoutToken: string;
  userId: number;
  confirmationEmail: string;
  paymentCardId: number;
};

function createConfirmationCode() {return `CE-${randomBytes(6).toString("hex").toUpperCase()}`}


export async function claimBookingDraftForUser(checkoutToken: string, userId: number) {
  const normalizedToken = checkoutToken.trim();

  if (!normalizedToken) {
    throw new CheckoutValidationError("The checkout token is required.");
  }

  if (!Number.isInteger(userId) || userId <= 0) {
    throw new CheckoutValidationError("A valid customer account is required.");
  }

  return withTransaction(
    async (connection) => {
      await deleteExpiredCheckoutData(connection);

      const draft = await findBookingDraftForUpdate(connection, normalizedToken);

      if (!draft) {
        throw new CheckoutValidationError("This checkout has expired or is no longer available.");
      }

      if (draft.userId !== null && draft.userId !== userId) {
        throw new CheckoutValidationError("This checkout belongs to another customer.");
      }

      if (draft.userId === null) {
        await assignBookingDraftToUser( connection, draft.bookingDraftId, userId);
      }

      return {
        bookingDraftId:
          draft.bookingDraftId,
        userId,
      };
    },
  );
}


export async function confirmCheckout(input: ConfirmCheckoutInput) {
  const checkoutToken = input.checkoutToken.trim();

  const confirmationEmail =input.confirmationEmail.trim().toLowerCase();

  if (!checkoutToken) {
    throw new CheckoutValidationError("The checkout token is required.");
  }

  if (!Number.isInteger(input.userId) || input.userId <= 0) {
    throw new CheckoutValidationError("You must be logged in to complete checkout.");
  }

  if (!isValidEmail(confirmationEmail)) {
    throw new CheckoutValidationError("Enter a valid confirmation email.");
  }

  if (!Number.isInteger(input.paymentCardId) ||input.paymentCardId <= 0) {
    throw new CheckoutValidationError("Select a valid payment card.");
  }

  return withTransaction(
    async (connection) => {await deleteExpiredCheckoutData(connection);

      const draft = await findBookingDraftForUpdate(connection, checkoutToken);

      if (!draft) {
        throw new CheckoutValidationError("This checkout has expired or is no longer available.");
      }

      if (draft.userId !== null && draft.userId !== input.userId) {
        throw new CheckoutValidationError("This checkout does not belong to the currently logged-in customer.");
      }

      if (draft.userId === null) {
        await assignBookingDraftToUser(connection, draft.bookingDraftId,input.userId);
      }

      const quantities: TicketQuantities = {
        adult:draft.adultQuantity,
        senior:draft.seniorQuantity,
        child:draft.childQuantity,
      };

      const totalTickets = getTotalTicketCount(quantities);

      if (totalTickets <= 0) {
        throw new CheckoutValidationError("The checkout does not contain any tickets.");
      }

      const seatIds = await findBookingDraftSeatIdsForUpdate(connection, draft.bookingDraftId);

      if ( seatIds.length !==totalTickets) {
        throw new CheckoutValidationError("The number of selected seats does not match the number of tickets.");
      }

      const showtime =await findCheckoutShowtimeForUpdate(connection,draft.showtimeId,);

      if (!showtime) {
        throw new CheckoutValidationError("The selected showtime no longer exists.");
      }

      if (showtime.status !=="scheduled") {
        throw new CheckoutValidationError("This showtime is no longer available.");
      }

      if (new Date(showtime.startTime).getTime() <= Date.now()) {
        throw new CheckoutValidationError("This showtime has already started.");
      }

      const seats =await findCheckoutSeatsForUpdate( connection,
          {
            showtimeId:draft.showtimeId,
            theaterRoomId:showtime.theaterRoomId,
            seatIds,
          },
        );

      if (seats.length !== seatIds.length) {
        throw new CheckoutValidationError("One or more selected seats are invalid.");
      }

      const invalidReservation =
        seats.find((seat) => {
          if (
            seat.status !==
            "reserved"
          ) {
            return true;
          }

          if (!seat.reservedUntil) {
            return true;
          }

          return (
            new Date(
              seat.reservedUntil,
            ).getTime() <= Date.now()
          );
        });

      if (invalidReservation) {
        throw new CheckoutConflictError("One or more seats are no longer reserved. Return to the seat map and select your seats again.");
      }

      const card =
        await findCardByIdForUpdate(
          connection,
          input.paymentCardId,
          input.userId,
        );

      if (!card) {
        throw new CheckoutValidationError("The selected payment card was not found.");
      }

      if (isCardExpired(card.expiryMonth,card.expiryYear,)) {
        throw new CheckoutValidationError("The selected payment card has expired.");
      }

      const subtotal =calculateTicketSubtotal(quantities);

      /*
       * No tax rule has been specified yet.
       * Keep tax at zero until your project
       * defines the required tax rate.
       */
      const taxAmount = 0;
      const totalAmount = subtotal + taxAmount;

      const confirmationCode = createConfirmationCode();

      const orderId =
        await insertOrder(
          connection,
          {
            confirmationCode,
            userId:
              input.userId,
            showtimeId:
              draft.showtimeId,
            confirmationEmail,
            paymentCardId:
              card.cardId,
            cardType:
              card.cardType,
            cardLastFour:
              lastFourDigits(
                card.cardNumberEncrypted,
              ),
            subtotal,
            taxAmount,
            totalAmount,
          },
        );

      const ticketItems: OrderTicketItem[] =
        [
          {
            ticketCategory:
              "adult" as const,
            quantity:
              quantities.adult,
            unitPrice:
              TICKET_PRICES.adult,
          },
          {
            ticketCategory:
              "senior" as const,
            quantity:
              quantities.senior,
            unitPrice:
              TICKET_PRICES.senior,
          },
          {
            ticketCategory:
              "child" as const,
            quantity:
              quantities.child,
            unitPrice:
              TICKET_PRICES.child,
          },
        ].filter(
          (item) =>
            item.quantity > 0,
        );

      await insertOrderTicketItems(connection, orderId, ticketItems);

      await insertOrderSeats(
        connection,
        orderId,
        draft.showtimeId,
        seats.map((seat) => ({
          seatId:
            seat.seatId,
          rowLabel:
            seat.rowLabel,
          seatNumber:
            seat.seatNumber,
          seatType:
            seat.seatType,
        })),
      );

      const bookedSeatCount =
        await markCheckoutSeatsBooked(
          connection,
          {
            showtimeId:
              draft.showtimeId,
            seatIds,
          },
        );

      if (bookedSeatCount !==seatIds.length) {
        throw new CheckoutConflictError("One or more seats could not be booked. No payment was completed.");
      }

      await deleteBookingDraft(connection,draft.bookingDraftId);

      return {
        orderId,
        confirmationCode,
        confirmationEmail,
        subtotal,
        taxAmount,
        totalAmount,
        cardType:
          card.cardType,
        cardLastFour:lastFourDigits(card.cardNumberEncrypted),
      };
    },
  );
}
