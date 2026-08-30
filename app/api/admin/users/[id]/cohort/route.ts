import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSessionAdminId } from "@/lib/auth";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const adminId = await getSessionAdminId();
  if (!adminId) return NextResponse.json({ error: "Ruxsat yo'q" }, { status: 401 });

  const { id } = await params;
  const { cohortId } = (await req.json()) as { cohortId: string };
  if (!cohortId) return NextResponse.json({ error: "Patokni tanlang" }, { status: 400 });

  const [user, cohort] = await Promise.all([
    prisma.user.findUnique({ where: { id } }),
    prisma.cohort.findUnique({ where: { id: cohortId } }),
  ]);
  if (!user) return NextResponse.json({ error: "Foydalanuvchi topilmadi" }, { status: 404 });
  if (!cohort) return NextResponse.json({ error: "Patok topilmadi" }, { status: 404 });

  const updated = await prisma.user.update({ where: { id }, data: { cohortId } });
  return NextResponse.json({ user: { id: updated.id, cohortId: updated.cohortId } });
}
