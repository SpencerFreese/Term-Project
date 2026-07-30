export const TICKET_PRICES = {
  adult: 14.5,
  senior: 11.5,
  child: 9.5,
} as const;

export const TAX_RATE = 0.06;

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

export function calculateTax(subtotal: number): number {
  return Math.round(subtotal * TAX_RATE * 100) / 100;
}

export function calculateOrderTotal(subtotal: number, taxAmount: number): number {
  return Math.round((subtotal + taxAmount) * 100) / 100;
}