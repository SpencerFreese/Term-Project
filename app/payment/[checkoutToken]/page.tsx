import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { findBookingDraftDetailsByToken } from "@/lib/repositories/bookingDraftRepository";
import { findUserProfileById } from "@/lib/repositories/userRepository";
import { claimBookingDraftForUser } from "@/lib/services/checkoutService";
import { calculateTicketSubtotal, TICKET_PRICES } from "@/lib/ticketPricing";

export const dynamic = "force-dynamic";

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

function getConfirmedEmail(value: string | string[] | undefined, fallback: string) {
  const resolved = Array.isArray(value) ? value[0] : value;

  if (
    typeof resolved === "string" &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(resolved.trim())
  ) {
    return resolved.trim();
  }

  return fallback;
}

export default async function PaymentPage({
  params,
  searchParams,
}: {
  params: Promise<{ checkoutToken: string }>;
  searchParams: Promise<{ email?: string | string[] }>;
}) {
  const { checkoutToken } = await params;
  const resolvedSearchParams = await searchParams;
  const returnTo = `/payment/${checkoutToken}`;

  const session = await getSession();

  if (!session) {
    redirect(`/login?returnTo=${encodeURIComponent(returnTo)}`);
  }

  if (session.role !== "customer") {
    redirect("/admin");
  }

  try {
    await claimBookingDraftForUser(checkoutToken, session.userId);
  } catch {
    notFound();
  }

  const [draft, user] = await Promise.all([
    findBookingDraftDetailsByToken(checkoutToken),
    findUserProfileById(session.userId),
  ]);

  if (!draft || !user) {
    notFound();
  }

  const confirmedEmail = getConfirmedEmail(resolvedSearchParams.email, user.email);
  const selectedSeatLabels = draft.selectedSeats
    .map((seat) => `${seat.rowLabel}${seat.seatNumber}`)
    .join(", ");
  const subtotal = calculateTicketSubtotal(draft.quantities);

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-6 px-6 py-12">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-sky-600 dark:text-sky-400">
            Payment Mockup
          </p>
          <h1 className="text-3xl font-bold text-zinc-950 dark:text-zinc-50">
            Payment Processing
          </h1>
        </div>

        <Link
          href={`/checkout/${checkoutToken}`}
          className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-semibold hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-900"
        >
          Back to Checkout
        </Link>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <section className="space-y-6 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
          <div>
            <h2 className="text-xl font-bold">Payment Details</h2>
            <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
              This page is a mockup for the deliverable. Real payment processing and final order confirmation will be completed in the final demo.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium">Cardholder name</label>
              <input
                disabled
                value="Demo Customer"
                className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-zinc-500 dark:border-zinc-700 dark:bg-zinc-900"
                readOnly
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">Card number</label>
              <input
                disabled
                value="•••• •••• •••• 4242"
                className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-zinc-500 dark:border-zinc-700 dark:bg-zinc-900"
                readOnly
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">Expiration date</label>
              <input
                disabled
                value="12/2028"
                className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-zinc-500 dark:border-zinc-700 dark:bg-zinc-900"
                readOnly
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">Billing ZIP</label>
              <input
                disabled
                value="30332"
                className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-zinc-500 dark:border-zinc-700 dark:bg-zinc-900"
                readOnly
              />
            </div>
          </div>

          <div className="rounded-xl border border-dashed border-sky-300 bg-sky-50 p-4 text-sm text-sky-900 dark:border-sky-800 dark:bg-sky-950/30 dark:text-sky-100">
            Payment processing is intentionally mocked here. No charge is submitted in this deliverable.
          </div>
        </section>

        <aside className="space-y-4 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
          <h2 className="text-xl font-bold">Order Summary</h2>

          <dl className="grid gap-3 text-sm">
            <div>
              <dt className="font-semibold">Movie</dt>
              <dd className="text-zinc-600 dark:text-zinc-400">{draft.movieTitle}</dd>
            </div>

            <div>
              <dt className="font-semibold">Showtime</dt>
              <dd className="text-zinc-600 dark:text-zinc-400">{formatDateTime(draft.startTime)}</dd>
            </div>

            <div>
              <dt className="font-semibold">Theater</dt>
              <dd className="text-zinc-600 dark:text-zinc-400">
                {draft.roomName} · {draft.formatType ?? "Standard"}
              </dd>
            </div>

            <div>
              <dt className="font-semibold">Confirmation email</dt>
              <dd className="text-zinc-600 dark:text-zinc-400">{confirmedEmail}</dd>
            </div>

            <div>
              <dt className="font-semibold">Seats</dt>
              <dd className="text-zinc-600 dark:text-zinc-400">{selectedSeatLabels}</dd>
            </div>
          </dl>

          <div className="space-y-2 border-t border-zinc-200 pt-4 text-sm dark:border-zinc-800">
            {draft.quantities.adult > 0 ? (
              <div className="flex justify-between gap-4">
                <span>Adult × {draft.quantities.adult}</span>
                <span>{currency.format(draft.quantities.adult * TICKET_PRICES.adult)}</span>
              </div>
            ) : null}

            {draft.quantities.senior > 0 ? (
              <div className="flex justify-between gap-4">
                <span>Senior × {draft.quantities.senior}</span>
                <span>{currency.format(draft.quantities.senior * TICKET_PRICES.senior)}</span>
              </div>
            ) : null}

            {draft.quantities.child > 0 ? (
              <div className="flex justify-between gap-4">
                <span>Child × {draft.quantities.child}</span>
                <span>{currency.format(draft.quantities.child * TICKET_PRICES.child)}</span>
              </div>
            ) : null}
          </div>

          <div className="flex items-center justify-between border-t border-zinc-200 pt-4 text-lg font-bold dark:border-zinc-800">
            <span>Total before tax</span>
            <span>{currency.format(subtotal)}</span>
          </div>

          <p className="text-xs text-zinc-500">
            Reservation expires {formatDateTime(draft.expiresAt)}.
          </p>
        </aside>
      </div>
    </main>
  );
}
