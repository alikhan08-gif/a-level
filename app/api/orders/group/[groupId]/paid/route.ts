import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { mockSmsProvider } from "@/lib/sms/mock";

export async function POST(_req: Request, { params }: { params: Promise<{ groupId: string }> }) {
  const { groupId } = await params;
  const orders = await prisma.bookOrder.findMany({ where: { groupId }, include: { book: true } });
  if (orders.length === 0) {
    return NextResponse.json({ error: "Buyurtma topilmadi" }, { status: 404 });
  }
  if (!orders[0].receiptRef) {
    return NextResponse.json({ error: "To'lov chek topilmadi" }, { status: 400 });
  }

  await prisma.bookOrder.updateMany({
    where: { groupId },
    data: { status: "AWAITING_ADMIN" },
  });

  const titles = orders.map((o) => `${o.book.title} (${o.quantity} ta)`).join(", ");
  await mockSmsProvider.send(
    orders[0].phone,
    `Siz ${titles} kitoblaridan buyurtma qildingiz. Iltimos, admin tasdiqlashini kuting.`
  );

  return NextResponse.json({ ok: true });
}
