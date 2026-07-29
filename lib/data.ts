import { prisma } from "@/lib/db";
import { DIRECTIONS, SUBJECTS, type Direction, type Subject } from "@/lib/types";
import { progressForViewCount } from "@/lib/progress";

export async function getCoursesGroupedByDirection() {
  const courses = await prisma.course.findMany({ orderBy: { subject: "asc" } });
  const grouped = {} as Record<Direction, typeof courses>;
  for (const direction of DIRECTIONS) {
    grouped[direction] = courses
      .filter((c) => c.direction === direction)
      .sort((a, b) => SUBJECTS.indexOf(a.subject as Subject) - SUBJECTS.indexOf(b.subject as Subject));
  }
  return grouped;
}

export async function getCourseById(id: string) {
  return prisma.course.findUnique({
    where: { id },
    include: { modules: { orderBy: { order: "asc" }, include: { lessons: { orderBy: { order: "asc" } } } } },
  });
}

export async function getBooks() {
  return prisma.book.findMany({ orderBy: [{ subject: "asc" }, { title: "asc" }] });
}

export async function getBookById(id: string) {
  return prisma.book.findUnique({ where: { id } });
}

export async function getEnrollmentsForUser(userId: string) {
  const enrollments = await prisma.enrollment.findMany({
    where: { userId },
    include: {
      course: {
        include: { modules: { include: { lessons: true } } },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const lessonIds = enrollments.flatMap((e) => e.course.modules.flatMap((m) => m.lessons.map((l) => l.id)));
  const progressRows = lessonIds.length
    ? await prisma.lessonProgress.findMany({ where: { userId, lessonId: { in: lessonIds } } })
    : [];
  const viewCountByLesson = new Map(progressRows.map((p) => [p.lessonId, p.viewCount]));

  return enrollments.map((enrollment) => {
    const allLessons = enrollment.course.modules.flatMap((m) => m.lessons);
    const totalPercent = allLessons.reduce(
      (sum, lesson) => sum + progressForViewCount(viewCountByLesson.get(lesson.id) ?? 0).percent,
      0
    );
    const overallPercent = allLessons.length ? Math.round(totalPercent / allLessons.length) : 0;
    return { ...enrollment, overallPercent };
  });
}

export async function getEnrollmentDetail(userId: string, courseId: string) {
  const enrollment = await prisma.enrollment.findUnique({
    where: { userId_courseId: { userId, courseId } },
    include: {
      course: {
        include: { modules: { orderBy: { order: "asc" }, include: { lessons: { orderBy: { order: "asc" } } } } },
      },
    },
  });
  if (!enrollment) return null;

  const lessonIds = enrollment.course.modules.flatMap((m) => m.lessons.map((l) => l.id));
  const progressRows = lessonIds.length
    ? await prisma.lessonProgress.findMany({ where: { userId, lessonId: { in: lessonIds } } })
    : [];
  const progressByLesson = new Map(progressRows.map((p) => [p.lessonId, p]));

  return { enrollment, progressByLesson };
}
