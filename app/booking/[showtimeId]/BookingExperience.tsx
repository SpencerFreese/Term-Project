"use client";

import { useMemo, useState } from "react";
import type { Seat } from "@/lib/repositories/seatRepository";
import TicketSelector from "./components/TicketSelector";
import SeatMap from "./components/SeatMap";
import OrderSummary from "./components/OrderSummary";
import { TICKET_CATEGORIES, type TicketCategoryKey } from "./components/ticketCategories";
import { useRouter } from "next/navigation";

export default function BookingExperience({ seats, showtimeId}: {
  seats: Seat[];
  showtimeId: number;
}) {

  const router = useRouter();

  const [checkoutLoading, setCheckoutLoading] =
    useState(false);

  const [checkoutError, setCheckoutError] =
    useState("");
  const [quantities, setQuantities] = useState<Record<TicketCategoryKey, number>>({
    adult: 0,
    senior: 0,
    child: 0,
  });
  const [selectedSeatIds, setSelectedSeatIds] = useState<Set<number>>(new Set());

  const totalTickets = quantities.adult + quantities.senior + quantities.child;

  const canCheckout =totalTickets > 0 && selectedSeatIds.size === totalTickets;

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
    setQuantities((current) => {
      const next = {
        ...current,
        [key]: Math.max(0, current[key] + delta),
      };

      const nextTotalTickets =
        next.adult + next.senior + next.child;

      setSelectedSeatIds((currentSeatIds) => {
        if (currentSeatIds.size <= nextTotalTickets) {
          return currentSeatIds;
        }

        return new Set(
          Array.from(currentSeatIds).slice(0, nextTotalTickets),
        );
      });

      return next;
    });
  }

  // Selects or deselects a seat. Re-clicking a selected seat always
  // deselects it; otherwise the seat is only added if fewer seats are
  // selected than tickets purchased.
  function toggleSeat(seat: Seat) {
    const isSelectable =
      seat.availability === "available" ||
      seat.availability === "reserved_by_you";

    if (!isSelectable || totalTickets === 0) {
      return;
    }

  setSelectedSeatIds((current) => {
    const next = new Set(current);

    if (next.has(seat.seatId)) {
      next.delete(seat.seatId);
      return next;
    }

    if (next.size >= totalTickets) {
      return next;
    }

    next.add(seat.seatId);
    return next;
  });
}

  async function beginCheckout() {
  if (!canCheckout || checkoutLoading) {
    return;
  }

  setCheckoutLoading(true);
  setCheckoutError("");

  try {
    const response = await fetch(
      "/api/checkout/drafts",
      {
        method: "POST",
        headers: {
          "Content-Type":
            "application/json",
        },
        body: JSON.stringify({
          showtimeId,
          quantities,
          seatIds: Array.from(
            selectedSeatIds,
          ),
        }),
      },
    );

    const data = (await response.json()) as {
      checkoutUrl?: string;
      error?: string;
    };

    if (
      !response.ok ||
      !data.checkoutUrl
    ) {
      throw new Error(
        data.error ??
          "Unable to begin checkout.",
      );
    }

    router.push(data.checkoutUrl);
  } catch (error) {
    setCheckoutError(
      error instanceof Error
        ? error.message
        : "Unable to begin checkout.",
    );
  } finally {
    setCheckoutLoading(false);
  }
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
        selectedSeatIds={selectedSeatIds}
        canCheckout={canCheckout}
        checkoutLoading={checkoutLoading}
        checkoutError={checkoutError}
        onCheckout={beginCheckout}
      />
    </div>
  );
}
