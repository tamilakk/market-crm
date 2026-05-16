"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { clientSchema, type ClientFormValues } from "@/lib/validations/client";
import type { Client } from "@/types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ClientFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultValues?: Client;
}

export function ClientForm({ open, onOpenChange, defaultValues }: ClientFormProps) {
  const router = useRouter();
  const isEdit = !!defaultValues;

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ClientFormValues>({
    resolver: zodResolver(clientSchema),
    defaultValues: defaultValues
      ? {
          name: defaultValues.name,
          phone: defaultValues.phone ?? "",
          address: defaultValues.address ?? "",
          type: defaultValues.type as ClientFormValues["type"],
          notes: defaultValues.notes ?? "",
        }
      : { name: "", phone: "", address: "", type: "retail" as const, notes: "" },
  });

  const onSubmit = async (data: ClientFormValues) => {
    const url = isEdit
      ? `/api/clients/${defaultValues.id}`
      : "/api/clients";
    const method = isEdit ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (res.ok) {
      reset();
      onOpenChange(false);
      router.refresh();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card border-border sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-foreground">
            {isEdit ? "Редактировать клиента" : "Новый клиент"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-2">
          {/* Имя */}
          <div className="space-y-1.5">
            <Label htmlFor="name" className="text-foreground">Имя *</Label>
            <Input
              id="name"
              placeholder="Иван Петров"
              className="bg-input border-border text-foreground placeholder:text-muted-foreground"
              {...register("name")}
            />
            {errors.name && (
              <p className="text-xs text-destructive">{errors.name.message}</p>
            )}
          </div>

          {/* Телефон */}
          <div className="space-y-1.5">
            <Label htmlFor="phone" className="text-foreground">Телефон</Label>
            <Input
              id="phone"
              placeholder="+7 900 000 00 00"
              className="bg-input border-border text-foreground placeholder:text-muted-foreground"
              {...register("phone")}
            />
          </div>

          {/* Тип */}
          <div className="space-y-1.5">
            <Label className="text-foreground">Тип клиента</Label>
            <Select
              value={watch("type")}
              onValueChange={(v) => setValue("type", v as ClientFormValues["type"])}
            >
              <SelectTrigger className="bg-input border-border text-foreground">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-card border-border">
                <SelectItem value="retail">Розница</SelectItem>
                <SelectItem value="wholesale">Оптовик</SelectItem>
                <SelectItem value="contractor">Строительная бригада</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Адрес */}
          <div className="space-y-1.5">
            <Label htmlFor="address" className="text-foreground">Адрес</Label>
            <Input
              id="address"
              placeholder="ул. Строителей, 1"
              className="bg-input border-border text-foreground placeholder:text-muted-foreground"
              {...register("address")}
            />
          </div>

          {/* Заметки */}
          <div className="space-y-1.5">
            <Label htmlFor="notes" className="text-foreground">Заметки</Label>
            <Textarea
              id="notes"
              placeholder="Любая дополнительная информация..."
              rows={3}
              className="bg-input border-border text-foreground placeholder:text-muted-foreground resize-none"
              {...register("notes")}
            />
          </div>

          <div className="flex gap-2 justify-end pt-2">
            <Button
              type="button"
              variant="ghost"
              className="text-muted-foreground hover:text-foreground"
              onClick={() => onOpenChange(false)}
            >
              Отмена
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              {isSubmitting ? "Сохраняем..." : isEdit ? "Сохранить" : "Добавить"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
