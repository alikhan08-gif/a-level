import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSessionAdminId } from "@/lib/auth";

export async function POST(req: Request) {
  const adminId = await getSessionAdminId();
  if (!adminId) return NextResponse.json({ error: "Ruxsat yo'q" }, { status: 401 });

  const { phone, courseId } = (await req.json()) as { phone: string; courseId: string };
  if (!phone?.trim() || !courseId) {
    return NextResponse.json({ error: "Telefon va kursni tanlang" }, { status: 400 });
  }

  const user = await prisma.user.findUnique({ where: { phone: phone.trim() } });
  if (!user) {
    return NextResponse.json({ error: "Bu raqam bilan ro'yxatdan o'tgan foydalanuvchi topilmadi" }, { status: 404 });
  }

  const course = await prisma.course.findUnique({ where: { id: courseId } });
  if (!course) return NextResponse.json({ error: "Kurs topilmadi" }, { status: 404 });

  const enrollment = await prisma.enrollment.upsert({
    where: { userId_courseId: { userId: user.id, courseId } },
    update: { status: "ACTIVE", warningCount: 0, lastWarningAt: null, lastActivityAt: new Date() },
    create: { userId: user.id, courseId, status: "ACTIVE" },
  });

  return NextResponse.json({ enrollment });
}
