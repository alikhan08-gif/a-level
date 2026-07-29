import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { verifyPassword, signAdminToken, AUTH_COOKIES } from "@/lib/auth";

export async function POST(req: Request) {
  const { password } = (await req.json()) as { password: string };
  if (!password) return NextResponse.json({ error: "Parolni kiriting" }, { status: 400 });

  const admin = await prisma.adminUser.findUnique({ where: { username: "admin" } });
  if (!admin) return NextResponse.json({ error: "Admin topilmadi" }, { status: 404 });

  const valid = await verifyPassword(password, admin.passwordHash);
  if (!valid) return NextResponse.json({ error: "Parol noto'g'ri" }, { status: 401 });

  const token = signAdminToken({ adminId: admin.id });
  const res = NextResponse.json({ ok: true });
  res.cookies.set(AUTH_COOKIES.ADMIN_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 12,
  });
  return res;
}
