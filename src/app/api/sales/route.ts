import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { saleSchema } from "@/lib/validations/sale";

export async function GET() {
  const sales = await prisma.sale.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      client: { select: { id: true, name: true } },
      saleItems: {
        include: { product: { select: { name: true, unit: true } } },
      },
    },
  });
  return NextResponse.json(sales);
}

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = saleSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten().fieldErrors },
      { status: 422 }
    );
  }

  const { items, ...rest } = parsed.data;
  const totalAmount = items.reduce(
    (sum, item) => sum + item.quantity * item.priceAtSale,
    0
  );

  const sale = await prisma.$transaction(async (tx) => {
    // Проверяем остатки внутри транзакции — защита от гонки запросов
    const productIds = items.map((i) => i.productId);
    const dbProducts = await tx.product.findMany({
      where: { id: { in: productIds } },
      select: { id: true, name: true, stock: true },
    });

    for (const item of items) {
      const product = dbProducts.find((p) => p.id === item.productId);
      if (!product) {
        throw Object.assign(new Error(`Товар не найден: ${item.productId}`), { code: "STOCK_ERROR" });
      }
      if (product.stock < item.quantity) {
        throw Object.assign(
          new Error(`Недостаточно товара "${product.name}": на складе ${product.stock}, запрошено ${item.quantity}`),
          { code: "STOCK_ERROR" }
        );
      }
    }

    const created = await tx.sale.create({
      data: {
        ...rest,
        status: "paid",
        totalAmount,
        paidAmount: totalAmount,
        saleItems: {
          create: items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            priceAtSale: item.priceAtSale,
          })),
        },
      },
    });

    for (const item of items) {
      await tx.product.update({
        where: { id: item.productId },
        data: { stock: { decrement: item.quantity } },
      });
    }

    return created;
  }).catch((e: unknown) => {
    if (typeof e === "object" && e !== null && (e as { code?: string }).code === "STOCK_ERROR") {
      return { _stockError: (e as Error).message };
    }
    throw e;
  });

  if ("_stockError" in sale) {
    return NextResponse.json({ error: sale._stockError }, { status: 422 });
  }

  return NextResponse.json(sale, { status: 201 });
}
