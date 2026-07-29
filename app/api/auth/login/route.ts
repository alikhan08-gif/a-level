import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { verifyPassword, signFacePendingToken } from "@/lib/auth";

export async function POST(req: Request) {
  const body = await req.json();
  const { phone, password } = body as { phone: string; password: string };

  if (!phone?.trim() || !password) {
    return NextResponse.json({ error: "Telefon raqam va parolni kiriting" }, { status: 400 });
  }

  const user = await prisma.user.findUnique({ where: { phone: phone.trim() } });
  if (!user) {
    return NextResponse.json({ error: "Telefon raqam yoki parol noto'g'ri" }, { status: 401 });
  }

  if (user.locked) {
    return NextResponse.json(
      { error: "Akkountingiz qulflangan. Iltimos admin bilan bog'laning.", locked: true },
      { status: 423 }
    );
  }

  const valid = await verifyPassword(password, user.passwordHash);
  if (!valid) {
    return NextResponse.json({ error: "Telefon raqam yoki parol noto'g'ri" }, { status: 401 });
  }

  const facePendingToken = signFacePendingToken(user.id);
  return NextResponse.json({
    facePendingToken,
    needsFaceSetup: !user.faceDescriptor,
  });
}
