import "server-only";

import { sendEmail } from "@/lib/email";

import type {
  OrderResult,
} from "@/lib/services/checkoutCoordinator";

function formatCurrency(amount: number): string {
  return `$${amount.toFixed(2)}`;
}

export async function sendBookingConfirmation(
  order: OrderResult,
): Promise<void> {
  const subject =
    `Your Cinema E-Booking order ${order.confirmationCode} is confirmed`;

  const text = [
    "Thank you for your order!",
    "",
    `Confirmation code: ${order.confirmationCode}`,
    `Card charged: ${order.cardType} ending in ${order.cardLastFour}`,
    `Subtotal: ${formatCurrency(order.subtotal)}`,
    `Tax: ${formatCurrency(order.taxAmount)}`,
    `Total: ${formatCurrency(order.totalAmount)}`,
  ].join("\n");

  const html = `
    <h1>Thank you for your order!</h1>
    <p>Confirmation code: <strong>${order.confirmationCode}</strong></p>
    <p>Card charged: ${order.cardType} ending in ${order.cardLastFour}</p>
    <p>Subtotal: ${formatCurrency(order.subtotal)}</p>
    <p>Tax: ${formatCurrency(order.taxAmount)}</p>
    <p>Total: ${formatCurrency(order.totalAmount)}</p>
  `;

  await sendEmail(order.confirmationEmail, subject, {
    text,
    html,
  });
}
