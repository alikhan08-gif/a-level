import { getLocale } from "@/lib/i18n/server";
import { getDictionary } from "@/lib/i18n/dictionaries";

export const metadata = { title: "Bepul darslar — Harrington Academy" };

export default async function BepulDarslarPage() {
  const locale = await getLocale();
  const dict = getDictionary(locale);
  return (
    <div className="mx-auto max-w-3xl px-4 py-24 text-center">
      <h1 className="text-2xl font-bold text-brand-navy mb-3">{dict.freeLessons.title}</h1>
      <p className="text-brand-navy/60">{dict.freeLessons.comingSoon}</p>
    </div>
  );
}
