"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { productSchema, type ProductFormValues } from "@/lib/validations/product";
import type { Product } from "@/types";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";

interface ProductFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultValues?: Product;
}

const EMPTY: ProductFormValues = {
  name: "", sku: "", category: "wallpaper", unit: "roll",
  purchasePrice: 0, sellPrice: 0, stock: 0, minStock: 5,
};

export function ProductForm({ open, onOpenChange, defaultValues }: ProductFormProps) {
  const router = useRouter();
  const isEdit = !!defaultValues;

  const {
    register, handleSubmit, setValue, watch, reset,
    formState: { errors, isSubmitting },
  } = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: defaultValues
      ? {
          name: defaultValues.name,
          sku: defaultValues.sku ?? "",
          category: defaultValues.category as ProductFormValues["category"],
          unit: defaultValues.unit as ProductFormValues["unit"],
          purchasePrice: defaultValues.purchasePrice,
          sellPrice: defaultValues.sellPrice,
          stock: defaultValues.stock,
          minStock: defaultValues.minStock,
        }
      : EMPTY,
  });

  const onSubmit = async (data: ProductFormValues) => {
    const url = isEdit ? `/api/products/${defaultValues.id}` : "/api/products";
    const res = await fetch(url, {
      method: isEdit ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (res.ok) { reset(); onOpenChange(false); router.refresh(); }
  };

  const cls = "bg-input border-border text-foreground placeholder:text-muted-foreground h-10";
  const textField = (id: keyof ProductFormValues) => ({ className: cls, ...register(id) });
  // valueAsNumber: react-hook-form конвертирует строку input[type=number] → number
  const numField = (id: keyof ProductFormValues) => ({
    className: cls,
    ...register(id, { valueAsNumber: true }),
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card border-border sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-foreground text-lg">
            {isEdit ? "Редактировать товар" : "Новый товар"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-2 space-y-4">
          {/* Название + Артикул */}
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2 space-y-1.5">
              <Label className="text-sm text-foreground">Название *</Label>
              <Input placeholder='Обои "Прованс" 1.06м' {...textField("name")} />
              {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm text-foreground">Артикул (SKU)</Label>
              <Input placeholder="OB-1234" {...textField("sku")} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm text-foreground">Единица</Label>
              <Select value={watch("unit")} onValueChange={(v) => setValue("unit", v as ProductFormValues["unit"])}>
                <SelectTrigger className="bg-input border-border text-foreground h-10">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-card border-border">
                  <SelectItem value="roll">Рулон</SelectItem>
                  <SelectItem value="box">Коробка</SelectItem>
                  <SelectItem value="m2">м²</SelectItem>
                  <SelectItem value="piece">Штука</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Категория */}
          <div className="space-y-1.5">
            <Label className="text-sm text-foreground">Категория</Label>
            <Select value={watch("category")} onValueChange={(v) => setValue("category", v as ProductFormValues["category"])}>
              <SelectTrigger className="bg-input border-border text-foreground h-10">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-card border-border">
                <SelectItem value="wallpaper">Обои</SelectItem>
                <SelectItem value="laminate">Ламинат</SelectItem>
                <SelectItem value="other">Прочее</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Цены */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-sm text-foreground">Закупочная цена, ₽</Label>
              <Input type="number" step="0.01" placeholder="0" {...numField("purchasePrice")} />
              {errors.purchasePrice && <p className="text-xs text-destructive">{errors.purchasePrice.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm text-foreground">Цена продажи, ₽</Label>
              <Input type="number" step="0.01" placeholder="0" {...numField("sellPrice")} />
              {errors.sellPrice && <p className="text-xs text-destructive">{errors.sellPrice.message}</p>}
            </div>
          </div>

          {/* Склад */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-sm text-foreground">Остаток</Label>
              <Input type="number" step="0.1" placeholder="0" {...numField("stock")} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm text-foreground">Минимум (предупреждение)</Label>
              <Input type="number" step="0.1" placeholder="5" {...numField("minStock")} />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="ghost" className="text-muted-foreground hover:text-foreground" onClick={() => onOpenChange(false)}>
              Отмена
            </Button>
            <Button type="submit" disabled={isSubmitting} className="bg-primary text-primary-foreground hover:bg-primary/90">
              {isSubmitting ? "Сохраняем..." : isEdit ? "Сохранить" : "Добавить"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
