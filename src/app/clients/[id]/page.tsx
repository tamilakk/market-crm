import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, Phone, MapPin, FileText, ShoppingCart } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { ClientTypeBadge } from "@/components/clients/client-type-badge";
import { ClientActions } from "@/components/clients/client-actions";
import { format } from "date-fns";
import { ru } from "date-fns/locale";

type Props = { params: Promise<{ id: string }> };

export default async function ClientDetailPage({ params }: Props) {
  const { id } = await params;

  const client = await prisma.client.findUnique({
    where: { id },
    include: {
      sales: {
        orderBy: { createdAt: "desc" },
        take: 10,
      },
    },
  });

  if (!client) notFound();

  const totalRevenue = client.sales.reduce((sum, s) => sum + s.paidAmount, 0);
  const debtAmount = client.sales.reduce(
    (sum, s) => sum + (s.totalAmount - s.paidAmount),
    0
  );

  return (
    <div className="max-w-3xl">
      {/* Breadcrumb */}
      <Link
        href="/clients"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
      >
        <ChevronLeft className="h-4 w-4" />
        Клиенты
      </Link>

      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-2xl font-semibold text-foreground">{client.name}</h1>
            <ClientTypeBadge type={client.type} />
          </div>
          <p className="text-sm text-muted-foreground">
            Клиент с {format(client.createdAt, "d MMMM yyyy", { locale: ru })}
          </p>
        </div>
        <ClientActions client={client} />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: "Покупок", value: client.sales.length },
          {
            label: "Оплачено",
            value: `${totalRevenue.toLocaleString("ru")} ₽`,
          },
          {
            label: "Долг",
            value: `${debtAmount.toLocaleString("ru")} ₽`,
            highlight: debtAmount > 0,
          },
        ].map(({ label, value, highlight }) => (
          <div key={label} className="rounded-xl border border-border bg-card p-4">
            <p className="text-xs text-muted-foreground mb-1">{label}</p>
            <p
              className={`text-xl font-semibold ${
                highlight ? "text-destructive" : "text-foreground"
              }`}
            >
              {value}
            </p>
          </div>
        ))}
      </div>

      {/* Info */}
      <div className="rounded-xl border border-border bg-card p-5 mb-6 space-y-3">
        <h2 className="text-sm font-medium text-foreground mb-3">Контактная информация</h2>
        {client.phone && (
          <div className="flex items-center gap-2.5 text-sm">
            <Phone className="h-4 w-4 text-muted-foreground shrink-0" />
            <span className="text-foreground">{client.phone}</span>
          </div>
        )}
        {client.address && (
          <div className="flex items-center gap-2.5 text-sm">
            <MapPin className="h-4 w-4 text-muted-foreground shrink-0" />
            <span className="text-foreground">{client.address}</span>
          </div>
        )}
        {client.notes && (
          <div className="flex items-start gap-2.5 text-sm">
            <FileText className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
            <span className="text-muted-foreground">{client.notes}</span>
          </div>
        )}
        {!client.phone && !client.address && !client.notes && (
          <p className="text-sm text-muted-foreground">Нет дополнительной информации</p>
        )}
      </div>

      {/* Sales history */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="flex items-center gap-2 px-5 py-4 border-b border-border">
          <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          <h2 className="text-sm font-medium text-foreground">История покупок</h2>
        </div>
        {client.sales.length === 0 ? (
          <div className="py-10 text-center">
            <p className="text-sm text-muted-foreground">Покупок пока нет</p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {client.sales.map((sale) => (
              <Link
                key={sale.id}
                href={`/sales/${sale.id}`}
                className="flex items-center justify-between px-5 py-3.5 hover:bg-muted/30 transition-colors group"
              >
                <div>
                  <p className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">
                    {sale.totalAmount.toLocaleString("ru")} ₽
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {format(sale.createdAt, "d MMM yyyy", { locale: ru })}
                  </p>
                </div>
                <span
                  className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                    sale.status === "paid"
                      ? "bg-green-500/15 text-green-400"
                      : sale.status === "debt"
                        ? "bg-red-500/15 text-red-400"
                        : "bg-yellow-500/15 text-yellow-400"
                  }`}
                >
                  {sale.status === "paid"
                    ? "Оплачено"
                    : sale.status === "debt"
                      ? "Долг"
                      : "Частично"}
                </span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
