import { NextResponse } from "next/server";
import { getSessionUserId } from "@/lib/auth";
import { computeRating } from "@/lib/rating";

export async function GET() {
  const userId = await getSessionUserId();
  if (!userId) return NextResponse.json({ error: "Tizimga kiring" }, { status: 401 });

  const rating = await computeRating(userId);
  return NextResponse.json(rating);
}
