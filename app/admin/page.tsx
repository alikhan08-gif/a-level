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
        <div className="space-y-4">
          <h1 className="text-2xl font-bold text-brand-navy">{dict.admin.panelTitle}</h1>
          <nav className="flex flex-wrap items-center gap-2">
            <Link
              href="/admin/patoklar"
              className="flex items-center gap-1.5 rounded-full border border-black/10 bg-white px-4 py-2 text-sm font-semibold text-brand-navy hover:border-brand-navy/30 hover:bg-black/[0.02] transition-colors"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
              {dict.admin.cohorts}
            </Link>
            <Link
              href="/admin/reyting"
              className="flex items-center gap-1.5 rounded-full border border-black/10 bg-white px-4 py-2 text-sm font-semibold text-brand-navy hover:border-brand-navy/30 hover:bg-black/[0.02] transition-colors"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 3v18h18" />
                <path d="M18 17V9M13 17V5M8 17v-4" />
              </svg>
              {dict.admin.ratingLink}
            </Link>
            <Link
              href="/admin/hisobotlar"
              className="flex items-center gap-1.5 rounded-full border border-black/10 bg-white px-4 py-2 text-sm font-semibold text-brand-navy hover:border-brand-navy/30 hover:bg-black/[0.02] transition-colors"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z" />
                <path d="M14 2v6h6" />
              </svg>
              {dict.admin.reports}
            </Link>
            <AdminWarningsButton locale={locale} />
          </nav>
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
