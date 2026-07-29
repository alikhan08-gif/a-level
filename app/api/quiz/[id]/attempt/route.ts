import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSessionUserId } from "@/lib/auth";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const userId = await getSessionUserId();
  if (!userId) return NextResponse.json({ error: "Tizimga kiring" }, { status: 401 });

  const { id: quizId } = await params;
  const { answers } = (await req.json()) as { answers: number[] };

  const quiz = await prisma.quiz.findUnique({
    where: { id: quizId },
    include: { questions: true, lesson: { include: { module: true } } },
  });
  if (!quiz) return NextResponse.json({ error: "Test topilmadi" }, { status: 404 });

  const courseId = quiz.lesson.module.courseId;
  const enrollment = await prisma.enrollment.findUnique({
    where: { userId_courseId: { userId, courseId } },
  });
  if (!enrollment) return NextResponse.json({ error: "Sizda bu kursga yozilish yo'q" }, { status: 403 });

  const correctCount = quiz.questions.reduce(
    (count, q, i) => (answers[i] === q.correctOption ? count + 1 : count),
    0
  );
  const scorePct = quiz.questions.length ? Math.round((correctCount / quiz.questions.length) * 100) : 0;

  const attempt = await prisma.quizAttempt.create({
    data: { quizId, userId, scorePct },
  });

  await prisma.enrollment.update({
    where: { id: enrollment.id },
    data: { lastActivityAt: new Date() },
  });

  return NextResponse.json({ attempt, correctCount, total: quiz.questions.length });
}
