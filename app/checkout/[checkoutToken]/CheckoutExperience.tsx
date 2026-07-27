"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  TICKET_PRICES,
  calculateTicketSubtotal,
  type TicketQuantities,
} from "@/lib/ticketPricing";

type SelectedSeat = {
  seatId: number;
  rowLabel: string;
  seatNumber: number;
  seatType: string;
};

type EmailChoice = "account" | "different";

const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "long",
    timeStyle: "short",
  }).format(new Date(value));
}

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export default function CheckoutExperience({
  checkoutToken,
  accountEmail,
  movieTitle,
  startTime,
  roomName,
  formatType,
  quantities,
  selectedSeats,
  expiresAt,
}: {
  checkoutToken: string;
  accountEmail: string;
  movieTitle: string;
  startTime: string;
  roomName: string;
  formatType: string | null;
  quantities: TicketQuantities;
  selectedSeats: SelectedSeat[];
  expiresAt: string;
}) {
  const router = useRouter();
  const [emailChoice, setEmailChoice] = useState<EmailChoice>("account");
  const [differentEmail, setDifferentEmail] = useState("");

  const subtotal = calculateTicketSubtotal(quantities);

  const confirmationEmail =
    emailChoice === "account" ? accountEmail : differentEmail.trim();

  const emailIsValid = isValidEmail(confirmationEmail);

  const selectedSeatLabels = useMemo(
    () =>
      selectedSeats
        .map((seat) => `${seat.rowLabel}${seat.seatNumber}`)
        .join(", "),
    [selectedSeats],
  );

  function continueToPayment() {
    if (!emailIsValid) {
      return;
    }

    router.push(
      `/payment/${checkoutToken}?email=${encodeURIComponent(confirmationEmail)}`,
    );
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
          <section className="space-y-4 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
            <h2 className="text-xl font-bold">Movie and Showtime</h2>

            <dl className="grid gap-4 text-sm sm:grid-cols-2">
              <div>
                <dt className="font-semibold">Movie</dt>
                <dd className="text-zinc-600 dark:text-zinc-400">{movieTitle}</dd>
              </div>

              <div>
                <dt className="font-semibold">Date and time</dt>
                <dd className="text-zinc-600 dark:text-zinc-400">
                  {formatDateTime(startTime)}
                </dd>
              </div>

              <div>
                <dt className="font-semibold">Theater</dt>
                <dd className="text-zinc-600 dark:text-zinc-400">{roomName}</dd>
              </div>

              <div>
                <dt className="font-semibold">Format</dt>
                <dd className="text-zinc-600 dark:text-zinc-400">
                  {formatType ?? "Standard"}
                </dd>
              </div>
            </dl>
          </section>

          <section className="space-y-4 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
            <h2 className="text-xl font-bold">Selected Seats</h2>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              {selectedSeatLabels}
            </p>
          </section>

          <section className="space-y-4 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
            <div>
              <h2 className="text-xl font-bold">Confirmation Email</h2>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                Choose where the booking confirmation should be sent.
              </p>
            </div>

            <label className="flex items-start gap-3 rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
              <input
                type="radio"
                name="emailChoice"
                checked={emailChoice === "account"}
                onChange={() => setEmailChoice("account")}
              />

              <span>
                <span className="block font-semibold">Use my account email</span>
                <span className="text-sm text-zinc-600 dark:text-zinc-400">
                  {accountEmail}
                </span>
              </span>
            </label>

            <label className="flex items-start gap-3 rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
              <input
                type="radio"
                name="emailChoice"
                checked={emailChoice === "different"}
                onChange={() => setEmailChoice("different")}
              />

              <span className="w-full">
                <span className="block font-semibold">Use a different email</span>

                {emailChoice === "different" ? (
                  <input
                    type="email"
                    value={differentEmail}
                    onChange={(event) => setDifferentEmail(event.target.value)}
                    placeholder="customer@example.com"
                    className="mt-3 w-full rounded-lg border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900"
                  />
                ) : null}
              </span>
            </label>

            {!emailIsValid ? (
              <p className="text-sm text-red-600 dark:text-red-400">
                Enter a valid confirmation email.
              </p>
            ) : null}
          </section>
        </div>

        <aside className="h-fit space-y-4 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950 lg:sticky lg:top-6">
          <h2 className="text-xl font-bold">Order Summary</h2>

          <div className="space-y-2 text-sm">
            {quantities.adult > 0 ? (
              <div className="flex justify-between gap-4">
                <span>Adult × {quantities.adult}</span>
                <span>{currency.format(quantities.adult * TICKET_PRICES.adult)}</span>
              </div>
            ) : null}

            {quantities.senior > 0 ? (
              <div className="flex justify-between gap-4">
                <span>Senior × {quantities.senior}</span>
                <span>{currency.format(quantities.senior * TICKET_PRICES.senior)}</span>
              </div>
            ) : null}

            {quantities.child > 0 ? (
              <div className="flex justify-between gap-4">
                <span>Child × {quantities.child}</span>
                <span>{currency.format(quantities.child * TICKET_PRICES.child)}</span>
              </div>
            ) : null}
          </div>

          <div className="border-t border-zinc-200 pt-4 dark:border-zinc-800">
            <p className="text-sm text-zinc-600 dark:text-zinc-400">Seats</p>
            <p className="font-semibold">{selectedSeatLabels}</p>
          </div>

          <div className="flex items-center justify-between border-t border-zinc-200 pt-4 text-lg font-bold dark:border-zinc-800">
            <span>Total before tax</span>
            <span>{currency.format(subtotal)}</span>
          </div>

          <p className="text-xs text-zinc-500">
            Reservation expires {formatDateTime(expiresAt)}.
          </p>

          <button
            type="button"
            disabled={!emailIsValid}
            onClick={continueToPayment}
            className="w-full rounded-lg bg-sky-600 px-5 py-3 font-semibold text-white transition hover:bg-sky-500 disabled:cursor-not-allowed disabled:bg-zinc-400 disabled:opacity-60 dark:disabled:bg-zinc-700"
          >
            Continue to Payment
          </button>

          {!emailIsValid ? (
            <p className="text-sm text-amber-600 dark:text-amber-400">
              Enter a valid email to continue to the payment page.
            </p>
          ) : (
            <p className="text-sm text-zinc-500">
              Payment is shown on the next page and is not processed in this deliverable.
            </p>
          )}
        </aside>
      </div>
    </>
  );
}
