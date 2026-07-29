export interface PaymentReceipt {
  receiptRef: string;
  amount: number;
  paidAt: string;
  provider: "click" | "payme";
}

export interface PaymentProvider {
  // Simulates initiating a checkout and immediately returns a paid receipt.
  // Swap this implementation for a real Click/Payme merchant API integration
  // once merchant credentials are available — the call sites don't change.
  charge(params: { amount: number; orderId: string; provider: "click" | "payme" }): Promise<PaymentReceipt>;
}
