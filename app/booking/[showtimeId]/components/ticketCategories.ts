export type TicketCategoryKey = "adult" | "senior" | "child";

export const TICKET_CATEGORIES: Array<{
  key: TicketCategoryKey;
  label: string;
  description: string;
  price: number;
}> = [
  { key: "adult", label: "Adult", description: "Ages 13–64", price: 14.5 },
  { key: "senior", label: "Senior", description: "Ages 65+", price: 11.5 },
  { key: "child", label: "Child", description: "Ages 12 & under", price: 9.5 },
];

export const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});
