import { z } from "zod";

export const clientSchema = z.object({
  name: z.string().min(1, "Имя обязательно"),
  phone: z.string().optional(),
  address: z.string().optional(),
  type: z.enum(["retail", "wholesale", "contractor"]),
  notes: z.string().optional(),
});

export type ClientFormValues = z.infer<typeof clientSchema>;
