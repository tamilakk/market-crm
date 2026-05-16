import type { Client, Product, Sale, SaleItem } from "@/generated/prisma";

export type { Client, Product, Sale, SaleItem };

export type ClientType = "retail" | "wholesale" | "contractor";
export type ProductCategory = "wallpaper" | "laminate" | "other";
export type ProductUnit = "piece" | "roll" | "box" | "m2";
export type SaleStatus = "paid" | "debt" | "partial";

export type SaleWithItems = Sale & {
  client: Client | null;
  saleItems: (SaleItem & { product: Product })[];
};

export type ClientWithSales = Client & {
  sales: Sale[];
};
