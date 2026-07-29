import { redirect } from "next/navigation";
import { getSessionAdminId } from "@/lib/auth";
import { prisma } from "@/lib/db";
import AdminOrdersPanel from "@/components/admin/AdminOrdersPanel";
import AdminEnrollForm from "@/components/admin/AdminEnrollForm";
import AdminWarningsButton from "@/components/admin/AdminWarningsButton";
import AdminLockedUsersPanel from "@/components/admin/AdminLockedUsersPanel";
import Link from "next/link";
import { getLocale } from "@/lib/i18n/server";
import { getDictionary, formatTemplate } from "@/lib/i18n/dictionaries";

export const metadata = { title: "Admin panel" };

export default async function AdminDashboardPage() {
  const adminId = await getSessionAdminId();
  if (!adminId) redirect("/admin/login");

  const [pendingOrders, recentOrders, courses, lockedUsers, locale] = await Promise.all([
    prisma.bookOrder.findMany({
      where: { status: "AWAITING_ADMIN" },
      include: { book: true },
      orderBy: { createdAt: "asc" },
    }),
    prisma.bookOrder.findMany({
      where: { status: { in: ["CONFIRMED", "REJECTED"] } },
      include: { book: true },
      orderBy: { createdAt: "desc" },
      take: 10,
    }),
    prisma.course.findMany({ orderBy: [{ direction: "asc" }, { subject: "asc" }] }),
    prisma.user.findMany({ where: { locked: true }, orderBy: { createdAt: "desc" } }),
    getLocale(),
  ]);
  const dict = getDictionary(locale);

  return (
    <div className="min-h-screen bg-black/[0.02]">
      <div className="mx-auto max-w-5xl px-4 py-10 space-y-10">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-brand-navy">{dict.admin.panelTitle}</h1>
          <div className="flex items-center gap-3">
            <Link href="/admin/hisobotlar" className="text-sm font-semibold text-brand-navy hover:underline">
              {dict.admin.reports}
            </Link>
            <AdminWarningsButton locale={locale} />
          </div>
        </div>

        <section>
          <h2 className="font-bold text-brand-navy mb-4">
            {formatTemplate(dict.admin.pendingOrders, { count: pendingOrders.length })}
          </h2>
          <AdminOrdersPanel orders={pendingOrders} locale={locale} />
        </section>

        <section>
          <h2 className="font-bold text-brand-navy mb-4">{dict.admin.enrollSection}</h2>
          <AdminEnrollForm courses={courses} locale={locale} />
        </section>

        <section>
          <h2 className="font-bold text-brand-navy mb-4">
            {formatTemplate(dict.admin.lockedUsersSection, { count: lockedUsers.length })}
          </h2>
          <AdminLockedUsersPanel users={lockedUsers} locale={locale} />
        </section>

        <section>
          <h2 className="font-bold text-brand-navy mb-4">{dict.admin.recentOrders}</h2>
          <div className="rounded-2xl border border-black/10 bg-white divide-y divide-black/5">
            {recentOrders.length === 0 && (
              <p className="p-5 text-sm text-brand-navy/50">{dict.admin.none}</p>
            )}
            {recentOrders.map((order) => (
              <div key={order.id} className="flex items-center justify-between px-5 py-3 text-sm">
                <span className="text-brand-navy">
                  {order.name} — {order.book.title}
                </span>
                <span
                  className={`text-xs font-semibold rounded-full px-2.5 py-1 ${
                    order.status === "CONFIRMED" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                  }`}
                >
                  {order.status === "CONFIRMED" ? dict.admin.confirmed : dict.admin.rejected}
                </span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
