import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getSessionUserId } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { buildLockState } from "@/lib/progress";
import { getLocale } from "@/lib/i18n/server";
import { getDictionary, localize } from "@/lib/i18n/dictionaries";
import CabinetSidebar from "@/components/CabinetSidebar";

export default async function CourseLmsPage({ params }: { params: Promise<{ id: string }> }) {
  const userId = await getSessionUserId();
  if (!userId) redirect("/kirish");

  const { id: courseId } = await params;
  const [course, locale, user] = await Promise.all([
    prisma.course.findUnique({
      where: { id: courseId },
      include: { modules: { orderBy: { order: "asc" }, include: { lessons: { orderBy: { order: "asc" } } } } },
    }),
    getLocale(),
    prisma.user.findUnique({ where: { id: userId }, select: { firstName: true, lastName: true } }),
  ]);
  if (!course) notFound();
  const dict = getDictionary(locale);

  const enrollment = await prisma.enrollment.findUnique({ where: { userId_courseId: { userId, courseId } } });
  if (!enrollment) redirect("/kabinet");

  const lessonIds = course.modules.flatMap((m) => m.lessons.map((l) => l.id));
  const progressRows = lessonIds.length
    ? await prisma.lessonProgress.findMany({ where: { userId, lessonId: { in: lessonIds } } })
    : [];
  const viewCountByLessonId = new Map(progressRows.map((p) => [p.lessonId, p.viewCount]));
  const modules = buildLockState(course.modules, viewCountByLessonId);
  const overallPercent = modules.length
    ? Math.round(modules.reduce((sum, m) => sum + m.percent, 0) / modules.length)
    : 0;

  return (
    <div className="bg-black/[0.015] min-h-[70vh]">
      <div className="mx-auto max-w-5xl px-4 py-12">
        {enrollment.status === "EXPELLED" && (
          <div className="mb-6 rounded-2xl bg-red-50 text-red-800 text-sm px-4 py-3">
            {dict.kabinet.expelledBanner}
          </div>
        )}
        {enrollment.status === "ACTIVE" && enrollment.warningCount >= 2 && (
          <div className="mb-6 rounded-2xl bg-amber-50 text-amber-800 text-sm px-4 py-3">
            {dict.kabinet.resetBanner}
          </div>
        )}
        {enrollment.status === "ACTIVE" && enrollment.warningCount === 1 && (
          <div className="mb-6 rounded-2xl bg-amber-50 text-amber-800 text-sm px-4 py-3">
            {dict.kabinet.warningBanner}
          </div>
        )}

        <div className="flex flex-col md:flex-row gap-8">
          <CabinetSidebar
            firstName={user?.firstName}
            lastName={user?.lastName}
            percentLabel={dict.kabinet.percentDone}
            percent={overallPercent}
            logoutLabel={dict.nav.logout}
          />

          {/* Content — module tiles only; open one to see its lessons */}
          <div className="flex-1">
            <div className="text-xs font-semibold text-brand-gold uppercase tracking-wider mb-1">
              {dict.directions[course.direction as keyof typeof dict.directions]} ·{" "}
              {dict.subjects[course.subject as keyof typeof dict.subjects]}
            </div>
            <h1 className="text-2xl font-bold text-brand-navy mb-8">
              {localize(course.title, course.titleEn, locale)}
            </h1>

            <div className="grid gap-4 sm:grid-cols-2">
              {modules.map((module) => {
                const canOpen = module.unlocked && enrollment.status === "ACTIVE";
                const cardClass = `flex flex-col items-center justify-center gap-2 text-center min-h-[140px] rounded-[20px] border p-5 transition-all ${
                  canOpen
                    ? "card-3d border-black/10 bg-white"
                    : "border-dashed border-black/15 bg-black/[0.02] opacity-70"
                }`;
                const content = (
                  <>
                    {!module.unlocked && (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-brand-navy/30">
                        <rect x="5" y="11" width="14" height="9" rx="2" />
                        <path d="M8 11V8a4 4 0 1 1 8 0v3" />
                      </svg>
                    )}
                    <span className={`font-extrabold ${module.unlocked ? "text-brand-navy" : "text-brand-navy/40"}`}>
                      {module.title}
                    </span>
                    <span className="text-xs font-bold text-brand-navy/40">{module.percent}%</span>
                  </>
                );
                return canOpen ? (
                  <Link key={module.id} href={`/kabinet/kurs/${course.id}/modul/${module.id}`} className={cardClass}>
                    {content}
                  </Link>
                ) : (
                  <div key={module.id} className={cardClass}>
                    {content}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
