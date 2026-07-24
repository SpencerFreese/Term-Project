import Link from "next/link";
import { redirect } from "next/navigation";

import { getSession } from "@/lib/auth";

import {findOrdersByUserId} from "@/lib/repositories/orderRepository";

export const dynamic = "force-dynamic";

const currency = new Intl.NumberFormat(
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

function formatOrderDate(value: string) {
  return new Intl.DateTimeFormat(
    "en-US",
    {
      dateStyle: "medium",
    },
  ).format(new Date(value));
}

export default async function OrdersPage() {
  const session = await getSession();

  if (!session) {
    redirect(
      `/login?returnTo=${encodeURIComponent(
        "/orders",
      )}`,
    );
  }

  if (session.role !== "customer") {
    redirect("/admin");
  }

  const orders =await findOrdersByUserId( session.userId);

  return (
    <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-6 px-6 py-12">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-sky-600 dark:text-sky-400">
            Customer Account
          </p>

          <h1 className="text-3xl font-bold text-zinc-950 dark:text-zinc-50">
            My Orders
          </h1>

          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            View your movie tickets and previous purchases.
          </p>
        </div>

        <div className="flex gap-3">
          <Link
            href="/profile"
            className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-semibold transition hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-900"
          >
            Back to Profile
          </Link>

          <Link
            href="/"
            className="rounded-lg bg-sky-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-sky-500"
          >
            Home
          </Link>
        </div>
      </div>

      {orders.length === 0 ? (
        <section className="rounded-2xl border border-dashed border-zinc-300 bg-white p-8 text-center dark:border-zinc-700 dark:bg-zinc-950">
          <h2 className="text-xl font-bold text-zinc-950 dark:text-zinc-50">
            No orders yet
          </h2>

          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
            Your purchased movie tickets will appear here.
          </p>

          <Link
            href="/"
            className="mt-5 inline-flex rounded-lg bg-sky-600 px-5 py-2.5 font-semibold text-white transition hover:bg-sky-500"
          >
            Browse Movies
          </Link>
        </section>
      ) : (
        <div className="space-y-5">
          {orders.map((order) => {
            const selectedSeats =
              order.seats
                .map(
                  (seat) =>
                    `${seat.rowLabel}${seat.seatNumber}`,
                )
                .join(", ");

            return (
              <article
                key={order.orderId}
                className="space-y-5 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950"
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sky-600 dark:text-sky-400">
                      {order.confirmationCode}
                    </p>

                    <h2 className="mt-1 text-2xl font-bold text-zinc-950 dark:text-zinc-50">
                      {order.movieTitle}
                    </h2>

                    <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                      Ordered{" "}
                      {formatOrderDate(
                        order.createdAt,
                      )}
                    </p>
                  </div>

                  <span
                    className={[
                      "rounded-full px-3 py-1 text-xs font-semibold capitalize",
                      order.status ===
                      "confirmed"
                        ? "bg-green-100 text-green-800 dark:bg-green-950/40 dark:text-green-300"
                        : order.status ===
                            "cancelled"
                          ? "bg-red-100 text-red-800 dark:bg-red-950/40 dark:text-red-300"
                          : "bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300",
                    ].join(" ")}
                  >
                    {order.status}
                  </span>
                </div>

                <dl className="grid gap-4 rounded-xl border border-zinc-200 bg-zinc-50 p-4 text-sm dark:border-zinc-800 dark:bg-black/30 sm:grid-cols-2">
                  <div>
                    <dt className="font-semibold text-zinc-950 dark:text-zinc-50">
                      Showtime
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
                      {order.formatType
                        ? ` · ${order.formatType}`
                        : ""}
                    </dd>
                  </div>

                  <div>
                    <dt className="font-semibold text-zinc-950 dark:text-zinc-50">
                      Seats
                    </dt>

                    <dd className="text-zinc-600 dark:text-zinc-400">
                      {selectedSeats}
                    </dd>
                  </div>

                  <div>
                    <dt className="font-semibold text-zinc-950 dark:text-zinc-50">
                      Confirmation email
                    </dt>

                    <dd className="break-all text-zinc-600 dark:text-zinc-400">
                      {order.confirmationEmail}
                    </dd>
                  </div>
                </dl>

                <div className="space-y-2">
                  <h3 className="font-semibold text-zinc-950 dark:text-zinc-50">
                    Tickets
                  </h3>

                  {order.tickets.map(
                    (ticket) => (
                      <div
                        key={
                          ticket.ticketCategory
                        }
                        className="flex items-center justify-between gap-4 text-sm text-zinc-700 dark:text-zinc-300"
                      >
                        <span className="capitalize">
                          {
                            ticket.ticketCategory
                          }{" "}
                          × {ticket.quantity}
                        </span>

                        <span>
                          {currency.format(
                            ticket.quantity *
                              ticket.unitPrice,
                          )}
                        </span>
                      </div>
                    ),
                  )}
                </div>

                <div className="flex flex-wrap items-center justify-between gap-4 border-t border-zinc-200 pt-4 dark:border-zinc-800">
                  <div>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400">
                      Total
                    </p>

                    <p className="text-xl font-bold text-zinc-950 dark:text-zinc-50">
                      {currency.format(
                        order.totalAmount,
                      )}
                    </p>
                  </div>

                  <Link
                    href={`/orders/${order.orderId}/confirmation`}
                    className="rounded-lg bg-sky-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-sky-500"
                  >
                    View Tickets
                  </Link>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </main>
  );
}