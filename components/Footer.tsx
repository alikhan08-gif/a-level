import Link from "next/link";

const SOCIALS = [
  {
    label: "Telegram",
    href: "https://t.me/harrington_academy",
    icon: (
      <path d="M21.5 3.5 2.75 10.9c-.9.36-.9 1.65.02 1.99l4.4 1.6 1.7 5.34c.24.75 1.19.97 1.75.4l2.44-2.5 4.53 3.34c.72.53 1.75.14 1.94-.73L23.95 4.9c.2-.9-.7-1.66-1.53-1.4Zm-3.1 3.6-8.5 7.7-.4 3.1-1.5-4.7 9.9-6.9c.3-.2.6.2.35.4Z" />
    ),
  },
  {
    label: "Instagram",
    href: "https://instagram.com/harrington_academy",
    icon: (
      <>
        <rect x="3" y="3" width="18" height="18" rx="5" />
        <circle cx="12" cy="12" r="4" fill="none" stroke="var(--brand-navy)" strokeWidth="1.6" />
        <circle cx="17.4" cy="6.6" r="1.1" fill="var(--brand-navy)" />
      </>
    ),
  },
  {
    label: "YouTube",
    href: "https://youtube.com/@harrington_academy",
    icon: (
      <>
        <rect x="2" y="5" width="20" height="14" rx="4" fill="none" stroke="currentColor" strokeWidth="1.6" />
        <path d="M10 9.5v5l4.5-2.5Z" />
      </>
    ),
  },
  {
    label: "Email",
    href: "mailto:info@harringtonacademy.uz",
    icon: (
      <>
        <rect x="2" y="4" width="20" height="16" rx="3" fill="none" stroke="currentColor" strokeWidth="1.8" />
        <path d="m3 6 9 7 9-7" fill="none" stroke="currentColor" strokeWidth="1.8" />
      </>
    ),
  },
];

export default function Footer() {
  return (
    <footer
      className="relative bg-brand-navy text-white mt-auto"
      style={{ boxShadow: "0 -25px 50px -20px rgba(10,37,64,0.35)" }}
    >
      {/* Soft "reflection" highlight along the top edge */}
      <div
        className="absolute inset-x-0 top-0 h-px"
        style={{
          background: "linear-gradient(90deg, transparent, rgba(201,162,39,0.5), transparent)",
        }}
      />
      <div className="mx-auto max-w-6xl px-4 py-6 flex flex-col md:flex-row items-center md:items-center justify-between gap-4 md:gap-6">
        <div className="flex flex-col leading-tight items-center md:items-start shrink-0">
          <span className="font-serif text-lg font-bold tracking-wide">HARRINGTON</span>
          <span className="font-serif text-xs font-bold text-brand-gold tracking-[0.3em] -mt-0.5">
            ACADEMY
          </span>
        </div>

        <div className="flex items-center justify-center gap-5 sm:gap-10">
          {SOCIALS.map((s) => (
            <Link
              key={s.label}
              href={s.href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={s.label}
              className="flex items-center gap-2 text-white/90 hover:text-brand-gold transition-colors"
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" className="text-brand-gold shrink-0">
                {s.icon}
              </svg>
              <span className="hidden sm:inline text-lg font-medium">{s.label}</span>
            </Link>
          ))}
        </div>

        <a
          href="tel:+998998790404"
          className="flex items-center gap-2 text-base sm:text-lg font-medium text-white/90 hover:text-brand-gold transition-colors shrink-0"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" className="text-brand-gold shrink-0">
            <path d="M6.6 10.8a15.1 15.1 0 0 0 6.6 6.6l2.2-2.2a1 1 0 0 1 1-.25 11.4 11.4 0 0 0 3.6.57 1 1 0 0 1 1 1V20a1 1 0 0 1-1 1A17 17 0 0 1 3 4a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1 11.4 11.4 0 0 0 .57 3.6 1 1 0 0 1-.25 1Z" />
          </svg>
          +998 99 879 04 04
        </a>
      </div>
    </footer>
  );
}
