"use client";

import { useState } from "react";
import Link from "next/link";
import { getDictionary, type Locale } from "@/lib/i18n/dictionaries";
import { formatPrice } from "@/lib/format";

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
            <Link
              href="/shartnoma"
              target="_blank"
              className="font-semibold text-brand-navy underline hover:no-underline"
            >
              {dict.kurslarDetail.agreementLink}
            </Link>{" "}
            {dict.kurslarDetail.agreementSuffix}
          </span>
        </label>
        {showWarning && <p className="mt-1.5 text-xs text-red-600">{dict.kurslarDetail.agreementRequired}</p>}
      </div>
    </div>
  );
}
