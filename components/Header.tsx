"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { getDictionary, type Locale } from "@/lib/i18n/dictionaries";
import { LOCALE_COOKIE } from "@/lib/i18n/constants";
import { UzFlag, GbFlag } from "@/components/Flags";
import { useCart } from "@/lib/cart-context";

export default function Header({
  userFirstName,
  locale,
}: {
  userFirstName?: string | null;
  locale: Locale;
}) {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const dict = getDictionary(locale);
  const { totalCount } = useCart();

  const navLinks = [
    { href: "/", label: dict.nav.home },
    { href: "/bepul-darslar", label: dict.nav.freeLessons },
    { href: "/kurslar", label: dict.nav.courses },
  ];

  function switchLocale() {
    const next: Locale = locale === "uz" ? "en" : "uz";
    document.cookie = `${LOCALE_COOKIE}=${next}; path=/; max-age=${60 * 60 * 24 * 365}`;
    router.refresh();
  }

  const kabinetLabel = userFirstName ?? dict.nav.cabinet;

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-black/10 shadow-[0_1px_3px_rgba(10,37,64,0.06)]">
      <div className="mx-auto max-w-6xl px-4 h-20 flex items-center justify-between gap-4">
        <Link href="/" className="flex flex-col leading-tight shrink-0">
          <span className="font-serif text-xl font-bold text-brand-navy tracking-wide">
            HARRINGTON
          </span>
          <span className="font-serif text-xs font-bold text-brand-gold tracking-[0.3em] -mt-1">
            ACADEMY
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-lg font-semibold text-brand-navy/80 hover:text-brand-navy transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-1 md:gap-3">
          <button
            type="button"
            onClick={switchLocale}
            className="hidden md:flex items-center gap-1.5 rounded-full border border-black/10 px-2.5 py-1 text-xs font-semibold text-brand-navy hover:border-brand-navy/30"
            aria-label="Switch language"
          >
            {locale === "uz" ? <UzFlag className="h-3.5 w-5 rounded-[2px]" /> : <GbFlag className="h-3.5 w-5 rounded-[2px]" />}
            {locale === "uz" ? "UZ" : "EN"}
          </button>
          <Link
            href="/kabinet"
            className="hidden md:flex items-center gap-2 rounded-full bg-brand-navy px-4 py-2 text-sm font-medium text-white hover:bg-brand-navy-light transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z" />
              <path d="M4 20c1.5-4 5-6 8-6s6.5 2 8 6" />
            </svg>
            {kabinetLabel}
          </Link>

          <Link
            href="/savat"
            aria-label={dict.nav.cart}
            className="hidden md:flex relative h-9 w-9 items-center justify-center rounded-xl border-2 border-sky-400/60 text-brand-navy hover:bg-sky-50/50 transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="9" cy="21" r="1" />
              <circle cx="20" cy="21" r="1" />
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
            </svg>
            {totalCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-brand-gold px-1 text-[10px] font-bold text-brand-navy">
                {totalCount}
              </span>
            )}
          </Link>
        </div>

        <button
          type="button"
          className="md:hidden p-2 text-brand-navy"
          onClick={() => setMenuOpen((v) => !v)}
          aria-label="Menyu"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            {menuOpen ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
          </svg>
        </button>
      </div>

      {/* Backdrop */}
      <div
        onClick={() => setMenuOpen(false)}
        aria-hidden="true"
        className={`md:hidden fixed inset-0 z-[60] bg-black/40 transition-opacity duration-300 ${
          menuOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
      />

      {/* Telegram-style slide-in panel */}
      <div
        className={`md:hidden fixed inset-y-0 left-0 z-[70] w-72 max-w-[80%] bg-white shadow-2xl flex flex-col transition-transform duration-300 ease-out ${
          menuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="h-20 px-5 flex items-center justify-between border-b border-black/10 shrink-0">
          <div className="flex flex-col leading-tight">
            <span className="font-serif text-lg font-bold text-brand-navy tracking-wide">HARRINGTON</span>
            <span className="font-serif text-[11px] font-bold text-brand-gold tracking-[0.3em] -mt-1">
              ACADEMY
            </span>
          </div>
          <button
            type="button"
            onClick={() => setMenuOpen(false)}
            aria-label="Yopish"
            className="p-2 -mr-2 text-brand-navy"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        </div>

        <nav className="flex flex-col gap-1 p-4">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMenuOpen(false)}
              className="rounded-xl px-3 py-3 text-lg font-semibold text-brand-navy hover:bg-black/[0.04] transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="mt-auto p-4 border-t border-black/10 flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={switchLocale}
              className="flex items-center gap-1.5 rounded-full border border-black/10 px-2.5 py-1.5 text-xs font-semibold text-brand-navy"
            >
              {locale === "uz" ? <UzFlag className="h-3.5 w-5 rounded-[2px]" /> : <GbFlag className="h-3.5 w-5 rounded-[2px]" />}
              {locale === "uz" ? "UZ" : "EN"}
            </button>
            <Link
              href="/kabinet"
              onClick={() => setMenuOpen(false)}
              className="flex-1 text-center rounded-full bg-brand-navy px-4 py-2.5 text-sm font-semibold text-white"
            >
              {kabinetLabel}
            </Link>
            <Link
              href="/savat"
              onClick={() => setMenuOpen(false)}
              aria-label={dict.nav.cart}
              className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border-2 border-sky-400/60 text-brand-navy"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="9" cy="21" r="1" />
                <circle cx="20" cy="21" r="1" />
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
              </svg>
              {totalCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-brand-gold px-1 text-[10px] font-bold text-brand-navy">
                  {totalCount}
                </span>
              )}
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
