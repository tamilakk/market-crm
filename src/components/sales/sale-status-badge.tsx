import type { SaleStatus } from "@/types";

const config: Record<SaleStatus, { label: string; className: string; dot: string }> = {
  paid:    { label: "Оплачено",   className: "bg-green-500/15 text-green-400 border-green-500/25",  dot: "bg-green-400" },
  debt:    { label: "Долг",       className: "bg-red-500/15 text-red-400 border-red-500/25",        dot: "bg-red-400" },
  partial: { label: "Частично",   className: "bg-yellow-500/15 text-yellow-400 border-yellow-500/25", dot: "bg-yellow-400" },
};

export function SaleStatusBadge({ status }: { status: string }) {
  const cfg = config[status as SaleStatus] ?? config.paid;
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium ${cfg.className}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
}
