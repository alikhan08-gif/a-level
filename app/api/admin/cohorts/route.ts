import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSessionAdminId } from "@/lib/auth";
import { openCohort } from "@/lib/cohort";

export async function GET() {
  const adminId = await getSessionAdminId();
  if (!adminId) return NextResponse.json({ error: "Ruxsat yo'q" }, { status: 401 });

  const cohorts = await prisma.cohort.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      users: { select: { id: true, firstName: true, lastName: true, phone: true }, orderBy: { createdAt: "asc" } },
    },
  });
  return NextResponse.json({ cohorts });
}

// Creating a new cohort immediately opens it (closing whichever one was
// open before) — matches the requested flow: close the old stream by
// opening the new one, new registrants land in the new cohort.
export async function POST(req: Request) {
  const adminId = await getSessionAdminId();
  if (!adminId) return NextResponse.json({ error: "Ruxsat yo'q" }, { status: 401 });

  const { name } = (await req.json()) as { name: string };
  if (!name?.trim()) {
    return NextResponse.json({ error: "Patok nomini kiriting" }, { status: 400 });
  }

  const cohort = await prisma.cohort.create({ data: { name: name.trim(), status: "CLOSED" } });
  await openCohort(cohort.id);

  return NextResponse.json({ cohort });
}
