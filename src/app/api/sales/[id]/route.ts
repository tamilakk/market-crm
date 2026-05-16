import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: Request, { params }: Params) {
  const { id } = await params;

  const sale = await prisma.sale.findUnique({
    where: { id },
    include: {
      client: true,
      saleItems: {
        include: { product: true },
      },
    },
  });

  if (!sale) {
    return NextResponse.json({ error: "Продажа не найдена" }, { status: 404 });
  }

  return NextResponse.json(sale);
}

// Редактирование: только статус, оплаченная сумма и заметки
const updateSchema = z.object({
  status: z.enum(["paid", "debt", "partial"]),
  paidAmount: z.number().min(0),
  notes: z.string().optional(),
});

export async function PUT(request: Request, { params }: Params) {
  const { id } = await params;
  const body = await request.json();
  const parsed = updateSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten().fieldErrors },
      { status: 422 }
    );
  }

  const sale = await prisma.sale.update({
    where: { id },
    data: parsed.data,
  });

  return NextResponse.json(sale);
}

export async function DELETE(_req: Request, { params }: Params) {
  const { id } = await params;

  // Транзакция: восстанавливаем остатки и удаляем продажу
  await prisma.$transaction(async (tx) => {
    const sale = await tx.sale.findUnique({
      where: { id },
      include: { saleItems: true },
    });

    if (!sale) return;

    // Возвращаем товар на склад
    for (const item of sale.saleItems) {
      await tx.product.update({
        where: { id: item.productId },
        data: { stock: { increment: item.quantity } },
      });
    }

    await tx.sale.delete({ where: { id } });
  });

  return new NextResponse(null, { status: 204 });
}
