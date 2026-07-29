"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { DIRECTIONS, type Direction } from "@/lib/types";
import { getDictionary, type Locale } from "@/lib/i18n/dictionaries";
import { getSubjectStyle } from "@/lib/subjectStyle";

type CourseLite = {
  id: string;
  direction: string;
  subject: string;
  title: string;
  description: string;
};

export default function DirectionCourseTabs({
  grouped,
  locale,
}: {
  grouped: Record<Direction, CourseLite[]>;
  locale: Locale;
}) {
  const dict = getDictionary(locale);
  const searchParams = useSearchParams();
  const requestedDirection = searchParams.get("direction");
  const initial = DIRECTIONS.includes(requestedDirection as Direction) ? (requestedDirection as Direction) : "ALL";
  const [active, setActive] = useState<Direction | "ALL">(initial);

  useEffect(() => {
    if (DIRECTIONS.includes(requestedDirection as Direction)) {
      setActive(requestedDirection as Direction);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [requestedDirection]);

  const visibleCourses = active === "ALL" ? DIRECTIONS.flatMap((direction) => grouped[direction]) : grouped[active];

  return (
    <div>
      <div className="flex flex-wrap justify-center gap-2 mb-8">
        <button
          type="button"
          onClick={() => setActive("ALL")}
          className={`rounded-full px-5 py-2 text-sm font-semibold transition-colors ${
            active === "ALL" ? "bg-brand-navy text-white" : "bg-black/5 text-brand-navy hover:bg-black/10"
          }`}
        >
          {dict.kurslar.all}
        </button>
        {DIRECTIONS.map((direction) => (
          <button
            key={direction}
            type="button"
            onClick={() => setActive(direction)}
            className={`rounded-full px-5 py-2 text-sm font-semibold transition-colors ${
              active === direction
                ? "bg-brand-navy text-white"
                : "bg-black/5 text-brand-navy hover:bg-black/10"
            }`}
          >
            {dict.directions[direction]}
          </button>
        ))}
      </div>

      <div id="course-grid" className="grid gap-6 sm:grid-cols-3">
        {visibleCourses.map((course, i) => {
          const style = getSubjectStyle(course.subject);
          return (
            <Link
              key={course.id}
              href={`/kurslar/${course.id}`}
              data-aos="fade-up"
              data-aos-anchor="#course-grid"
              data-aos-delay={(i % 3) * 100}
              className="card-3d group relative overflow-hidden rounded-[28px] border border-black/10 p-6 pt-7 bg-white"
            >
              <div
                className="absolute inset-x-0 top-0 h-1.5"
                style={{ backgroundColor: style.accent }}
              />
              <div
                className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl"
                style={{ backgroundColor: `${style.accent}1a` }}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke={style.accent} strokeWidth="1.8" className="h-6 w-6">
                  {style.icon}
                </svg>
              </div>
              <div className="text-xs font-semibold text-brand-gold uppercase tracking-wider mb-2">
                {dict.subjects[course.subject as keyof typeof dict.subjects]}
              </div>
              <h3 className="text-lg font-bold text-brand-navy mb-2">{course.title}</h3>
              <p className="text-sm text-brand-navy/70 mb-4 line-clamp-2">{course.description}</p>
              <span className="inline-flex items-center gap-1 text-sm font-medium text-brand-navy group-hover:gap-2 transition-all">
                {dict.kurslar.detail} <span aria-hidden>&rarr;</span>
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
