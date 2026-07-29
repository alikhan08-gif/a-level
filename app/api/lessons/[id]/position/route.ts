import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSessionUserId } from "@/lib/auth";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const userId = await getSessionUserId();
  if (!userId) return NextResponse.json({ error: "Tizimga kiring" }, { status: 401 });

  const { id: lessonId } = await params;
  const { positionSec } = (await req.json()) as { positionSec: number };

  const existing = await prisma.lessonProgress.findUnique({ where: { userId_lessonId: { userId, lessonId } } });
  if (!existing) return NextResponse.json({ error: "Avval darsni ochishingiz kerak" }, { status: 400 });

  await prisma.lessonProgress.update({
    where: { userId_lessonId: { userId, lessonId } },
    data: { lastPositionSec: Math.max(0, Math.floor(positionSec)) },
  });

  return NextResponse.json({ ok: true });
}
