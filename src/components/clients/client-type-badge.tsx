import { Badge } from "@/components/ui/badge";
import type { ClientType } from "@/types";

const config: Record<ClientType, { label: string; className: string }> = {
  retail:      { label: "Розница",            className: "bg-blue-500/15 text-blue-400 border-blue-500/25" },
  wholesale:   { label: "Оптовик",            className: "bg-purple-500/15 text-purple-400 border-purple-500/25" },
  contractor:  { label: "Строит. бригада",    className: "bg-orange-500/15 text-orange-400 border-orange-500/25" },
};

export function ClientTypeBadge({ type }: { type: string }) {
  const { label, className } = config[type as ClientType] ?? config.retail;
  return (
    <Badge variant="outline" className={className}>
      {label}
    </Badge>
  );
}
