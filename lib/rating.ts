import { prisma } from "@/lib/db";
import { progressForViewCount } from "@/lib/progress";

export type RatingTier = "green" | "yellow" | "red";

export function getRatingTier(rating: number): RatingTier {
  if (rating > 60) return "green";
  if (rating > 50) return "yellow";
  return "red";
}

const INACTIVITY_PENALTY_STEP = 5;
const PENALTY_CHECK_HOURS = 24;

// Simple heuristic placeholder for AI grading (Claude API not wired in yet).
// Scores by length as a rough proxy for effort — swap this out for a real
// AI-graded score later without touching anything else that reads `score`.
export function scoreWrittenWork(content: string): number {
  const words = content.trim().split(/\s+/).filter(Boolean).length;
  if (words < 30) return 40;
  if (words < 80) return 60;
  if (words < 150) return 75;
  if (words < 300) return 88;
  return 95;
}

// Called whenever a student watches a lesson — studying again should
// immediately clear any accumulated inactivity penalty, not wait for the
// next cron run.
export async function resetRatingPenalty(userId: string) {
  await prisma.user.updateMany({
    where: { id: userId, ratingPenalty: { gt: 0 } },
    data: { ratingPenalty: 0 },
  });
}

export async function computeRating(userId: string) {
  const [progressRows, quizAttempts, writtenWorks, user] = await Promise.all([
    prisma.lessonProgress.findMany({ where: { userId } }),
    prisma.quizAttempt.findMany({ where: { userId } }),
    prisma.writtenWork.findMany({ where: { userId, status: "GRADED" } }),
    prisma.user.findUnique({ where: { id: userId }, select: { ratingPenalty: true } }),
  ]);

  const viewScore = progressRows.length
    ? Math.round(
        progressRows.reduce((sum, p) => sum + progressForViewCount(p.viewCount).percent, 0) / progressRows.length
      )
    : null;

  const quizScore = quizAttempts.length
    ? Math.round(quizAttempts.reduce((sum, q) => sum + q.scorePct, 0) / quizAttempts.length)
    : null;

  const writtenScore = writtenWorks.length
    ? Math.round(writtenWorks.reduce((sum, w) => sum + (w.score ?? 0), 0) / writtenWorks.length)
    : null;

  const components = [viewScore, quizScore, writtenScore].filter((v): v is number => v !== null);
  const baseRating = components.length ? components.reduce((a, b) => a + b, 0) / components.length : 60;

  const penalty = user?.ratingPenalty ?? 0;
  const rating = Math.max(0, Math.min(100, Math.round(baseRating - penalty)));

  return {
    rating,
    tier: getRatingTier(rating),
    baseRating: Math.round(baseRating),
    penalty,
    viewScore,
    quizScore,
    writtenScore,
  };
}

// Daily cron: any user with at least one ACTIVE enrollment who hasn't
// watched any lesson in the last 24h gets a rating penalty + notification.
// Watching a lesson again (see app/api/lessons/[id]/view) resets the
// penalty to 0, so a student who gets back on track recovers immediately.
export async function checkRatingDecay(now: Date = new Date()) {
  const cutoff = new Date(now.getTime() - PENALTY_CHECK_HOURS * 60 * 60 * 1000);

  const activeUsers = await prisma.user.findMany({
    where: { enrollments: { some: { status: "ACTIVE" } } },
    select: { id: true, lastPenaltyAppliedAt: true },
  });

  const results: { userId: string; newPenalty: number }[] = [];

  for (const user of activeUsers) {
    if (user.lastPenaltyAppliedAt && user.lastPenaltyAppliedAt > cutoff) continue;

    const recentActivity = await prisma.lessonProgress.findFirst({
      where: { userId: user.id, updatedAt: { gt: cutoff } },
    });
    if (recentActivity) continue;

    const updated = await prisma.user.update({
      where: { id: user.id },
      data: { ratingPenalty: { increment: INACTIVITY_PENALTY_STEP }, lastPenaltyAppliedAt: now },
    });

    await prisma.notification.create({
      data: {
        userId: user.id,
        message: `Bugun dars ko'rmadingiz — reytingingiz ${INACTIVITY_PENALTY_STEP} ballga pasaydi. Reytingni tiklash uchun darslarni davom ettiring!`,
      },
    });

    results.push({ userId: user.id, newPenalty: updated.ratingPenalty });
  }

  return results;
}
