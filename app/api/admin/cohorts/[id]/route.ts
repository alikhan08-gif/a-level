import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSessionAdminId } from "@/lib/auth";
import { openCohort, closeCohort } from "@/lib/cohort";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const adminId = await getSessionAdminId();
  if (!adminId) return NextResponse.json({ error: "Ruxsat yo'q" }, { status: 401 });

  const { id } = await params;
  const cohort = await prisma.cohort.findUnique({ where: { id } });
  if (!cohort) return NextResponse.json({ error: "Patok topilmadi" }, { status: 404 });

  const { action, name } = (await req.json()) as { action?: "open" | "close"; name?: string };

  if (action === "open") await openCohort(id);
  if (action === "close") await closeCohort(id);
  if (name?.trim()) await prisma.cohort.update({ where: { id }, data: { name: name.trim() } });

  const updated = await prisma.cohort.findUnique({ where: { id } });
  return NextResponse.json({ cohort: updated });
}
