import { redirect } from "next/navigation";
import Link from "next/link";
import { getSessionAdminId } from "@/lib/auth";
import { getLocale } from "@/lib/i18n/server";
import { getDictionary } from "@/lib/i18n/dictionaries";

export const metadata = { title: "Hisobotlar — Admin panel" };

export default async function AdminReportsPage() {
  const adminId = await getSessionAdminId();
  if (!adminId) redirect("/admin/login");
  const locale = await getLocale();
  const dict = getDictionary(locale);

  return (
    <div className="min-h-screen bg-black/[0.02]">
      <div className="mx-auto max-w-2xl px-4 py-10">
        <Link href="/admin" className="text-sm text-brand-navy/60 hover:underline">
          &larr; {dict.admin.reportsBack}
        </Link>
        <h1 className="text-2xl font-bold text-brand-navy mt-2 mb-6">{dict.admin.reportsTitle}</h1>
        <div className="rounded-2xl border border-black/10 bg-white p-6">
          <p className="text-sm text-brand-navy/70 mb-4">{dict.admin.reportsDescription}</p>
          <a
            href="/api/admin/reports/weekly"
            className="inline-block rounded-full bg-brand-navy px-6 py-3 text-white font-semibold hover:bg-brand-navy-light transition-colors"
          >
            {dict.admin.reportsGenerate}
          </a>
        </div>
      </div>
    </div>
  );
}
