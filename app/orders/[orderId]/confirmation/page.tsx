import Link from "next/link";
import {notFound, redirect} from "next/navigation";

import { getSession } from "@/lib/auth";

  import {findOrderByIdForUser} from "@/lib/repositories/orderRepository";

export const dynamic = "force-dynamic";

const currency =
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  });

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat(
    "en-US",
    {
      dateStyle: "long",
      timeStyle: "short",
    },
  ).format(new Date(value));
}

export default async function OrderConfirmationPage({
  params,
}: {
  params: Promise<{
    orderId: string;
  }>;
}) {
  const { orderId } = await params;

  const parsedOrderId = Number(orderId);

  if (!Number.isInteger(parsedOrderId) ||parsedOrderId <= 0 ) {
    notFound();
  }

  const session = await getSession();

  if (!session) {
    const returnTo = `/orders/${parsedOrderId}/confirmation`;

    redirect(`/login?returnTo=${encodeURIComponent(returnTo)}`);
  }

  if (session.role !== "customer") {
    redirect("/admin");
  }

  const order =
    await findOrderByIdForUser(parsedOrderId,session.userId );

  /*
   * This also prevents one customer from
   * viewing another customer's order.
   */
  if (!order) {
    notFound();
  }

  const selectedSeatLabels =
    order.seats
      .map(
        (seat) =>
          `${seat.rowLabel}${seat.seatNumber}`,
      )
      .join(", ");

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 px-6 py-12">
      <section className="space-y-5 rounded-2xl border border-green-300 bg-green-50 p-6 shadow-sm dark:border-green-900 dark:bg-green-950/30">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-green-700 dark:text-green-400">
            Order Confirmed
          </p>

          <h1 className="mt-1 text-3xl font-bold text-zinc-950 dark:text-zinc-50">
            Thank You for Your Purchase
          </h1>

          <p className="mt-2 text-zinc-700 dark:text-zinc-300">
            Your tickets have been booked successfully.
          </p>
        </div>

        <div className="rounded-xl border border-green-200 bg-white p-4 dark:border-green-900 dark:bg-zinc-950">
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Confirmation code
          </p>

          <p className="text-xl font-bold tracking-wide text-zinc-950 dark:text-zinc-50">
            {order.confirmationCode}
          </p>
        </div>
      </section>

      <section className="space-y-5 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
        <h2 className="text-xl font-bold text-zinc-950 dark:text-zinc-50">
          Movie and Showtime
        </h2>

        <dl className="grid gap-4 text-sm sm:grid-cols-2">
          <div>
            <dt className="font-semibold text-zinc-950 dark:text-zinc-50">
              Movie
            </dt>

            <dd className="text-zinc-600 dark:text-zinc-400">
              {order.movieTitle}
            </dd>
          </div>

          <div>
            <dt className="font-semibold text-zinc-950 dark:text-zinc-50">
              Date and time
            </dt>

            <dd className="text-zinc-600 dark:text-zinc-400">
              {formatDateTime(
                order.startTime,
              )}
            </dd>
          </div>

          <div>
            <dt className="font-semibold text-zinc-950 dark:text-zinc-50">
              Theater
            </dt>

            <dd className="text-zinc-600 dark:text-zinc-400">
              {order.roomName}
            </dd>
          </div>

          <div>
            <dt className="font-semibold text-zinc-950 dark:text-zinc-50">
              Format
            </dt>

            <dd className="text-zinc-600 dark:text-zinc-400">
              {order.formatType ??
                "Standard"}
            </dd>
          </div>
        </dl>
      </section>

      <section className="space-y-5 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
        <h2 className="text-xl font-bold text-zinc-950 dark:text-zinc-50">
          Tickets and Seats
        </h2>

        <div className="space-y-3 text-sm">
          {order.tickets.map(
            (ticket) => (
              <div
                key={
                  ticket.ticketCategory
                }
                className="flex items-center justify-between gap-4"
              >
                <span className="capitalize text-zinc-700 dark:text-zinc-300">
                  {
                    ticket.ticketCategory
                  }{" "}
                  × {ticket.quantity}
                  <span className="ml-1 text-zinc-500 dark:text-zinc-400">
                    at{" "}
                    {currency.format(
                      ticket.unitPrice,
                    )}
                  </span>
                </span>

                <span className="font-semibold">
                  {currency.format(
                    ticket.quantity *
                      ticket.unitPrice,
                  )}
                </span>
              </div>
            ),
          )}
        </div>

        <div className="border-t border-zinc-200 pt-4 dark:border-zinc-800">
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Selected seats
          </p>

          <p className="font-semibold text-zinc-950 dark:text-zinc-50">
            {selectedSeatLabels}
          </p>
        </div>
      </section>

      <section className="space-y-4 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
        <h2 className="text-xl font-bold text-zinc-950 dark:text-zinc-50">
          Payment and Confirmation
        </h2>

        <dl className="space-y-3 text-sm">
          <div className="flex justify-between gap-4">
            <dt className="text-zinc-600 dark:text-zinc-400">
              Confirmation email
            </dt>

            <dd className="text-right font-semibold">
              {order.confirmationEmail}
            </dd>
          </div>

          <div className="flex justify-between gap-4">
            <dt className="text-zinc-600 dark:text-zinc-400">
              Payment method
            </dt>

            <dd className="font-semibold">
              {order.cardType ??
                "Card"}{" "}
              ending in{" "}
              {order.cardLastFour}
            </dd>
          </div>

          <div className="flex justify-between gap-4">
            <dt className="text-zinc-600 dark:text-zinc-400">
              Subtotal
            </dt>

            <dd>
              {currency.format(
                order.subtotal,
              )}
            </dd>
          </div>

          <div className="flex justify-between gap-4">
            <dt className="text-zinc-600 dark:text-zinc-400">
              Tax
            </dt>

            <dd>
              {currency.format(
                order.taxAmount,
              )}
            </dd>
          </div>

          <div className="flex justify-between gap-4 border-t border-zinc-200 pt-3 text-base font-bold dark:border-zinc-800">
            <dt>Total</dt>

            <dd>
              {currency.format(
                order.totalAmount,
              )}
            </dd>
          </div>
        </dl>

        {order.emailStatus ===
        "sent" ? (
          <p className="rounded-lg bg-green-100 px-3 py-2 text-sm text-green-800 dark:bg-green-950/40 dark:text-green-300">
            A confirmation email was sent successfully.
          </p>
        ) : order.emailStatus ===
          "failed" ? (
          <p className="rounded-lg bg-amber-100 px-3 py-2 text-sm text-amber-800 dark:bg-amber-950/40 dark:text-amber-300">
            Your order is confirmed, but the confirmation email could not be sent.
          </p>
        ) : (
          <p className="rounded-lg bg-zinc-100 px-3 py-2 text-sm text-zinc-700 dark:bg-zinc-900 dark:text-zinc-300">
            Confirmation email delivery is pending.
          </p>
        )}
      </section>

      <div className="flex flex-wrap gap-3">
        <Link
          href="/orders"
          className="rounded-lg bg-sky-600 px-5 py-2.5 font-semibold text-white transition hover:bg-sky-500"
        >
          View My Orders
        </Link>

        <Link
          href="/"
          className="rounded-lg border border-zinc-300 px-5 py-2.5 font-semibold transition hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-900"
        >
          Return Home
        </Link>
      </div>
    </main>
  );
}