import ExcelJS from "exceljs";
import { prisma } from "@/lib/db";
import { progressForViewCount } from "@/lib/progress";
import { DIRECTION_LABELS, SUBJECT_LABELS, type Direction, type Subject } from "@/lib/types";

interface DetailRow {
  fullName: string;
  phone: string;
  course: string;
  module: string;
  lesson: string;
  videoPercent: number;
  quizPercent: number | null;
}

export async function buildWeeklyReportWorkbook(): Promise<ExcelJS.Buffer> {
  const enrollments = await prisma.enrollment.findMany({
    include: {
      user: true,
      course: {
        include: { modules: { orderBy: { order: "asc" }, include: { lessons: { orderBy: { order: "asc" }, include: { quiz: { include: { attempts: true } } } } } } },
      },
    },
  });

  const rows: DetailRow[] = [];

  for (const enrollment of enrollments) {
    const lessonIds = enrollment.course.modules.flatMap((m) => m.lessons.map((l) => l.id));
    const progressRows = lessonIds.length
      ? await prisma.lessonProgress.findMany({ where: { userId: enrollment.userId, lessonId: { in: lessonIds } } })
      : [];
    const viewCountByLesson = new Map(progressRows.map((p) => [p.lessonId, p.viewCount]));

    for (const module of enrollment.course.modules) {
      for (const lesson of module.lessons) {
        const videoPercent = progressForViewCount(viewCountByLesson.get(lesson.id) ?? 0).percent;
        const attempts = lesson.quiz?.attempts.filter((a) => a.userId === enrollment.userId) ?? [];
        const bestQuiz = attempts.length ? Math.max(...attempts.map((a) => a.scorePct)) : null;

        rows.push({
          fullName: `${enrollment.user.firstName} ${enrollment.user.lastName}`,
          phone: enrollment.user.phone,
          course: `${DIRECTION_LABELS[enrollment.course.direction as Direction]} — ${SUBJECT_LABELS[enrollment.course.subject as Subject]}`,
          module: module.title,
          lesson: lesson.title,
          videoPercent,
          quizPercent: bestQuiz,
        });
      }
    }
  }

  const workbook = new ExcelJS.Workbook();

  const detailSheet = workbook.addWorksheet("Batafsil");
  detailSheet.columns = [
    { header: "Ism Familiya", key: "fullName", width: 24 },
    { header: "Telefon", key: "phone", width: 16 },
    { header: "Kurs", key: "course", width: 26 },
    { header: "Modul", key: "module", width: 14 },
    { header: "Mavzu", key: "lesson", width: 20 },
    { header: "Video foizi (%)", key: "videoPercent", width: 16 },
    { header: "Test natijasi (%)", key: "quizPercent", width: 16 },
  ];
  detailSheet.getRow(1).font = { bold: true };
  rows.forEach((row) => detailSheet.addRow({ ...row, quizPercent: row.quizPercent ?? "—" }));

  const summarySheet = workbook.addWorksheet("Xulosa");
  summarySheet.columns = [
    { header: "Ism Familiya", key: "fullName", width: 24 },
    { header: "Kurs", key: "course", width: 26 },
    { header: "Eng yaxshi mavzu", key: "best", width: 22 },
    { header: "Eng yaxshi natija (%)", key: "bestPct", width: 18 },
    { header: "Eng past mavzu", key: "worst", width: 22 },
    { header: "Eng past natija (%)", key: "worstPct", width: 18 },
  ];
  summarySheet.getRow(1).font = { bold: true };

  const byUserCourse = new Map<string, DetailRow[]>();
  for (const row of rows) {
    const key = `${row.fullName}__${row.course}`;
    if (!byUserCourse.has(key)) byUserCourse.set(key, []);
    byUserCourse.get(key)!.push(row);
  }
  for (const [key, group] of byUserCourse) {
    const [fullName, course] = key.split("__");
    const graded = group.filter((r) => r.quizPercent !== null) as (DetailRow & { quizPercent: number })[];
    if (graded.length === 0) continue;
    const best = graded.reduce((a, b) => (b.quizPercent > a.quizPercent ? b : a));
    const worst = graded.reduce((a, b) => (b.quizPercent < a.quizPercent ? b : a));
    summarySheet.addRow({
      fullName,
      course,
      best: best.lesson,
      bestPct: best.quizPercent,
      worst: worst.lesson,
      worstPct: worst.quizPercent,
    });
  }

  return workbook.xlsx.writeBuffer();
}
