import Link from "next/link";
import { redirect } from "next/navigation";
import { getSessionUserId } from "@/lib/auth";
import { computeRating, getLeaderboard, TIER_COLORS } from "@/lib/rating";
import { getLocale } from "@/lib/i18n/server";
import { getDictionary } from "@/lib/i18n/dictionaries";
import BackButton from "@/components/BackButton";

export const metadata = { title: "Reyting — Harrington Academy" };

function Bar({ label, value, currency }: { label: string; value: number | null; currency?: string }) {
  return (
    <div>
      <div className="flex justify-between text-sm font-semibold text-brand-navy/70 mb-1.5">
        <span>{label}</span>
        <span>{value === null ? currency : `${value}%`}</span>
      </div>
      <div className="h-2.5 rounded-full bg-black/[0.06] overflow-hidden">
        <div
          className="h-full rounded-full bg-brand-navy/70"
          style={{ width: `${value ?? 0}%` }}
        />
      </div>
    </div>
  );
}

export default async function RatingPage() {
  const userId = await getSessionUserId();
  if (!userId) redirect("/kirish");

  const [locale, rating, leaderboard] = await Promise.all([getLocale(), computeRating(userId), getLeaderboard()]);
  const dict = getDictionary(locale);
  const colors = TIER_COLORS[rating.tier];

  const tierLabel =
    rating.tier === "green" ? dict.rating.tierGreen : rating.tier === "yellow" ? dict.rating.tierYellow : dict.rating.tierRed;
  const recommendation =
    rating.tier === "green"
      ? dict.rating.recommendationGreen
      : rating.tier === "yellow"
        ? dict.rating.recommendationYellow
        : dict.rating.recommendationRed;

  return (
    <div className="bg-black/[0.015] min-h-[70vh]">
      <div className="mx-auto max-w-3xl px-4 py-12">
        <div className="mb-6">
          <BackButton label={dict.kurslar.back} />
        </div>
        <h1 className="text-2xl font-bold text-brand-navy mb-1">{dict.rating.title}</h1>
        <p className="text-brand-navy/60 mb-8">{dict.rating.subtitle}</p>

        <div className={`rounded-[28px] border border-black/10 ${colors.bg} p-8 text-center mb-6`}>
          <div className={`text-6xl font-extrabold ${colors.text}`}>{rating.rating}</div>
          <div className={`text-sm font-bold uppercase tracking-wide mt-1 ${colors.text}`}>{tierLabel}</div>
          <p className="text-brand-navy/70 mt-4 max-w-md mx-auto">{recommendation}</p>
        </div>

        <div className="rounded-[28px] border border-black/10 bg-white p-6 space-y-5 mb-6">
          <Bar label={dict.rating.viewLabel} value={rating.viewScore} currency={dict.rating.noData} />
          <Bar label={dict.rating.quizLabel} value={rating.quizScore} currency={dict.rating.noData} />
          <Bar label={dict.rating.writtenLabel} value={rating.writtenScore} currency={dict.rating.noData} />
          {rating.penalty > 0 && (
            <div className="flex justify-between text-sm font-semibold text-red-600 pt-2 border-t border-black/[0.06]">
              <span>{dict.rating.penaltyLabel}</span>
              <span>-{rating.penalty}</span>
            </div>
          )}
        </div>

        <Link
          href="/kabinet/yozma-ish"
          className="block text-center rounded-full bg-brand-navy px-6 py-3 text-white font-semibold hover:bg-brand-navy-light transition-colors"
        >
          {dict.rating.writtenWorkTitle} &rarr;
        </Link>

        <h2 className="text-lg font-bold text-brand-navy text-center mt-12 mb-4">
          {dict.rating.leaderboardTitle}
        </h2>
        {leaderboard.length === 0 ? (
          <p className="text-brand-navy/50 text-sm text-center">{dict.rating.leaderboardEmpty}</p>
        ) : (
          <div className="rounded-[28px] border border-black/10 bg-white overflow-hidden divide-y divide-black/5">
            {leaderboard.map((entry) => {
              const isYou = entry.userId === userId;
              const entryColors = TIER_COLORS[entry.tier];
              return (
                <div
                  key={entry.userId}
                  className={`flex items-center gap-4 px-5 py-3.5 ${isYou ? "bg-brand-gold/[0.06]" : ""}`}
                >
                  <span className="w-7 shrink-0 text-center text-sm font-bold text-brand-navy/40">
                    {entry.rank}
                  </span>
                  <span className="flex-1 text-sm font-semibold text-brand-navy truncate">
                    {entry.name}
                    {isYou && (
                      <span className="ml-2 text-xs font-bold text-brand-gold uppercase tracking-wide">
                        {dict.rating.leaderboardYou}
                      </span>
                    )}
                  </span>
                  <span className={`text-sm font-extrabold ${entryColors.text}`}>{entry.rating}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
