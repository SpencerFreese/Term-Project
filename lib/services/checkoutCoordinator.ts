export type CompleteCheckoutInput = {
  checkoutToken: string;
  userId: number;
  confirmationEmail: string;
  paymentCardId: number;
};

export type CompleteCheckoutResult = {
  orderId: number;
  confirmationCode: string;
  confirmationEmail: string;
  subtotal: number;
  taxAmount: number;
  totalAmount: number;
  cardType: string | null;
  cardLastFour: string;
  emailStatus: "sent" | "failed";
};

export interface CheckoutCoordinator {
  completeCheckout(input: CompleteCheckoutInput): Promise<CompleteCheckoutResult>;
}