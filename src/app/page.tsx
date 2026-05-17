import Link from "next/link";
import {
  TrendingUp, Users, Package, ShoppingCart, ChevronRight, Clock,
} from "lucide-react";
import { prisma } from "@/lib/prisma";
import { StatCard } from "@/components/dashboard/stat-card";
import { RevenueChart } from "@/components/dashboard/revenue-chart";
import { TopProductsChart } from "@/components/dashboard/top-products-chart";
import { format, subDays, startOfDay, startOfMonth, endOfDay } from "date-fns";
import { ru } from "date-fns/locale";

async function getRevenueChartData(days: number) {
  const sales = await prisma.sale.findMany({
    where: { createdAt: { gte: subDays(new Date(), days) } },
    select: { createdAt: true, totalAmount: true },
  });

  return Array.from({ length: days }, (_, i) => {
    const date = subDays(new Date(), days - 1 - i);
    const dayStart = startOfDay(date);
    const dayEnd = endOfDay(date);
    const daySales = sales.filter(
      (s) => s.createdAt >= dayStart && s.createdAt <= dayEnd
    );
    return {
      date: format(date, "d MMM", { locale: ru }),
      revenue: daySales.reduce((sum, s) => sum + s.totalAmount, 0),
    };
  });
}

export default async function DashboardPage() {
  const now = new Date();
  const monthStart = startOfMonth(now);

  const [
    allSales,
    monthSales,
    allClients,
    allProducts,
    lowStockProducts,
    revenueChart,
    recentSales,
  ] = await Promise.all([
    prisma.sale.findMany({ select: { totalAmount: true } }),
    prisma.sale.findMany({
      where: { createdAt: { gte: monthStart } },
      select: { totalAmount: true },
    }),
    prisma.client.count(),
    prisma.product.count(),
    prisma.$queryRaw<{ id: string; name: string; stock: number; minStock: number }[]>`
      SELECT id, name, stock, "minStock" FROM "Product" WHERE stock <= "minStock" ORDER BY stock ASC LIMIT 5
    `,
    getRevenueChartData(14),
    prisma.sale.findMany({
      orderBy: { createdAt: "desc" },
      take: 6,
      include: {
        client: { select: { name: true } },
        saleItems: { include: { product: { select: { name: true } } } },
      },
    }),
  ]);

  const topItemsRaw = await prisma.saleItem.groupBy({
    by: ["productId"],
    where: { sale: { createdAt: { gte: subDays(now, 30) } } },
    _sum: { quantity: true, priceAtSale: true },
    orderBy: { _sum: { priceAtSale: "desc" } },
    take: 5,
  });

  const topProductIds = topItemsRaw.map((r) => r.productId);
  const topProductNames = await prisma.product.findMany({
    where: { id: { in: topProductIds } },
    select: { id: true, name: true },
  });

  const topProducts = topItemsRaw.map((r) => {
    const product = topProductNames.find((p) => p.id === r.productId);
    return {
      name: product?.name ?? "Неизвестно",
      revenue: r._sum.priceAtSale ?? 0,
      qty: r._sum.quantity ?? 0,
    };
  });

  const totalRevenue = allSales.reduce((s, x) => s + x.totalAmount, 0);
  const monthRevenue = monthSales.reduce((s, x) => s + x.totalAmount, 0);

  const prevMonthSales = await prisma.sale.findMany({
    where: { createdAt: { lt: monthStart } },
    select: { totalAmount: true },
    take: 1000,
  });
  const prevRevenue = prevMonthSales.reduce((s, x) => s + x.totalAmount, 0);
  const revenueTrend =
    prevRevenue > 0 ? Math.round(((monthRevenue - prevRevenue) / prevRevenue) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* ── Заголовок ─────────────────────── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Дашборд</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {format(now, "d MMMM yyyy", { locale: ru })} · Қарағанды
          </p>
        </div>
        <Link
          href="/sales/new"
          className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors shrink-0"
        >
          <ShoppingCart className="h-4 w-4" />
          <span className="hidden sm:inline">Новая продажа</span>
        </Link>
      </div>

      {/* ── Стат-карточки ─────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Выручка за месяц"
          value={`${monthRevenue.toLocaleString("ru-KZ")} ₸`}
          sub={`всего: ${totalRevenue.toLocaleString("ru-KZ")} ₸`}
          icon={TrendingUp}
          trend={prevRevenue > 0 ? { value: revenueTrend, label: "vs прошлый месяц" } : undefined}
          variant="default"
        />
        <StatCard
          label="Продаж за месяц"
          value={String(monthSales.length)}
          sub={`всего ${allSales.length} продаж`}
          icon={ShoppingCart}
          variant="default"
        />
        <StatCard
          label="Клиентов"
          value={String(allClients)}
          sub="покупателей в базе"
          icon={Users}
          variant="default"
        />
        <StatCard
          label="Товаров"
          value={String(allProducts)}
          sub={lowStockProducts.length > 0 ? `${lowStockProducts.length} заканчивается` : "все в наличии"}
          icon={Package}
          variant={lowStockProducts.length > 0 ? "warning" : "default"}
        />
      </div>

      {/* ── Графики ────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        <div className="lg:col-span-3 rounded-xl border border-border bg-card p-5">
          <div className="mb-5">
            <h2 className="text-sm font-semibold text-foreground">Выручка за 14 дней</h2>
            <p className="text-xs text-muted-foreground mt-0.5">по дням</p>
          </div>
          <RevenueChart data={revenueChart} />
        </div>

        <div className="lg:col-span-2 rounded-xl border border-border bg-card p-5">
          <div className="mb-5">
            <h2 className="text-sm font-semibold text-foreground">Топ товаров</h2>
            <p className="text-xs text-muted-foreground mt-0.5">по выручке за 30 дней</p>
          </div>
          <TopProductsChart data={topProducts} />
        </div>
      </div>

      {/* ── Нижний ряд ────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        {/* Последние продажи */}
        <div className="lg:col-span-3 rounded-xl border border-border bg-card overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-border">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <h2 className="text-sm font-semibold text-foreground">Последние продажи</h2>
            </div>
            <Link href="/sales" className="text-xs text-primary hover:text-primary/80 transition-colors flex items-center gap-1">
              Все продажи <ChevronRight className="h-3 w-3" />
            </Link>
          </div>

          {recentSales.length === 0 ? (
            <div className="py-10 text-center">
              <p className="text-sm text-muted-foreground">Продаж пока нет</p>
              <Link href="/sales/new" className="mt-2 inline-block text-sm text-primary hover:text-primary/80">
                Оформить первую →
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {recentSales.map((sale) => (
                <Link
                  key={sale.id}
                  href={`/sales/${sale.id}`}
                  className="flex items-center gap-4 px-5 py-3.5 hover:bg-muted/30 transition-colors group"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground group-hover:text-primary transition-colors truncate">
                      {sale.saleItems.map((i) => i.product.name).join(", ")}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {sale.client?.name ?? "Без клиента"} · {format(sale.createdAt, "d MMM, HH:mm", { locale: ru })}
                    </p>
                  </div>
                  <p className="text-sm font-semibold text-foreground shrink-0">
                    {sale.totalAmount.toLocaleString("ru-KZ")} ₸
                  </p>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Правая колонка */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          {/* Мало на складе */}
          <div className="rounded-xl border border-border bg-card overflow-hidden flex-1">
            <div className="flex items-center gap-2 px-5 py-4 border-b border-border">
              <Package className="h-4 w-4 text-yellow-400" />
              <h2 className="text-sm font-semibold text-foreground">Заканчивается</h2>
              <Link href="/products" className="ml-auto text-xs text-primary hover:text-primary/80 flex items-center gap-1">
                Склад <ChevronRight className="h-3 w-3" />
              </Link>
            </div>
            {lowStockProducts.length === 0 ? (
              <div className="py-8 text-center">
                <p className="text-sm text-muted-foreground">Все товары в норме ✓</p>
              </div>
            ) : (
              <div className="divide-y divide-border">
                {lowStockProducts.map((p) => {
                  const isOut = p.stock <= 0;
                  return (
                    <Link
                      key={p.id}
                      href={`/products/${p.id}`}
                      className="flex items-center justify-between px-5 py-3 hover:bg-muted/30 transition-colors group"
                    >
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-foreground group-hover:text-primary transition-colors truncate">
                          {p.name}
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">мин. {p.minStock} ед.</p>
                      </div>
                      <span className={`ml-3 shrink-0 text-sm font-bold ${isOut ? "text-red-400" : "text-yellow-400"}`}>
                        {p.stock} ед.
                      </span>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>

          {/* Быстрые действия */}
          <div className="rounded-xl border border-border bg-card p-5">
            <h2 className="text-sm font-semibold text-foreground mb-3">Быстрые действия</h2>
            <div className="space-y-2">
              {[
                { href: "/sales/new", icon: ShoppingCart, label: "Новая продажа", color: "text-primary" },
                { href: "/clients", icon: Users, label: "Добавить клиента", color: "text-blue-400" },
                { href: "/products", icon: Package, label: "Управление складом", color: "text-amber-400" },
              ].map(({ href, icon: Icon, label, color }) => (
                <Link
                  key={href}
                  href={href}
                  className="flex items-center gap-3 rounded-lg px-3 py-2.5 hover:bg-muted/50 transition-colors group"
                >
                  <Icon className={`h-4 w-4 ${color}`} />
                  <span className="text-sm text-foreground group-hover:text-primary transition-colors">
                    {label}
                  </span>
                  <ChevronRight className="h-3.5 w-3.5 text-muted-foreground ml-auto group-hover:text-primary transition-colors" />
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
