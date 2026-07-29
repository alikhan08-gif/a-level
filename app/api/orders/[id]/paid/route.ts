import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { mockSmsProvider } from "@/lib/sms/mock";

export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const order = await prisma.bookOrder.findUnique({ where: { id }, include: { book: true } });
  if (!order) {
    return NextResponse.json({ error: "Buyurtma topilmadi" }, { status: 404 });
  }
  if (!order.receiptRef) {
    return NextResponse.json({ error: "To'lov chek topilmadi" }, { status: 400 });
  }

  const updated = await prisma.bookOrder.update({
    where: { id },
    data: { status: "AWAITING_ADMIN" },
  });

  await mockSmsProvider.send(
    order.phone,
    `Siz "${order.book.title}" kitobidan buyurtma qildingiz. Iltimos, admin tasdiqlashini kuting.`
  );

  return NextResponse.json({ order: updated });
}
