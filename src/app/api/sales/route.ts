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

  // Проверяем остатки до создания продажи
  const productIds = items.map((i) => i.productId);
  const dbProducts = await prisma.product.findMany({
    where: { id: { in: productIds } },
    select: { id: true, name: true, stock: true },
  });

  for (const item of items) {
    const product = dbProducts.find((p) => p.id === item.productId);
    if (!product) {
      return NextResponse.json(
        { error: `Товар не найден: ${item.productId}` },
        { status: 422 }
      );
    }
    if (product.stock < item.quantity) {
      return NextResponse.json(
        {
          error: `Недостаточно товара "${product.name}": на складе ${product.stock}, запрошено ${item.quantity}`,
        },
        { status: 422 }
      );
    }
  }

  const sale = await prisma.$transaction(async (tx) => {
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
  });

  return NextResponse.json(sale, { status: 201 });
}
