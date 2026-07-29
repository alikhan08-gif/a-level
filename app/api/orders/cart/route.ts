import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { prisma } from "@/lib/db";
import { mockPaymentProvider } from "@/lib/payments/mock";

export async function POST(req: Request) {
  const body = await req.json();
  const { items, name, phone, address, provider } = body as {
    items: { bookId: string; quantity: number }[];
    name: string;
    phone: string;
    address: string;
    provider: "click" | "payme";
  };

  if (!items?.length || !name || !phone || !address || !provider) {
    return NextResponse.json({ error: "Barcha maydonlarni to'ldiring" }, { status: 400 });
  }

  const books = await prisma.book.findMany({ where: { id: { in: items.map((i) => i.bookId) } } });
  if (books.length !== items.length) {
    return NextResponse.json({ error: "Ba'zi kitoblar topilmadi" }, { status: 404 });
  }
  const bookById = new Map(books.map((b) => [b.id, b]));

  const groupId = randomUUID();
  const totalAmount = items.reduce((sum, item) => sum + (bookById.get(item.bookId)?.price ?? 0) * item.quantity, 0);

  await prisma.bookOrder.createMany({
    data: items.map((item) => ({
      bookId: item.bookId,
      quantity: item.quantity,
      groupId,
      name,
      phone,
      address,
      status: "PENDING",
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
