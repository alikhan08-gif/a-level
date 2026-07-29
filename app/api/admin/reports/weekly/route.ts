import { NextResponse } from "next/server";
import { getSessionAdminId } from "@/lib/auth";
import { buildWeeklyReportWorkbook } from "@/lib/reports/weekly";

export async function GET() {
  const adminId = await getSessionAdminId();
  if (!adminId) return NextResponse.json({ error: "Ruxsat yo'q" }, { status: 401 });

  const buffer = await buildWeeklyReportWorkbook();
  const filename = `hisobot-${new Date().toISOString().slice(0, 10)}.xlsx`;

  return new NextResponse(buffer, {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
