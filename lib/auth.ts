import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

const JWT_SECRET = process.env.JWT_SECRET ?? "dev-secret-change-me";
const USER_COOKIE = "session";
const ADMIN_COOKIE = "admin_session";

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}

type UserTokenPayload = { userId: string };
type AdminTokenPayload = { adminId: string };
type FacePendingPayload = { userId: string; purpose: "face-pending" };

export function signUserToken(payload: UserTokenPayload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "30d" });
}

export function verifyUserToken(token: string): UserTokenPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as UserTokenPayload;
  } catch {
    return null;
  }
}

export function signFacePendingToken(userId: string) {
  const payload: FacePendingPayload = { userId, purpose: "face-pending" };
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "2m" });
}

export function verifyFacePendingToken(token: string): string | null {
  try {
    const payload = jwt.verify(token, JWT_SECRET) as FacePendingPayload;
    return payload.purpose === "face-pending" ? payload.userId : null;
  } catch {
    return null;
  }
}

export function signAdminToken(payload: AdminTokenPayload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "12h" });
}

export function verifyAdminToken(token: string): AdminTokenPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as AdminTokenPayload;
  } catch {
    return null;
  }
}

export async function getSessionUserId(): Promise<string | null> {
  const store = await cookies();
  const token = store.get(USER_COOKIE)?.value;
  if (!token) return null;
  const payload = verifyUserToken(token);
  return payload?.userId ?? null;
}

export async function getSessionAdminId(): Promise<string | null> {
  const store = await cookies();
  const token = store.get(ADMIN_COOKIE)?.value;
  if (!token) return null;
  const payload = verifyAdminToken(token);
  return payload?.adminId ?? null;
}

export const AUTH_COOKIES = { USER_COOKIE, ADMIN_COOKIE };
