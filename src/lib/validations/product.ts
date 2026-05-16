import { z } from "zod";

export const productSchema = z.object({
  name: z.string().min(1, "Название обязательно"),
  sku: z.string().optional(),
  category: z.enum(["wallpaper", "laminate", "other"]),
  unit: z.enum(["piece", "roll", "box", "m2"]),
  purchasePrice: z.coerce.number().min(0, "Цена не может быть отрицательной"),
  sellPrice: z.coerce.number().min(0, "Цена не может быть отрицательной"),
  stock: z.coerce.number().min(0),
  minStock: z.coerce.number().min(0),
});

export type ProductFormValues = z.infer<typeof productSchema>;
