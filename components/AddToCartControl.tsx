"use client";

import { useCart } from "@/lib/cart-context";

export default function AddToCartControl({
  book,
}: {
  book: { id: string; title: string; price: number; coverImage?: string | null; subject: string };
}) {
  const { items, addItem, incrementItem, decrementItem } = useCart();
  const item = items.find((i) => i.bookId === book.id);

  if (!item) {
    return (
      <button
        type="button"
        aria-label="Savatga qo'shish"
        onClick={() =>
          addItem({ bookId: book.id, title: book.title, price: book.price, coverImage: book.coverImage, subject: book.subject })
        }
        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border-2 border-black/10 text-brand-navy hover:border-brand-navy hover:bg-brand-navy hover:text-white transition-colors"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="9" cy="21" r="1" />
          <circle cx="20" cy="21" r="1" />
          <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
        </svg>
      </button>
    );
  }

  return (
    <div className="flex h-11 shrink-0 items-center rounded-xl border-2 border-brand-navy/30 overflow-hidden">
      <button
        type="button"
        onClick={() => decrementItem(book.id)}
        aria-label="-"
        className="flex h-full w-8 items-center justify-center text-brand-navy font-bold hover:bg-black/5 transition-colors"
      >
        −
      </button>
      <span className="w-5 text-center text-sm font-bold text-brand-navy">{item.quantity}</span>
      <button
        type="button"
        onClick={() => incrementItem(book.id)}
        aria-label="+"
        className="flex h-full w-8 items-center justify-center text-brand-navy font-bold hover:bg-black/5 transition-colors"
      >
        +
      </button>
    </div>
  );
}
