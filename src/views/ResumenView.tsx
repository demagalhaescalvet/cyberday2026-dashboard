'use client'

import { useState, useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from '@/components/ui/chart'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  PieChart, Pie, Label, Cell,
} from 'recharts'
import revenueData from '@/data/revenue.json'
import unitsData from '@/data/units.json'

// Hex colors for the 5 chart slots (from Luma Blue oklch preset)
const CHART_COLORS = ['#8ec5ff', '#2b7fff', '#155dfc', '#1447e6', '#193cb8']

type MetricKey = 'revenue' | 'units'

const chartConfig = {
  revenue: { label: 'Ingresos (M)', color: '#2b7fff' },
  units: { label: 'Unidades', color: '#8ec5ff' },
} satisfies ChartConfig

// Build combined data
const chartData = revenueData.categories.map((cat, i) => ({
  name: cat,
  revenue: revenueData.revenue_millions[i] || 0,
  units: unitsData.units[i] || 0,
}))

// Top 5 categories for donut
const top5 = [...chartData].sort((a, b) => b.revenue - a.revenue).slice(0, 5)
const othersRevenue = chartData
  .filter((d) => !top5.includes(d))
  .reduce((s, d) => s + d.revenue, 0)
const donutData = [
  ...top5.map((d) => ({ name: d.name, value: d.revenue })),
  { name: 'Otros', value: othersRevenue },
]
const DONUT_COLORS = [...CHART_COLORS, '#64748b']

const donutConfig: ChartConfig = Object.fromEntries(
  donutData.map((d, i) => [
    d.name,
    { label: d.name, color: DONUT_COLORS[i] || '#64748b' },
  ])
)

// KPI data
const kpis = [
  { title: 'Revenue 2024', value: '$4.553M', sub: 'Cifra histórica', delta: null },
  { title: 'Revenue 2025', value: '$5.047M', sub: '+10.9% vs 2024', delta: '+10.9%' },
  { title: 'Target 2026', value: '$5.421M', sub: '+7.4% vs 2025', delta: '+7.4%' },
  { title: 'Ticket Promedio', value: '$290K', sub: 'Promedio por orden', delta: null },
  { title: 'Unidades 2026', value: '18,670', sub: '+1.7% vs 2025', delta: '+1.7%' },
  { title: 'Categorías', value: '17', sub: 'Apple + 3P', delta: null },
]

export function ResumenView() {
  const [activeMetric, setActiveMetric] = useState<MetricKey>('revenue')

  const total = useMemo(
    () => ({
      revenue: chartData.reduce((s, d) => s + d.revenue, 0),
      units: chartData.reduce((s, d) => s + d.units, 0),
    }),
    []
  )

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
        {kpis.map((kpi) => (
          <Card key={kpi.title}>
            <CardHeader className="pb-1 pt-4 px-4">
              <CardTitle className="text-xs font-medium text-muted-foreground">{kpi.title}</CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-4">
              <div className="text-2xl font-bold tracking-tight">{kpi.value}</div>
              <p className={`text-xs mt-1 ${kpi.delta ? 'text-emerald-400 font-medium' : 'text-muted-foreground'}`}>
                {kpi.sub}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Interactive Bar Chart — 2 cols */}
        <Card className="xl:col-span-2 py-0">
          <CardHeader className="flex flex-col items-stretch border-b p-0 sm:flex-row">
            <div className="flex flex-1 flex-col justify-center gap-1 px-6 pt-4 pb-3 sm:py-4">
              <CardTitle>Categorías CyberDay 2026</CardTitle>
              <CardDescription>Ingresos vs Unidades por categoría</CardDescription>
            </div>
            <div className="flex">
              {(['revenue', 'units'] as MetricKey[]).map((key) => (
                <button
                  key={key}
                  data-active={activeMetric === key}
                  className="relative z-30 flex flex-1 flex-col justify-center gap-1 border-t px-6 py-4 text-left even:border-l data-[active=true]:bg-muted/50 sm:border-t-0 sm:border-l sm:px-8 sm:py-6"
                  onClick={() => setActiveMetric(key)}
                >
                  <span className="text-xs text-muted-foreground">
                    {chartConfig[key].label}
                  </span>
                  <span className="text-lg leading-none font-bold sm:text-3xl">
                    {key === 'revenue' ? `$${total.revenue}M` : total.units.toLocaleString()}
                  </span>
                </button>
              ))}
            </div>
          </CardHeader>
          <CardContent className="px-2 pt-4 sm:p-6">
            <ChartContainer config={chartConfig} className="aspect-auto h-[350px] w-full">
              <BarChart
                accessibilityLayer
                data={chartData}
                margin={{ top: 10, right: 10, left: 0, bottom: 80 }}
              >
                <CartesianGrid vertical={false} className="stroke-border/50" />
                <XAxis
                  dataKey="name"
                  angle={-45}
                  textAnchor="end"
                  height={80}
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  tick={{ fontSize: 11 }}
                />
                <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 11 }} />
                <ChartTooltip
                  content={
                    <ChartTooltipContent
                      className="w-[160px]"
                      labelFormatter={(v) => v}
                      formatter={(value) =>
                        activeMetric === 'revenue'
                          ? `$${value}M`
                          : `${Number(value).toLocaleString()} uds`
                      }
                    />
                  }
                />
                <Bar
                  dataKey={activeMetric}
                  fill={chartConfig[activeMetric].color}
                  radius={[6, 6, 0, 0]}
                />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Donut Chart — 1 col */}
        <Card className="flex flex-col">
          <CardHeader className="items-center pb-0">
            <CardTitle>Distribución Revenue</CardTitle>
            <CardDescription>Top 5 categorías + Otros</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 pb-0">
            <ChartContainer config={donutConfig} className="mx-auto aspect-square max-h-[300px]">
              <PieChart accessibilityLayer>
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent hideLabel formatter={(v) => `$${v}M`} />}
                />
                <Pie
                  data={donutData}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={70}
                  strokeWidth={3}
                >
                  {donutData.map((_, i) => (
                    <Cell key={i} fill={DONUT_COLORS[i]} />
                  ))}
                  <Label
                    content={({ viewBox }) => {
                      if (viewBox && 'cx' in viewBox && 'cy' in viewBox) {
                        return (
                          <text x={viewBox.cx} y={viewBox.cy} textAnchor="middle" dominantBaseline="middle">
                            <tspan x={viewBox.cx} y={viewBox.cy} className="fill-foreground text-3xl font-bold">
                              ${total.revenue}M
                            </tspan>
                            <tspan x={viewBox.cx} y={(viewBox.cy || 0) + 24} className="fill-muted-foreground text-sm">
                              Total
                            </tspan>
                          </text>
                        )
                      }
                    }}
                  />
                </Pie>
              </PieChart>
            </ChartContainer>
          </CardContent>
          {/* Legend */}
          <div className="px-6 pb-4 grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
            {donutData.map((d, i) => (
              <div key={d.name} className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: DONUT_COLORS[i] }} />
                <span className="text-muted-foreground truncate">{d.name}</span>
                <span className="ml-auto font-medium">${d.value}M</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  )
}
