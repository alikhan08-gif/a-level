import { NextResponse } from "next/server";
import { getSessionAdminId } from "@/lib/auth";
import { checkRatingDecay } from "@/lib/rating";

export async function POST() {
  const adminId = await getSessionAdminId();
  if (!adminId) return NextResponse.json({ error: "Ruxsat yo'q" }, { status: 401 });

  const results = await checkRatingDecay();
  return NextResponse.json({ results });
}
