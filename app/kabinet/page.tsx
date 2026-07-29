import Link from "next/link";
import { redirect } from "next/navigation";
import { getSessionUserId } from "@/lib/auth";
import { getEnrollmentsForUser } from "@/lib/data";
import { prisma } from "@/lib/db";
import { getLocale } from "@/lib/i18n/server";
import { getDictionary, localize } from "@/lib/i18n/dictionaries";

export const metadata = { title: "Shaxsiy kabinet — Harrington Academy" };

export default async function KabinetPage() {
  const userId = await getSessionUserId();
  if (!userId) redirect("/kirish");

  const [enrollments, locale, user] = await Promise.all([
    getEnrollmentsForUser(userId),
    getLocale(),
    prisma.user.findUnique({ where: { id: userId }, select: { firstName: true } }),
  ]);
  const dict = getDictionary(locale);

  return (
    <div className="bg-black/[0.015] min-h-[70vh]">
      <div className="mx-auto max-w-4xl px-4 py-12">
        <div className="flex items-center gap-4 mb-8">
          <div className="h-14 w-14 shrink-0 rounded-full bg-brand-navy/10 flex items-center justify-center text-lg font-bold text-brand-navy">
            {user?.firstName?.[0] ?? "?"}
          </div>
          <div>
            <p className="text-sm text-brand-navy/50">{dict.kabinet.myCourses}</p>
            <h1 className="text-2xl font-bold text-brand-navy">{user?.firstName}</h1>
          </div>
        </div>

        {enrollments.length === 0 ? (
          <div className="rounded-[28px] border border-black/10 bg-white p-8 text-center">
            <p className="text-brand-navy/60 mb-4">{dict.kabinet.noCoursesYet}</p>
            <Link
              href="/kurslar"
              className="inline-block rounded-full bg-brand-navy px-6 py-3 text-white font-semibold hover:bg-brand-navy-light transition-colors"
            >
              {dict.kabinet.viewCourses}
            </Link>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 gap-5">
            {enrollments.map((enrollment) => (
              <Link
                key={enrollment.id}
                href={
                  enrollment.status === "EXPELLED"
                    ? "#"
                    : `/kabinet/kurs/${enrollment.courseId}`
                }
                className={`card-3d rounded-[28px] border border-black/10 bg-white p-5 ${
                  enrollment.status === "EXPELLED" ? "opacity-50 pointer-events-none" : ""
                }`}
              >
                <div className="text-xs font-semibold text-brand-gold uppercase tracking-wider mb-1">
                  {dict.directions[enrollment.course.direction as keyof typeof dict.directions]} ·{" "}
                  {dict.subjects[enrollment.course.subject as keyof typeof dict.subjects]}
                </div>
                <h3 className="font-bold text-brand-navy mb-3">
                  {localize(enrollment.course.title, enrollment.course.titleEn, locale)}
                </h3>

                <div className="h-2 rounded-full bg-black/5 overflow-hidden mb-2">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${enrollment.overallPercent}%`,
                      background: "linear-gradient(90deg, var(--brand-gold), #eab308)",
                    }}
                  />
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-brand-navy/60">
                    {enrollment.overallPercent}% {dict.kabinet.percentDone}
                  </span>
                  {enrollment.status === "ACTIVE" && enrollment.warningCount >= 2 && (
                    <span className="text-amber-600 font-semibold">{dict.kabinet.restarted}</span>
                  )}
                  {enrollment.status === "EXPELLED" && (
                    <span className="text-red-600 font-semibold">{dict.kabinet.expelled}</span>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
