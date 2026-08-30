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
  if (order.status !== "CONFIRMED") {
    return NextResponse.json({ error: "Faqat tasdiqlangan buyurtmani yetkazishga chiqarish mumkin" }, { status: 400 });
  }

  const updated = await prisma.bookOrder.update({ where: { id }, data: { status: "DELIVERING" } });
  await mockSmsProvider.send(order.phone, `"${order.book.title}" kitobingiz yetkazib berish uchun jo'natildi.`);
  if (order.userId) {
    await prisma.notification.create({
      data: { userId: order.userId, message: `"${order.book.title}" kitobingiz yetkazilmoqda.` },
    });
  }

  return NextResponse.json({ order: updated });
}
