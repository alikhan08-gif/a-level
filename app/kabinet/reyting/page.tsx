import Link from "next/link";
import { redirect } from "next/navigation";
import { getSessionUserId } from "@/lib/auth";
import { computeRating, type RatingTier } from "@/lib/rating";
import { getLocale } from "@/lib/i18n/server";
import { getDictionary } from "@/lib/i18n/dictionaries";

export const metadata = { title: "Reyting — Harrington Academy" };

const TIER_COLORS: Record<RatingTier, { text: string; bg: string; bar: string }> = {
  green: { text: "text-green-600", bg: "bg-green-50", bar: "#16a34a" },
  yellow: { text: "text-amber-600", bg: "bg-amber-50", bar: "#d97706" },
  red: { text: "text-red-600", bg: "bg-red-50", bar: "#dc2626" },
};

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

  const [locale, rating] = await Promise.all([getLocale(), computeRating(userId)]);
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
      </div>
    </div>
  );
}
