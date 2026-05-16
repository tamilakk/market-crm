import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma";
import { PrismaLibSql } from "@prisma/adapter-libsql";
import { subDays, subHours, subMinutes } from "date-fns";

const url = process.env.DATABASE_URL;
if (!url) throw new Error("DATABASE_URL is not set");
const adapter = new PrismaLibSql({ url });
const prisma = new PrismaClient({ adapter } as any);

async function main() {
  console.log("🌱 Очищаем базу...");
  await prisma.saleItem.deleteMany();
  await prisma.sale.deleteMany();
  await prisma.product.deleteMany();
  await prisma.client.deleteMany();

  // ── Товары ──────────────────────────────────────────────────────
  console.log("📦 Создаём товары...");
  const products = await Promise.all([
    // Обои
    prisma.product.create({ data: { name: "Обои виниловые «Авангард» бежевые", sku: "WP-001", category: "wallpaper", unit: "roll", purchasePrice: 1800, sellPrice: 2800, stock: 42, minStock: 10 } }),
    prisma.product.create({ data: { name: "Обои флизелиновые «Мозаика» серые", sku: "WP-002", category: "wallpaper", unit: "roll", purchasePrice: 2200, sellPrice: 3400, stock: 28, minStock: 10 } }),
    prisma.product.create({ data: { name: "Обои бумажные «Классика» белые", sku: "WP-003", category: "wallpaper", unit: "roll", purchasePrice: 900, sellPrice: 1500, stock: 3, minStock: 10 } }),
    prisma.product.create({ data: { name: "Обои виниловые «Лофт» кирпич", sku: "WP-004", category: "wallpaper", unit: "roll", purchasePrice: 2600, sellPrice: 3900, stock: 19, minStock: 8 } }),
    prisma.product.create({ data: { name: "Обои флизелиновые «Прованс» голубые", sku: "WP-005", category: "wallpaper", unit: "roll", purchasePrice: 2400, sellPrice: 3600, stock: 0, minStock: 8 } }),
    // Ламинат
    prisma.product.create({ data: { name: "Ламинат Quick-Step 32кл дуб натуральный", sku: "LM-001", category: "laminate", unit: "m2", purchasePrice: 3200, sellPrice: 4800, stock: 120, minStock: 30 } }),
    prisma.product.create({ data: { name: "Ламинат Egger 31кл сосна лофт", sku: "LM-002", category: "laminate", unit: "m2", purchasePrice: 2100, sellPrice: 3200, stock: 85, minStock: 30 } }),
    prisma.product.create({ data: { name: "Ламинат Tarkett 33кл ясень серый", sku: "LM-003", category: "laminate", unit: "m2", purchasePrice: 4100, sellPrice: 6000, stock: 48, minStock: 20 } }),
    prisma.product.create({ data: { name: "Ламинат Berry Floor 32кл венге", sku: "LM-004", category: "laminate", unit: "m2", purchasePrice: 2800, sellPrice: 4200, stock: 12, minStock: 20 } }),
    // Стройматериалы
    prisma.product.create({ data: { name: "Клей для обоев Quelyd Extra", sku: "GL-001", category: "other", unit: "piece", purchasePrice: 650, sellPrice: 1100, stock: 35, minStock: 10 } }),
    prisma.product.create({ data: { name: "Грунтовка Knauf Tiefengrund 10л", sku: "PR-001", category: "other", unit: "piece", purchasePrice: 3800, sellPrice: 5500, stock: 8, minStock: 5 } }),
    prisma.product.create({ data: { name: "Подложка под ламинат 3мм (рулон 10м²)", sku: "UL-001", category: "other", unit: "roll", purchasePrice: 800, sellPrice: 1400, stock: 25, minStock: 10 } }),
  ]);

  const [wpBeige, wpGray, wpWhite, wpBrick, wpBlue, lmOak, lmPine, lmAsh, lmWenge, glue, primer, underlay] = products;

  // ── Клиенты ─────────────────────────────────────────────────────
  console.log("👥 Создаём клиентов...");
  const clients = await Promise.all([
    prisma.client.create({ data: { name: "Арман Сейткали", phone: "+7 777 100 22 33", address: "Қарағанды, мкр Юбилейный 14-5", type: "retail", notes: "Постоянный покупатель, берёт обои и ламинат" } }),
    prisma.client.create({ data: { name: "ТОО «Ремонт Плюс»", phone: "+7 705 300 11 55", address: "Қарағанды, ул. Ерубаева 8", type: "contractor", notes: "Строительная бригада, крупные заказы, просит скидку" } }),
    prisma.client.create({ data: { name: "Гүлнара Бекова", phone: "+7 747 222 44 66", address: "Қарағанды, ул. Гоголя 31-12", type: "retail" } }),
    prisma.client.create({ data: { name: "Нуржан Касымов", phone: "+7 700 555 88 99", address: "Темиртау, ул. Металлургов 5", type: "wholesale", notes: "Перепродаёт в Темиртау, берёт партиями" } }),
    prisma.client.create({ data: { name: "Айгуль Дюсенова", phone: "+7 771 444 00 77", type: "retail" } }),
    prisma.client.create({ data: { name: "ИП Рыбалко С.В.", phone: "+7 702 666 33 11", address: "Қарағанды, Михайловка", type: "contractor", notes: "Частный мастер, заказывает под конкретные объекты" } }),
    prisma.client.create({ data: { name: "Данияр Ахметов", phone: "+7 776 111 55 22", type: "retail" } }),
  ]);

  const [arman, remontPlus, gulnara, nurzhan, aigul, rybalko, daniyar] = clients;

  // ── Продажи ──────────────────────────────────────────────────────
  console.log("🧾 Создаём продажи...");
  const now = new Date();

  const salesData = [
    // 60 дней назад
    { daysAgo: 59, client: nurzhan, items: [{ product: lmOak, qty: 30, price: 4800 }, { product: underlay, qty: 3, price: 1400 }], paid: 0, status: "debt" as const },
    { daysAgo: 55, client: remontPlus, items: [{ product: wpBrick, qty: 15, price: 3900 }, { product: glue, qty: 6, price: 1100 }], paid: 60000, status: "paid" as const },
    // 45 дней назад
    { daysAgo: 46, client: arman, items: [{ product: wpBeige, qty: 8, price: 2800 }, { product: glue, qty: 2, price: 1100 }], paid: 24600, status: "paid" as const },
    { daysAgo: 44, client: gulnara, items: [{ product: wpGray, qty: 6, price: 3400 }, { product: glue, qty: 2, price: 1100 }], paid: 10000, status: "partial" as const },
    { daysAgo: 42, client: remontPlus, items: [{ product: lmPine, qty: 45, price: 3200 }, { product: underlay, qty: 5, price: 1400 }], paid: 0, status: "debt" as const },
    // 30 дней назад
    { daysAgo: 32, client: rybalko, items: [{ product: wpBeige, qty: 12, price: 2800 }, { product: wpBrick, qty: 8, price: 3900 }, { product: glue, qty: 4, price: 1100 }], paid: 73600, status: "paid" as const },
    { daysAgo: 30, client: nurzhan, items: [{ product: lmOak, qty: 50, price: 4600 }, { product: underlay, qty: 6, price: 1400 }], paid: 100000, status: "partial" as const },
    { daysAgo: 28, client: arman, items: [{ product: lmPine, qty: 20, price: 3200 }], paid: 64000, status: "paid" as const },
    { daysAgo: 27, client: null, items: [{ product: wpWhite, qty: 5, price: 1500 }, { product: glue, qty: 1, price: 1100 }], paid: 8600, status: "paid" as const },
    // 2 недели назад
    { daysAgo: 15, client: aigul, items: [{ product: wpGray, qty: 10, price: 3400 }, { product: wpBlue, qty: 5, price: 3600 }, { product: glue, qty: 3, price: 1100 }], paid: 55000, status: "partial" as const },
    { daysAgo: 14, client: remontPlus, items: [{ product: lmAsh, qty: 60, price: 5800 }, { product: underlay, qty: 7, price: 1400 }], paid: 0, status: "debt" as const },
    { daysAgo: 13, client: daniyar, items: [{ product: primer, qty: 2, price: 5500 }, { product: underlay, qty: 2, price: 1400 }], paid: 13800, status: "paid" as const },
    { daysAgo: 12, client: rybalko, items: [{ product: wpBrick, qty: 20, price: 3900 }], paid: 78000, status: "paid" as const },
    { daysAgo: 10, client: arman, items: [{ product: lmOak, qty: 18, price: 4800 }, { product: underlay, qty: 2, price: 1400 }], paid: 43200, status: "partial" as const },
    // Последняя неделя
    { daysAgo: 6, client: gulnara, items: [{ product: wpBeige, qty: 9, price: 2800 }, { product: glue, qty: 2, price: 1100 }], paid: 27400, status: "paid" as const },
    { daysAgo: 5, client: null, items: [{ product: lmPine, qty: 12, price: 3200 }, { product: underlay, qty: 2, price: 1400 }], paid: 41200, status: "paid" as const },
    { daysAgo: 4, client: nurzhan, items: [{ product: lmWenge, qty: 25, price: 4200 }], paid: 60000, status: "partial" as const },
    { daysAgo: 3, client: remontPlus, items: [{ product: wpGray, qty: 18, price: 3400 }, { product: wpBrick, qty: 10, price: 3900 }, { product: glue, qty: 6, price: 1100 }], paid: 107600, status: "paid" as const },
    { daysAgo: 2, client: aigul, items: [{ product: wpBeige, qty: 7, price: 2800 }], paid: 0, status: "debt" as const },
    { daysAgo: 1, client: daniyar, items: [{ product: lmAsh, qty: 15, price: 6000 }, { product: underlay, qty: 2, price: 1400 }], paid: 92800, status: "paid" as const },
    { daysAgo: 0, client: arman, items: [{ product: wpBlue, qty: 8, price: 3600 }, { product: glue, qty: 2, price: 1100 }], paid: 31000, status: "paid" as const },
  ];

  for (const [i, s] of salesData.entries()) {
    const totalAmount = s.items.reduce((sum, item) => sum + item.qty * item.price, 0);
    const createdAt = subHours(subDays(now, s.daysAgo), Math.floor(Math.random() * 8) + 8);

    await prisma.sale.create({
      data: {
        clientId: s.client?.id ?? null,
        status: s.status,
        totalAmount,
        paidAmount: s.paid,
        createdAt,
        updatedAt: createdAt,
        saleItems: {
          create: s.items.map((item) => ({
            productId: item.product.id,
            quantity: item.qty,
            priceAtSale: item.price,
          })),
        },
      },
    });
  }

  console.log(`✅ Готово!`);
  console.log(`   ${products.length} товаров`);
  console.log(`   ${clients.length} клиентов`);
  console.log(`   ${salesData.length} продаж`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
