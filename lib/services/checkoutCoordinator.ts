/*
 * The checkout Facade's public contract.
 *
 * The Checkout API Route depends on this interface rather
 * than on the concrete CheckoutService, so the route stays
 * decoupled from the Facade's implementation and from the
 * repositories behind it (Dependency Inversion). The
 * interface exposes only the one operation the route
 * needs (Interface Segregation).
 */
export type CheckoutInput = {
  checkoutToken: string;
  userId: number;
  confirmationEmail: string;
  paymentCardId: number;
};

export type OrderResult = {
  orderId: number;
  confirmationCode: string;
  confirmationEmail: string;
  subtotal: number;
  taxAmount: number;
  totalAmount: number;
  cardType: string;
  cardLastFour: string;
};

export interface CheckoutCoordinator {
  completeCheckout(
    input: CheckoutInput,
  ): Promise<OrderResult>;
}
