import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSessionAdminId } from "@/lib/auth";
import { mockSmsProvider } from "@/lib/sms/mock";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const adminId = await getSessionAdminId();
  if (!adminId) return NextResponse.json({ error: "Ruxsat yo'q" }, { status: 401 });

  const { id } = await params;
  const { reason } = (await req.json().catch(() => ({}))) as { reason?: string };
  const order = await prisma.bookOrder.findUnique({ where: { id } });
  if (!order) return NextResponse.json({ error: "Buyurtma topilmadi" }, { status: 404 });

  const updated = await prisma.bookOrder.update({
    where: { id },
    data: { status: "REJECTED", rejectReason: reason ?? null },
  });
  await mockSmsProvider.send(
    order.phone,
    `Buyurtmangiz rad etildi.${reason ? ` Sabab: ${reason}` : ""} Savollar uchun admin bilan bog'laning.`
  );

  return NextResponse.json({ order: updated });
}
