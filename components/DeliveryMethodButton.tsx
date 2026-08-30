import type { DeliveryMethod } from "@/lib/types";

const METHODS: Record<DeliveryMethod, { label: string; color: string; icon: React.ReactNode }> = {
  UZPOST: {
    label: "UzPost",
    color: "#0057B8",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 4h16v13H7l-3 3V4Z" />
        <path d="M4 7l8 5 8-5" />
      </svg>
    ),
  },
  BTS: {
    label: "BTS",
    color: "#F97316",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 16V6a1 1 0 0 1 1-1h10v11" />
        <path d="M14 9h4l3 3v4h-7" />
        <circle cx="7.5" cy="17.5" r="1.7" />
        <circle cx="17.5" cy="17.5" r="1.7" />
      </svg>
    ),
  },
};

export default function DeliveryMethodButton({
  method,
  disabled,
  onClick,
}: {
  method: DeliveryMethod;
  disabled?: boolean;
  onClick: () => void;
}) {
  const { label, color, icon } = METHODS[method];

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      style={{ ["--provider-color" as string]: color }}
      className="group flex flex-col items-center gap-2.5 rounded-xl border-2 border-black/10 py-5 hover:border-[var(--provider-color)] hover:bg-[var(--provider-color)]/5 transition-colors disabled:opacity-50"
    >
      <div className="flex h-11 w-11 items-center justify-center rounded-xl" style={{ backgroundColor: color }}>
        {icon}
      </div>
      <span className="font-bold text-brand-navy">{label}</span>
    </button>
  );
}
