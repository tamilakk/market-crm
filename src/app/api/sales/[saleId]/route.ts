import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

type Params = { params: Promise<{ saleId: string }> };

export async function GET(_req: Request, { params }: Params) {
  const { saleId: id } = await params;

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
  const { saleId: id } = await params;
  const body = await request.json();
  const parsed = updateSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten().fieldErrors },
      { status: 422 }
    );
  }

  const existing = await prisma.sale.findUnique({
    where: { id },
    select: { totalAmount: true },
  });

  if (!existing) {
    return NextResponse.json({ error: "Продажа не найдена" }, { status: 404 });
  }

  if (parsed.data.paidAmount > existing.totalAmount) {
    return NextResponse.json(
      { error: `Оплата не может превышать сумму продажи (${existing.totalAmount} ₸)` },
      { status: 422 }
    );
  }

  try {
    const sale = await prisma.sale.update({
      where: { id },
      data: parsed.data,
    });
    return NextResponse.json(sale);
  } catch (e: unknown) {
    if (isPrismaCode(e, "P2025")) {
      return NextResponse.json({ error: "Продажа не найдена" }, { status: 404 });
    }
    throw e;
  }
}

export async function DELETE(_req: Request, { params }: Params) {
  const { saleId: id } = await params;

  try {
    await prisma.$transaction(async (tx) => {
      const sale = await tx.sale.findUnique({
        where: { id },
        include: { saleItems: true },
      });

      if (!sale) {
        const err = new Error("Продажа не найдена");
        (err as unknown as { code: string }).code = "NOT_FOUND";
        throw err;
      }

      for (const item of sale.saleItems) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { increment: item.quantity } },
        });
      }

      await tx.sale.delete({ where: { id } });
    });

    return new NextResponse(null, { status: 204 });
  } catch (e: unknown) {
    if (
      typeof e === "object" &&
      e !== null &&
      "code" in e &&
      (e as { code: string }).code === "NOT_FOUND"
    ) {
      return NextResponse.json({ error: "Продажа не найдена" }, { status: 404 });
    }
    throw e;
  }
}

function isPrismaCode(e: unknown, code: string): boolean {
  return (
    typeof e === "object" &&
    e !== null &&
    "code" in e &&
    (e as { code: string }).code === code
  );
}
