import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getSessionUserId } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { buildLockState } from "@/lib/progress";
import { extractYoutubeId } from "@/lib/youtube";
import LessonPlayer from "@/components/LessonPlayer";
import QuizCard from "@/components/QuizCard";
import { getLocale } from "@/lib/i18n/server";
import { getDictionary } from "@/lib/i18n/dictionaries";

export default async function LessonPage({
  params,
}: {
  params: Promise<{ id: string; lessonId: string }>;
}) {
  const userId = await getSessionUserId();
  if (!userId) redirect("/kirish");

  const { id: courseId, lessonId } = await params;
  const locale = await getLocale();
  const dict = getDictionary(locale);

  const course = await prisma.course.findUnique({
    where: { id: courseId },
    include: { modules: { orderBy: { order: "asc" }, include: { lessons: { orderBy: { order: "asc" } } } } },
  });
  if (!course) notFound();

  const enrollment = await prisma.enrollment.findUnique({ where: { userId_courseId: { userId, courseId } } });
  if (!enrollment || enrollment.status !== "ACTIVE") redirect(`/kabinet/kurs/${courseId}`);

  const lesson = await prisma.lesson.findUnique({
    where: { id: lessonId },
    include: { quiz: { include: { questions: true } } },
  });
  if (!lesson) notFound();

  const lessonIds = course.modules.flatMap((m) => m.lessons.map((l) => l.id));
  const progressRows = await prisma.lessonProgress.findMany({ where: { userId, lessonId: { in: lessonIds } } });
  const viewCountByLessonId = new Map(progressRows.map((p) => [p.lessonId, p.viewCount]));
  const modules = buildLockState(course.modules, viewCountByLessonId);
  const flatLessons = modules.flatMap((m) => m.lessons);
  const currentLock = flatLessons.find((l) => l.id === lessonId);
  if (!currentLock?.unlocked) redirect(`/kabinet/kurs/${courseId}`);

  const currentIndex = flatLessons.findIndex((l) => l.id === lessonId);
  const nextLesson = flatLessons[currentIndex + 1];
  const currentProgress = progressRows.find((p) => p.lessonId === lessonId);
  const videoId = extractYoutubeId(lesson.youtubeUrl);

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <Link href={`/kabinet/kurs/${courseId}`} className="text-sm text-brand-navy/60 hover:underline">
        &larr; {dict.kabinet.backToProgram}
      </Link>
      <h1 className="text-2xl font-bold text-brand-navy mt-2 mb-6">{lesson.title}</h1>

      {videoId ? (
        <LessonPlayer
          lessonId={lesson.id}
          videoId={videoId}
          initialViewCount={currentProgress?.viewCount ?? 0}
          initialPositionSec={currentProgress?.lastPositionSec ?? 0}
          locale={locale}
        />
      ) : (
        <p className="text-red-600 text-sm">{dict.kabinet.invalidVideo}</p>
      )}

      {lesson.quiz && lesson.quiz.questions.length > 0 && (
        <div className="mt-8">
          <QuizCard
            quizId={lesson.quiz.id}
            questions={lesson.quiz.questions.map((q) => ({
              id: q.id,
              text: q.text,
              options: JSON.parse(q.optionsJson) as string[],
            }))}
            locale={locale}
          />
        </div>
      )}

      {nextLesson && (
        <div className="mt-8 text-right">
          <Link
            href={`/kabinet/kurs/${courseId}/dars/${nextLesson.id}`}
            className="inline-flex items-center gap-1 text-sm font-semibold text-brand-navy hover:underline"
          >
            {dict.kabinet.nextLesson} &rarr;
          </Link>
        </div>
      )}
    </div>
  );
}
