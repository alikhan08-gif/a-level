import type { PaymentProviderId } from "@/lib/types";

const PROVIDERS: Record<PaymentProviderId, { label: string; hoverColor: string; iconBg: string; icon: string }> = {
  click: { label: "Click", hoverColor: "#0065FF", iconBg: "#000000", icon: "/payments/click.png" },
  payme: { label: "Payme", hoverColor: "#25E8FF", iconBg: "#FFFFFF", icon: "/payments/payme.png" },
  uzum: { label: "Uzum", hoverColor: "#7000FF", iconBg: "#A6FC6F", icon: "/payments/uzum.svg" },
  paynet: { label: "Paynet", hoverColor: "#1EB863", iconBg: "#1EB863", icon: "/payments/paynet.png" },
};

export default function PaymentMethodButton({
  provider,
  disabled,
  onClick,
}: {
  provider: PaymentProviderId;
  disabled?: boolean;
  onClick: () => void;
}) {
  const { label, hoverColor, iconBg, icon } = PROVIDERS[provider];

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      style={{ ["--provider-color" as string]: hoverColor }}
      className="group flex flex-col items-center gap-2.5 rounded-xl border-2 border-black/10 bg-white py-5 hover:border-[var(--provider-color)] hover:bg-[var(--provider-color)]/5 transition-colors disabled:opacity-50"
    >
      <div
        className="flex h-11 w-11 items-center justify-center rounded-xl overflow-hidden shadow-sm ring-1 ring-black/5"
        style={{ backgroundColor: iconBg }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={icon} alt={label} className="h-full w-full object-cover" />
      </div>
      <span className="font-bold text-brand-navy">{label}</span>
    </button>
  );
}
