"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Search, Plus, Phone, ChevronRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ClientTypeBadge } from "./client-type-badge";
import { ClientForm } from "./client-form";
import type { Client } from "@/types";

interface ClientsTableProps {
  clients: (Client & { _count: { sales: number } })[];
}

export function ClientsTable({ clients }: ClientsTableProps) {
  const [query, setQuery] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [, startTransition] = useTransition();
  const router = useRouter();

  const filtered = clients.filter((c) => {
    const q = query.toLowerCase();
    return (
      c.name.toLowerCase().includes(q) ||
      (c.phone ?? "").toLowerCase().includes(q)
    );
  });

  const handleFormClose = (open: boolean) => {
    setFormOpen(open);
    if (!open) startTransition(() => router.refresh());
  };

  return (
    <>
      {/* Toolbar */}
      <div className="flex items-center gap-3 mb-6">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Поиск по имени или телефону..."
            className="pl-9 bg-card border-border text-foreground placeholder:text-muted-foreground"
          />
        </div>
        <Button
          onClick={() => setFormOpen(true)}
          className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2"
        >
          <Plus className="h-4 w-4" />
          Добавить клиента
        </Button>
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-4">
            <Search className="h-5 w-5 text-muted-foreground" />
          </div>
          <p className="text-sm font-medium text-foreground">Клиенты не найдены</p>
          <p className="text-xs text-muted-foreground mt-1">
            {query ? "Попробуйте другой запрос" : "Добавьте первого клиента"}
          </p>
        </div>
      ) : (
        <div className="rounded-xl border border-border overflow-hidden">
          {/* Table header */}
          <div className="grid grid-cols-[1fr_160px_140px_80px_40px] gap-4 px-4 py-3 bg-muted/40 border-b border-border text-xs font-medium text-muted-foreground uppercase tracking-wide">
            <span>Клиент</span>
            <span>Телефон</span>
            <span>Тип</span>
            <span className="text-center">Покупок</span>
            <span />
          </div>

          {/* Rows */}
          <div className="divide-y divide-border">
            {filtered.map((client) => (
              <Link
                key={client.id}
                href={`/clients/${client.id}`}
                className="grid grid-cols-[1fr_160px_140px_80px_40px] gap-4 px-4 py-3.5 items-center hover:bg-muted/30 transition-colors group"
              >
                <div>
                  <p className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">
                    {client.name}
                  </p>
                  {client.address && (
                    <p className="text-xs text-muted-foreground mt-0.5 truncate">
                      {client.address}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  {client.phone ? (
                    <>
                      <Phone className="h-3.5 w-3.5 shrink-0" />
                      <span className="truncate">{client.phone}</span>
                    </>
                  ) : (
                    <span className="text-muted-foreground/50">—</span>
                  )}
                </div>

                <ClientTypeBadge type={client.type} />

                <div className="text-center">
                  <span className="text-sm font-medium text-foreground">
                    {client._count.sales}
                  </span>
                </div>

                <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors justify-self-end" />
              </Link>
            ))}
          </div>
        </div>
      )}

      <ClientForm open={formOpen} onOpenChange={handleFormClose} />
    </>
  );
}
