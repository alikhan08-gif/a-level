export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;
  if (process.env.NODE_ENV !== "production") return; // avoid duplicate cron jobs under dev hot-reload

  const cronSpecifier = "node-cron";
  const fsSpecifier = "node:fs/promises";
  const pathSpecifier = "node:path";
  const cron = await import(cronSpecifier);
  const { checkInactivityWarnings } = await import("@/lib/warnings");
  const { checkRatingDecay } = await import("@/lib/rating");
  const { buildWeeklyReportWorkbook } = await import("@/lib/reports/weekly");
  const fs = await import(fsSpecifier);
  const path = await import(pathSpecifier);

  // Daily: fire inactivity warnings (3 consecutive inactive days -> warn on day 4, escalating to reset/expel).
  cron.schedule("30 0 * * *", async () => {
    try {
      await checkInactivityWarnings();
    } catch (err) {
      console.error("[cron] checkInactivityWarnings failed", err);
    }
  });

  // Daily: apply a rating penalty (and notify) to anyone with no lesson
  // activity in the last 24h. Runs a few minutes after the warnings check.
  cron.schedule("35 0 * * *", async () => {
    try {
      await checkRatingDecay();
    } catch (err) {
      console.error("[cron] checkRatingDecay failed", err);
    }
  });

  // Weekly: every Sunday at 00:00, save the Excel report to disk for the admin panel.
  cron.schedule("0 0 * * 0", async () => {
    try {
      const buffer = await buildWeeklyReportWorkbook();
      const dir = path.join(process.cwd(), "reports");
      await fs.mkdir(dir, { recursive: true });
      const filename = `hisobot-${new Date().toISOString().slice(0, 10)}.xlsx`;
      await fs.writeFile(path.join(dir, filename), Buffer.from(buffer));
    } catch (err) {
      console.error("[cron] weekly report generation failed", err);
    }
  });
}
