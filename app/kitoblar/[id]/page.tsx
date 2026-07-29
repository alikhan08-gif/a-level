import { notFound } from "next/navigation";
import { getBookById } from "@/lib/data";
import { getLocale } from "@/lib/i18n/server";
import { getDictionary, localize } from "@/lib/i18n/dictionaries";
import { formatPrice } from "@/lib/format";
import BookOrderFlow from "@/components/BookOrderFlow";

export default async function BookDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [book, locale] = await Promise.all([getBookById(id), getLocale()]);
  if (!book) notFound();
  const dict = getDictionary(locale);
  const title = localize(book.title, book.titleEn, locale);

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 grid md:grid-cols-2 gap-10">
      <div>
        <div className="aspect-[3/4] max-w-xs rounded-2xl bg-black/5 flex items-center justify-center text-brand-navy/30">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M4 4.5A2.5 2.5 0 0 1 6.5 2H20v17H6.5A2.5 2.5 0 0 0 4 21.5v-17Z" />
            <path d="M4 19a2.5 2.5 0 0 1 2.5-2.5H20" />
          </svg>
        </div>
        <div className="mt-6 text-sm font-semibold text-brand-gold uppercase tracking-wider mb-1">
          {dict.subjects[book.subject as keyof typeof dict.subjects]}
        </div>
        <h1 className="text-2xl font-bold text-brand-navy mb-2">{title}</h1>
        <p className="text-brand-navy/70 mb-4">{localize(book.description, book.descriptionEn, locale)}</p>
        <div className="text-2xl font-bold text-brand-navy">
          {formatPrice(book.price)} {dict.kitoblar.currency}
        </div>
      </div>

      <BookOrderFlow bookId={book.id} bookTitle={title} price={book.price} locale={locale} />
    </div>
  );
}
