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
