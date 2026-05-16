import type { ProductCategory } from "@/types";

const config: Record<ProductCategory, { label: string; className: string }> = {
  wallpaper: { label: "Обои",    className: "bg-pink-500/15 text-pink-400 border-pink-500/25" },
  laminate:  { label: "Ламинат", className: "bg-amber-500/15 text-amber-400 border-amber-500/25" },
  other:     { label: "Прочее",  className: "bg-zinc-500/15 text-zinc-400 border-zinc-500/25" },
};

export function ProductCategoryBadge({ category }: { category: string }) {
  const cfg = config[category as ProductCategory] ?? config.other;
  return (
    <span className={`inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium ${cfg.className}`}>
      {cfg.label}
    </span>
  );
}
