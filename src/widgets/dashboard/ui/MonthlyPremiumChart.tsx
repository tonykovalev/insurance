"use client"

import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"

import { formatCurrency } from "@/shared/lib/format"

type MonthlyPremiumChartProps = {
  data: { month: string; amount: number }[]
}

function formatCompact(value: number) {
  return new Intl.NumberFormat("ru-RU", { notation: "compact", maximumFractionDigits: 1 }).format(value)
}

export function MonthlyPremiumChart({ data }: MonthlyPremiumChartProps) {
  return (
    <div className="h-70 w-full overflow-hidden">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 8, right: 16, bottom: 4, left: 4 }}>
          <defs>
            <linearGradient id="premiumFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--color-chart-1)" stopOpacity={0.35} />
              <stop offset="100%" stopColor="var(--color-chart-1)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid vertical={false} stroke="var(--color-border)" />
          <XAxis
            dataKey="month"
            tick={{ fill: "var(--color-muted-foreground)", fontSize: 12 }}
            axisLine={{ stroke: "var(--color-border)" }}
            tickLine={false}
          />
          <YAxis
            tickFormatter={formatCompact}
            tick={{ fill: "var(--color-muted-foreground)", fontSize: 12 }}
            axisLine={false}
            tickLine={false}
            width={48}
          />
          <Tooltip
            wrapperStyle={{ pointerEvents: "none" }}
            allowEscapeViewBox={{ x: false, y: false }}
            cursor={{ stroke: "var(--color-chart-1)", strokeWidth: 1 }}
            contentStyle={{
              background: "var(--color-card)",
              border: "1px solid var(--color-border)",
              borderRadius: "var(--radius-md)",
              fontSize: 13,
            }}
            labelStyle={{ color: "var(--color-foreground)" }}
            formatter={(value) => [formatCurrency(Number(value)), "Сумма полисов"]}
          />
          <Area
            type="monotone"
            dataKey="amount"
            stroke="var(--color-chart-1)"
            strokeWidth={2}
            fill="url(#premiumFill)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
