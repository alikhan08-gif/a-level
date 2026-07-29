import Link from "next/link";
import type { ReactNode } from "react";
import BookCarousel from "@/components/BookCarousel";
import OrbitAnimation from "@/components/OrbitAnimation";
import Reveal from "@/components/Reveal";
import { getBooks } from "@/lib/data";
import { type Direction, SUBJECTS } from "@/lib/types";
import { getSubjectStyle } from "@/lib/subjectStyle";
import { getLocale } from "@/lib/i18n/server";
import { getDictionary, localize } from "@/lib/i18n/dictionaries";

// Nodes sit on a circular orbit (r=150) centered at (170,180),
// at 120-degree intervals starting from the top.
const ORBIT_NODES: { direction: Direction; x: number; y: number }[] = [
  { direction: "A_LEVEL", x: 170, y: 30 },
  { direction: "MILLIY_SERTIFIKAT", x: 300, y: 255 },
  { direction: "ATTESTATSIYA", x: 40, y: 255 },
];

// One icon per entry in dict.home.features, matched by index.
const FEATURE_ICONS: ReactNode[] = [
  <>
    <path key="a" d="M17 21v-2a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v2" />
    <circle key="b" cx="9" cy="7" r="4" />
    <path key="c" d="M23 21v-2a4 4 0 0 0-3-3.87" />
    <path key="d" d="M16 3.13a4 4 0 0 1 0 7.75" />
  </>,
  <>
    <path key="a" d="M2 4h6a4 4 0 0 1 4 4v13a3 3 0 0 0-3-3H2Z" />
    <path key="b" d="M22 4h-6a4 4 0 0 0-4 4v13a3 3 0 0 1 3-3h7Z" />
  </>,
  <>
    <rect key="a" x="3" y="4" width="18" height="18" rx="2" />
    <path key="b" d="M16 2v4M8 2v4M3 10h18" />
  </>,
  <>
    <path key="a" d="M3 3v18h18" />
    <path key="b" d="M7 16v-4M12 16V8M17 16v-7" />
  </>,
  <>
    <rect key="a" x="9" y="2" width="6" height="12" rx="3" />
    <path key="b" d="M5 10a7 7 0 0 0 14 0" />
    <path key="c" d="M12 19v3M8 22h8" />
  </>,
  <>
    <path key="a" d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7Z" />
    <circle key="b" cx="12" cy="12" r="3" />
  </>,
  <>
    <circle key="a" cx="12" cy="12" r="10" />
    <path key="b" d="M10 8.5v7l6-3.5-6-3.5Z" fill="currentColor" stroke="none" />
  </>,
  <>
    <rect key="a" x="3" y="8" width="18" height="4" rx="1" />
    <path key="b" d="M12 8v13M19 12v9H5v-9" />
    <path key="c" d="M12 8a2.5 2.5 0 1 1-2.5-2.5c1.5 0 2.5 1 2.5 2.5ZM12 8a2.5 2.5 0 1 0 2.5-2.5c-1.5 0-2.5 1-2.5 2.5Z" />
  </>,
];

export default async function HomePage() {
  const [locale, allBooks] = await Promise.all([getLocale(), getBooks()]);
  const dict = getDictionary(locale);

  const localizedBooks = allBooks.map((b) => ({
    ...b,
    title: localize(b.title, b.titleEn, locale),
    description: localize(b.description, b.descriptionEn, locale),
  }));

  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-b from-white to-black/[0.02]">
        <div className="mx-auto max-w-6xl px-4 py-20 md:py-28 grid md:grid-cols-2 gap-12 items-center">
          {/* Team photo — replace /public/team-photo.svg (or point this src at a
              .jpg/.png you add to /public) with your own picture any time. */}
          <div data-aos="zoom-in" className="relative mx-auto md:mx-0 order-2 md:order-1 h-56 w-56 sm:h-72 sm:w-72">
            <div className="absolute inset-0 rounded-full bg-brand-gold/15 blur-2xl" />
            <div className="relative h-full w-full rounded-full overflow-hidden ring-4 ring-white shadow-2xl shadow-brand-navy/20">
              <img src="/team-photo.svg" alt="" className="h-full w-full object-cover" />
            </div>
          </div>

          <div data-aos="fade-left" className="order-1 md:order-2 text-center md:text-left">
            <h1 className="text-4xl sm:text-5xl font-extrabold text-brand-navy leading-tight">
              {dict.home.heroTitle}
            </h1>
            <p className="mt-4 text-brand-navy/70 text-lg max-w-md mx-auto md:mx-0">{dict.home.heroSubtitle}</p>
            <Link
              href="/royxatdan-otish"
              className="mt-6 inline-block rounded-full bg-brand-navy px-8 py-3 text-white font-semibold hover:bg-brand-navy-light transition-colors"
            >
              {dict.home.heroCta}
            </Link>
          </div>
        </div>
      </section>

      {/* Orbit */}
      <section className="bg-gradient-to-b from-black/[0.02] to-white pt-6 pb-20 md:pt-8 md:pb-28">
        <OrbitAnimation nodes={ORBIT_NODES} labels={dict.directions} />
      </section>

      {/* Books */}
      <section className="bg-black/[0.02] py-16">
        <div className="mx-auto max-w-6xl px-4">
          <div data-aos="fade-up" className="flex items-end justify-between mb-8">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-brand-navy">{dict.home.booksTitle}</h2>
              <p className="text-brand-navy/60 mt-1">{dict.home.booksSubtitle}</p>
            </div>
            <Link href="/kitoblar" className="text-sm font-semibold text-brand-navy hover:underline">
              {dict.home.booksAll} &rarr;
            </Link>
          </div>
          {SUBJECTS.map((subject) => {
            const subjectBooks = localizedBooks.filter((b) => b.subject === subject);
            if (subjectBooks.length === 0) return null;
            return (
              <BookCarousel
                key={subject}
                title={`${dict.subjects[subject]} ${dict.kitoblar.collectionsSuffix}`}
                accent={getSubjectStyle(subject).accent}
                books={subjectBooks}
                locale={locale}
              />
            );
          })}
        </div>
      </section>

      {/* Problems — styled like an iOS/Telegram chat: an incoming question,
          then Harrington Academy's reply, all in one consistent text size. */}
      <section className="mx-auto max-w-6xl px-4 py-16">
        <h2 data-aos="fade-up" className="text-3xl sm:text-4xl font-extrabold text-brand-navy text-center">{dict.home.problemsTitle}</h2>
        <p data-aos="fade-up" className="text-center text-brand-navy/60 mt-3 mb-12 text-lg">{dict.home.problemsSubtitle}</p>
        <div id="problems-grid" className="grid sm:grid-cols-2 gap-6">
          {dict.home.problems.map((p, i) => (
            <div
              key={p.from}
              data-aos="fade-up"
              data-aos-anchor="#problems-grid"
              data-aos-delay={i * 100}
              className="card-3d rounded-[28px] border border-black/10 bg-white p-6 space-y-3"
            >
              <div className="flex items-end gap-2.5">
                <div className="h-10 w-10 shrink-0 rounded-full bg-brand-navy/10 flex items-center justify-center text-base font-bold text-brand-navy">
                  {p.from[0]}
                </div>
                <div className="max-w-[85%]">
                  <div className="text-sm font-semibold text-brand-gold mb-1 px-1">{p.from}</div>
                  <div className="rounded-2xl rounded-bl-md bg-black/[0.05] px-4 py-3">
                    <p className="text-base text-brand-navy leading-snug">{p.text}</p>
                  </div>
                </div>
              </div>
              <div className="flex justify-end">
                <div className="max-w-[85%] rounded-2xl rounded-br-md bg-brand-navy px-4 py-3">
                  <p className="text-base text-white leading-snug">{p.answer}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="bg-black/[0.02] py-16">
        <div className="mx-auto max-w-6xl px-4">
          <h2 data-aos="fade-up" className="text-3xl sm:text-4xl font-extrabold text-brand-navy text-center mb-12">
            {dict.home.featuresTitle}
          </h2>
          <div id="features-grid" className="grid sm:grid-cols-2 gap-5 max-w-4xl mx-auto">
            {dict.home.features.map((f, i) => (
              <div
                key={f}
                data-aos="fade-up"
                data-aos-anchor="#features-grid"
                data-aos-delay={i * 100}
                className="card-3d flex items-center gap-4 rounded-[24px] border-2 border-sky-400/60 bg-white px-6 py-5 hover:bg-sky-50/50"
              >
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-brand-navy text-white">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    {FEATURE_ICONS[i]}
                  </svg>
                </div>
                <span className="text-base font-bold text-brand-navy uppercase tracking-wide">{f}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="mx-auto max-w-6xl px-4 py-16">
        <Reveal>
          <h2 className="text-2xl sm:text-3xl font-bold text-brand-navy text-center mb-10">{dict.home.teamTitle}</h2>
        </Reveal>
        <div className="grid sm:grid-cols-3 gap-6">
          {dict.home.team.map((member, i) => (
            <Reveal
              key={member.name}
              delay={i * 100}
              className="card-3d rounded-[28px] border border-black/10 bg-white p-6 text-center"
            >
              <div className="mx-auto h-24 w-24 rounded-full bg-black/5 mb-4" />
              <h3 className="font-bold text-brand-navy">{member.name}</h3>
              <p className="text-sm text-brand-navy/60 mt-1">{member.role}</p>
            </Reveal>
          ))}
        </div>
      </section>
    </div>
  );
}
