import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { productSchema } from "@/lib/validations/product";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q") ?? "";
  const category = searchParams.get("category") ?? "";

  const products = await prisma.product.findMany({
    where: {
      AND: [
        query
          ? {
              OR: [
                { name: { contains: query } },
                { sku: { contains: query } },
              ],
            }
          : {},
        category ? { category } : {},
      ],
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(products);
}

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = productSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten().fieldErrors },
      { status: 422 }
    );
  }

  try {
    const product = await prisma.product.create({ data: parsed.data });
    return NextResponse.json(product, { status: 201 });
  } catch (e: unknown) {
    if (
      typeof e === "object" &&
      e !== null &&
      "code" in e &&
      (e as { code: string }).code === "P2002"
    ) {
      return NextResponse.json(
        { error: { sku: ["Товар с таким SKU уже существует"] } },
        { status: 409 }
      );
    }
    throw e;
  }
}
