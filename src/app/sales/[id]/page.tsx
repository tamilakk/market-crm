import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, User, Package } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { SaleStatusBadge } from "@/components/sales/sale-status-badge";
import { SaleActions } from "@/components/sales/sale-actions";
import { unitLabel } from "@/components/products/stock-status";
import { format } from "date-fns";
import { ru } from "date-fns/locale";

type Props = { params: Promise<{ id: string }> };

export default async function SaleDetailPage({ params }: Props) {
  const { id } = await params;

  const sale = await prisma.sale.findUnique({
    where: { id },
    include: {
      client: true,
      saleItems: {
        include: { product: true },
      },
    },
  });

  if (!sale) notFound();

  const debt = sale.totalAmount - sale.paidAmount;

  return (
    <div className="max-w-2xl">
      {/* Breadcrumb */}
      <Link href="/sales"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6">
        <ChevronLeft className="h-4 w-4" /> Продажи
      </Link>

      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <div className="flex items-center gap-3 mb-2 flex-wrap">
            <h1 className="text-2xl font-semibold text-foreground">
              {sale.totalAmount.toLocaleString("ru-KZ")} ₸
            </h1>
            <SaleStatusBadge status={sale.status} />
          </div>
          <p className="text-sm text-muted-foreground">
            {format(sale.createdAt, "d MMMM yyyy, HH:mm", { locale: ru })}
          </p>
        </div>
        <SaleActions sale={sale} />
      </div>

      {/* Payment info */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: "Сумма продажи", value: `${sale.totalAmount.toLocaleString("ru-KZ")} ₸`, color: "text-foreground" },
          { label: "Оплачено",      value: `${sale.paidAmount.toLocaleString("ru-KZ")} ₸`,  color: "text-green-400" },
          { label: "Долг",          value: `${debt.toLocaleString("ru-KZ")} ₸`,              color: debt > 0 ? "text-red-400" : "text-muted-foreground" },
        ].map(({ label, value, color }) => (
          <div key={label} className="rounded-xl border border-border bg-card p-4">
            <p className="text-xs text-muted-foreground mb-1">{label}</p>
            <p className={`text-lg font-semibold ${color}`}>{value}</p>
          </div>
        ))}
      </div>

      {/* Клиент */}
      <div className="rounded-xl border border-border bg-card p-5 mb-4">
        <div className="flex items-center gap-2 mb-3">
          <User className="h-4 w-4 text-muted-foreground" />
          <h2 className="text-sm font-medium text-foreground">Покупатель</h2>
        </div>
        {sale.client ? (
          <Link href={`/clients/${sale.client.id}`}
            className="text-sm font-medium text-primary hover:text-primary/80 transition-colors">
            {sale.client.name}
          </Link>
        ) : (
          <p className="text-sm text-muted-foreground">Без клиента (розничная продажа)</p>
        )}
      </div>

      {/* Позиции */}
      <div className="rounded-xl border border-border bg-card overflow-hidden mb-4">
        <div className="flex items-center gap-2 px-5 py-4 border-b border-border">
          <Package className="h-4 w-4 text-muted-foreground" />
          <h2 className="text-sm font-medium text-foreground">Позиции</h2>
          <span className="ml-auto text-xs text-muted-foreground">
            {sale.saleItems.length} товар{sale.saleItems.length === 1 ? "" : "а"}
          </span>
        </div>

        <div className="divide-y divide-border">
          {sale.saleItems.map((item) => (
            <Link key={item.id} href={`/products/${item.productId}`}
              className="flex items-center justify-between px-5 py-3.5 hover:bg-muted/30 transition-colors group">
              <div>
                <p className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">
                  {item.product.name}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {item.quantity} {unitLabel(item.product.unit)} × {item.priceAtSale.toLocaleString("ru-KZ")} ₸
                </p>
              </div>
              <span className="text-sm font-semibold text-foreground">
                {(item.quantity * item.priceAtSale).toLocaleString("ru-KZ")} ₸
              </span>
            </Link>
          ))}
        </div>

        {/* Итого */}
        <div className="flex justify-between px-5 py-4 border-t border-border bg-muted/20">
          <span className="text-sm text-muted-foreground">Итого</span>
          <span className="text-base font-semibold text-foreground">
            {sale.totalAmount.toLocaleString("ru-KZ")} ₸
          </span>
        </div>
      </div>

      {/* Заметки */}
      {sale.notes && (
        <div className="rounded-xl border border-border bg-card p-5">
          <h2 className="text-sm font-medium text-foreground mb-2">Заметки</h2>
          <p className="text-sm text-muted-foreground">{sale.notes}</p>
        </div>
      )}
    </div>
  );
}
