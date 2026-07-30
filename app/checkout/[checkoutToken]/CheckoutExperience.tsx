"use client";

import Link from "next/link";
import {useEffect,useMemo, useState} from "react";
import { useRouter } from "next/navigation";

import {TICKET_PRICES, calculateOrderTotal, calculateTax, calculateTicketSubtotal, type TicketQuantities} from "@/lib/ticketPricing";

type CheckoutSeat = {
  seatId: number;
  rowLabel: string;
  seatNumber: number;
  seatType: string;
  availability: "available" | "reserved" | "booked";
};

type SelectedSeat = {
  seatId: number;
  rowLabel: string;
  seatNumber: number;
  seatType: string;
};

type MaskedCard = {
  cardId: number;
  cardholderName: string;
  cardType: string | null;
  expiryMonth: string;
  expiryYear: string;
  lastFour: string;
};

type EmailChoice = "account"| "different";

const EMPTY_CARD = {
  cardNumber: "",
  cardholderName: "",
  expiryMonth: "",
  expiryYear: "",
};

const currency =
  new Intl.NumberFormat(
    "en-US",
    {
      style: "currency",
      currency: "USD",
    },
  );

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat(
    "en-US",
    {
      dateStyle: "long",
      timeStyle: "short",
    },
  ).format(new Date(value));
}

export default function CheckoutExperience({
  checkoutToken,
  accountEmail,
  movieTitle,
  startTime,
  roomName,
  formatType,
  quantities,
  seats,
  selectedSeats,
  cards,
  expiresAt,
}: {
  checkoutToken: string;
  accountEmail: string;
  movieTitle: string;
  startTime: string;
  roomName: string;
  formatType: string | null;
  quantities: TicketQuantities;
  seats: CheckoutSeat[];
  selectedSeats: SelectedSeat[];
  cards: MaskedCard[];
  expiresAt: string;
}) {
  const router = useRouter();

  const [emailChoice, setEmailChoice] =useState<EmailChoice>( "account");

  const [ differentEmail, setDifferentEmail] = useState("");

  const [selectedCardId, setSelectedCardId] = useState<number | null>(cards[0]?.cardId ?? null);

  const [showCardForm, setShowCardForm] =useState(cards.length === 0);

  const [cardForm, setCardForm] =useState(EMPTY_CARD);

  const [cardError, setCardError] =useState("");

  const [cardSuccess, setCardSuccess] = useState("");

  const [cardLoading, setCardLoading] =useState(false);

  const [finalCheckoutLoading,setFinalCheckoutLoading] = useState(false);

  const [ finalCheckoutError, setFinalCheckoutError] = useState("");
    

  /*
   * Keep the selected card valid after
   * router.refresh() reloads the card list.
   */
  useEffect(() => {
    const selectedCardStillExists =
      cards.some(
        (card) =>
          card.cardId ===
          selectedCardId,
      );

    if (!selectedCardStillExists) {
      setSelectedCardId( cards[0]?.cardId ?? null);
    }
  }, [cards, selectedCardId]);

  const selectedSeatIds =
    useMemo(
      () =>
        new Set(
          selectedSeats.map(
            (seat) => seat.seatId,
          ),
        ),
      [selectedSeats],
    );

  const rows = useMemo(() => {
    const grouped =new Map<string, CheckoutSeat[]>();

    for (const seat of seats) {
      const rowSeats = grouped.get(seat.rowLabel,) ?? [];

      rowSeats.push(seat);

      grouped.set(seat.rowLabel, rowSeats);
    }

    return Array.from(
      grouped.entries(),
    ).sort(([a], [b]) =>
      a.localeCompare(b),
    );
  }, [seats]);

  const subtotal = calculateTicketSubtotal(quantities);
  const taxAmount = calculateTax(subtotal);
  const totalAmount = calculateOrderTotal(subtotal, taxAmount);

  const confirmationEmail =
    emailChoice === "account"
      ? accountEmail
      : differentEmail.trim();

  const emailIsValid =
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(confirmationEmail);

  const checkoutIsReady =emailIsValid && selectedCardId !== null;

  async function addCard(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setCardError("");
    setCardSuccess("");
    setCardLoading(true);

    try {
      const response = await fetch(
        "/api/profile/payment-cards",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify(
            cardForm,
          ),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        setCardError(data.error ?? "Payment card could not be saved.");

        return;
      }

      setCardSuccess(data.message ?? "Payment card added successfully.");

      setCardForm(EMPTY_CARD);
      setShowCardForm(false);

      router.refresh();
    } 
    catch {
      setCardError( "Could not connect to the server.");
    } 
    finally {
      setCardLoading(false); 
    }
  }

  async function completeCheckout() {
    if (
      !checkoutIsReady ||
      selectedCardId === null ||
      finalCheckoutLoading
    ) {
      return;
    }

    setFinalCheckoutLoading(true);
    setFinalCheckoutError("");

    try {
      const response = await fetch(
        "/api/checkout/confirm",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            checkoutToken,
            confirmationEmail,
            paymentCardId:
              selectedCardId,
          }),
        },
      );

      const data =
        (await response.json()) as {
          orderId?: number;
          confirmationUrl?: string;
          error?: string;
        };

      if (!response.ok || !data.orderId) {
        throw new Error(data.error ?? "Unable to complete checkout." );
      }

      router.replace( data.confirmationUrl ?? `/orders/${data.orderId}/confirmation`);
    } 
    catch (error) {
      setFinalCheckoutError(
        error instanceof Error
          ? error.message
          : "Unable to complete checkout.",
      );
    } 
    finally {
      setFinalCheckoutLoading(false);
    }
  }

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-sky-600 dark:text-sky-400">
            Secure Checkout
          </p>

          <h1 className="text-3xl font-bold text-zinc-950 dark:text-zinc-50">
            Review Your Order
          </h1>
        </div>

        <Link
          href="/"
          className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-semibold hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-900"
        >
          Home
        </Link>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.35fr_0.85fr]">
        <div className="space-y-6">
          {/* Movie information */}
          <section className="space-y-4 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
            <h2 className="text-xl font-bold">
              Movie and Showtime
            </h2>

            <dl className="grid gap-4 text-sm sm:grid-cols-2">
              <div>
                <dt className="font-semibold">
                  Movie
                </dt>

                <dd className="text-zinc-600 dark:text-zinc-400">
                  {movieTitle}
                </dd>
              </div>

              <div>
                <dt className="font-semibold">
                  Date and time
                </dt>

                <dd className="text-zinc-600 dark:text-zinc-400">
                  {formatDateTime(
                    startTime,
                  )}
                </dd>
              </div>

              <div>
                <dt className="font-semibold">
                  Theater
                </dt>

                <dd className="text-zinc-600 dark:text-zinc-400">
                  {roomName}
                </dd>
              </div>

              <div>
                <dt className="font-semibold">
                  Format
                </dt>

                <dd className="text-zinc-600 dark:text-zinc-400">
                  {formatType ??
                    "Standard"}
                </dd>
              </div>
            </dl>
          </section>

          {/* Visual seat map */}
          <section className="space-y-4 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
            <div>
              <h2 className="text-xl font-bold">
                Selected Seats
              </h2>

              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                {selectedSeats
                  .map(
                    (seat) =>
                      `${seat.rowLabel}${seat.seatNumber}`,
                  )
                  .join(", ")}
              </p>
            </div>

            <div className="mx-auto w-fit rounded-full bg-zinc-200 px-12 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
              Screen
            </div>

            <div className="flex flex-col items-center gap-2 overflow-x-auto">
              {rows.map(
                ([
                  rowLabel,
                  rowSeats,
                ]) => (
                  <div
                    key={rowLabel}
                    className="flex items-center gap-3"
                  >
                    <span className="w-5 text-center text-xs font-bold text-zinc-500">
                      {rowLabel}
                    </span>

                    <div className="flex gap-2">
                      {rowSeats.map(
                        (seat) => {
                          const isSelected =
                            selectedSeatIds.has(
                              seat.seatId,
                            );

                          const isUnavailable =
                            seat.availability !==
                            "available";

                          return (
                            <span
                              key={
                                seat.seatId
                              }
                              title={`Seat ${seat.rowLabel}${seat.seatNumber}`}
                              className={[
                                "flex h-8 w-8 items-center justify-center rounded-md border text-[10px] font-semibold",
                                isSelected
                                  ? "border-sky-500 bg-sky-600 text-white"
                                  : isUnavailable
                                    ? "border-zinc-600 bg-zinc-700 text-zinc-300 opacity-60"
                                    : "border-zinc-300 bg-zinc-50 text-zinc-500 dark:border-zinc-700 dark:bg-zinc-900",
                              ].join(
                                " ",
                              )}
                            >
                              {
                                seat.seatNumber
                              }
                            </span>
                          );
                        },
                      )}
                    </div>
                  </div>
                ),
              )}
            </div>

            <p className="text-xs text-zinc-500">
              Selected seats are shown
              in blue.
            </p>
          </section>

          {/* Confirmation email */}
          <section className="space-y-4 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
            <div>
              <h2 className="text-xl font-bold">
                Confirmation Email
              </h2>

              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                Choose where the order
                confirmation should be
                sent.
              </p>
            </div>

            <label className="flex items-start gap-3 rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
              <input
                type="radio"
                name="emailChoice"
                checked={
                  emailChoice ===
                  "account"
                }
                onChange={() =>
                  setEmailChoice(
                    "account",
                  )
                }
              />

              <span>
                <span className="block font-semibold">
                  Use my account email
                </span>

                <span className="text-sm text-zinc-600 dark:text-zinc-400">
                  {accountEmail}
                </span>
              </span>
            </label>

            <label className="flex items-start gap-3 rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
              <input
                type="radio"
                name="emailChoice"
                checked={
                  emailChoice ===
                  "different"
                }
                onChange={() =>
                  setEmailChoice(
                    "different",
                  )
                }
              />

              <span className="w-full">
                <span className="block font-semibold">
                  Use a different email
                </span>

                {emailChoice ===
                "different" ? (
                  <input
                    type="email"
                    value={
                      differentEmail
                    }
                    onChange={(event) =>
                      setDifferentEmail(
                        event.target
                          .value,
                      )
                    }
                    placeholder="customer@example.com"
                    className="mt-3 w-full rounded-lg border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900"
                  />
                ) : null}
              </span>
            </label>

            {!emailIsValid ? (
              <p className="text-sm text-red-600 dark:text-red-400">
                Enter a valid
                confirmation email.
              </p>
            ) : null}
          </section>

          {/* Payment cards */}
          <section className="space-y-4 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
            <div>
              <h2 className="text-xl font-bold">
                Payment Method
              </h2>

              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                Select one of your saved
                cards or add another one.
              </p>
            </div>

            {cards.length > 0 ? (
              <div className="space-y-3">
                {cards.map((card) => (
                  <label
                    key={card.cardId}
                    className="flex items-center gap-3 rounded-lg border border-zinc-200 p-4 dark:border-zinc-800"
                  >
                    <input
                      type="radio"
                      name="paymentCard"
                      checked={
                        selectedCardId ===
                        card.cardId
                      }
                      onChange={() =>
                        setSelectedCardId(
                          card.cardId,
                        )
                      }
                    />

                    <span>
                      <span className="block font-semibold">
                        {card.cardType ??
                          "Card"}{" "}
                        ••••{" "}
                        {card.lastFour}
                      </span>

                      <span className="text-sm text-zinc-600 dark:text-zinc-400">
                        {
                          card.cardholderName
                        }{" "}
                        · Expires{" "}
                        {
                          card.expiryMonth
                        }
                        /
                        {card.expiryYear}
                      </span>
                    </span>
                  </label>
                ))}
              </div>
            ) : (
              <p className="rounded-lg bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:bg-amber-950/40 dark:text-amber-200">
                Add a payment card to
                continue.
              </p>
            )}

            <button
              type="button"
              onClick={() =>
                setShowCardForm(
                  (current) =>
                    !current,
                )
              }
              disabled={
                cards.length >= 3
              }
              className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-semibold hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-700 dark:hover:bg-zinc-900"
            >
              {showCardForm
                ? "Cancel adding card"
                : "Add another card"}
            </button>

            {cards.length >= 3 ? (
              <p className="text-sm text-amber-600">
                You have reached the
                maximum of three saved
                cards.
              </p>
            ) : null}

            {showCardForm &&
            cards.length < 3 ? (
              <form
                onSubmit={addCard}
                className="space-y-4 rounded-xl border border-zinc-200 p-4 dark:border-zinc-800"
              >
                <div>
                  <label className="mb-1 block text-sm font-medium">
                    Card number
                  </label>

                  <input
                    required
                    inputMode="numeric"
                    autoComplete="cc-number"
                    value={
                      cardForm.cardNumber
                    }
                    onChange={(event) =>
                      setCardForm(
                        (current) => ({
                          ...current,
                          cardNumber:
                            event.target
                              .value,
                        }),
                      )
                    }
                    className="w-full rounded-lg border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium">
                    Cardholder name
                  </label>

                  <input
                    required
                    autoComplete="cc-name"
                    value={
                      cardForm.cardholderName
                    }
                    onChange={(event) =>
                      setCardForm(
                        (current) => ({
                          ...current,
                          cardholderName:
                            event.target
                              .value,
                        }),
                      )
                    }
                    className="w-full rounded-lg border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900"
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-sm font-medium">
                      Expiry month
                    </label>

                    <input
                      required
                      placeholder="MM"
                      maxLength={2}
                      inputMode="numeric"
                      value={
                        cardForm.expiryMonth
                      }
                      onChange={(event) =>
                        setCardForm(
                          (current) => ({
                            ...current,
                            expiryMonth:
                              event.target
                                .value,
                          }),
                        )
                      }
                      className="w-full rounded-lg border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium">
                      Expiry year
                    </label>

                    <input
                      required
                      placeholder="YYYY"
                      maxLength={4}
                      inputMode="numeric"
                      value={
                        cardForm.expiryYear
                      }
                      onChange={(event) =>
                        setCardForm(
                          (current) => ({
                            ...current,
                            expiryYear:
                              event.target
                                .value,
                          }),
                        )
                      }
                      className="w-full rounded-lg border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900"
                    />
                  </div>
                </div>

                {cardError ? (
                  <p
                    role="alert"
                    className="rounded-lg bg-red-100 px-3 py-2 text-sm text-red-700"
                  >
                    {cardError}
                  </p>
                ) : null}

                {cardSuccess ? (
                  <p
                    role="status"
                    className="rounded-lg bg-green-100 px-3 py-2 text-sm text-green-800"
                  >
                    {cardSuccess}
                  </p>
                ) : null}

                <button
                  type="submit"
                  disabled={
                    cardLoading
                  }
                  className="rounded-lg bg-sky-600 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-500 disabled:opacity-60"
                >
                  {cardLoading
                    ? "Saving..."
                    : "Save Card"}
                </button>
              </form>
            ) : null}
          </section>
        </div>

        {/* Order summary */}
        <aside className="h-fit space-y-4 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950 lg:sticky lg:top-6">
          <h2 className="text-xl font-bold">
            Order Summary
          </h2>

          <div className="space-y-2 text-sm">
            {quantities.adult > 0 ? (
              <div className="flex justify-between gap-4">
                <span>
                  Adult ×{" "}
                  {quantities.adult}
                </span>

                <span>
                  {currency.format(
                    quantities.adult *
                      TICKET_PRICES.adult,
                  )}
                </span>
              </div>
            ) : null}

            {quantities.senior > 0 ? (
              <div className="flex justify-between gap-4">
                <span>
                  Senior ×{" "}
                  {quantities.senior}
                </span>

                <span>
                  {currency.format(
                    quantities.senior *
                      TICKET_PRICES.senior,
                  )}
                </span>
              </div>
            ) : null}

            {quantities.child > 0 ? (
              <div className="flex justify-between gap-4">
                <span>
                  Child ×{" "}
                  {quantities.child}
                </span>

                <span>
                  {currency.format(
                    quantities.child *
                      TICKET_PRICES.child,
                  )}
                </span>
              </div>
            ) : null}
          </div>

          <div className="border-t border-zinc-200 pt-4 dark:border-zinc-800">
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              Seats
            </p>

            <p className="font-semibold">
              {selectedSeats
                .map(
                  (seat) =>
                    `${seat.rowLabel}${seat.seatNumber}`,
                )
                .join(", ")}
            </p>
          </div>

          <div className="space-y-2 border-t border-zinc-200 pt-4 dark:border-zinc-800">
            <div className="flex items-center justify-between text-sm">
              <span>Subtotal</span>
              <span>{currency.format(subtotal)}</span>
            </div>

            <div className="flex items-center justify-between text-sm">
              <span>Tax (6%)</span>
              <span>{currency.format(taxAmount)}</span>
            </div>

            <div className="flex items-center justify-between border-t border-zinc-200 pt-3 text-lg font-bold dark:border-zinc-800">
              <span>Total</span>
              <span>{currency.format(totalAmount)}</span>
            </div>
          </div>

          <p className="text-xs text-zinc-500">
            Reservation expires{" "}
            {formatDateTime(expiresAt)}.
          </p>

          <button
            type="button"
            disabled={
              !checkoutIsReady ||
              finalCheckoutLoading
            }
            onClick={completeCheckout}
            className="w-full rounded-lg bg-sky-600 px-5 py-3 font-semibold text-white transition hover:bg-sky-500 disabled:cursor-not-allowed disabled:bg-zinc-400 disabled:opacity-60 dark:disabled:bg-zinc-700"
          >
            {finalCheckoutLoading
              ? "Completing Order..."
              : "Complete Checkout"}
          </button>

          {finalCheckoutError ? (
            <p
              role="alert"
              className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950/40 dark:text-red-300"
            >
              {finalCheckoutError}
            </p>
          ) : null}

          {!checkoutIsReady ? (
            <p className="text-sm text-amber-600 dark:text-amber-400">
              Select a payment card and
              enter a valid email to
              continue.
            </p>
          ) : (
            <p className="text-sm text-zinc-500">
              
            </p>
          )}
        </aside>
      </div>
    </>
  );
}