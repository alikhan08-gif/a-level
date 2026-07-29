import Link from "next/link";
import BookCarousel from "@/components/BookCarousel";
import { getBooks } from "@/lib/data";
import { SUBJECTS } from "@/lib/types";
import { getSubjectStyle } from "@/lib/subjectStyle";
import { getLocale } from "@/lib/i18n/server";
import { getDictionary, localize } from "@/lib/i18n/dictionaries";

export const metadata = { title: "Kitoblar — Harrington Academy" };

export default async function KitoblarPage() {
  const [books, locale] = await Promise.all([getBooks(), getLocale()]);
  const dict = getDictionary(locale);

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <h1 className="text-3xl font-bold text-brand-navy text-center mb-2">{dict.kitoblar.title}</h1>
      <p className="text-center text-brand-navy/60 mb-10">{dict.kitoblar.subtitle}</p>

      {SUBJECTS.map((subject) => {
        const subjectBooks = books.filter((b) => b.subject === subject);
        if (subjectBooks.length === 0) return null;
        return (
          <BookCarousel
            key={subject}
            title={`${dict.subjects[subject]} ${dict.kitoblar.collectionsSuffix}`}
            accent={getSubjectStyle(subject).accent}
            books={subjectBooks.map((book) => ({
              ...book,
              title: localize(book.title, book.titleEn, locale),
              description: localize(book.description, book.descriptionEn, locale),
            }))}
            locale={locale}
          />
        );
      })}

      <div className="flex justify-center mt-4">
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-full border border-black/10 px-6 py-3 text-sm font-semibold text-brand-navy hover:bg-black/[0.03] transition-colors"
        >
          &larr; {dict.kitoblar.backHome}
        </Link>
      </div>
    </div>
  );
}
