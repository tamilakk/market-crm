"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import type { Sale } from "@/types";

export function SaleActions({ sale }: { sale: Sale }) {
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState(sale.status);
  const [paidAmount, setPaidAmount] = useState(sale.paidAmount);
  const router = useRouter();

  const handleSave = async () => {
    setSaving(true);
    await fetch(`/api/sales/${sale.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        status,
        paidAmount: status === "paid" ? sale.totalAmount : paidAmount,
        notes: sale.notes ?? undefined,
      }),
    });
    setSaving(false);
    setEditOpen(false);
    router.refresh();
  };

  const handleDelete = async () => {
    setDeleting(true);
    await fetch(`/api/sales/${sale.id}`, { method: "DELETE" });
    router.push("/sales");
    router.refresh();
  };

  return (
    <>
      <div className="flex gap-2">
        <Button variant="outline" size="sm" onClick={() => setEditOpen(true)}
          className="gap-1.5 border-border text-foreground hover:bg-muted h-9">
          <Pencil className="h-3.5 w-3.5" /> Изменить статус
        </Button>
        <Button variant="outline" size="sm" onClick={() => setDeleteOpen(true)}
          className="gap-1.5 border-destructive/40 text-destructive hover:bg-destructive/10 h-9">
          <Trash2 className="h-3.5 w-3.5" /> Удалить
        </Button>
      </div>

      {/* Edit dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="bg-card border-border sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-foreground">Обновить оплату</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <div className="space-y-1.5">
              <Label className="text-foreground">Статус оплаты</Label>
              <Select value={status} onValueChange={(v) => setStatus(v as Sale["status"])}>
                <SelectTrigger className="bg-input border-border text-foreground h-10">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-card border-border">
                  <SelectItem value="paid">Оплачено</SelectItem>
                  <SelectItem value="partial">Частично</SelectItem>
                  <SelectItem value="debt">Долг</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {status === "partial" && (
              <div className="space-y-1.5">
                <Label className="text-foreground">
                  Оплачено, ₸
                  <span className="ml-2 text-xs text-muted-foreground">
                    из {sale.totalAmount.toLocaleString("ru-KZ")} ₸
                  </span>
                </Label>
                <Input
                  type="number"
                  step="0.01"
                  value={paidAmount}
                  onChange={(e) => setPaidAmount(Number(e.target.value))}
                  className="bg-input border-border text-foreground h-10"
                />
              </div>
            )}

            <div className="flex gap-2 justify-end pt-1">
              <Button variant="ghost" className="text-muted-foreground" onClick={() => setEditOpen(false)}>
                Отмена
              </Button>
              <Button disabled={saving} onClick={handleSave}
                className="bg-primary text-primary-foreground hover:bg-primary/90">
                {saving ? "Сохраняем..." : "Сохранить"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete dialog */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent className="bg-card border-border sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-foreground">Удалить продажу?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Продажа на{" "}
            <span className="font-medium text-foreground">
              {sale.totalAmount.toLocaleString("ru-KZ")} ₸
            </span>{" "}
            будет удалена, а товары вернутся на склад.
          </p>
          <div className="flex gap-2 justify-end mt-4">
            <Button variant="ghost" className="text-muted-foreground" onClick={() => setDeleteOpen(false)}>
              Отмена
            </Button>
            <Button disabled={deleting} onClick={handleDelete}
              className="bg-destructive text-white hover:bg-destructive/90">
              {deleting ? "Удаляем..." : "Удалить"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
