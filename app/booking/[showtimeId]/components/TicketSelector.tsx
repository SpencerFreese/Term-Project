import {
  TICKET_CATEGORIES,
  currency,
  type TicketCategoryKey,
} from "./ticketCategories";

export default function TicketSelector({
  quantities,
  onUpdateQuantity,
}: {
  quantities: Record<TicketCategoryKey, number>;
  onUpdateQuantity: (key: TicketCategoryKey, delta: number) => void;
}) {
  return (
    <section className="space-y-4 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.25em] text-sky-600 dark:text-sky-400">
          Step 1
        </p>
        <h2 className="text-xl font-bold text-zinc-950 dark:text-zinc-50">
          Choose Tickets
        </h2>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        {TICKET_CATEGORIES.map((category) => (
          <div
            key={category.key}
            className="flex flex-col gap-3 rounded-xl border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-black/40"
          >
            <div>
              <p className="text-sm font-bold text-zinc-950 dark:text-zinc-50">
                {category.label}
              </p>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                {category.description}
              </p>
              <p className="mt-1 text-sm font-semibold text-sky-600 dark:text-sky-400">
                {currency.format(category.price)}
              </p>
            </div>

            <div className="flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => onUpdateQuantity(category.key, -1)}
                disabled={quantities[category.key] === 0}
                aria-label={`Decrease ${category.label} tickets`}
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-300 text-lg font-semibold text-zinc-700 transition hover:border-sky-500 hover:text-sky-600 disabled:cursor-not-allowed disabled:opacity-40 dark:border-zinc-700 dark:text-zinc-300"
              >
                −
              </button>

              <span className="min-w-8 text-center text-lg font-bold text-zinc-950 dark:text-zinc-50">
                {quantities[category.key]}
              </span>

              <button
                type="button"
                onClick={() => onUpdateQuantity(category.key, 1)}
                aria-label={`Increase ${category.label} tickets`}
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-300 text-lg font-semibold text-zinc-700 transition hover:border-sky-500 hover:text-sky-600 dark:border-zinc-700 dark:text-zinc-300"
              >
                +
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
