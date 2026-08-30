import { redirect } from "next/navigation";
import Link from "next/link";
import { getSessionAdminId } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getLocale } from "@/lib/i18n/server";
import { getDictionary } from "@/lib/i18n/dictionaries";
import AdminCohortsPanel from "@/components/admin/AdminCohortsPanel";
import type { CohortStatus } from "@/lib/types";

export const metadata = { title: "Patoklar — Admin panel" };

export default async function AdminCohortsPage() {
  const adminId = await getSessionAdminId();
  if (!adminId) redirect("/admin/login");

  const [locale, cohorts] = await Promise.all([
    getLocale(),
    prisma.cohort.findMany({
      orderBy: { createdAt: "asc" },
      include: {
        users: { select: { id: true, firstName: true, lastName: true, phone: true }, orderBy: { createdAt: "asc" } },
      },
    }),
  ]);
  const dict = getDictionary(locale);

  return (
    <div className="min-h-screen bg-black/[0.02]">
      <div className="mx-auto max-w-3xl px-4 py-10">
        <Link href="/admin" className="text-sm text-brand-navy/60 hover:underline">
          &larr; {dict.admin.cohortsBack}
        </Link>
        <h1 className="text-2xl font-bold text-brand-navy mt-2 mb-6">{dict.admin.cohortsTitle}</h1>
        <AdminCohortsPanel
          cohorts={cohorts.map((c) => ({
            ...c,
            status: c.status as CohortStatus,
            createdAt: c.createdAt.toISOString(),
          }))}
          locale={locale}
        />
      </div>
    </div>
  );
}
