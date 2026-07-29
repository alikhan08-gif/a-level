import { NextResponse } from "next/server";
import { getSessionAdminId } from "@/lib/auth";
import { checkInactivityWarnings } from "@/lib/warnings";

export async function POST() {
  const adminId = await getSessionAdminId();
  if (!adminId) return NextResponse.json({ error: "Ruxsat yo'q" }, { status: 401 });

  const results = await checkInactivityWarnings();
  return NextResponse.json({ results });
}
