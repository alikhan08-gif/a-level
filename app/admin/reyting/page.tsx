import Link from "next/link";
import { redirect } from "next/navigation";
import { getSessionAdminId } from "@/lib/auth";
import { getLeaderboardGroupedByCohort, TIER_COLORS, type RatingTier } from "@/lib/rating";
import { getLocale } from "@/lib/i18n/server";
import { getDictionary, formatTemplate } from "@/lib/i18n/dictionaries";

export const metadata = { title: "Reyting — Admin panel" };

function tierLabel(tier: RatingTier, dict: ReturnType<typeof getDictionary>) {
  return tier === "green" ? dict.rating.tierGreen : tier === "yellow" ? dict.rating.tierYellow : dict.rating.tierRed;
}

export default async function AdminRatingPage() {
  const adminId = await getSessionAdminId();
  if (!adminId) redirect("/admin/login");

  const [locale, { groups, unassigned }] = await Promise.all([getLocale(), getLeaderboardGroupedByCohort()]);
  const dict = getDictionary(locale);

  return (
    <div className="min-h-screen bg-black/[0.02]">
      <div className="mx-auto max-w-3xl px-4 py-10 space-y-6">
        <Link href="/admin" className="text-sm text-brand-navy/60 hover:underline">
          &larr; {dict.admin.ratingBack}
        </Link>
        <h1 className="text-2xl font-bold text-brand-navy">{dict.admin.ratingTitle}</h1>

        {groups.map((group) => (
          <section key={group.cohortId}>
            <div className="flex items-center gap-2 mb-3">
              <h2 className="font-bold text-brand-navy">{group.cohortName}</h2>
              <span
                className={`rounded-full px-2.5 py-0.5 text-xs font-bold uppercase tracking-wide ${
                  group.cohortStatus === "OPEN" ? "bg-green-100 text-green-700" : "bg-black/5 text-brand-navy/50"
                }`}
              >
                {group.cohortStatus === "OPEN" ? dict.admin.cohortOpen : dict.admin.cohortClosed}
              </span>
              <span className="ml-auto text-xs font-semibold text-brand-navy/50">
                {formatTemplate(dict.admin.cohortStudentsCount, { count: group.entries.length })}
              </span>
            </div>
            {group.entries.length === 0 ? (
              <div className="rounded-2xl border border-black/10 bg-white p-5 text-sm text-brand-navy/50">
                {dict.admin.ratingNoStudents}
              </div>
            ) : (
              <div className="rounded-2xl border border-black/10 bg-white overflow-hidden divide-y divide-black/5">
                {group.entries.map((entry) => (
                  <div key={entry.userId} className="flex items-center gap-4 px-5 py-3">
                    <span className="w-6 shrink-0 text-center text-sm font-bold text-brand-navy/40">{entry.rank}</span>
                    <span className="flex-1 text-sm font-semibold text-brand-navy truncate">{entry.name}</span>
                    <span className={`text-xs font-bold uppercase tracking-wide ${TIER_COLORS[entry.tier].text}`}>
                      {tierLabel(entry.tier, dict)}
                    </span>
                    <span className={`text-sm font-extrabold ${TIER_COLORS[entry.tier].text}`}>{entry.rating}</span>
                  </div>
                ))}
              </div>
            )}
          </section>
        ))}

        {unassigned.length > 0 && (
          <section>
            <div className="flex items-center gap-2 mb-3">
              <h2 className="font-bold text-brand-navy">{dict.admin.ratingUnassigned}</h2>
              <span className="ml-auto text-xs font-semibold text-brand-navy/50">
                {formatTemplate(dict.admin.cohortStudentsCount, { count: unassigned.length })}
              </span>
            </div>
            <div className="rounded-2xl border border-black/10 bg-white overflow-hidden divide-y divide-black/5">
              {unassigned.map((entry) => (
                <div key={entry.userId} className="flex items-center gap-4 px-5 py-3">
                  <span className="w-6 shrink-0 text-center text-sm font-bold text-brand-navy/40">{entry.rank}</span>
                  <span className="flex-1 text-sm font-semibold text-brand-navy truncate">{entry.name}</span>
                  <span className={`text-xs font-bold uppercase tracking-wide ${TIER_COLORS[entry.tier].text}`}>
                    {tierLabel(entry.tier, dict)}
                  </span>
                  <span className={`text-sm font-extrabold ${TIER_COLORS[entry.tier].text}`}>{entry.rating}</span>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
