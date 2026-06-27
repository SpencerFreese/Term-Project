"use client";

import { useMemo, useState } from "react";

type TicketCategory = {
  label: string;
  price: number;
};

const ticketCategories: TicketCategory[] = [
  { label: "Adult", price: 12.99 },
  { label: "Child", price: 8.99 },
  { label: "Senior", price: 9.99 },
];

const seatRows = ["A", "B", "C", "D", "E"];
const seatsPerRow = 8;

const unavailableSeats = new Set(["A3", "B5", "C4", "D7"]);

export default function BookingPrototypeClient({
  movieTitle,
  showtime,
}: {
  movieTitle: string;
  showtime: string;
}) {
  const [ticketQuantities, setTicketQuantities] = useState({
    Adult: 0,
    Child: 0,
    Senior: 0,
  });

  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);

  const ticketTotal = useMemo(() => {
    return ticketCategories.reduce((total, category) => {
      const quantity =
        ticketQuantities[category.label as keyof typeof ticketQuantities];

      return total + quantity * category.price;
    }, 0);
  }, [ticketQuantities]);

  function updateTicketQuantity(category: string, value: string) {
    const quantity = Math.max(0, Number(value));

    setTicketQuantities((current) => ({
      ...current,
      [category]: quantity,
    }));
  }

  function toggleSeat(seatId: string) {
    if (unavailableSeats.has(seatId)) {
      return;
    }

    setSelectedSeats((current) =>
      current.includes(seatId)
        ? current.filter((seat) => seat !== seatId)
        : [...current, seatId]
    );
  }

  return (
    <>
      <section className="space-y-4 rounded-2xl border p-6">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.3em] text-zinc-500">
            Tickets
          </p>
          <h2 className="text-2xl font-bold">Select Ticket Quantities</h2>
        </div>

        <div className="grid gap-4">
          {ticketCategories.map((category) => (
            <div
              key={category.label}
              className="flex items-center justify-between gap-4 rounded-xl border p-4"
            >
              <div>
                <p className="font-semibold">{category.label}</p>
                <p className="text-sm text-zinc-500">
                  ${category.price.toFixed(2)} each
                </p>
              </div>

              <input
                type="number"
                min="0"
                value={
                  ticketQuantities[
                    category.label as keyof typeof ticketQuantities
                  ]
                }
                onChange={(event) =>
                  updateTicketQuantity(category.label, event.target.value)
                }
                className="w-24 rounded-lg border px-3 py-2 text-right"
              />
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-4 rounded-2xl border p-6">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.3em] text-zinc-500">
            Seat Selection
          </p>
          <h2 className="text-2xl font-bold">Choose Your Seats</h2>
        </div>

        <div className="mx-auto w-full max-w-xl rounded-lg bg-zinc-200 py-2 text-center text-sm font-medium text-zinc-700 dark:bg-zinc-700 dark:text-zinc-200">
          Screen
        </div>

        <div className="space-y-3">
          {seatRows.map((row) => (
            <div key={row} className="flex items-center justify-center gap-2">
              <span className="w-6 text-sm font-semibold">{row}</span>

              {Array.from({ length: seatsPerRow }, (_, index) => {
                const seatId = `${row}${index + 1}`;
                const isSelected = selectedSeats.includes(seatId);
                const isUnavailable = unavailableSeats.has(seatId);

                return (
                  <button
                    key={seatId}
                    type="button"
                    disabled={isUnavailable}
                    onClick={() => toggleSeat(seatId)}
                    className={[
                      "h-10 w-10 rounded-lg border text-sm font-medium transition",
                      isUnavailable
                        ? "cursor-not-allowed bg-zinc-300 text-zinc-500 dark:bg-zinc-800"
                        : isSelected
                        ? "bg-blue-600 text-white"
                        : "bg-white hover:bg-blue-50 dark:bg-zinc-900",
                    ].join(" ")}
                  >
                    {index + 1}
                  </button>
                );
              })}
            </div>
          ))}
        </div>

        <div className="flex flex-wrap gap-4 text-sm text-zinc-600 dark:text-zinc-400">
          <span>Available</span>
          <span className="text-blue-600">Selected</span>
          <span>Unavailable</span>
        </div>
      </section>

      <section className="space-y-3 rounded-2xl border border-dashed p-6">
        <p className="text-sm font-medium uppercase tracking-[0.3em] text-zinc-500">
          Booking Summary
        </p>

        <div className="space-y-1 text-sm">
          <p>
            <span className="font-semibold">Movie:</span> {movieTitle}
          </p>
          <p>
            <span className="font-semibold">Showtime:</span> {showtime}
          </p>
          <p>
            <span className="font-semibold">Selected Seats:</span>{" "}
            {selectedSeats.length > 0 ? selectedSeats.join(", ") : "None"}
          </p>
          <p>
            <span className="font-semibold">Estimated Total:</span>{" "}
            ${ticketTotal.toFixed(2)}
          </p>
        </div>

        <button
          type="button"
          disabled
          className="mt-3 rounded-lg bg-zinc-300 px-4 py-2 text-sm font-semibold text-zinc-600"
        >
          Checkout Disabled — UI Prototype Only
        </button>

        <p className="text-sm text-zinc-500">
          Backend booking logic is not included in this sprint.
        </p>
      </section>
    </>
  );
}