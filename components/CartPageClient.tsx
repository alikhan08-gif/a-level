"use client";

import Link from "next/link";
import { useState } from "react";
import { useCart } from "@/lib/cart-context";
import { getDictionary, type Locale } from "@/lib/i18n/dictionaries";
import { formatPrice } from "@/lib/format";
import { getSubjectStyle } from "@/lib/subjectStyle";
import PaymentMethodButton from "@/components/PaymentMethodButton";
import DeliveryMethodButton from "@/components/DeliveryMethodButton";
import type { DeliveryMethod } from "@/lib/types";

type Step = "cart" | "form" | "delivery" | "payment" | "receipt" | "submitted";

type Receipt = {
  receiptRef: string;
  amount: number;
  paidAt: string;
  provider: "click" | "payme";
};

export default function CartPageClient({ locale }: { locale: Locale }) {
  const dict = getDictionary(locale);
  const { items, incrementItem, decrementItem, removeItem, totalPrice, clear } = useCart();

  const [step, setStep] = useState<Step>("cart");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [groupId, setGroupId] = useState<string | null>(null);
  const [receipt, setReceipt] = useState<Receipt | null>(null);
  const [deliveryMethod, setDeliveryMethod] = useState<DeliveryMethod | null>(null);

  function handleFormSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!name.trim() || !phone.trim() || !address.trim()) {
      setError(dict.bookOrder.fillAllFields);
      return;
    }
    setStep("delivery");
  }

  function handleChooseDelivery(method: DeliveryMethod) {
    setDeliveryMethod(method);
    setStep("payment");
  }

  async function handlePay(provider: "click" | "payme") {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/orders/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map((i) => ({ bookId: i.bookId, quantity: i.quantity })),
          name,
          phone,
          address,
          provider,
          deliveryMethod,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? dict.bookOrder.genericError);
      setGroupId(data.groupId);
      setReceipt(data.receipt);
      setStep("receipt");
    } catch (err) {
      setError(err instanceof Error ? err.message : dict.bookOrder.genericError);
    } finally {
      setLoading(false);
    }
  }

  async function handlePaidConfirm() {
    if (!groupId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/orders/group/${groupId}/paid`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? dict.bookOrder.genericError);
      clear();
      setStep("submitted");
    } catch (err) {
      setError(err instanceof Error ? err.message : dict.bookOrder.genericError);
    } finally {
      setLoading(false);
    }
  }

  if (step === "cart") {
    if (items.length === 0) {
      return (
        <div className="mx-auto max-w-2xl px-4 py-16 text-center">
          <h1 className="text-2xl font-bold text-brand-navy mb-3">{dict.cart.title}</h1>
          <p className="text-brand-navy/60 mb-6">{dict.cart.empty}</p>
          <Link
            href="/kitoblar"
            className="inline-block rounded-full bg-brand-navy px-6 py-3 text-white font-semibold hover:bg-brand-navy-light transition-colors"
          >
            {dict.cart.browseBooks}
          </Link>
        </div>
      );
    }

    return (
      <div className="mx-auto max-w-3xl px-4 py-12">
        <h1 className="text-2xl font-bold text-brand-navy mb-8">{dict.cart.title}</h1>

        <div className="space-y-4">
          {items.map((item) => {
            const style = getSubjectStyle(item.subject);
            return (
              <div key={item.bookId} className="flex items-center gap-4 rounded-2xl border border-black/10 bg-white p-4">
                <div
                  className="h-16 w-16 shrink-0 rounded-xl flex items-center justify-center text-2xl overflow-hidden"
                  style={{ backgroundColor: `${style.accent}1a` }}
                >
                  {item.coverImage ? (
                    <img src={item.coverImage} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <span>{style.emoji}</span>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-semibold text-brand-navy line-clamp-2">{item.title}</h3>
                  <div className="text-sm font-bold text-brand-navy mt-1">
                    {formatPrice(item.price)} {dict.kitoblar.currency}
                  </div>
                </div>

                <div className="flex items-center rounded-lg border border-black/10 overflow-hidden shrink-0">
                  <button
                    type="button"
                    onClick={() => decrementItem(item.bookId)}
                    className="px-3 py-1.5 text-brand-navy font-bold hover:bg-black/5 transition-colors"
                  >
                    −
                  </button>
                  <span className="text-sm font-bold text-brand-navy w-6 text-center">{item.quantity}</span>
                  <button
                    type="button"
                    onClick={() => incrementItem(item.bookId)}
                    className="px-3 py-1.5 text-brand-navy font-bold hover:bg-black/5 transition-colors"
                  >
                    +
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => removeItem(item.bookId)}
                  aria-label={dict.cart.remove}
                  className="shrink-0 p-2 text-brand-navy/40 hover:text-red-600 transition-colors"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0-1 14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2L4 6" />
                  </svg>
                </button>
              </div>
            );
          })}
        </div>

        <div className="mt-8 flex items-center justify-between rounded-2xl border border-black/10 bg-white p-5">
          <span className="text-base font-semibold text-brand-navy">{dict.cart.total}</span>
          <span className="text-xl font-bold text-brand-navy">
            {formatPrice(totalPrice)} {dict.kitoblar.currency}
          </span>
        </div>

        <button
          type="button"
          onClick={() => setStep("form")}
          className="mt-4 w-full rounded-full bg-brand-navy px-6 py-3.5 text-white font-semibold hover:bg-brand-navy-light transition-colors"
        >
          {dict.cart.checkout}
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <div className="rounded-2xl border border-black/10 bg-white p-6">
        {error && <div className="mb-4 rounded-lg bg-red-50 text-red-700 text-sm px-3 py-2">{error}</div>}

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
            <button
              type="button"
              onClick={() => setStep("cart")}
              className="block w-full text-center text-sm text-brand-navy/60 hover:underline"
            >
              &larr; {dict.bookOrder.back}
            </button>
          </form>
        )}

        {step === "delivery" && (
          <div className="space-y-4">
            <h2 className="font-bold text-brand-navy mb-1">{dict.bookOrder.chooseDelivery}</h2>
            <div className="grid grid-cols-2 gap-3">
              <DeliveryMethodButton method="UZPOST" onClick={() => handleChooseDelivery("UZPOST")} />
              <DeliveryMethodButton method="BTS" onClick={() => handleChooseDelivery("BTS")} />
            </div>
            <button type="button" onClick={() => setStep("form")} className="text-sm text-brand-navy/60 hover:underline">
              &larr; {dict.bookOrder.back}
            </button>
          </div>
        )}

        {step === "payment" && (
          <div className="space-y-4">
            <h2 className="font-bold text-brand-navy mb-1">{dict.bookOrder.choosePayment}</h2>
            <p className="text-sm text-brand-navy/60">
              {dict.cart.total}: {formatPrice(totalPrice)} {dict.kitoblar.currency}
            </p>
            <div className="grid grid-cols-2 gap-3">
              <PaymentMethodButton provider="click" disabled={loading} onClick={() => handlePay("click")} />
              <PaymentMethodButton provider="payme" disabled={loading} onClick={() => handlePay("payme")} />
            </div>
            {loading && <p className="text-sm text-brand-navy/50">{dict.bookOrder.payInProgress}</p>}
            <button type="button" onClick={() => setStep("delivery")} className="text-sm text-brand-navy/60 hover:underline">
              &larr; {dict.bookOrder.back}
            </button>
          </div>
        )}

        {step === "receipt" && receipt && (
          <div className="space-y-4">
            <h2 className="font-bold text-brand-navy mb-1">{dict.bookOrder.receiptTitle}</h2>
            <div className="rounded-xl bg-black/[0.03] p-4 text-sm space-y-1.5 font-mono">
              <div className="flex justify-between">
                <span>{dict.bookOrder.receiptNumber}</span>
                <span>{receipt.receiptRef}</span>
              </div>
              <div className="flex justify-between">
                <span>{dict.bookOrder.amount}</span>
                <span>
                  {formatPrice(receipt.amount)} {dict.kitoblar.currency}
                </span>
              </div>
              <div className="flex justify-between">
                <span>{dict.bookOrder.method}</span>
                <span>{receipt.provider.toUpperCase()}</span>
              </div>
              <div className="flex justify-between">
                <span>{dict.bookOrder.date}</span>
                <span>{new Date(receipt.paidAt).toLocaleString("uz-UZ")}</span>
              </div>
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
    </div>
  );
}
