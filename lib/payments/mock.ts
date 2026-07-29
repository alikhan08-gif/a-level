import type { PaymentProvider, PaymentReceipt } from "./types";

export const mockPaymentProvider: PaymentProvider = {
  async charge({ amount, orderId, provider }): Promise<PaymentReceipt> {
    return {
      receiptRef: `MOCK-${provider.toUpperCase()}-${orderId}-${Date.now()}`,
      amount,
      paidAt: new Date().toISOString(),
      provider,
    };
  },
};
