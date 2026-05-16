"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, Plus, ChevronRight, ShoppingCart } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { SaleStatusBadge } from "./sale-status-badge";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import type { Client, Product, Sale, SaleItem } from "@/types";

type SaleWithRelations = Sale & {
  client: Pick<Client, "id" | "name"> | null;
  saleItems: (SaleItem & {
    product: Pick<Product, "name" | "unit">;
  })[];
};

const STATUS_FILTERS = [
  { value: "", label: "Все" },
  { value: "paid", label: "Оплачено" },
  { value: "partial", label: "Частично" },
  { value: "debt", label: "Долг" },
];

export function SalesTable({ sales }: { sales: SaleWithRelations[] }) {
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const router = useRouter();

  const filtered = sales.filter((s) => {
    const q = query.toLowerCase();
    const matchQuery =
      !q ||
      (s.client?.name ?? "").toLowerCase().includes(q) ||
      s.saleItems.some((i) => i.product.name.toLowerCase().includes(q));
    const matchStatus = !statusFilter || s.status === statusFilter;
    return matchQuery && matchStatus;
  });

  const totalDebt = sales
    .filter((s) => s.status !== "paid")
    .reduce((sum, s) => sum + (s.totalAmount - s.paidAmount), 0);

  return (
    <>
      {/* Долг-баннер */}
      {totalDebt > 0 && (
        <div className="mb-5 flex items-center gap-3 rounded-lg border border-red-500/25 bg-red-500/10 px-4 py-3">
          <span className="h-2 w-2 rounded-full bg-red-400 shrink-0" />
          <span className="text-sm text-red-400 font-medium">
            Общий долг: {totalDebt.toLocaleString("ru-KZ")} ₸
          </span>
        </div>
      )}

      {/* Toolbar */}
      <div className="mb-5 flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Поиск по клиенту или товару..."
            className="pl-9 bg-card border-border text-foreground placeholder:text-muted-foreground h-10"
          />
        </div>

        <div className="flex gap-1">
          {STATUS_FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => setStatusFilter(f.value)}
              className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                statusFilter === f.value
                  ? "bg-primary/15 text-primary border border-primary/25"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted border border-transparent"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        <Button
          onClick={() => router.push("/sales/new")}
          className="ml-auto bg-primary text-primary-foreground hover:bg-primary/90 gap-2 h-10"
        >
          <Plus className="h-4 w-4" />
          Новая продажа
        </Button>
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-border bg-card py-20 text-center">
          <div className="h-14 w-14 rounded-full bg-muted flex items-center justify-center mb-4">
            <ShoppingCart className="h-6 w-6 text-muted-foreground" />
          </div>
          <p className="text-base font-medium text-foreground">Продажи не найдены</p>
          <p className="text-sm text-muted-foreground mt-1">
            {query || statusFilter ? "Попробуйте изменить фильтры" : "Оформите первую продажу"}
          </p>
        </div>
      ) : (
        <div className="rounded-xl border border-border overflow-hidden">
          <div className="grid grid-cols-[140px_1fr_130px_130px_120px_36px] gap-4 px-5 py-3 bg-muted/40 border-b border-border">
            {["Дата", "Позиции", "Клиент", "Сумма", "Статус", ""].map((h) => (
              <span key={h} className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                {h}
              </span>
            ))}
          </div>

          <div className="divide-y divide-border">
            {filtered.map((sale) => (
              <Link
                key={sale.id}
                href={`/sales/${sale.id}`}
                className="grid grid-cols-[140px_1fr_130px_130px_120px_36px] gap-4 px-5 py-4 items-center hover:bg-muted/30 transition-colors group"
              >
                <div>
                  <p className="text-sm font-medium text-foreground">
                    {format(sale.createdAt, "d MMM yyyy", { locale: ru })}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {format(sale.createdAt, "HH:mm")}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-foreground leading-snug line-clamp-1">
                    {sale.saleItems.map((i) => i.product.name).join(", ")}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {sale.saleItems.length} поз.
                  </p>
                </div>

                <p className="text-sm text-foreground truncate">
                  {sale.client?.name ?? <span className="text-muted-foreground">—</span>}
                </p>

                <div>
                  <p className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
                    {sale.totalAmount.toLocaleString("ru-KZ")} ₸
                  </p>
                  {sale.status !== "paid" && (
                    <p className="text-xs text-red-400 mt-0.5">
                      долг: {(sale.totalAmount - sale.paidAmount).toLocaleString("ru-KZ")} ₸
                    </p>
                  )}
                </div>

                <SaleStatusBadge status={sale.status} />

                <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors justify-self-end" />
              </Link>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
