"use client";

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell,
} from "recharts";

interface TopProductsChartProps {
  data: { name: string; revenue: number; qty: number }[];
}

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-border bg-card px-3 py-2.5 shadow-xl text-sm">
      <p className="font-medium text-foreground mb-1">{label}</p>
      <p className="text-muted-foreground">
        Выручка: <span className="text-foreground font-semibold">
          {payload[0]?.value?.toLocaleString("ru-KZ")} ₸
        </span>
      </p>
      <p className="text-muted-foreground">
        Продано: <span className="text-foreground font-semibold">{payload[0]?.payload?.qty} ед.</span>
      </p>
    </div>
  );
}

export function TopProductsChart({ data }: TopProductsChartProps) {
  if (!data.length) {
    return (
      <div className="flex h-48 items-center justify-center">
        <p className="text-sm text-muted-foreground">Нет данных</p>
      </div>
    );
  }

  const colors = [
    "oklch(0.705 0.213 47.6)",
    "oklch(0.65 0.18 47.6)",
    "oklch(0.60 0.15 47.6)",
    "oklch(0.50 0.12 47.6)",
    "oklch(0.42 0.10 47.6)",
  ];

  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data} layout="vertical" margin={{ top: 0, right: 12, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.26 0.008 265)" horizontal={false} />
        <XAxis
          type="number"
          tick={{ fill: "oklch(0.55 0.010 265)", fontSize: 12 }}
          axisLine={false}
          tickLine={false}
          tickFormatter={(v) => v >= 1000 ? `${(v / 1000).toFixed(0)}к` : v}
        />
        <YAxis
          type="category"
          dataKey="name"
          width={110}
          tick={{ fill: "oklch(0.80 0 0)", fontSize: 12 }}
          axisLine={false}
          tickLine={false}
          tickFormatter={(v) => v.length > 16 ? v.slice(0, 15) + "…" : v}
        />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: "oklch(0.18 0.006 265)" }} />
        <Bar dataKey="revenue" radius={[0, 4, 4, 0]}>
          {data.map((_, i) => (
            <Cell key={i} fill={colors[i % colors.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
