"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, Plus, ChevronRight, Package } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ProductCategoryBadge } from "./product-category-badge";
import { StockStatus } from "./stock-status";
import { ProductForm } from "./product-form";
import type { Product } from "@/types";

const CATEGORIES = [
  { value: "", label: "Все" },
  { value: "wallpaper", label: "Обои" },
  { value: "laminate", label: "Ламинат" },
  { value: "other", label: "Прочее" },
];

interface ProductsTableProps {
  products: Product[];
}

export function ProductsTable({ products }: ProductsTableProps) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [, startTransition] = useTransition();
  const router = useRouter();

  const filtered = products.filter((p) => {
    const q = query.toLowerCase();
    const matchQuery =
      !q ||
      p.name.toLowerCase().includes(q) ||
      (p.sku ?? "").toLowerCase().includes(q);
    const matchCat = !category || p.category === category;
    return matchQuery && matchCat;
  });

  const lowStock = products.filter((p) => p.stock > 0 && p.stock <= p.minStock).length;
  const outStock = products.filter((p) => p.stock <= 0).length;

  const handleFormClose = (open: boolean) => {
    setFormOpen(open);
    if (!open) startTransition(() => router.refresh());
  };

  return (
    <>
      {/* Stock alerts */}
      {(lowStock > 0 || outStock > 0) && (
        <div className="mb-5 flex flex-wrap gap-3">
          {outStock > 0 && (
            <div className="flex items-center gap-2 rounded-lg border border-red-500/25 bg-red-500/10 px-4 py-2.5">
              <span className="h-2 w-2 rounded-full bg-red-400" />
              <span className="text-sm text-red-400 font-medium">
                {outStock} товар{outStock === 1 ? "" : "а"} нет в наличии
              </span>
            </div>
          )}
          {lowStock > 0 && (
            <div className="flex items-center gap-2 rounded-lg border border-yellow-500/25 bg-yellow-500/10 px-4 py-2.5">
              <span className="h-2 w-2 rounded-full bg-yellow-400" />
              <span className="text-sm text-yellow-400 font-medium">
                {lowStock} товар{lowStock === 1 ? "" : "а"} заканчивается
              </span>
            </div>
          )}
        </div>
      )}

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
            onClick={() => setFormOpen(true)}
            className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2 h-10 shrink-0"
          >
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Добавить товар</span>
          </Button>
        </div>
        <div className="flex gap-1 flex-wrap">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.value}
              onClick={() => setCategory(cat.value)}
              className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                category === cat.value
                  ? "bg-primary/15 text-primary border border-primary/25"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted border border-transparent"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-border bg-card py-20 text-center">
          <div className="h-14 w-14 rounded-full bg-muted flex items-center justify-center mb-4">
            <Package className="h-6 w-6 text-muted-foreground" />
          </div>
          <p className="text-base font-medium text-foreground">Товары не найдены</p>
          <p className="text-sm text-muted-foreground mt-1">
            {query || category ? "Попробуйте изменить фильтры" : "Добавьте первый товар"}
          </p>
        </div>
      ) : (
        <div className="rounded-xl border border-border overflow-hidden">
          {/* Desktop header */}
          <div className="hidden md:grid md:grid-cols-[1fr_110px_100px_120px_120px_100px_36px] gap-4 px-5 py-3 bg-muted/40 border-b border-border">
            {["Товар", "Категория", "Артикул", "Закуп.", "Продажа", "Склад", ""].map((h) => (
              <span key={h} className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                {h}
              </span>
            ))}
          </div>

          <div className="divide-y divide-border">
            {filtered.map((product) => {
              const margin = product.purchasePrice > 0
                ? Math.round(((product.sellPrice - product.purchasePrice) / product.purchasePrice) * 100)
                : 0;

              return (
                <Link
                  key={product.id}
                  href={`/products/${product.id}`}
                  className="group block hover:bg-muted/30 transition-colors"
                >
                  {/* Mobile layout */}
                  <div className="md:hidden px-4 py-3.5">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-foreground group-hover:text-primary transition-colors leading-tight">
                          {product.name}
                        </p>
                        <div className="flex items-center gap-2 mt-1.5">
                          <ProductCategoryBadge category={product.category} />
                          <span className="text-xs text-foreground font-medium">
                            {product.sellPrice.toLocaleString("ru-KZ")} ₸
                            {margin > 0 && (
                              <span className="ml-1 text-green-400">+{margin}%</span>
                            )}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <StockStatus product={product} />
                        <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                      </div>
                    </div>
                  </div>

                  {/* Desktop layout */}
                  <div className="hidden md:grid md:grid-cols-[1fr_110px_100px_120px_120px_100px_36px] gap-4 px-5 py-4 items-center">
                    <div>
                      <p className="text-sm font-medium text-foreground group-hover:text-primary transition-colors leading-tight">
                        {product.name}
                      </p>
                    </div>
                    <ProductCategoryBadge category={product.category} />
                    <span className="text-sm text-muted-foreground font-mono">{product.sku ?? "—"}</span>
                    <span className="text-sm text-muted-foreground">
                      {product.purchasePrice.toLocaleString("ru-KZ")} ₸
                    </span>
                    <div>
                      <span className="text-sm font-medium text-foreground">
                        {product.sellPrice.toLocaleString("ru-KZ")} ₸
                      </span>
                      {margin > 0 && (
                        <span className="ml-1.5 text-xs text-green-400">+{margin}%</span>
                      )}
                    </div>
                    <StockStatus product={product} />
                    <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors justify-self-end" />
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      <ProductForm open={formOpen} onOpenChange={handleFormClose} />
    </>
  );
}
