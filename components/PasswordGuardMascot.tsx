"use client";

// A husky-style mascot that covers its eyes while the password field is
// focused, and watches normally otherwise. Colored a lighter slate-navy
// (rather than the brand's darkest navy) so it stays visible on the dark,
// glassy auth cards.
const FUR = "#4a5b7a";

export default function PasswordGuardMascot({ covering }: { covering: boolean }) {
  return (
    <svg viewBox="0 0 140 140" className="mx-auto h-24 w-24 drop-shadow-[0_4px_16px_rgba(0,0,0,0.35)]" aria-hidden>
      {/* Ears */}
      <path d="M34 40 16 4l32 16Z" fill={FUR} />
      <path d="M106 40 124 4 92 20Z" fill={FUR} />
      <path d="M35 33 26 14l18 10Z" fill="#f6d9c4" />
      <path d="M105 33 114 14 96 24Z" fill="#f6d9c4" />

      {/* Head */}
      <circle cx="70" cy="72" r="46" fill={FUR} />
      <path d="M70 34c-16 0-28 9-31 22 7-6 18-9 31-9s24 3 31 9c-3-13-15-22-31-22Z" fill="#fff" fillOpacity="0.08" />

      {/* Cheek blush */}
      <ellipse cx="38" cy="80" rx="7" ry="4.5" fill="#f2a6a6" fillOpacity="0.55" />
      <ellipse cx="102" cy="80" rx="7" ry="4.5" fill="#f2a6a6" fillOpacity="0.55" />

      {/* White muzzle */}
      <path d="M70 110c-15 0-25-10-25-24 0-5 9-8 25-8s25 3 25 8c0 14-10 24-25 24Z" fill="#fff" />

      {/* Eyes (hidden while covering) */}
      <g style={{ opacity: covering ? 0 : 1, transition: "opacity 150ms ease" }}>
        <ellipse cx="56" cy="76" rx="6.5" ry="7.5" fill="#5aa8e0" />
        <ellipse cx="84" cy="76" rx="6.5" ry="7.5" fill="#5aa8e0" />
        <circle cx="58" cy="73" r="2" fill="#0d2138" />
        <circle cx="86" cy="73" r="2" fill="#0d2138" />
        <circle cx="54.5" cy="72" r="1.4" fill="#fff" />
        <circle cx="82.5" cy="72" r="1.4" fill="#fff" />
      </g>

      {/* Nose + mouth */}
      <path d="M70 92c-3.5 0-6-2.2-6-4.6s2.5-4.6 6-4.6 6 2.2 6 4.6-2.5 4.6-6 4.6Z" fill={FUR} />
      <path d="M70 92v4M70 96c-3 0-5 2-5 3M70 96c3 0 5 2 5 3" stroke={FUR} strokeWidth="1.3" fill="none" strokeLinecap="round" />

      {/* Paws — swing up to cover the eyes when the password field is focused */}
      <g
        style={{
          transformBox: "fill-box",
          transformOrigin: "bottom center",
          transform: covering ? "translateY(-46px) rotate(-6deg)" : "translateY(0px) rotate(0deg)",
          transition: "transform 220ms cubic-bezier(0.34,1.56,0.64,1)",
        }}
      >
        <ellipse cx="52" cy="122" rx="13" ry="16" fill="#e7ebef" stroke={FUR} strokeWidth="1" />
        <circle cx="46" cy="118" r="2.4" fill={FUR} fillOpacity="0.3" />
        <circle cx="52" cy="115" r="2.4" fill={FUR} fillOpacity="0.3" />
        <circle cx="58" cy="118" r="2.4" fill={FUR} fillOpacity="0.3" />
      </g>
      <g
        style={{
          transformBox: "fill-box",
          transformOrigin: "bottom center",
          transform: covering ? "translateY(-46px) rotate(6deg)" : "translateY(0px) rotate(0deg)",
          transition: "transform 220ms cubic-bezier(0.34,1.56,0.64,1) 30ms",
        }}
      >
        <ellipse cx="88" cy="122" rx="13" ry="16" fill="#e7ebef" stroke={FUR} strokeWidth="1" />
        <circle cx="82" cy="118" r="2.4" fill={FUR} fillOpacity="0.3" />
        <circle cx="88" cy="115" r="2.4" fill={FUR} fillOpacity="0.3" />
        <circle cx="94" cy="118" r="2.4" fill={FUR} fillOpacity="0.3" />
      </g>
    </svg>
  );
}
