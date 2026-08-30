import { redirect } from "next/navigation";
import { getSessionUserId } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getLocale } from "@/lib/i18n/server";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { formatPrice } from "@/lib/format";
import { DELIVERY_METHOD_LABELS, type DeliveryMethod, type OrderStatus } from "@/lib/types";

export const metadata = { title: "Buyurtmalarim — Harrington Academy" };

const STATUS_COLORS: Record<OrderStatus, string> = {
  PENDING: "bg-black/5 text-brand-navy/50",
  AWAITING_ADMIN: "bg-amber-100 text-amber-700",
  CONFIRMED: "bg-green-100 text-green-700",
  REJECTED: "bg-red-100 text-red-700",
};

export default async function MyOrdersPage() {
  const userId = await getSessionUserId();
  if (!userId) redirect("/kirish");

  const [locale, orders] = await Promise.all([
    getLocale(),
    prisma.bookOrder.findMany({
      where: { userId },
      include: { book: true },
      orderBy: { createdAt: "desc" },
    }),
  ]);
  const dict = getDictionary(locale);

  const statusLabel: Record<OrderStatus, string> = {
    PENDING: dict.kabinet.orderStatusPending,
    AWAITING_ADMIN: dict.kabinet.orderStatusAwaitingAdmin,
    CONFIRMED: dict.kabinet.orderStatusConfirmed,
    REJECTED: dict.kabinet.orderStatusRejected,
  };

  return (
    <div className="bg-black/[0.015] min-h-[70vh]">
      <div className="mx-auto max-w-3xl px-4 py-12">
        <h1 className="text-2xl font-bold text-brand-navy mb-8">{dict.kabinet.ordersTitle}</h1>

        {orders.length === 0 ? (
          <div className="rounded-[28px] border border-black/10 bg-white p-8 text-center text-brand-navy/60">
            {dict.kabinet.noOrdersYet}
          </div>
        ) : (
          <div className="space-y-3">
            {orders.map((order) => {
              const status = order.status as OrderStatus;
              return (
                <div key={order.id} className="rounded-2xl border border-black/10 bg-white p-5">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <h3 className="font-bold text-brand-navy">{order.book.title}</h3>
                      <p className="text-sm text-brand-navy/60 mt-1">
                        {order.quantity} {dict.kabinet.orderQuantity} —{" "}
                        {formatPrice(order.book.price * order.quantity)} {dict.kitoblar.currency}
                      </p>
                      <p className="text-xs text-brand-navy/40 mt-1">
                        {new Date(order.createdAt).toLocaleDateString("uz-UZ")}
                      </p>
                      {order.deliveryMethod && (
                        <p className="text-xs font-semibold text-brand-navy/50 mt-1">
                          {dict.kabinet.orderDeliveryMethod}:{" "}
                          {DELIVERY_METHOD_LABELS[order.deliveryMethod as DeliveryMethod] ?? order.deliveryMethod}
                        </p>
                      )}
                      {status === "REJECTED" && order.rejectReason && (
                        <p className="text-sm text-red-600 mt-2">
                          {dict.kabinet.orderRejectReason}: {order.rejectReason}
                        </p>
                      )}
                    </div>
                    <span className={`text-xs font-semibold rounded-full px-3 py-1.5 whitespace-nowrap ${STATUS_COLORS[status]}`}>
                      {statusLabel[status]}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
