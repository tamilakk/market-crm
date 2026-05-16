import { prisma } from "@/lib/prisma";
import { ClientsTable } from "@/components/clients/clients-table";

export default async function ClientsPage() {
  const clients = await prisma.client.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { sales: true } } },
  });

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-foreground">Клиенты</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {clients.length > 0
            ? `${clients.length} клиент${clients.length === 1 ? "" : clients.length < 5 ? "а" : "ов"}`
            : "Добавьте первого клиента"}
        </p>
      </div>

      <ClientsTable clients={clients} />
    </div>
  );
}
