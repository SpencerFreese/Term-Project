import {
  TICKET_CATEGORIES,
  type TicketCategoryKey,
} from "./ticketCategories";

const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});


export default function OrderSummary({
  quantities,
  totalTickets,
  totalPrice,
  selectedSeatIds,
  canCheckout,
  checkoutLoading,
  checkoutError,
  onCheckout,
}: {
  quantities: Record<TicketCategoryKey, number>;
  totalTickets: number;
  totalPrice: number;
  selectedSeatIds: Set<number>;
  canCheckout: boolean;
  checkoutLoading: boolean;
  checkoutError: string;
  onCheckout: () => void;
}) {
  return (
    <section className="space-y-4 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.25em] text-sky-600 dark:text-sky-400">
          Step 3
        </p>

        <h2 className="text-xl font-bold text-zinc-950 dark:text-zinc-50">
          Order Summary
        </h2>
      </div>

      <div className="space-y-2 text-sm text-zinc-700 dark:text-zinc-300">
        {TICKET_CATEGORIES.map((category) => {
          const quantity =
            quantities[category.key];

          if (quantity === 0) {
            return null;
          }

          return (
            <div
              key={category.key}
              className="flex items-center justify-between gap-4"
            >
              <span>
                {category.label} × {quantity}
                <span className="ml-1 text-zinc-500 dark:text-zinc-400">
                  at {currency.format(category.price)}
                </span>
              </span>

              <span className="font-semibold">
                {currency.format(
                  category.price * quantity,
                )}
              </span>
            </div>
          );
        })}

        {totalTickets === 0 ? (
          <p className="text-zinc-500 dark:text-zinc-400">
            Select at least one ticket to begin.
          </p>
        ) : null}
      </div>

      <div className="flex items-center justify-between border-t border-zinc-200 pt-4 text-sm dark:border-zinc-800">
        <span className="text-zinc-600 dark:text-zinc-400">
          Seats selected
        </span>

        <span className="font-semibold text-zinc-950 dark:text-zinc-50">
          {selectedSeatIds.size} / {totalTickets}
        </span>
      </div>

      {totalTickets > 0 && !canCheckout ? (
        <p className="rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-700 dark:bg-amber-950/40 dark:text-amber-300">
          Select exactly {totalTickets} seat
          {totalTickets === 1 ? "" : "s"} to continue.
        </p>
      ) : null}

      <div className="flex items-center justify-between border-t border-zinc-200 pt-4 text-base font-bold text-zinc-950 dark:border-zinc-800 dark:text-zinc-50">
        <span>Total before tax</span>
        <span>{currency.format(totalPrice)}</span>
      </div>

      {checkoutError ? (
        <p
          role="alert"
          className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950/40 dark:text-red-300"
        >
          {checkoutError}
        </p>
      ) : null}

      <button
        type="button"
        disabled={!canCheckout || checkoutLoading}
        onClick={onCheckout}
        className="w-full rounded-lg bg-sky-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-sky-500 disabled:cursor-not-allowed disabled:bg-zinc-400 disabled:opacity-60 dark:disabled:bg-zinc-700"
      >
        {checkoutLoading
          ? "Reserving Seats..."
          : "Proceed to Checkout"}
      </button>
    </section>
  );
}