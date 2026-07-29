const PROVIDERS = {
  click: {
    label: "Click",
    color: "#0093D6",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M13 2 3 14h7l-1 8 10-12h-7l1-8Z" fill="white" stroke="none" />
      </svg>
    ),
  },
  payme: {
    label: "Payme",
    color: "#00C8B3",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="5" width="20" height="14" rx="3" fill="none" />
        <path d="M2 10h20" />
        <path d="M6 15h4" />
      </svg>
    ),
  },
} as const;

export default function PaymentMethodButton({
  provider,
  disabled,
  onClick,
}: {
  provider: "click" | "payme";
  disabled?: boolean;
  onClick: () => void;
}) {
  const { label, color, icon } = PROVIDERS[provider];

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      style={{ ["--provider-color" as string]: color }}
      className="group flex flex-col items-center gap-2.5 rounded-xl border-2 border-black/10 py-5 hover:border-[var(--provider-color)] hover:bg-[var(--provider-color)]/5 transition-colors disabled:opacity-50"
    >
      <div
        className="flex h-11 w-11 items-center justify-center rounded-xl"
        style={{ backgroundColor: color }}
      >
        {icon}
      </div>
      <span className="font-bold text-brand-navy">{label}</span>
    </button>
  );
}
