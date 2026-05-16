import { z } from "zod";

const saleItemSchema = z.object({
  productId: z.string().min(1, "Выберите товар"),
  quantity: z.coerce.number().min(0.1, "Количество должно быть больше 0"),
  priceAtSale: z.coerce.number().min(0),
});

export const saleSchema = z.object({
  clientId: z.string().optional(),
  status: z.enum(["paid", "debt", "partial"]).default("paid"),
  paidAmount: z.coerce.number().min(0).default(0),
  notes: z.string().optional(),
  items: z.array(saleItemSchema).min(1, "Добавьте хотя бы один товар"),
});

export type SaleFormValues = z.infer<typeof saleSchema>;
