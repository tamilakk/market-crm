import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { clientSchema } from "@/lib/validations/client";

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: Request, { params }: Params) {
  const { id } = await params;

  const client = await prisma.client.findUnique({
    where: { id },
    include: {
      sales: {
        orderBy: { createdAt: "desc" },
        take: 10,
      },
    },
  });

  if (!client) {
    return NextResponse.json({ error: "Клиент не найден" }, { status: 404 });
  }

  return NextResponse.json(client);
}

export async function PUT(request: Request, { params }: Params) {
  const { id } = await params;
  const body = await request.json();
  const parsed = clientSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten().fieldErrors },
      { status: 422 }
    );
  }

  const client = await prisma.client.update({
    where: { id },
    data: parsed.data,
  });

  return NextResponse.json(client);
}

export async function DELETE(_req: Request, { params }: Params) {
  const { id } = await params;
  await prisma.client.delete({ where: { id } });
  return new NextResponse(null, { status: 204 });
}
