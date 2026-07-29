import Link from "next/link";
import { getDictionary, type Locale } from "@/lib/i18n/dictionaries";
import { getSubjectStyle } from "@/lib/subjectStyle";
import { formatPrice } from "@/lib/format";
import AddToCartControl from "@/components/AddToCartControl";

export default function BookCard({
  book,
  locale,
}: {
  book: { id: string; subject: string; title: string; description?: string; price: number; coverImage?: string | null };
  locale: Locale;
}) {
  const dict = getDictionary(locale);
  const style = getSubjectStyle(book.subject);

  return (
    <div className="card-3d group h-full w-full rounded-2xl border border-black/10 bg-white overflow-hidden flex flex-col hover:border-black/20">
      <Link href={`/kitoblar/${book.id}`} className="flex flex-col flex-1">
        <div className="w-full h-[430px] p-4 bg-black/[0.02] overflow-hidden">
          <div
            className="h-full w-full rounded-xl flex items-center justify-center text-4xl overflow-hidden"
            style={{ backgroundColor: `${style.accent}1a` }}
          >
            {book.coverImage ? (
              <img
                src={book.coverImage}
                alt=""
                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
              />
            ) : (
              <span className="transition-transform duration-300 group-hover:scale-110">{style.emoji}</span>
            )}
          </div>
        </div>

        <div className="flex flex-1 flex-col px-4 pt-1 gap-1.5">
          <h3 className="text-base font-semibold text-brand-navy leading-snug line-clamp-2 min-h-[2.5em]">{book.title}</h3>
          <div className="text-sm font-bold text-brand-navy">
            {formatPrice(book.price)} <span className="text-xs font-semibold text-brand-navy/50">{dict.kitoblar.currency}</span>
          </div>
        </div>
      </Link>

      <div className="flex items-center gap-2 p-4 pt-3">
        <AddToCartControl book={book} />
        <Link
          href={`/kitoblar/${book.id}`}
          className="flex-1 rounded-xl border-2 border-brand-navy py-2.5 text-center text-sm font-bold text-brand-navy hover:bg-brand-navy hover:text-white transition-colors"
        >
          {dict.kitoblar.buy}
        </Link>
      </div>
    </div>
  );
}
