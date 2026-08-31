"use client";

import { useState } from "react";
import { getDictionary, type Locale } from "@/lib/i18n/dictionaries";
import { formatPrice } from "@/lib/format";
import { DELIVERY_METHOD_LABELS, getDeliveryFee, type DeliveryMethod } from "@/lib/types";

type Order = {
  id: string;
  quantity: number;
  name: string;
  phone: string;
  address: string;
  status: "CONFIRMED" | "REJECTED";
  deliveryMethod: string | null;
  receiptRef: string | null;
  rejectReason: string | null;
  createdAt: string | Date;
  book: { title: string; price: number };
};

export default function AdminRecentOrdersPanel({ orders, locale }: { orders: Order[]; locale: Locale }) {
  const dict = getDictionary(locale);
  const [openId, setOpenId] = useState<string | null>(null);

  if (orders.length === 0) {
    return <p className="p-5 text-sm text-brand-navy/50">{dict.admin.none}</p>;
  }

  return (
    <div className="divide-y divide-black/5">
      {orders.map((order) => {
        const open = openId === order.id;
        const deliveryFee = order.deliveryMethod
          ? getDeliveryFee(order.deliveryMethod as DeliveryMethod, order.quantity)
          : 0;
        const total = order.book.price * order.quantity + deliveryFee;
        return (
          <div key={order.id}>
            <button
              type="button"
              onClick={() => setOpenId(open ? null : order.id)}
              className="flex w-full items-center justify-between gap-3 px-5 py-3 text-sm text-left hover:bg-black/[0.02] transition-colors"
            >
              <span className="text-brand-navy">
                {order.name} — {order.book.title}
              </span>
              <span className="flex items-center gap-2 shrink-0">
                <span
                  className={`text-xs font-semibold rounded-full px-2.5 py-1 ${
                    order.status === "CONFIRMED" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                  }`}
                >
                  {order.status === "CONFIRMED" ? dict.admin.confirmed : dict.admin.rejected}
                </span>
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  className={`text-brand-navy/40 transition-transform ${open ? "rotate-180" : ""}`}
                >
                  <path d="M6 9l6 6 6-6" />
                </svg>
              </span>
            </button>
            {open && (
              <div className="px-5 pb-4 text-sm text-brand-navy/70 space-y-1">
                <p>
                  {dict.admin.phone}: {order.phone}
                </p>
                <p>{order.address}</p>
                {order.deliveryMethod && (
                  <p>
                    {dict.bookOrder.deliveryMethod}: {DELIVERY_METHOD_LABELS[order.deliveryMethod as DeliveryMethod] ?? order.deliveryMethod}
                  </p>
                )}
                <p>
                  {order.book.title} — {order.quantity} ta — {formatPrice(order.book.price * order.quantity)} {dict.kitoblar.currency}
                </p>
                {deliveryFee > 0 && (
                  <p>
                    {dict.bookOrder.deliveryMethod} — {formatPrice(deliveryFee)} {dict.kitoblar.currency}
                  </p>
                )}
                <p className="font-semibold text-brand-navy">
                  {dict.cart.total}: {formatPrice(total)} {dict.kitoblar.currency}
                </p>
                {order.receiptRef && (
                  <p className="font-mono text-xs">
                    {dict.admin.receiptNumber}: {order.receiptRef}
                  </p>
                )}
                <p className="text-xs">
                  {dict.admin.date}: {new Date(order.createdAt).toLocaleString("uz-UZ")}
                </p>
                {order.status === "REJECTED" && order.rejectReason && (
                  <p className="text-red-600">
                    {dict.kabinet.orderRejectReason}: {order.rejectReason}
                  </p>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
