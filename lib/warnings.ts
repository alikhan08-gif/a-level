import { prisma } from "@/lib/db";

const INACTIVITY_THRESHOLD_DAYS = 3;
const MS_PER_DAY = 24 * 60 * 60 * 1000;

// Escalation ladder for repeated inactivity on an enrollment:
//   warningCount 0 -> 1: 3 consecutive inactive days -> notify only
//   warningCount 1 -> 2: notify + reset course progress to module 1
//   warningCount 2 -> 3: notify + expel from the course
// Each step requires a fresh INACTIVITY_THRESHOLD_DAYS gap since the last
// warning (or since enrollment start if no warning yet) so a single
// continuous absence doesn't fire on every cron run.
export async function checkInactivityWarnings(now: Date = new Date()) {
  const enrollments = await prisma.enrollment.findMany({
    where: { status: "ACTIVE" },
    include: { course: { include: { modules: { include: { lessons: true } } } } },
  });

  const results: { enrollmentId: string; action: "warned" | "reset" | "expelled" }[] = [];

  for (const enrollment of enrollments) {
    const since = enrollment.lastWarningAt ?? enrollment.lastActivityAt;
    const inactiveDays = (now.getTime() - since.getTime()) / MS_PER_DAY;
    if (inactiveDays < INACTIVITY_THRESHOLD_DAYS) continue;

    const nextWarningCount = enrollment.warningCount + 1;

    if (nextWarningCount === 1) {
      await prisma.$transaction([
        prisma.enrollment.update({
          where: { id: enrollment.id },
          data: { warningCount: nextWarningCount, lastWarningAt: now },
        }),
        prisma.notification.create({
          data: {
            userId: enrollment.userId,
            message: `"${enrollment.course.title}" kursida siz vazifalarni o'z vaqtida bajarmayotganingiz sababli ogohlantirilasiz.`,
          },
        }),
      ]);
      results.push({ enrollmentId: enrollment.id, action: "warned" });
    } else if (nextWarningCount === 2) {
      const lessonIds = enrollment.course.modules.flatMap((m) => m.lessons.map((l) => l.id));
      await prisma.$transaction([
        prisma.lessonProgress.deleteMany({ where: { userId: enrollment.userId, lessonId: { in: lessonIds } } }),
        prisma.enrollment.update({
          where: { id: enrollment.id },
          data: {
            warningCount: nextWarningCount,
            lastWarningAt: now,
            lastActivityAt: now,
            status: "ACTIVE",
            currentModuleOrder: 1,
          },
        }),
        prisma.notification.create({
          data: {
            userId: enrollment.userId,
            message: `"${enrollment.course.title}" kursida vazifalar bajarilmagani sababli progress 0 dan qayta boshlandi.`,
          },
        }),
      ]);
      results.push({ enrollmentId: enrollment.id, action: "reset" });
    } else {
      await prisma.$transaction([
        prisma.enrollment.update({
          where: { id: enrollment.id },
          data: { warningCount: nextWarningCount, lastWarningAt: now, status: "EXPELLED" },
        }),
        prisma.notification.create({
          data: {
            userId: enrollment.userId,
            message: `"${enrollment.course.title}" kursidan vazifalar bajarilmagani sababli chetlatildingiz.`,
          },
        }),
      ]);
      results.push({ enrollmentId: enrollment.id, action: "expelled" });
    }
  }

  return results;
}
