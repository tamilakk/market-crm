import type { Product } from "@/types";

type Status = "out" | "low" | "ok";

function getStatus(product: Product): Status {
  if (product.stock <= 0) return "out";
  if (product.stock <= product.minStock) return "low";
  return "ok";
}

const statusConfig: Record<Status, { label: string; className: string; dot: string }> = {
  out: { label: "Нет",    className: "bg-red-500/15 text-red-400",    dot: "bg-red-400" },
  low: { label: "Мало",   className: "bg-yellow-500/15 text-yellow-400", dot: "bg-yellow-400" },
  ok:  { label: "В наличии", className: "bg-green-500/15 text-green-400", dot: "bg-green-400" },
};

export function StockStatus({ product }: { product: Product }) {
  const status = getStatus(product);
  const { label, className, dot } = statusConfig[status];
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${className}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${dot}`} />
      {label}
    </span>
  );
}

export function StockBar({ product }: { product: Product }) {
  const status = getStatus(product);
  const pct = product.minStock > 0
    ? Math.min(100, (product.stock / (product.minStock * 3)) * 100)
    : product.stock > 0 ? 100 : 0;

  const colors: Record<Status, string> = {
    out: "bg-red-500",
    low: "bg-yellow-500",
    ok:  "bg-green-500",
  };

  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>{product.stock} {unitLabel(product.unit)}</span>
        <span>мин. {product.minStock}</span>
      </div>
      <div className="h-1.5 rounded-full bg-muted overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${colors[status]}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

export function unitLabel(unit: string) {
  const map: Record<string, string> = {
    piece: "шт",
    roll:  "рул",
    box:   "кор",
    m2:    "м²",
  };
  return map[unit] ?? unit;
}
