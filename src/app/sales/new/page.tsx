import { prisma } from "@/lib/prisma";
import { SaleForm } from "@/components/sales/sale-form";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

export default async function NewSalePage() {
  // Грузим клиентов и товары на сервере, передаём в Client Component
  const [clients, products] = await Promise.all([
    prisma.client.findMany({ orderBy: { name: "asc" } }),
    prisma.product.findMany({
      where: { stock: { gt: 0 } },
      orderBy: { name: "asc" },
    }),
  ]);

  return (
    <div>
      <Link
        href="/sales"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
      >
        <ChevronLeft className="h-4 w-4" /> Продажи
      </Link>

      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-foreground">Новая продажа</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Добавьте товары, выберите клиента и укажите статус оплаты
        </p>
      </div>

      <SaleForm clients={clients} products={products} />
    </div>
  );
}
