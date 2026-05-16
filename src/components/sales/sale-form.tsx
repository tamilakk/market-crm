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
      status: "paid",
      paidAmount: 0,
      notes: "",
      items: [EMPTY_ITEM],
    },
  });

  // useFieldArray — управляет динамическим массивом items
  const { fields, append, remove } = useFieldArray({ control, name: "items" });

  // useWatch — реактивно читаем items без ре-рендера всей формы
  const watchedItems = useWatch({ control, name: "items" });
  const status = watch("status");

  // Считаем итог прямо в рендере — источник правды это items
  const total = (watchedItems ?? []).reduce(
    (sum, item) => sum + (item.quantity || 0) * (item.priceAtSale || 0),
    0
  );

  // При выборе товара автоматически подставляем его цену продажи
  const handleProductSelect = (index: number, productId: string) => {
    const product = products.find((p) => p.id === productId);
    if (product) {
      setValue(`items.${index}.productId`, productId);
      setValue(`items.${index}.priceAtSale`, product.sellPrice);
    }
  };

  const onSubmit = async (data: SaleFormValues) => {
    // Если статус "paid" — paidAmount = total (всё оплачено)
    const payload = {
      ...data,
      clientId: data.clientId || undefined,
      paidAmount: data.status === "paid" ? total : data.paidAmount,
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

        {/* Шапка таблицы */}
        <div className="hidden sm:grid grid-cols-[1fr_100px_130px_110px_40px] gap-3 px-5 py-2.5 bg-muted/40 border-b border-border text-xs font-medium text-muted-foreground uppercase tracking-wide">
          <span>Товар</span>
          <span>Кол-во</span>
          <span>Цена, ₽</span>
          <span>Сумма</span>
          <span />
        </div>

        {/* Строки товаров */}
        <div className="divide-y divide-border">
          {fields.map((field, index) => {
            const qty = watchedItems?.[index]?.quantity || 0;
            const price = watchedItems?.[index]?.priceAtSale || 0;
            const rowTotal = qty * price;
            const selectedProduct = products.find(
              (p) => p.id === watchedItems?.[index]?.productId
            );

            return (
              <div key={field.id} className="grid grid-cols-[1fr_100px_130px_110px_40px] gap-3 px-5 py-3 items-center">
                {/* Выбор товара */}
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

                {/* Количество */}
                <Input
                  type="number"
                  step="0.1"
                  min="0.1"
                  className="bg-input border-border text-foreground h-9 text-sm"
                  {...register(`items.${index}.quantity`, { valueAsNumber: true })}
                />

                {/* Цена */}
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  className="bg-input border-border text-foreground h-9 text-sm"
                  {...register(`items.${index}.priceAtSale`, { valueAsNumber: true })}
                />

                {/* Строчный итог */}
                <span className="text-sm font-medium text-foreground text-right">
                  {rowTotal.toLocaleString("ru")} ₽
                </span>

                {/* Удалить строку */}
                <button
                  type="button"
                  onClick={() => remove(index)}
                  disabled={fields.length === 1}
                  className="flex h-9 w-9 items-center justify-center rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            );
          })}
        </div>

        {/* Добавить строку */}
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

        {/* Итог */}
        <div className="px-5 py-4 border-t border-border bg-muted/20 flex justify-end items-center gap-3">
          <span className="text-sm text-muted-foreground">Итого:</span>
          <span className="text-xl font-semibold text-foreground">
            {total.toLocaleString("ru")} ₽
          </span>
        </div>
      </div>

      {/* ── Оплата ────────────────────────────────── */}
      <div className="rounded-xl border border-border bg-card p-5 space-y-4">
        <h2 className="text-sm font-semibold text-foreground uppercase tracking-wide">
          Оплата
        </h2>

        <div className="space-y-1.5">
          <Label className="text-sm text-foreground">Статус</Label>
          <Select
            value={status}
            onValueChange={(v) => setValue("status", v as SaleFormValues["status"])}
          >
            <SelectTrigger className="bg-input border-border text-foreground h-10">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-card border-border">
              <SelectItem value="paid">
                <span className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-green-400" /> Оплачено полностью
                </span>
              </SelectItem>
              <SelectItem value="partial">
                <span className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-yellow-400" /> Оплачено частично
                </span>
              </SelectItem>
              <SelectItem value="debt">
                <span className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-red-400" /> Долг (не оплачено)
                </span>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Поле суммы оплаты — только для partial */}
        {status === "partial" && (
          <div className="space-y-1.5">
            <Label className="text-sm text-foreground">
              Оплачено сейчас, ₽
              <span className="ml-2 text-xs text-muted-foreground">
                (осталось: {(total - (watch("paidAmount") || 0)).toLocaleString("ru")} ₽)
              </span>
            </Label>
            <Input
              type="number"
              step="0.01"
              min="0"
              className="bg-input border-border text-foreground h-10"
              {...register("paidAmount", { valueAsNumber: true })}
            />
          </div>
        )}
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
          {isSubmitting ? "Создаём продажу..." : `Оформить на ${total.toLocaleString("ru")} ₽`}
        </Button>
      </div>
    </form>
  );
}
