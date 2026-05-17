"use client";

import { useForm, useFieldArray, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { Plus, Trash2, ArrowLeft } from "lucide-react";
import { saleSchema, type SaleFormValues } from "@/lib/validations/sale";
import type { Client, Product } from "@/types";
import { unitLabel } from "@/components/products/stock-status";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";

interface SaleFormProps {
  clients: Client[];
  products: Product[];
}

const EMPTY_ITEM = { productId: "", quantity: 1, priceAtSale: 0 };

export function SaleForm({ clients, products }: SaleFormProps) {
  const router = useRouter();

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<SaleFormValues>({
    resolver: zodResolver(saleSchema),
    defaultValues: {
      clientId: "",
      notes: "",
      items: [EMPTY_ITEM],
    },
  });

  const { fields, append, remove } = useFieldArray({ control, name: "items" });
  const watchedItems = useWatch({ control, name: "items" });

  const total = (watchedItems ?? []).reduce(
    (sum, item) => sum + (item.quantity || 0) * (item.priceAtSale || 0),
    0
  );

  const handleProductSelect = (index: number, productId: string) => {
    const product = products.find((p) => p.id === productId);
    if (product) {
      setValue(`items.${index}.productId`, productId);
      setValue(`items.${index}.priceAtSale`, product.sellPrice);
    }
  };

  const onSubmit = async (data: SaleFormValues) => {
    const payload = {
      ...data,
      clientId: data.clientId || undefined,
    };

    const res = await fetch("/api/sales", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      const sale = await res.json();
      router.push(`/sales/${sale.id}`);
      router.refresh();
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="max-w-3xl space-y-6">

      {/* ── Клиент ────────────────────────────────── */}
      <div className="rounded-xl border border-border bg-card p-5 space-y-4">
        <h2 className="text-sm font-semibold text-foreground uppercase tracking-wide">
          Покупатель
        </h2>
        <div className="space-y-1.5">
          <Label className="text-sm text-foreground">Клиент (необязательно)</Label>
          <Select
            value={watch("clientId") ?? ""}
            onValueChange={(v) => setValue("clientId", v === "_none" ? undefined : (v ?? undefined))}
          >
            <SelectTrigger className="bg-input border-border text-foreground h-10">
              <SelectValue placeholder="Выберите клиента или оставьте пустым" />
            </SelectTrigger>
            <SelectContent className="bg-card border-border">
              <SelectItem value="_none">— Без клиента</SelectItem>
              {clients.map((c) => (
                <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* ── Товары ────────────────────────────────── */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="px-5 py-4 border-b border-border">
          <h2 className="text-sm font-semibold text-foreground uppercase tracking-wide">
            Позиции
          </h2>
        </div>

        <div className="hidden sm:grid sm:grid-cols-[1fr_100px_130px_110px_40px] gap-3 px-5 py-2.5 bg-muted/40 border-b border-border text-xs font-medium text-muted-foreground uppercase tracking-wide">
          <span>Товар</span>
          <span>Кол-во</span>
          <span>Цена, ₸</span>
          <span>Сумма</span>
          <span />
        </div>

        <div className="divide-y divide-border">
          {fields.map((field, index) => {
            const qty = watchedItems?.[index]?.quantity || 0;
            const price = watchedItems?.[index]?.priceAtSale || 0;
            const rowTotal = qty * price;
            const selectedProduct = products.find(
              (p) => p.id === watchedItems?.[index]?.productId
            );

            return (
              <div key={field.id} className="px-4 py-3 sm:px-5 grid grid-cols-1 sm:grid-cols-[1fr_100px_130px_110px_40px] gap-3 sm:items-center">
                <div>
                  <Select
                    value={watchedItems?.[index]?.productId ?? ""}
                    onValueChange={(v) => v && handleProductSelect(index, v)}
                  >
                    <SelectTrigger className="bg-input border-border text-foreground h-9 text-sm">
                      <SelectValue placeholder="Выберите товар" />
                    </SelectTrigger>
                    <SelectContent className="bg-card border-border">
                      {products.map((p) => (
                        <SelectItem key={p.id} value={p.id}>
                          <span>{p.name}</span>
                          <span className="ml-2 text-muted-foreground text-xs">
                            {p.stock} {unitLabel(p.unit)}
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {selectedProduct && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Склад: {selectedProduct.stock} {unitLabel(selectedProduct.unit)}
                    </p>
                  )}
                  {errors.items?.[index]?.productId && (
                    <p className="text-xs text-destructive mt-1">
                      {errors.items[index]?.productId?.message}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-[1fr_1fr_auto_auto] sm:contents gap-2 items-center">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1 sm:hidden">Кол-во</p>
                    <Input
                      type="number"
                      step="0.1"
                      min="0.1"
                      className="bg-input border-border text-foreground h-9 text-sm"
                      {...register(`items.${index}.quantity`, { valueAsNumber: true })}
                    />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1 sm:hidden">Цена, ₸</p>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      className="bg-input border-border text-foreground h-9 text-sm"
                      {...register(`items.${index}.priceAtSale`, { valueAsNumber: true })}
                    />
                  </div>
                  <span className="text-sm font-medium text-foreground text-right whitespace-nowrap">
                    {rowTotal.toLocaleString("ru-KZ")} ₸
                  </span>
                  <button
                    type="button"
                    onClick={() => remove(index)}
                    disabled={fields.length === 1}
                    className="flex h-9 w-9 items-center justify-center rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        <div className="px-5 py-3 border-t border-border">
          <button
            type="button"
            onClick={() => append(EMPTY_ITEM)}
            className="flex items-center gap-2 text-sm text-primary hover:text-primary/80 font-medium transition-colors"
          >
            <Plus className="h-4 w-4" />
            Добавить позицию
          </button>
        </div>

        <div className="px-5 py-4 border-t border-border bg-muted/20 flex justify-end items-center gap-3">
          <span className="text-sm text-muted-foreground">Итого:</span>
          <span className="text-xl font-semibold text-foreground">
            {total.toLocaleString("ru-KZ")} ₸
          </span>
        </div>
      </div>

      {/* ── Заметки ───────────────────────────────── */}
      <div className="rounded-xl border border-border bg-card p-5 space-y-3">
        <h2 className="text-sm font-semibold text-foreground uppercase tracking-wide">
          Заметки
        </h2>
        <Textarea
          placeholder="Дополнительная информация о продаже..."
          rows={3}
          className="bg-input border-border text-foreground placeholder:text-muted-foreground resize-none"
          {...register("notes")}
        />
      </div>

      {/* ── Действия ──────────────────────────────── */}
      <div className="flex items-center gap-3 pb-6">
        <Button
          type="button"
          variant="ghost"
          className="gap-2 text-muted-foreground hover:text-foreground"
          onClick={() => router.back()}
        >
          <ArrowLeft className="h-4 w-4" /> Назад
        </Button>
        <Button
          type="submit"
          disabled={isSubmitting || total === 0}
          className="ml-auto bg-primary text-primary-foreground hover:bg-primary/90 px-8"
        >
          {isSubmitting ? "Создаём продажу..." : `Оформить на ${total.toLocaleString("ru-KZ")} ₸`}
        </Button>
      </div>
    </form>
  );
}
