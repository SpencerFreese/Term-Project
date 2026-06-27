import {
  TICKET_CATEGORIES,
  currency,
  type TicketCategoryKey,
} from "./ticketCategories";

export default function OrderSummary({
  quantities,
  totalTickets,
  totalPrice,
}: {
  quantities: Record<TicketCategoryKey, number>;
  totalTickets: number;
  totalPrice: number;
}) {
  return (
    <section className="space-y-3 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
      <h2 className="text-xl font-bold text-zinc-950 dark:text-zinc-50">
        Order Summary
      </h2>

      <dl className="space-y-1 text-sm text-zinc-700 dark:text-zinc-300">
        {TICKET_CATEGORIES.filter((category) => quantities[category.key] > 0).map(
          (category) => (
            <div key={category.key} className="flex items-center justify-between">
              <dt>
                {category.label} x {quantities[category.key]}
              </dt>
              <dd>{currency.format(category.price * quantities[category.key])}</dd>
            </div>
          ),
        )}

        {totalTickets === 0 ? (
          <p className="text-zinc-500 dark:text-zinc-400">
            Add tickets above to see your order total.
          </p>
        ) : null}
      </dl>

      <div className="flex items-center justify-between border-t border-zinc-200 pt-3 text-base font-bold text-zinc-950 dark:border-zinc-800 dark:text-zinc-50">
        <span>Total</span>
        <span>{currency.format(totalPrice)}</span>
      </div>

      <button
        type="button"
        disabled
        className="w-full cursor-not-allowed rounded-lg bg-sky-600/40 px-5 py-2.5 text-sm font-semibold text-white opacity-60"
      >
        Checkout (coming in a later sprint)
      </button>
    </section>
  );
}
