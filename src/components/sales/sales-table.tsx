"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, Plus, ChevronRight, ShoppingCart } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { format, isToday, isThisWeek, isThisMonth } from "date-fns";
import { ru } from "date-fns/locale";
import type { Client, Product, Sale, SaleItem } from "@/types";

type SaleWithRelations = Sale & {
  client: Pick<Client, "id" | "name"> | null;
  saleItems: (SaleItem & {
    product: Pick<Product, "name" | "unit">;
  })[];
};

const DATE_FILTERS = [
  { value: "all",   label: "Все" },
  { value: "today", label: "Сегодня" },
  { value: "week",  label: "Неделя" },
  { value: "month", label: "Месяц" },
];

function matchesDate(sale: SaleWithRelations, filter: string) {
  const d = new Date(sale.createdAt);
  if (filter === "today") return isToday(d);
  if (filter === "week")  return isThisWeek(d, { weekStartsOn: 1 });
  if (filter === "month") return isThisMonth(d);
  return true;
}

export function SalesTable({ sales }: { sales: SaleWithRelations[] }) {
  const [query, setQuery] = useState("");
  const [dateFilter, setDateFilter] = useState("all");
  const router = useRouter();

  const filtered = sales.filter((s) => {
    const q = query.toLowerCase();
    const matchQuery =
      !q ||
      (s.client?.name ?? "").toLowerCase().includes(q) ||
      s.saleItems.some((i) => i.product.name.toLowerCase().includes(q));
    return matchQuery && matchesDate(s, dateFilter);
  });

  return (
    <>
      {/* Toolbar */}
      <div className="mb-5 space-y-3">
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Поиск..."
              className="pl-9 bg-card border-border text-foreground placeholder:text-muted-foreground h-10"
            />
          </div>
          <Button
            onClick={() => router.push("/sales/new")}
            className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2 h-10 shrink-0"
          >
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Новая продажа</span>
          </Button>
        </div>
        <div className="flex gap-1 flex-wrap">
          {DATE_FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => setDateFilter(f.value)}
              className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                dateFilter === f.value
                  ? "bg-primary/15 text-primary border border-primary/25"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted border border-transparent"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-border bg-card py-20 text-center">
          <div className="h-14 w-14 rounded-full bg-muted flex items-center justify-center mb-4">
            <ShoppingCart className="h-6 w-6 text-muted-foreground" />
          </div>
          <p className="text-base font-medium text-foreground">Продажи не найдены</p>
          <p className="text-sm text-muted-foreground mt-1">
            {query || dateFilter !== "all" ? "Попробуйте изменить фильтры" : "Оформите первую продажу"}
          </p>
        </div>
      ) : (
        <div className="rounded-xl border border-border overflow-hidden">
          {/* Desktop header */}
          <div className="hidden md:grid md:grid-cols-[140px_1fr_160px_140px_36px] gap-4 px-5 py-3 bg-muted/40 border-b border-border">
            {["Дата", "Позиции", "Клиент", "Сумма", ""].map((h) => (
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
                className="group block hover:bg-muted/30 transition-colors"
              >
                {/* Mobile layout */}
                <div className="md:hidden px-4 py-3.5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-foreground group-hover:text-primary transition-colors line-clamp-1">
                        {sale.saleItems.map((i) => i.product.name).join(", ")}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {sale.client?.name ?? "Без клиента"} · {format(new Date(sale.createdAt), "d MMM, HH:mm", { locale: ru })}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <p className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
                        {sale.totalAmount.toLocaleString("ru-KZ")} ₸
                      </p>
                      <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                    </div>
                  </div>
                </div>

                {/* Desktop layout */}
                <div className="hidden md:grid md:grid-cols-[140px_1fr_160px_140px_36px] gap-4 px-5 py-4 items-center">
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      {format(new Date(sale.createdAt), "d MMM yyyy", { locale: ru })}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {format(new Date(sale.createdAt), "HH:mm")}
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
                  <p className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
                    {sale.totalAmount.toLocaleString("ru-KZ")} ₸
                  </p>
                  <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors justify-self-end" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
