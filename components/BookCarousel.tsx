"use client";

import { useRef } from "react";
import BookCard from "@/components/BookCard";
import type { Locale } from "@/lib/i18n/dictionaries";

export default function BookCarousel({
  title,
  accent,
  books,
  locale,
}: {
  title: string;
  accent: string;
  books: { id: string; subject: string; title: string; description?: string; price: number; coverImage?: string | null }[];
  locale: Locale;
}) {
  const trackRef = useRef<HTMLDivElement>(null);

  function scroll(direction: 1 | -1) {
    trackRef.current?.scrollBy({ left: direction * 600, behavior: "smooth" });
  }

  return (
    <div data-aos="fade-up" className="mb-12">
      <div className="flex items-center gap-3 mb-5">
        <span className="h-6 w-1.5 rounded-full" style={{ backgroundColor: accent }} />
        <h2 className="text-lg font-bold text-brand-navy">{title}</h2>
      </div>

      <div className="relative">
        <div
          ref={trackRef}
          className="flex gap-5 overflow-x-auto scroll-smooth snap-x snap-mandatory pb-2 px-[calc(50%-150px)] sm:px-0 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {books.map((book) => (
            <div key={book.id} className="shrink-0 w-[300px] snap-center sm:snap-start">
              <BookCard book={book} locale={locale} />
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={() => scroll(-1)}
          aria-label="Previous"
          className="hidden sm:flex absolute -left-5 top-1/2 -translate-y-1/2 h-10 w-10 items-center justify-center rounded-full bg-white border border-black/10 shadow-md text-brand-navy hover:bg-black/[0.03] transition-colors"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>
        <button
          type="button"
          onClick={() => scroll(1)}
          aria-label="Next"
          className="hidden sm:flex absolute -right-5 top-1/2 -translate-y-1/2 h-10 w-10 items-center justify-center rounded-full bg-white border border-black/10 shadow-md text-brand-navy hover:bg-black/[0.03] transition-colors"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M9 6l6 6-6 6" />
          </svg>
        </button>
      </div>
    </div>
  );
}
