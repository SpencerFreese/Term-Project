"use client";

import { useEffect, useMemo, useState } from "react";
import type { Seat } from "@/lib/repositories/seatRepository";
import TicketSelector from "./components/TicketSelector";
import SeatMap from "./components/SeatMap";
import OrderSummary from "./components/OrderSummary";
import {
  TICKET_CATEGORIES,
  type TicketCategoryKey,
} from "./components/ticketCategories";

export default function BookingExperience({ seats }: { seats: Seat[] }) {
  const [quantities, setQuantities] = useState<Record<TicketCategoryKey, number>>({
    adult: 0,
    senior: 0,
    child: 0,
  });

  const [selectedSeatIds, setSelectedSeatIds] = useState<Set<number>>(new Set());

  const totalTickets = quantities.adult + quantities.senior + quantities.child;

  const totalPrice = TICKET_CATEGORIES.reduce(
    (sum, category) => sum + quantities[category.key] * category.price,
    0,
  );

  const hasSelectedTickets = totalTickets > 0;
  const hasSelectedAllSeats =
    hasSelectedTickets && selectedSeatIds.size === totalTickets;

  // Groups seats by row label so the seat map can render one row at a time,
  // sorted alphabetically (e.g. A, B, C...) regardless of the order seats
  // came back from the database.
  const rows = useMemo(() => {
    const byRow = new Map<string, Seat[]>();

    for (const seat of seats) {
      const rowSeats = byRow.get(seat.rowLabel) ?? [];
      rowSeats.push(seat);
      byRow.set(seat.rowLabel, rowSeats);
    }

    return Array.from(byRow.entries()).sort(([a], [b]) => a.localeCompare(b));
  }, [seats]);

  // Adjusts how many tickets of a given category are selected, clamped at 0
  // so decrementing past zero is a no-op.
  function updateQuantity(key: TicketCategoryKey, delta: number) {
    setQuantities((current) => ({
      ...current,
      [key]: Math.max(0, current[key] + delta),
    }));
  }

  // Keeps selected seats in sync with the number of selected tickets.
  // If the user lowers the ticket quantity, extra selected seats are removed.
  // If the ticket quantity reaches zero, all selected seats are cleared.
  useEffect(() => {
    setSelectedSeatIds((current) => {
      if (totalTickets === 0) {
        return current.size === 0 ? current : new Set();
      }

      if (current.size <= totalTickets) {
        return current;
      }

      return new Set(Array.from(current).slice(0, totalTickets));
    });
  }, [totalTickets]);

  // Selects or deselects a seat. Re-clicking a selected seat always
  // deselects it; otherwise the seat is only added if the user has selected
  // at least one ticket and fewer seats are selected than tickets purchased.
  function toggleSeat(seat: Seat) {
    setSelectedSeatIds((current) => {
      const next = new Set(current);

      if (next.has(seat.seatId)) {
        next.delete(seat.seatId);
        return next;
      }

      // Do not allow seat selection until at least one ticket is selected.
      if (totalTickets === 0) {
        return next;
      }

      // Do not allow selecting more seats than tickets.
      if (next.size >= totalTickets) {
        return next;
      }

      next.add(seat.seatId);
      return next;
    });
  }

  return (
    <div className="space-y-6">
      <section className="rounded-lg border p-4">
        <h2 className="mb-4 text-lg font-semibold">1. Select tickets</h2>

        <TicketSelector
          quantities={quantities}
          onUpdateQuantity={updateQuantity}
        />
      </section>

      <section
        className={
          hasSelectedTickets
            ? "rounded-lg border p-4"
            : "hidden"
        }
      >
        <h2 className="mb-4 text-lg font-semibold">2. Select seats</h2>

        <SeatMap
          rows={rows}
          selectedSeatIds={selectedSeatIds}
          totalTickets={totalTickets}
          onToggleSeat={toggleSeat}
        />
      </section>

      <section
        className={
          hasSelectedAllSeats
            ? "rounded-lg border p-4"
            : "hidden"
        }
      >
        <h2 className="mb-4 text-lg font-semibold">3. Review order</h2>

        <OrderSummary
          quantities={quantities}
          totalTickets={totalTickets}
          totalPrice={totalPrice}
        />
      </section>
    </div>
  );
}