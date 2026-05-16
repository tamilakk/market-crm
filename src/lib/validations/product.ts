import { z } from "zod";

export const productSchema = z.object({
  name: z.string().min(1, "Название обязательно"),
  sku: z.string().optional(),
  category: z.enum(["wallpaper", "laminate", "other"]),
  unit: z.enum(["piece", "roll", "box", "m2"]),
  // z.number() вместо z.coerce — тип числа в форме задаём через valueAsNumber
  purchasePrice: z.number().min(0, "Цена не может быть отрицательной"),
  sellPrice: z.number().min(0, "Цена не может быть отрицательной"),
  stock: z.number().min(0),
  minStock: z.number().min(0),
});

export type ProductFormValues = z.infer<typeof productSchema>;
