import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSessionAdminId } from "@/lib/auth";

export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const adminId = await getSessionAdminId();
  if (!adminId) return NextResponse.json({ error: "Ruxsat yo'q" }, { status: 401 });

  const { id } = await params;
  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) return NextResponse.json({ error: "Foydalanuvchi topilmadi" }, { status: 404 });

  const updated = await prisma.user.update({
    where: { id },
    // Clear the stored descriptor too, so the user re-captures Face ID
    // fresh on next login instead of immediately re-triggering a mismatch.
    data: { locked: false, faceFailedAttempts: 0, faceDescriptor: null },
  });

  return NextResponse.json({ user: { id: updated.id } });
}
