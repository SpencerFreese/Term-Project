export const TICKET_PRICES = {
  adult: 14.5,
  senior: 11.5,
  child: 9.5,
} as const;

export type TicketCategory =
  keyof typeof TICKET_PRICES;

export type TicketQuantities = Record<
  TicketCategory,
  number
>;

export function calculateTicketSubtotal(quantities: TicketQuantities): number {
  return (
    quantities.adult *
      TICKET_PRICES.adult +
    quantities.senior *
      TICKET_PRICES.senior +
    quantities.child *
      TICKET_PRICES.child
  );
}

export function getTotalTicketCount(quantities: TicketQuantities): number {
  return (
    quantities.adult +
    quantities.senior +
    quantities.child
  );
}