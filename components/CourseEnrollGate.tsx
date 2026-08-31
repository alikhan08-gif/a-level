"use client";

import { useState } from "react";
import { getDictionary, type Locale } from "@/lib/i18n/dictionaries";
import { formatPrice } from "@/lib/format";
import { OFFER_TITLE_UZ, OFFER_TITLE_EN, OFFER_SECTIONS_UZ, OFFER_SECTIONS_EN } from "@/lib/offerAgreement";

export default function CourseEnrollGate({
  price,
  currency,
  telegramBotLink,
  locale,
}: {
  price: number;
  currency: string;
  telegramBotLink: string | null;
  locale: Locale;
}) {
  const dict = getDictionary(locale);
  const [agreed, setAgreed] = useState(false);
  const [showWarning, setShowWarning] = useState(false);
  const [showContract, setShowContract] = useState(false);

  const title = locale === "en" ? OFFER_TITLE_EN : OFFER_TITLE_UZ;
  const sections = locale === "en" ? OFFER_SECTIONS_EN : OFFER_SECTIONS_UZ;

  function handleEnrollClick(e: React.MouseEvent) {
    if (!agreed) {
      e.preventDefault();
      setShowWarning(true);
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-4 mb-3">
      <span className="text-2xl font-bold text-brand-navy">
        {formatPrice(price)} {currency}
      </span>
      <a
        href={telegramBotLink ?? "#"}
        target="_blank"
        rel="noopener noreferrer"
        onClick={handleEnrollClick}
        aria-disabled={!agreed}
        className={`rounded-full px-6 py-3 font-semibold transition-colors ${
          agreed
            ? "bg-brand-navy text-white hover:bg-brand-navy-light"
            : "bg-black/10 text-brand-navy/40 cursor-not-allowed"
        }`}
      >
        {dict.kurslarDetail.enroll}
      </a>

      <div className="w-full">
        <label className="flex items-start gap-2 text-sm text-brand-navy/70">
          <input
            type="checkbox"
            checked={agreed}
            onChange={(e) => {
              setAgreed(e.target.checked);
              if (e.target.checked) setShowWarning(false);
            }}
            className="mt-0.5 h-4 w-4 shrink-0 accent-[color:var(--brand-navy)]"
          />
          <span>
            {dict.kurslarDetail.agreementPrefix}{" "}
            <button
              type="button"
              onClick={() => setShowContract(true)}
              className="font-semibold text-brand-navy underline hover:no-underline"
            >
              {dict.kurslarDetail.agreementLink}
            </button>{" "}
            {dict.kurslarDetail.agreementSuffix}
          </span>
        </label>
        {showWarning && <p className="mt-1.5 text-xs text-red-600">{dict.kurslarDetail.agreementRequired}</p>}
      </div>

      {showContract && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4"
          onClick={() => setShowContract(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="flex max-h-[85vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl"
          >
            <div className="flex items-center justify-between gap-3 border-b border-black/10 px-6 py-4 shrink-0">
              <div>
                <h2 className="font-bold text-brand-navy">{title}</h2>
                <p className="text-xs text-brand-navy/50">Harrington Academy</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <a
                  href={`/api/shartnoma/pdf?locale=${locale}`}
                  className="flex items-center gap-1.5 rounded-full border border-black/15 px-3 py-1.5 text-xs font-semibold text-brand-navy hover:border-brand-navy/30 transition-colors"
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 15V3M7 10l5 5 5-5M4 21h16" />
                  </svg>
                  PDF
                </a>
                <button
                  type="button"
                  onClick={() => setShowContract(false)}
                  aria-label="Yopish"
                  className="text-brand-navy/50 hover:text-brand-navy"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M6 6l12 12M18 6L6 18" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="overflow-y-auto px-6 py-5 space-y-5">
              {sections.map((section) => (
                <div key={section.title}>
                  <h3 className="font-bold text-brand-navy mb-2 text-sm">{section.title}</h3>
                  <div className="space-y-1.5">
                    {section.body.map((p, i) => (
                      <p key={i} className="text-sm text-brand-navy/70 leading-relaxed">
                        {p}
                      </p>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-black/10 px-6 py-4 shrink-0">
              <button
                type="button"
                onClick={() => {
                  setAgreed(true);
                  setShowWarning(false);
                  setShowContract(false);
                }}
                className="w-full rounded-full bg-brand-navy px-6 py-3 text-white font-semibold hover:bg-brand-navy-light transition-colors"
              >
                {dict.kurslarDetail.agreementPrefix} {dict.kurslarDetail.agreementLink} {dict.kurslarDetail.agreementSuffix}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
