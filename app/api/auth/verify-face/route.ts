import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { verifyFacePendingToken, signUserToken, AUTH_COOKIES } from "@/lib/auth";
import { euclideanDistance, FACE_MATCH_THRESHOLD, FACE_MAX_FAILED_ATTEMPTS } from "@/lib/faceMath";

export async function POST(req: Request) {
  const { facePendingToken, descriptor } = (await req.json()) as {
    facePendingToken: string;
    descriptor: number[];
  };

  const userId = facePendingToken ? verifyFacePendingToken(facePendingToken) : null;
  if (!userId || !Array.isArray(descriptor)) {
    return NextResponse.json({ error: "Sessiya muddati tugagan, qaytadan kiring" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return NextResponse.json({ error: "Foydalanuvchi topilmadi" }, { status: 404 });
  if (user.locked) {
    return NextResponse.json(
      { error: "Akkountingiz qulflangan. Iltimos admin bilan bog'laning.", locked: true },
      { status: 423 }
    );
  }

  // First-time capture (e.g. right after registration, or after an admin
  // unlock cleared the previous descriptor): store it instead of comparing.
  if (!user.faceDescriptor) {
    await prisma.user.update({
      where: { id: user.id },
      data: { faceDescriptor: JSON.stringify(descriptor), faceFailedAttempts: 0 },
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

  const storedDescriptor = JSON.parse(user.faceDescriptor) as number[];
  const distance = euclideanDistance(storedDescriptor, descriptor);

  if (distance <= FACE_MATCH_THRESHOLD) {
    await prisma.user.update({ where: { id: user.id }, data: { faceFailedAttempts: 0 } });
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

  const failedAttempts = user.faceFailedAttempts + 1;
  const shouldLock = failedAttempts >= FACE_MAX_FAILED_ATTEMPTS;
  await prisma.user.update({
    where: { id: user.id },
    data: { faceFailedAttempts: failedAttempts, locked: shouldLock },
  });

  if (shouldLock) {
    return NextResponse.json(
      { error: "Yuz mos kelmadi. Akkountingiz qulflandi. Iltimos admin bilan bog'laning.", locked: true },
      { status: 423 }
    );
  }

  return NextResponse.json(
    {
      error: `Yuz mos kelmadi. ${FACE_MAX_FAILED_ATTEMPTS - failedAttempts} ta urinish qoldi.`,
      attemptsLeft: FACE_MAX_FAILED_ATTEMPTS - failedAttempts,
    },
    { status: 401 }
  );
}
