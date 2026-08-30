import type { PaymentProviderId } from "@/lib/types";

export interface PaymentReceipt {
  receiptRef: string;
  amount: number;
  paidAt: string;
  provider: PaymentProviderId;
}

export interface PaymentProvider {
  // Simulates initiating a checkout and immediately returns a paid receipt.
  // Swap this implementation for real merchant API integrations once
  // credentials are available — the call sites don't change.
  charge(params: { amount: number; orderId: string; provider: PaymentProviderId }): Promise<PaymentReceipt>;
}
