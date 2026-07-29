import { NextResponse } from "next/server";
import { AUTH_COOKIES } from "@/lib/auth";

export async function POST() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set(AUTH_COOKIES.USER_COOKIE, "", { path: "/", maxAge: 0 });
  return res;
}
