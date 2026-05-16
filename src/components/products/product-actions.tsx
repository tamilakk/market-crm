"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProductForm } from "./product-form";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import type { Product } from "@/types";

export function ProductActions({ product }: { product: Product }) {
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    setDeleting(true);
    await fetch(`/api/products/${product.id}`, { method: "DELETE" });
    router.push("/products");
    router.refresh();
  };

  return (
    <>
      <div className="flex gap-2">
        <Button variant="outline" size="sm" onClick={() => setEditOpen(true)}
          className="gap-1.5 border-border text-foreground hover:bg-muted h-9">
          <Pencil className="h-3.5 w-3.5" /> Редактировать
        </Button>
        <Button variant="outline" size="sm" onClick={() => setDeleteOpen(true)}
          className="gap-1.5 border-destructive/40 text-destructive hover:bg-destructive/10 h-9">
          <Trash2 className="h-3.5 w-3.5" /> Удалить
        </Button>
      </div>

      <ProductForm open={editOpen} onOpenChange={setEditOpen} defaultValues={product} />

      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent className="bg-card border-border sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-foreground">Удалить товар?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Товар <span className="font-medium text-foreground">{product.name}</span> будет удалён без возможности восстановления.
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
