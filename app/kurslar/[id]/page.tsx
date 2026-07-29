import Link from "next/link";
import { notFound } from "next/navigation";
import { getCourseById } from "@/lib/data";
import { getLocale } from "@/lib/i18n/server";
import { getDictionary, localize } from "@/lib/i18n/dictionaries";
import { formatPrice } from "@/lib/format";

export default async function CourseDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [course, locale] = await Promise.all([getCourseById(id), getLocale()]);
  if (!course) notFound();
  const dict = getDictionary(locale);

  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <div className="text-sm font-semibold text-brand-gold uppercase tracking-wider mb-2">
        {dict.directions[course.direction as keyof typeof dict.directions]} ·{" "}
        {dict.subjects[course.subject as keyof typeof dict.subjects]}
      </div>
      <h1 className="text-3xl font-bold text-brand-navy mb-3">
        {localize(course.title, course.titleEn, locale)}
      </h1>
      <p className="text-brand-navy/70 mb-6 max-w-2xl">
        {localize(course.description, course.descriptionEn, locale)}
      </p>

      <div className="flex flex-wrap items-center gap-4 mb-10">
        <span className="text-2xl font-bold text-brand-navy">
          {formatPrice(course.price)} {dict.kitoblar.currency}
        </span>
        <Link
          href={course.telegramBotLink ?? "#"}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-full bg-brand-navy px-6 py-3 text-white font-semibold hover:bg-brand-navy-light transition-colors"
        >
          {dict.kurslarDetail.enroll}
        </Link>
      </div>

      <h2 className="text-xl font-bold text-brand-navy mb-4">{dict.kurslarDetail.program}</h2>
      <div className="space-y-4">
        {course.modules.map((module) => (
          <div key={module.id} className="rounded-2xl border border-black/10 p-5">
            <h3 className="font-semibold text-brand-navy mb-3">{module.title}</h3>
            <ul className="space-y-2">
              {module.lessons.map((lesson) => (
                <li
                  key={lesson.id}
                  className="flex items-center gap-3 text-sm text-brand-navy/70"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="5" y="11" width="14" height="9" rx="2" />
                    <path d="M8 11V8a4 4 0 1 1 8 0v3" />
                  </svg>
                  {lesson.title}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
