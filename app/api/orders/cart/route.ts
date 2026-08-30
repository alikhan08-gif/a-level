import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { prisma } from "@/lib/db";
import { mockPaymentProvider } from "@/lib/payments/mock";
import { getSessionUserId } from "@/lib/auth";
import { DELIVERY_METHODS, DELIVERY_FEES, PAYMENT_PROVIDERS, type DeliveryMethod, type PaymentProviderId } from "@/lib/types";

export async function POST(req: Request) {
  const body = await req.json();
  const { items, name, phone, address, provider, deliveryMethod } = body as {
    items: { bookId: string; quantity: number }[];
    name: string;
    phone: string;
    address: string;
    provider: PaymentProviderId;
    deliveryMethod?: DeliveryMethod;
  };

  if (!items?.length || !name || !phone || !address || !provider) {
    return NextResponse.json({ error: "Barcha maydonlarni to'ldiring" }, { status: 400 });
  }
  if (!PAYMENT_PROVIDERS.includes(provider)) {
    return NextResponse.json({ error: "To'lov usuli noto'g'ri" }, { status: 400 });
  }
  if (deliveryMethod && !DELIVERY_METHODS.includes(deliveryMethod)) {
    return NextResponse.json({ error: "Yetkazib berish usuli noto'g'ri" }, { status: 400 });
  }

  const books = await prisma.book.findMany({ where: { id: { in: items.map((i) => i.bookId) } } });
  if (books.length !== items.length) {
    return NextResponse.json({ error: "Ba'zi kitoblar topilmadi" }, { status: 404 });
  }
  const bookById = new Map(books.map((b) => [b.id, b]));

  const groupId = randomUUID();
  const booksTotal = items.reduce((sum, item) => sum + (bookById.get(item.bookId)?.price ?? 0) * item.quantity, 0);
  const deliveryFee = deliveryMethod ? DELIVERY_FEES[deliveryMethod] : 0;
  const totalAmount = booksTotal + deliveryFee;
  const userId = await getSessionUserId();

  await prisma.bookOrder.createMany({
    data: items.map((item) => ({
      bookId: item.bookId,
      quantity: item.quantity,
      groupId,
      name,
      phone,
      address,
      status: "PENDING",
      deliveryMethod,
      userId: userId ?? undefined,
    })),
  });

  const receipt = await mockPaymentProvider.charge({
    amount: totalAmount,
    orderId: groupId,
    provider,
  });

  await prisma.bookOrder.updateMany({
    where: { groupId },
    data: { receiptRef: receipt.receiptRef },
  });

  return NextResponse.json({ groupId, receipt });
}
