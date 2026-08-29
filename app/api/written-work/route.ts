import { NextResponse } from "next/server";
import { getSessionUserId } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { scoreWrittenWork } from "@/lib/rating";

export async function GET() {
  const userId = await getSessionUserId();
  if (!userId) return NextResponse.json({ works: [] });

  const works = await prisma.writtenWork.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    include: { course: { select: { title: true, titleEn: true } } },
  });
  return NextResponse.json({ works });
}

export async function POST(req: Request) {
  const userId = await getSessionUserId();
  if (!userId) return NextResponse.json({ error: "Tizimga kiring" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const { courseId, prompt, content } = body as { courseId?: string; prompt?: string; content?: string };
  if (!courseId?.trim() || !prompt?.trim() || !content?.trim()) {
    return NextResponse.json({ error: "Barcha maydonlarni to'ldiring" }, { status: 400 });
  }

  const enrollment = await prisma.enrollment.findUnique({ where: { userId_courseId: { userId, courseId } } });
  if (!enrollment) return NextResponse.json({ error: "Sizda bu kursga yozilish yo'q" }, { status: 403 });

  const score = scoreWrittenWork(content);
  const work = await prisma.writtenWork.create({
    data: { userId, courseId, prompt: prompt.trim(), content: content.trim(), score, status: "GRADED" },
  });

  await prisma.notification.create({
    data: { userId, message: `Yozma ishingiz baholandi: ${score} ball.` },
  });

  return NextResponse.json({ work });
}
