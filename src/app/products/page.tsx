import { prisma } from "@/lib/prisma";
import { ProductsTable } from "@/components/products/products-table";

export default async function ProductsPage() {
  const products = await prisma.product.findMany({
    orderBy: { createdAt: "desc" },
  });

  const totalValue = products.reduce((sum, p) => sum + p.purchasePrice * p.stock, 0);
  const categories = {
    wallpaper: products.filter((p) => p.category === "wallpaper").length,
    laminate: products.filter((p) => p.category === "laminate").length,
    other: products.filter((p) => p.category === "other").length,
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Товары</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {products.length > 0
              ? `${products.length} позиций · склад на ${totalValue.toLocaleString("ru")} ₽`
              : "Добавьте первый товар"}
          </p>
        </div>
      </div>

      {/* Summary cards */}
      {products.length > 0 && (
        <div className="mb-6 grid grid-cols-3 gap-4">
          {[
            { label: "Обои", count: categories.wallpaper, color: "text-pink-400" },
            { label: "Ламинат", count: categories.laminate, color: "text-amber-400" },
            { label: "Прочее", count: categories.other, color: "text-zinc-400" },
          ].map(({ label, count, color }) => (
            <div key={label} className="rounded-xl border border-border bg-card px-5 py-4">
              <p className={`text-xs font-medium uppercase tracking-wide ${color}`}>{label}</p>
              <p className="mt-1 text-2xl font-semibold text-foreground">{count}</p>
              <p className="text-xs text-muted-foreground mt-0.5">позиций</p>
            </div>
          ))}
        </div>
      )}

      <ProductsTable products={products} />
    </div>
  );
}
