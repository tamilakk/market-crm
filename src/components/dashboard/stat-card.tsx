import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  label: string;
  value: string;
  sub?: string;
  icon: LucideIcon;
  trend?: { value: number; label: string };
  variant?: "default" | "warning" | "danger" | "success";
}

const variants = {
  default: { icon: "bg-primary/15 text-primary", value: "text-foreground" },
  success: { icon: "bg-green-500/15 text-green-400", value: "text-green-400" },
  warning: { icon: "bg-yellow-500/15 text-yellow-400", value: "text-yellow-400" },
  danger:  { icon: "bg-red-500/15 text-red-400",  value: "text-red-400" },
};

export function StatCard({ label, value, sub, icon: Icon, trend, variant = "default" }: StatCardProps) {
  const v = variants[variant];
  return (
    <div className="rounded-xl border border-border bg-card p-5 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{label}</p>
        <div className={cn("h-9 w-9 rounded-lg flex items-center justify-center", v.icon)}>
          <Icon className="h-4 w-4" />
        </div>
      </div>

      <div>
        <p className={cn("text-2xl font-bold tracking-tight", v.value)}>{value}</p>
        {sub && <p className="text-xs text-muted-foreground mt-1">{sub}</p>}
      </div>

      {trend && (
        <div className="flex items-center gap-1.5 pt-1 border-t border-border">
          <span className={cn(
            "text-xs font-medium",
            trend.value > 0 ? "text-green-400" : trend.value < 0 ? "text-red-400" : "text-muted-foreground"
          )}>
            {trend.value > 0 ? "+" : ""}{trend.value}%
          </span>
          <span className="text-xs text-muted-foreground">{trend.label}</span>
        </div>
      )}
    </div>
  );
}
