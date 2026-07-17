"use client"

import { Bar, BarChart, CartesianGrid, LabelList, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"

type PoliciesByCategoryChartProps = {
  data: { category: string; count: number }[]
}

export function PoliciesByCategoryChart({ data }: PoliciesByCategoryChartProps) {
  return (
    <div className="h-70 w-full overflow-hidden">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical" margin={{ top: 4, right: 24, bottom: 4, left: 4 }}>
          <CartesianGrid horizontal={false} stroke="var(--color-border)" />
          <XAxis
            type="number"
            allowDecimals={false}
            tick={{ fill: "var(--color-muted-foreground)", fontSize: 12 }}
            axisLine={{ stroke: "var(--color-border)" }}
            tickLine={false}
          />
          <YAxis
            type="category"
            dataKey="category"
            width={130}
            tick={{ fill: "var(--color-foreground)", fontSize: 13 }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            wrapperStyle={{ pointerEvents: "none" }}
            allowEscapeViewBox={{ x: false, y: false }}
            cursor={{ fill: "var(--color-accent)" }}
            contentStyle={{
              background: "var(--color-card)",
              border: "1px solid var(--color-border)",
              borderRadius: "var(--radius-md)",
              fontSize: 13,
            }}
            labelStyle={{ color: "var(--color-foreground)" }}
            formatter={(value) => [Number(value), "Активных полисов"]}
          />
          <Bar dataKey="count" fill="var(--color-chart-1)" radius={[0, 4, 4, 0]} maxBarSize={28}>
            <LabelList dataKey="count" position="right" fill="var(--color-foreground)" fontSize={12} />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
