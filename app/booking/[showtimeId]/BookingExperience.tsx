"use client";

import { useMemo, useState } from "react";
import type { Seat } from "@/lib/repositories/seatRepository";
import TicketSelector from "./components/TicketSelector";
import SeatMap from "./components/SeatMap";
import OrderSummary from "./components/OrderSummary";
import { TICKET_CATEGORIES, type TicketCategoryKey } from "./components/ticketCategories";

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

  // Selects or deselects a seat. Re-clicking a selected seat always
  // deselects it; otherwise the seat is only added if fewer seats are
  // selected than tickets purchased.
  function toggleSeat(seat: Seat) {
    setSelectedSeatIds((current) => {
      const next = new Set(current);

      if (next.has(seat.seatId)) {
        next.delete(seat.seatId);
        return next;
      }

      if (totalTickets > 0 && next.size >= totalTickets) {
        return next;
      }

      next.add(seat.seatId);
      return next;
    });
  }

  return (
    <div className="space-y-6">
      <TicketSelector quantities={quantities} onUpdateQuantity={updateQuantity} />

      <SeatMap
        rows={rows}
        selectedSeatIds={selectedSeatIds}
        totalTickets={totalTickets}
        onToggleSeat={toggleSeat}
      />

      <OrderSummary
        quantities={quantities}
        totalTickets={totalTickets}
        totalPrice={totalPrice}
      />
    </div>
  );
}
