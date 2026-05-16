import { prisma } from "@/lib/prisma";
import { SalesTable } from "@/components/sales/sales-table";
import { startOfMonth } from "date-fns";

export default async function SalesPage() {
  const sales = await prisma.sale.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      client: { select: { id: true, name: true } },
      saleItems: {
        include: { product: { select: { name: true, unit: true } } },
      },
    },
  });

  const monthStart = startOfMonth(new Date());
  const monthSales = sales.filter((s) => s.createdAt >= monthStart);

  const stats = {
    totalRevenue: sales.reduce((sum, s) => sum + s.paidAmount, 0),
    monthRevenue: monthSales.reduce((sum, s) => sum + s.paidAmount, 0),
    totalDebt: sales.reduce((sum, s) => sum + Math.max(0, s.totalAmount - s.paidAmount), 0),
    debtCount: sales.filter((s) => s.status !== "paid").length,
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-foreground">Продажи</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {sales.length > 0 ? `${sales.length} продаж всего` : "Оформите первую продажу"}
        </p>
      </div>

      {/* Stats */}
      {sales.length > 0 && (
        <div className="mb-6 grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="rounded-xl border border-border bg-card px-5 py-4">
            <p className="text-xs text-muted-foreground uppercase tracking-wide">Выручка всего</p>
            <p className="mt-1 text-xl font-semibold text-foreground">
              {stats.totalRevenue.toLocaleString("ru")} ₽
            </p>
          </div>
          <div className="rounded-xl border border-border bg-card px-5 py-4">
            <p className="text-xs text-muted-foreground uppercase tracking-wide">За этот месяц</p>
            <p className="mt-1 text-xl font-semibold text-primary">
              {stats.monthRevenue.toLocaleString("ru")} ₽
            </p>
          </div>
          <div className="rounded-xl border border-border bg-card px-5 py-4">
            <p className="text-xs text-muted-foreground uppercase tracking-wide">Общий долг</p>
            <p className={`mt-1 text-xl font-semibold ${stats.totalDebt > 0 ? "text-red-400" : "text-foreground"}`}>
              {stats.totalDebt.toLocaleString("ru")} ₽
            </p>
          </div>
          <div className="rounded-xl border border-border bg-card px-5 py-4">
            <p className="text-xs text-muted-foreground uppercase tracking-wide">С долгом</p>
            <p className={`mt-1 text-xl font-semibold ${stats.debtCount > 0 ? "text-yellow-400" : "text-foreground"}`}>
              {stats.debtCount} продаж
            </p>
          </div>
        </div>
      )}

      <SalesTable sales={sales} />
    </div>
  );
}
