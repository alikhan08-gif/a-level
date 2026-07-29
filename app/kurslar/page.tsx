import { Suspense } from "react";
import DirectionCourseTabs from "@/components/DirectionCourseTabs";
import BackButton from "@/components/BackButton";
import { getCoursesGroupedByDirection } from "@/lib/data";
import { DIRECTIONS, type Direction } from "@/lib/types";
import { getLocale } from "@/lib/i18n/server";
import { getDictionary, localize } from "@/lib/i18n/dictionaries";

export const metadata = { title: "Kurslar — Harrington Academy" };

export default async function KurslarPage() {
  const [locale, grouped] = await Promise.all([getLocale(), getCoursesGroupedByDirection()]);
  const dict = getDictionary(locale);

  const localizedGrouped = Object.fromEntries(
    DIRECTIONS.map((direction) => [
      direction,
      grouped[direction].map((c) => ({
        ...c,
        title: localize(c.title, c.titleEn, locale),
        description: localize(c.description, c.descriptionEn, locale),
      })),
    ])
  ) as Record<Direction, (typeof grouped)[Direction]>;

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <h1 className="text-3xl font-bold text-brand-navy text-center mb-2">{dict.kurslar.title}</h1>
      <p className="text-center text-brand-navy/60 mb-10">{dict.kurslar.subtitle}</p>
      <Suspense fallback={null}>
        <DirectionCourseTabs grouped={localizedGrouped} locale={locale} />
      </Suspense>

      <div className="flex justify-center mt-8">
        <BackButton label={dict.kurslar.back} />
      </div>
    </div>
  );
}
