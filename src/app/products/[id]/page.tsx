import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, Tag, Layers, TrendingUp, ShoppingCart } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { ProductCategoryBadge } from "@/components/products/product-category-badge";
import { StockBar, unitLabel } from "@/components/products/stock-status";
import { ProductActions } from "@/components/products/product-actions";
import { format } from "date-fns";
import { ru } from "date-fns/locale";

type Props = { params: Promise<{ id: string }> };

export default async function ProductDetailPage({ params }: Props) {
  const { id } = await params;

  const product = await prisma.product.findUnique({
    where: { id },
    include: {
      _count: { select: { saleItems: true } },
      saleItems: {
        take: 10,
        orderBy: { sale: { createdAt: "desc" } },
        include: { sale: { include: { client: true } } },
      },
    },
  });

  if (!product) notFound();

  const margin = product.purchasePrice > 0
    ? ((product.sellPrice - product.purchasePrice) / product.purchasePrice) * 100
    : 0;

  const totalSold = product.saleItems.reduce((sum, si) => sum + si.quantity, 0);
  const totalRevenue = product.saleItems.reduce(
    (sum, si) => sum + si.quantity * si.priceAtSale, 0
  );

  return (
    <div className="max-w-3xl">
      {/* Breadcrumb */}
      <Link href="/products"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6">
        <ChevronLeft className="h-4 w-4" /> Товары
      </Link>

      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <div className="flex items-center gap-3 mb-2 flex-wrap">
            <h1 className="text-2xl font-semibold text-foreground">{product.name}</h1>
            <ProductCategoryBadge category={product.category} />
          </div>
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            {product.sku && (
              <span className="font-mono bg-muted px-2 py-0.5 rounded text-xs">{product.sku}</span>
            )}
            <span>Добавлен {format(product.createdAt, "d MMMM yyyy", { locale: ru })}</span>
          </div>
        </div>
        <ProductActions product={product} />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        {[
          {
            icon: Tag,
            label: "Цена закупки",
            value: `${product.purchasePrice.toLocaleString("ru")} ₽`,
            sub: `за 1 ${unitLabel(product.unit)}`,
          },
          {
            icon: TrendingUp,
            label: "Цена продажи",
            value: `${product.sellPrice.toLocaleString("ru")} ₽`,
            sub: margin > 0 ? `наценка ${margin.toFixed(0)}%` : "наценка не задана",
            highlight: margin > 0,
          },
          {
            icon: Layers,
            label: "Остаток",
            value: `${product.stock} ${unitLabel(product.unit)}`,
            sub: `мин. ${product.minStock} ${unitLabel(product.unit)}`,
          },
          {
            icon: ShoppingCart,
            label: "Продано",
            value: `${totalSold} ${unitLabel(product.unit)}`,
            sub: `выручка ${totalRevenue.toLocaleString("ru")} ₽`,
          },
        ].map(({ icon: Icon, label, value, sub, highlight }) => (
          <div key={label} className="rounded-xl border border-border bg-card p-4">
            <div className="flex items-center gap-2 mb-2">
              <Icon className="h-4 w-4 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">{label}</span>
            </div>
            <p className={`text-xl font-semibold ${highlight ? "text-green-400" : "text-foreground"}`}>
              {value}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>
          </div>
        ))}
      </div>

      {/* Stock bar */}
      <div className="rounded-xl border border-border bg-card p-5 mb-6">
        <h2 className="text-sm font-medium text-foreground mb-3">Уровень склада</h2>
        <StockBar product={product} />
      </div>

      {/* Sales history */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="flex items-center gap-2 px-5 py-4 border-b border-border">
          <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          <h2 className="text-sm font-medium text-foreground">
            Последние продажи
          </h2>
          <span className="ml-auto text-xs text-muted-foreground">
            {product._count.saleItems} всего
          </span>
        </div>
        {product.saleItems.length === 0 ? (
          <div className="py-10 text-center">
            <p className="text-sm text-muted-foreground">Этот товар ещё не продавался</p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {product.saleItems.map((item) => (
              <Link key={item.id} href={`/sales/${item.saleId}`}
                className="flex items-center justify-between px-5 py-3.5 hover:bg-muted/30 transition-colors group">
                <div>
                  <p className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">
                    {item.quantity} {unitLabel(product.unit)} × {item.priceAtSale.toLocaleString("ru")} ₽
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {item.sale.client?.name ?? "Без клиента"} ·{" "}
                    {format(item.sale.createdAt, "d MMM yyyy", { locale: ru })}
                  </p>
                </div>
                <span className="text-sm font-semibold text-foreground">
                  {(item.quantity * item.priceAtSale).toLocaleString("ru")} ₽
                </span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
