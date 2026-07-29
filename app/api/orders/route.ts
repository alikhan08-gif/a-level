import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { mockPaymentProvider } from "@/lib/payments/mock";

export async function POST(req: Request) {
  const body = await req.json();
  const { bookId, name, phone, address, provider } = body as {
    bookId: string;
    name: string;
    phone: string;
    address: string;
    provider: "click" | "payme";
  };

  if (!bookId || !name || !phone || !address || !provider) {
    return NextResponse.json({ error: "Barcha maydonlarni to'ldiring" }, { status: 400 });
  }

  const book = await prisma.book.findUnique({ where: { id: bookId } });
  if (!book) {
    return NextResponse.json({ error: "Kitob topilmadi" }, { status: 404 });
  }

  const order = await prisma.bookOrder.create({
    data: { bookId, name, phone, address, status: "PENDING" },
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
