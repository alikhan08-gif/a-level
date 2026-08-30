"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { getDictionary, type Locale } from "@/lib/i18n/dictionaries";
import { formatPrice } from "@/lib/format";

type Order = {
  id: string;
  groupId: string | null;
  quantity: number;
  name: string;
  phone: string;
  address: string;
  status: "CONFIRMED" | "DELIVERING";
  createdAt: string | Date;
  book: { title: string; price: number };
};

export default function AdminShippingPanel({ orders, locale }: { orders: Order[]; locale: Locale }) {
  const dict = getDictionary(locale);
  const router = useRouter();
  const [loadingId, setLoadingId] = useState<string | null>(null);

  async function handleAdvance(ids: string[], endpoint: "deliver" | "delivered") {
    setLoadingId(ids[0]);
    try {
      await Promise.all(ids.map((id) => fetch(`/api/admin/orders/${id}/${endpoint}`, { method: "POST" })));
      router.refresh();
    } finally {
      setLoadingId(null);
    }
  }

  if (orders.length === 0) {
    return <div className="rounded-2xl border border-black/10 bg-white p-6 text-sm text-brand-navy/50">{dict.admin.none}</div>;
  }

  const groups: Order[][] = [];
  const seenGroupIds = new Set<string>();
  for (const order of orders) {
    if (order.groupId) {
      if (seenGroupIds.has(order.groupId)) continue;
      seenGroupIds.add(order.groupId);
      groups.push(orders.filter((o) => o.groupId === order.groupId));
    } else {
      groups.push([order]);
    }
  }

  return (
    <div className="grid gap-4">
      {groups.map((group) => {
        const first = group[0];
        const ids = group.map((o) => o.id);
        const total = group.reduce((sum, o) => sum + o.book.price * o.quantity, 0);
        return (
          <div key={first.id} className="rounded-2xl border border-black/10 bg-white p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h3 className="font-bold text-brand-navy">{first.name}</h3>
                <p className="text-sm text-brand-navy/70">{first.phone}</p>
                <p className="text-sm text-brand-navy/70">{first.address}</p>
                <div className="text-sm text-brand-navy/60 mt-1 space-y-0.5">
                  {group.map((o) => (
                    <p key={o.id}>
                      {o.book.title} — {o.quantity} ta — {formatPrice(o.book.price * o.quantity)} {dict.kitoblar.currency}
                    </p>
                  ))}
                  {group.length > 1 && (
                    <p className="font-semibold text-brand-navy">
                      {dict.cart.total}: {formatPrice(total)} {dict.kitoblar.currency}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex flex-col items-end gap-2">
                <span
                  className={`text-xs font-semibold rounded-full px-2.5 py-1 ${
                    first.status === "DELIVERING" ? "bg-amber-100 text-amber-700" : "bg-green-100 text-green-700"
                  }`}
                >
                  {first.status === "DELIVERING" ? dict.admin.delivering : dict.admin.confirmed}
                </span>
                {first.status === "CONFIRMED" ? (
                  <button
                    type="button"
                    disabled={loadingId === first.id}
                    onClick={() => handleAdvance(ids, "deliver")}
                    className="rounded-full bg-amber-500 px-4 py-1.5 text-xs font-semibold text-white hover:bg-amber-600 disabled:opacity-50"
                  >
                    {dict.admin.markDelivering}
                  </button>
                ) : (
                  <button
                    type="button"
                    disabled={loadingId === first.id}
                    onClick={() => handleAdvance(ids, "delivered")}
                    className="rounded-full bg-green-600 px-4 py-1.5 text-xs font-semibold text-white hover:bg-green-700 disabled:opacity-50"
                  >
                    {dict.admin.markDelivered}
                  </button>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
