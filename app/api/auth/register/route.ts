import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { hashPassword, signUserToken, AUTH_COOKIES } from "@/lib/auth";

export async function POST(req: Request) {
  const body = await req.json();
  const { firstName, lastName, phone, password, faceDescriptor } = body as {
    firstName: string;
    lastName: string;
    phone: string;
    password: string;
    faceDescriptor?: number[];
  };

  if (!firstName?.trim() || !lastName?.trim() || !phone?.trim() || !password) {
    return NextResponse.json({ error: "Barcha maydonlarni to'ldiring" }, { status: 400 });
  }
  if (password.length < 6) {
    return NextResponse.json({ error: "Parol kamida 6 belgidan iborat bo'lishi kerak" }, { status: 400 });
  }
  if (!Array.isArray(faceDescriptor) || faceDescriptor.length === 0) {
    return NextResponse.json({ error: "Face ID ro'yxatga olinmadi" }, { status: 400 });
  }

  const existing = await prisma.user.findUnique({ where: { phone } });
  if (existing) {
    return NextResponse.json({ error: "Bu telefon raqam bilan foydalanuvchi allaqachon ro'yxatdan o'tgan" }, { status: 409 });
  }

  const passwordHash = await hashPassword(password);
  const user = await prisma.user.create({
    data: {
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      phone: phone.trim(),
      passwordHash,
      faceDescriptor: JSON.stringify(faceDescriptor),
    },
  });

  const token = signUserToken({ userId: user.id });
  const res = NextResponse.json({ user: { id: user.id, firstName: user.firstName, lastName: user.lastName } });
  res.cookies.set(AUTH_COOKIES.USER_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
  return res;
}
