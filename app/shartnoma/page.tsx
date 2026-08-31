import Link from "next/link";
import { getLocale } from "@/lib/i18n/server";
import { OFFER_TITLE_UZ, OFFER_TITLE_EN, OFFER_SECTIONS_UZ, OFFER_SECTIONS_EN } from "@/lib/offerAgreement";

export const metadata = { title: "Ommaviy oferta shartnomasi — Harrington Academy" };

export default async function ShartnomaPage() {
  const locale = await getLocale();
  const sections = locale === "en" ? OFFER_SECTIONS_EN : OFFER_SECTIONS_UZ;

  return (
    <div className="bg-black/[0.015] min-h-[70vh]">
      <div className="mx-auto max-w-3xl px-4 py-12">
        <div className="flex flex-wrap items-start justify-between gap-4 mb-2">
          <h1 className="text-2xl font-bold text-brand-navy">{locale === "en" ? OFFER_TITLE_EN : OFFER_TITLE_UZ}</h1>
          <Link
            href={`/api/shartnoma/pdf?locale=${locale}`}
            className="flex items-center gap-2 rounded-full border border-black/15 px-4 py-2 text-sm font-semibold text-brand-navy hover:border-brand-navy/30 transition-colors shrink-0"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 15V3M7 10l5 5 5-5M4 21h16" />
            </svg>
            PDF
          </Link>
        </div>
        <p className="text-brand-navy/50 text-sm mb-8">Harrington Academy</p>

        <div className="space-y-6">
          {sections.map((section) => (
            <div key={section.title} className="rounded-2xl border border-black/10 bg-white p-6">
              <h2 className="font-bold text-brand-navy mb-3">{section.title}</h2>
              <div className="space-y-2">
                {section.body.map((p, i) => (
                  <p key={i} className="text-sm text-brand-navy/70 leading-relaxed">
                    {p}
                  </p>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
