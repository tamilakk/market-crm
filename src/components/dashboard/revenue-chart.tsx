"use client";

import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer,
} from "recharts";

interface RevenueChartProps {
  data: { date: string; revenue: number; debt: number }[];
}

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-border bg-card px-3 py-2.5 shadow-xl text-sm">
      <p className="text-muted-foreground mb-1.5">{label}</p>
      {payload.map((p: any) => (
        <div key={p.dataKey} className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full" style={{ background: p.color }} />
          <span className="text-muted-foreground">
            {p.dataKey === "revenue" ? "Выручка" : "Долг"}:
          </span>
          <span className="font-semibold text-foreground">
            {p.value.toLocaleString("ru-KZ")} ₸
          </span>
        </div>
      ))}
    </div>
  );
}

export function RevenueChart({ data }: RevenueChartProps) {
  if (data.every((d) => d.revenue === 0)) {
    return (
      <div className="flex h-48 items-center justify-center">
        <p className="text-sm text-muted-foreground">Нет данных за этот период</p>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={220}>
      <AreaChart data={data} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="gradRevenue" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="oklch(0.705 0.213 47.6)" stopOpacity={0.25} />
            <stop offset="95%" stopColor="oklch(0.705 0.213 47.6)" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="gradDebt" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="oklch(0.63 0.22 25)" stopOpacity={0.2} />
            <stop offset="95%" stopColor="oklch(0.63 0.22 25)" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.26 0.008 265)" vertical={false} />
        <XAxis
          dataKey="date"
          tick={{ fill: "oklch(0.55 0.010 265)", fontSize: 12 }}
          axisLine={false}
          tickLine={false}
          dy={8}
        />
        <YAxis
          tick={{ fill: "oklch(0.55 0.010 265)", fontSize: 12 }}
          axisLine={false}
          tickLine={false}
          tickFormatter={(v) => v >= 1000 ? `${(v / 1000).toFixed(0)}к` : v}
          width={48}
        />
        <Tooltip content={<CustomTooltip />} cursor={{ stroke: "oklch(0.26 0.008 265)" }} />
        <Area
          type="monotone"
          dataKey="revenue"
          stroke="oklch(0.705 0.213 47.6)"
          strokeWidth={2}
          fill="url(#gradRevenue)"
          dot={false}
          activeDot={{ r: 4, fill: "oklch(0.705 0.213 47.6)" }}
        />
        <Area
          type="monotone"
          dataKey="debt"
          stroke="oklch(0.63 0.22 25)"
          strokeWidth={1.5}
          fill="url(#gradDebt)"
          dot={false}
          activeDot={{ r: 4, fill: "oklch(0.63 0.22 25)" }}
          strokeDasharray="4 2"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
