import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getSessionUserId } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { buildLockState } from "@/lib/progress";
import { getLocale } from "@/lib/i18n/server";
import { getDictionary } from "@/lib/i18n/dictionaries";
import CabinetSidebar from "@/components/CabinetSidebar";

const COLOR_CLASSES = {
  red: "bg-red-100 text-red-700",
  yellow: "bg-amber-100 text-amber-700",
  green: "bg-green-100 text-green-700",
} as const;

export default async function ModuleLmsPage({
  params,
}: {
  params: Promise<{ id: string; moduleId: string }>;
}) {
  const userId = await getSessionUserId();
  if (!userId) redirect("/kirish");

  const { id: courseId, moduleId } = await params;
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

  const module = modules.find((m) => m.id === moduleId);
  const canView = module?.unlocked && enrollment.status === "ACTIVE";
  if (!module || !canView) redirect(`/kabinet/kurs/${courseId}`);

  return (
    <div className="bg-black/[0.015] min-h-[70vh]">
      <div className="mx-auto max-w-5xl px-4 py-12">
        <div className="flex flex-col md:flex-row gap-8">
          <CabinetSidebar
            firstName={user?.firstName}
            lastName={user?.lastName}
            percentLabel={dict.kabinet.percentDone}
            percent={overallPercent}
            logoutLabel={dict.nav.logout}
          />

          <div className="flex-1">
            <Link href={`/kabinet/kurs/${courseId}`} className="text-sm text-brand-navy/60 hover:underline">
              &larr; {dict.kabinet.courseProgram}
            </Link>
            <div className="flex items-center justify-between mt-2 mb-8">
              <h1 className="text-2xl font-bold text-brand-navy">{module.title}</h1>
              <span className="text-sm font-bold text-brand-navy/40">{module.percent}%</span>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {module.lessons.map((lesson) => {
                const canOpen = lesson.unlocked;
                const cardClass = `flex flex-col justify-between h-[130px] rounded-[18px] border p-4 transition-all ${
                  lesson.unlocked
                    ? "card-3d border-black/10 bg-white"
                    : "border-dashed border-black/15 bg-black/[0.02] opacity-70"
                }`;
                const content = (
                  <>
                    <div className="flex items-start justify-between gap-2">
                      <span
                        className={`text-sm font-bold leading-snug ${lesson.unlocked ? "text-brand-navy" : "text-brand-navy/40"}`}
                      >
                        {lesson.title}
                      </span>
                      {!lesson.unlocked && (
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="shrink-0 text-brand-navy/30">
                          <rect x="5" y="11" width="14" height="9" rx="2" />
                          <path d="M8 11V8a4 4 0 1 1 8 0v3" />
                        </svg>
                      )}
                    </div>
                    {lesson.unlocked && (
                      <span
                        className={`self-start text-xs font-bold rounded-full px-2.5 py-1 ${COLOR_CLASSES[lesson.color]}`}
                      >
                        {lesson.percent}%
                      </span>
                    )}
                  </>
                );
                return canOpen ? (
                  <Link key={lesson.id} href={`/kabinet/kurs/${courseId}/dars/${lesson.id}`} className={cardClass}>
                    {content}
                  </Link>
                ) : (
                  <div key={lesson.id} className={cardClass}>
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
