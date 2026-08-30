import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { mockPaymentProvider } from "@/lib/payments/mock";
import { getSessionUserId } from "@/lib/auth";
import { DELIVERY_METHODS, type DeliveryMethod } from "@/lib/types";

export async function POST(req: Request) {
  const body = await req.json();
  const { bookId, name, phone, address, provider, deliveryMethod } = body as {
    bookId: string;
    name: string;
    phone: string;
    address: string;
    provider: "click" | "payme";
    deliveryMethod?: DeliveryMethod;
  };

  if (!bookId || !name || !phone || !address || !provider) {
    return NextResponse.json({ error: "Barcha maydonlarni to'ldiring" }, { status: 400 });
  }
  if (deliveryMethod && !DELIVERY_METHODS.includes(deliveryMethod)) {
    return NextResponse.json({ error: "Yetkazib berish usuli noto'g'ri" }, { status: 400 });
  }

  const book = await prisma.book.findUnique({ where: { id: bookId } });
  if (!book) {
    return NextResponse.json({ error: "Kitob topilmadi" }, { status: 404 });
  }

  const userId = await getSessionUserId();
  const order = await prisma.bookOrder.create({
    data: { bookId, name, phone, address, status: "PENDING", deliveryMethod, userId: userId ?? undefined },
  });

  const receipt = await mockPaymentProvider.charge({
    amount: book.price,
    orderId: order.id,
    provider,
  });

  const updated = await prisma.bookOrder.update({
    where: { id: order.id },
    data: { receiptRef: receipt.receiptRef },
  });

  return NextResponse.json({ order: updated, receipt });
}
