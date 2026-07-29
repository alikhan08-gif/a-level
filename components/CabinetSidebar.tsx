import CabinetLogoutCart from "@/components/CabinetLogoutCart";

export default function CabinetSidebar({
  firstName,
  lastName,
  percentLabel,
  percent,
  logoutLabel,
}: {
  firstName?: string | null;
  lastName?: string | null;
  percentLabel: string;
  percent: number;
  logoutLabel: string;
}) {
  return (
    <aside className="md:w-64 shrink-0">
      <div className="md:sticky md:top-24 rounded-[28px] border border-black/10 bg-white p-6 flex flex-col items-center text-center">
        <div className="h-16 w-16 rounded-full bg-brand-navy/10 flex items-center justify-center text-xl font-bold text-brand-navy mb-3">
          {firstName?.[0] ?? "?"}
        </div>
        <div className="w-full rounded-lg bg-black/[0.03] border border-black/10 py-2 text-sm font-semibold text-brand-navy mb-5">
          {firstName} {lastName}
        </div>

        <div className="w-full rounded-xl bg-black/[0.03] border border-black/10 p-3.5 mb-5">
          <div className="flex justify-between text-xs font-bold text-brand-navy/70 mb-1.5">
            <span>{percentLabel}</span>
            <span>{percent}%</span>
          </div>
          <div className="h-2 rounded-full bg-black/10 overflow-hidden">
            <div
              className="h-full rounded-full"
              style={{
                width: `${percent}%`,
                background: "linear-gradient(90deg, var(--brand-gold), #eab308)",
              }}
            />
          </div>
        </div>

        <CabinetLogoutCart logoutLabel={logoutLabel} />
      </div>
    </aside>
  );
}
