"use client";

// Idle: the door stands open with the figure waiting at the doorway.
// While `active` (the password field is focused/being typed), the figure
// walks in and the door swings shut — reverses smoothly when not active.
export default function SignInDoorIcon({ active }: { active: boolean }) {
  return (
    <svg viewBox="0 0 44 32" className="h-7 w-11 shrink-0" aria-hidden>
      {/* Door frame */}
      <rect x="24" y="4" width="16" height="26" rx="1.5" fill="none" stroke="currentColor" strokeOpacity="0.6" strokeWidth="1.5" />
      {/* Door flap — open (scaled down) when idle, closes (scaleX 1) once active */}
      <rect
        x="25.5"
        y="5.5"
        width="13"
        height="23"
        rx="1"
        fill="currentColor"
        fillOpacity="0.35"
        style={{
          transformBox: "fill-box",
          transformOrigin: "left center",
          transform: active ? "scaleX(1)" : "scaleX(0.3)",
          transition: "transform 480ms ease",
        }}
      />
      {/* Stick figure — stands at the doorway idle, walks in + fades when active */}
      <g
        style={{
          transformBox: "fill-box",
          transformOrigin: "left center",
          transform: active ? "translateX(20px)" : "translateX(0)",
          opacity: active ? 0 : 1,
          transition: "transform 480ms ease, opacity 300ms ease 20ms",
        }}
      >
        <circle cx="8" cy="12" r="2.4" fill="currentColor" />
        <path d="M8 15v7M8 17l-4 3M8 17l4 3M8 22l-3 5M8 22l3 5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" fill="none" />
      </g>
    </svg>
  );
}
