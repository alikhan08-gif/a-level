import { redirect } from "next/navigation";
import { getSessionUserId } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getLocale } from "@/lib/i18n/server";
import { getDictionary, localize } from "@/lib/i18n/dictionaries";
import WrittenWorkForm from "@/components/WrittenWorkForm";

export const metadata = { title: "Yozma ish — Harrington Academy" };

export default async function WrittenWorkPage() {
  const userId = await getSessionUserId();
  if (!userId) redirect("/kirish");

  const [locale, enrollments, works] = await Promise.all([
    getLocale(),
    prisma.enrollment.findMany({
      where: { userId, status: "ACTIVE" },
      include: { course: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.writtenWork.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      include: { course: true },
    }),
  ]);
  const dict = getDictionary(locale);

  const courses = enrollments.map((e) => ({
    id: e.course.id,
    title: localize(e.course.title, e.course.titleEn, locale),
  }));

  return (
    <div className="bg-black/[0.015] min-h-[70vh]">
      <div className="mx-auto max-w-3xl px-4 py-12">
        <h1 className="text-2xl font-bold text-brand-navy mb-1">{dict.rating.writtenWorkTitle}</h1>
        <p className="text-brand-navy/60 mb-8">{dict.rating.writtenWorkSubtitle}</p>

        {courses.length === 0 ? (
          <div className="rounded-[28px] border border-black/10 bg-white p-8 text-center text-brand-navy/60">
            {dict.kabinet.noCoursesYet}
          </div>
        ) : (
          <div className="mb-8">
            <WrittenWorkForm courses={courses} locale={locale} />
          </div>
        )}

        <h2 className="text-lg font-bold text-brand-navy mb-4">{dict.rating.writtenWorkHistory}</h2>
        {works.length === 0 ? (
          <p className="text-brand-navy/50 text-sm">{dict.rating.writtenWorkNone}</p>
        ) : (
          <div className="space-y-3">
            {works.map((w) => (
              <div key={w.id} className="rounded-2xl border border-black/10 bg-white p-4">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-semibold text-brand-gold uppercase tracking-wide">
                    {localize(w.course.title, w.course.titleEn, locale)}
                  </span>
                  <span className="text-sm font-bold text-brand-navy">
                    {dict.rating.writtenWorkScore}: {w.score ?? "—"}
                  </span>
                </div>
                <p className="text-sm font-semibold text-brand-navy mb-1">{w.prompt}</p>
                <p className="text-sm text-brand-navy/60 line-clamp-2">{w.content}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
