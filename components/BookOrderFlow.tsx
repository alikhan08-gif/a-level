"use client";

import { useState } from "react";
import { getDictionary, type Locale } from "@/lib/i18n/dictionaries";
import PaymentMethodButton from "@/components/PaymentMethodButton";

type Step = "form" | "payment" | "receipt" | "submitted";

type Receipt = {
  receiptRef: string;
  amount: number;
  paidAt: string;
  provider: "click" | "payme";
};

export default function BookOrderFlow({
  bookId,
  bookTitle,
  price,
  locale,
}: {
  bookId: string;
  bookTitle: string;
  price: number;
  locale: Locale;
}) {
  const dict = getDictionary(locale);
  const [step, setStep] = useState<Step>("form");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [receipt, setReceipt] = useState<Receipt | null>(null);

  function handleFormSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!name.trim() || !phone.trim() || !address.trim()) {
      setError(dict.bookOrder.fillAllFields);
      return;
    }
    setStep("payment");
  }

  async function handlePay(provider: "click" | "payme") {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookId, name, phone, address, provider }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? dict.bookOrder.genericError);
      setOrderId(data.order.id);
      setReceipt(data.receipt);
      setStep("receipt");
    } catch (err) {
      setError(err instanceof Error ? err.message : dict.bookOrder.genericError);
    } finally {
      setLoading(false);
    }
  }

  async function handlePaidConfirm() {
    if (!orderId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/orders/${orderId}/paid`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? dict.bookOrder.genericError);
      setStep("submitted");
    } catch (err) {
      setError(err instanceof Error ? err.message : dict.bookOrder.genericError);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-2xl border border-black/10 bg-white p-6">
      {error && (
        <div className="mb-4 rounded-lg bg-red-50 text-red-700 text-sm px-3 py-2">{error}</div>
      )}

      {step === "form" && (
        <form onSubmit={handleFormSubmit} className="space-y-4">
          <h2 className="font-bold text-brand-navy mb-1">{dict.bookOrder.orderTitle}</h2>
          <div>
            <label className="block text-sm font-medium text-brand-navy/80 mb-1">{dict.bookOrder.fullName}</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-lg border border-black/15 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-navy/30"
              placeholder={dict.bookOrder.fullNamePlaceholder}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-brand-navy/80 mb-1">{dict.bookOrder.phone}</label>
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full rounded-lg border border-black/15 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-navy/30"
              placeholder="+998 90 123 45 67"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-brand-navy/80 mb-1">{dict.bookOrder.address}</label>
            <textarea
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full rounded-lg border border-black/15 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-navy/30"
              rows={2}
              placeholder={dict.bookOrder.addressPlaceholder}
            />
          </div>
          <button
            type="submit"
            className="w-full rounded-full bg-brand-navy px-6 py-3 text-white font-semibold hover:bg-brand-navy-light transition-colors"
          >
            {dict.bookOrder.continue}
          </button>
        </form>
      )}

      {step === "payment" && (
        <div className="space-y-4">
          <h2 className="font-bold text-brand-navy mb-1">{dict.bookOrder.choosePayment}</h2>
          <p className="text-sm text-brand-navy/60">
            &quot;{bookTitle}&quot; — {price.toLocaleString("uz-UZ")} {dict.kitoblar.currency}
          </p>
          <div className="grid grid-cols-2 gap-3">
            <PaymentMethodButton provider="click" disabled={loading} onClick={() => handlePay("click")} />
            <PaymentMethodButton provider="payme" disabled={loading} onClick={() => handlePay("payme")} />
          </div>
          {loading && <p className="text-sm text-brand-navy/50">{dict.bookOrder.payInProgress}</p>}
          <button
            type="button"
            onClick={() => setStep("form")}
            className="text-sm text-brand-navy/60 hover:underline"
          >
            &larr; {dict.bookOrder.back}
          </button>
        </div>
      )}

      {step === "receipt" && receipt && (
        <div className="space-y-4">
          <h2 className="font-bold text-brand-navy mb-1">{dict.bookOrder.receiptTitle}</h2>
          <div className="rounded-xl bg-black/[0.03] p-4 text-sm space-y-1.5 font-mono">
            <div className="flex justify-between"><span>{dict.bookOrder.receiptNumber}</span><span>{receipt.receiptRef}</span></div>
            <div className="flex justify-between"><span>{dict.bookOrder.amount}</span><span>{receipt.amount.toLocaleString("uz-UZ")} {dict.kitoblar.currency}</span></div>
            <div className="flex justify-between"><span>{dict.bookOrder.method}</span><span>{receipt.provider.toUpperCase()}</span></div>
            <div className="flex justify-between"><span>{dict.bookOrder.date}</span><span>{new Date(receipt.paidAt).toLocaleString("uz-UZ")}</span></div>
          </div>
          <div className="grid gap-3">
            <button
              type="button"
              disabled={loading}
              onClick={handlePaidConfirm}
              className="rounded-full bg-brand-navy px-6 py-3 text-white font-semibold hover:bg-brand-navy-light transition-colors disabled:opacity-50"
            >
              {dict.bookOrder.iPaid}
            </button>
            <a
              href="https://t.me/harrington_academy_admin"
              target="_blank"
              rel="noopener noreferrer"
              className="text-center rounded-full border border-black/15 px-6 py-3 font-semibold text-brand-navy hover:border-brand-navy/40 transition-colors"
            >
              {dict.bookOrder.contactAdmin}
            </a>
          </div>
        </div>
      )}

      {step === "submitted" && (
        <div className="text-center py-4">
          <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5">
              <path d="M20 6 9 17l-5-5" />
            </svg>
          </div>
          <h2 className="font-bold text-brand-navy mb-2">{dict.bookOrder.submittedTitle}</h2>
          <p className="text-sm text-brand-navy/70">{dict.bookOrder.submittedText}</p>
        </div>
      )}
    </div>
  );
}
