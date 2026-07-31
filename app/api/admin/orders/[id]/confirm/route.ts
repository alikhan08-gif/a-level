import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSessionAdminId } from "@/lib/auth";
import { mockSmsProvider } from "@/lib/sms/mock";

export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const adminId = await getSessionAdminId();
  if (!adminId) return NextResponse.json({ error: "Ruxsat yo'q" }, { status: 401 });

  const { id } = await params;
  const order = await prisma.bookOrder.findUnique({ where: { id }, include: { book: true } });
  if (!order) return NextResponse.json({ error: "Buyurtma topilmadi" }, { status: 404 });

  const updated = await prisma.bookOrder.update({ where: { id }, data: { status: "CONFIRMED" } });
  await mockSmsProvider.send(
    order.phone,
    `Buyurtmangiz qabul qilindi. Uni 24-72 soat ichida "UzPost" orqali yetkazamiz. Diqqat-e'tiborli bo'ling.`
  );
  if (order.userId) {
    await prisma.notification.create({
      data: { userId: order.userId, message: `"${order.book.title}" kitobiga buyurtmangiz tasdiqlandi.` },
    });
  }

  return NextResponse.json({ order: updated });
}
