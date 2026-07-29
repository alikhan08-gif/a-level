import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSessionUserId } from "@/lib/auth";
import { buildLockState, LESSON_COMPLETE_VIEW_COUNT } from "@/lib/progress";

export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const userId = await getSessionUserId();
  if (!userId) return NextResponse.json({ error: "Tizimga kiring" }, { status: 401 });

  const { id: lessonId } = await params;
  const lesson = await prisma.lesson.findUnique({
    where: { id: lessonId },
    include: { module: { include: { course: { include: { modules: { orderBy: { order: "asc" }, include: { lessons: { orderBy: { order: "asc" } } } } } } } } },
  });
  if (!lesson) return NextResponse.json({ error: "Dars topilmadi" }, { status: 404 });

  const course = lesson.module.course;
  const enrollment = await prisma.enrollment.findUnique({
    where: { userId_courseId: { userId, courseId: course.id } },
  });
  if (!enrollment || enrollment.status !== "ACTIVE") {
    return NextResponse.json({ error: "Sizda bu kursga faol yozilish yo'q" }, { status: 403 });
  }

  const lessonIds = course.modules.flatMap((m) => m.lessons.map((l) => l.id));
  const progressRows = await prisma.lessonProgress.findMany({ where: { userId, lessonId: { in: lessonIds } } });
  const viewCountByLessonId = new Map(progressRows.map((p) => [p.lessonId, p.viewCount]));

  const lockState = buildLockState(course.modules, viewCountByLessonId);
  const targetLesson = lockState.flatMap((m) => m.lessons).find((l) => l.id === lessonId);
  if (!targetLesson?.unlocked) {
    return NextResponse.json({ error: "Bu dars hali qulflangan" }, { status: 403 });
  }

  const currentViewCount = viewCountByLessonId.get(lessonId) ?? 0;
  const nextViewCount = Math.min(currentViewCount + 1, LESSON_COMPLETE_VIEW_COUNT);

  const progress = await prisma.lessonProgress.upsert({
    where: { userId_lessonId: { userId, lessonId } },
    create: { userId, lessonId, viewCount: nextViewCount },
    update: { viewCount: nextViewCount },
  });

  return NextResponse.json({ progress });
}
