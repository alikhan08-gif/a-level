import { prisma } from "@/lib/db";

// Returns the single currently-open cohort, if any.
export async function getOpenCohort() {
  return prisma.cohort.findFirst({ where: { status: "OPEN" }, orderBy: { createdAt: "desc" } });
}

// Called at registration time. Guarantees there is always somewhere for a
// new student to land, even before the admin has ever touched the cohorts
// panel — auto-creates a first cohort ("1-oqim") the very first time it's
// needed instead of requiring that as a manual setup step.
export async function ensureOpenCohort() {
  const open = await getOpenCohort();
  if (open) return open;

  const cohortCount = await prisma.cohort.count();
  return prisma.cohort.create({
    data: { name: `${cohortCount + 1}-oqim`, status: "OPEN" },
  });
}

// Opening a cohort closes every other one first, so exactly one cohort is
// ever open (i.e. receiving new registrations) at a time.
export async function openCohort(id: string) {
  await prisma.$transaction([
    prisma.cohort.updateMany({ where: { status: "OPEN" }, data: { status: "CLOSED" } }),
    prisma.cohort.update({ where: { id }, data: { status: "OPEN" } }),
  ]);
}

export async function closeCohort(id: string) {
  await prisma.cohort.update({ where: { id }, data: { status: "CLOSED" } });
}
