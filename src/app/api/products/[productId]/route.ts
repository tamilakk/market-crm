import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { productSchema } from "@/lib/validations/product";

type Params = { params: Promise<{ productId: string }> };

export async function GET(_req: Request, { params }: Params) {
  const { productId: id } = await params;

  const product = await prisma.product.findUnique({
    where: { id },
    include: { _count: { select: { saleItems: true } } },
  });

  if (!product) {
    return NextResponse.json({ error: "Товар не найден" }, { status: 404 });
  }

  return NextResponse.json(product);
}

export async function PUT(request: Request, { params }: Params) {
  const { productId: id } = await params;
  const body = await request.json();
  const parsed = productSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten().fieldErrors },
      { status: 422 }
    );
  }

  try {
    const product = await prisma.product.update({
      where: { id },
      data: parsed.data,
    });
    return NextResponse.json(product);
  } catch (e: unknown) {
    if (isPrismaCode(e, "P2025")) {
      return NextResponse.json({ error: "Товар не найден" }, { status: 404 });
    }
    throw e;
  }
}

export async function DELETE(_req: Request, { params }: Params) {
  const { productId: id } = await params;

  try {
    await prisma.product.delete({ where: { id } });
    return new NextResponse(null, { status: 204 });
  } catch (e: unknown) {
    if (isPrismaCode(e, "P2025")) {
      return NextResponse.json({ error: "Товар не найден" }, { status: 404 });
    }
    if (isPrismaCode(e, "P2003")) {
      return NextResponse.json(
        { error: "Невозможно удалить товар с историей продаж" },
        { status: 409 }
      );
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
