'use client'

import { useState, useMemo } from 'react'
import type { PieSectorShapeProps } from 'recharts/types/polar/Pie'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { ChartContainer, ChartStyle, ChartTooltip, ChartTooltipContent, type ChartConfig } from '@/components/ui/chart'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  PieChart, Pie, Label, Cell, Sector,
  AreaChart, Area, LabelList, LineChart, Line,
  ReferenceLine,
} from 'recharts'
import revenueData from '@/data/revenue.json'
import unitsData from '@/data/units.json'
import launchData from '@/data/launch-tracker.json'
import sensitivityData from '@/data/sensitivity.json'
import multiYearData from '@/data/multi-year.json'
import iphoneBreakdown from '@/data/iphone-breakdown.json'
import dailyCurve from '@/data/daily-curve.json'
import aspComparison from '@/data/asp-comparison.json'
import orderMetrics from '@/data/order-metrics.json'
import channelMix from '@/data/channel-mix.json'
import hourlyDist from '@/data/hourly-distribution.json'
import regionalData from '@/data/regional.json'
import gaTraffic from '@/data/ga-traffic.json'
import gaChannels from '@/data/ga-channels.json'
import klaviyoCampaigns from '@/data/klaviyo-campaigns.json'

// Hex colors for the 5 chart slots
const CHART_COLORS = ['#8ec5ff', '#2b7fff', '#155dfc', '#1447e6', '#193cb8']

// Extended palette for stacked area (top 6 + others)
const STACK_COLORS = ['#2b7fff', '#155dfc', '#8ec5ff', '#1447e6', '#193cb8', '#64748b', '#94a3b8']

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

// KPI data — enhanced with composition shift info
const kpis = [
  { title: 'Revenue 2024', value: '$4.553M', sub: 'Cifra histórica', delta: null, isTarget: false },
  { title: 'Revenue 2025', value: '$5.047M', sub: '+10.9% vs 2024', delta: '+10.9%', isTarget: false },
  { title: 'Target 2026', value: '$5.421M', sub: '+7.4% vs 2025', delta: '+7.4%', isTarget: true },
  { title: 'Líder 2026', value: 'Mac NB', sub: '$1,080M — era #3 en 2025', delta: '↑ de #3', isTarget: false },
  { title: 'Unidades 2026', value: '18,670', sub: '+8.4% vs 2025', delta: '+8.4%', isTarget: false },
  { title: 'Mayor Cambio', value: 'iPhone Pro', sub: '-64% revenue vs 2025', delta: '-64%', isTarget: false },
]

// Revenue total comparison data (grouped bar)
const totalComparisonData = [
  { year: '2024', revenue: 4553 },
  { year: '2025', revenue: 5047 },
  { year: '2026 Target', revenue: 5421 },
]

// Build per-category revenue growth data (2025 → 2026)
const growthData = multiYearData.categories.map((cat, i) => {
  const rev2025 = multiYearData.revenue['2025'][i] || 0
  const rev2026 = multiYearData.revenue['2026_target'][i] || 0
  const growth = rev2025 > 0 ? ((rev2026 - rev2025) / rev2025) * 100 : (rev2026 > 0 ? 999 : 0)
  return {
    name: cat,
    growth: Math.round(growth * 10) / 10,
    rev2025,
    rev2026,
    delta: rev2026 - rev2025,
  }
}).filter(d => d.rev2025 > 10 || d.rev2026 > 10) // filter out tiny categories
  .sort((a, b) => b.growth - a.growth)

// Build mix-shift stacked area data (top 6 categories + Otros)
const buildMixShiftData = () => {
  // Find top 6 by 2026 revenue
  const catRevenue2026 = multiYearData.categories.map((cat, i) => ({
    name: cat,
    idx: i,
    rev2026: multiYearData.revenue['2026_target'][i] || 0,
  }))
  const sortedCats = [...catRevenue2026].sort((a, b) => b.rev2026 - a.rev2026)
  const top6 = sortedCats.slice(0, 6)
  const top6Names = top6.map(c => c.name)

  const years = ['2024', '2025', '2026_target'] as const
  const yearLabels = ['2024', '2025', '2026']

  return yearLabels.map((label, yi) => {
    const yearKey = years[yi]
    const entry: Record<string, number | string> = { year: label }

    // Calculate totals for this year
    const totalRev = multiYearData.revenue[yearKey].reduce((s: number, v: number) => s + v, 0)

    // Add top 6 categories as % of total
    let top6Sum = 0
    for (const cat of top6) {
      const rev = multiYearData.revenue[yearKey][cat.idx] || 0
      const pct = totalRev > 0 ? (rev / totalRev) * 100 : 0
      entry[cat.name] = Math.round(pct * 10) / 10
      top6Sum += rev
    }

    // Otros
    const otrosRev = totalRev - top6Sum
    entry['Otros'] = totalRev > 0 ? Math.round((otrosRev / totalRev) * 1000) / 10 : 0

    return entry
  })
}

const mixShiftData = buildMixShiftData()
const mixShiftCategories = Object.keys(mixShiftData[0] || {}).filter(k => k !== 'year')

const mixShiftConfig: ChartConfig = Object.fromEntries(
  mixShiftCategories.map((cat, i) => [
    cat,
    { label: cat, color: STACK_COLORS[i] || '#94a3b8' },
  ])
)

// Revenue trend data
const trendConfig: ChartConfig = {
  '2024': { label: '2024', color: '#8ec5ff' },
  '2025': { label: '2025', color: '#2b7fff' },
  '2026 Target': { label: '2026 Target', color: '#155dfc' },
} satisfies ChartConfig

// Custom active sector renderer for interactive donut
const renderActiveShape = (props: PieSectorShapeProps & { outerRadius?: number }) => {
  const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill } = props

  return (
    <>
      <Sector
        {...props}
        outerRadius={(outerRadius || 0) + 10}
        fill={fill}
      />
      <Sector
        cx={cx}
        cy={cy}
        startAngle={startAngle}
        endAngle={endAngle}
        innerRadius={innerRadius}
        outerRadius={(outerRadius || 0) + 10}
        fill={fill}
        opacity={0.15}
      />
    </>
  )
}

export function ResumenView() {
  const [activeMetric, setActiveMetric] = useState<MetricKey>('revenue')
  const [selectedCategory, setSelectedCategory] = useState<string>(donutData[0]?.name || '')

  const total = useMemo(
    () => ({
      revenue: chartData.reduce((s, d) => s + d.revenue, 0),
      units: chartData.reduce((s, d) => s + d.units, 0),
    }),
    []
  )

  // Sort bar data descending by active metric
  const sortedBarData = useMemo(
    () => [...chartData].sort((a, b) => b[activeMetric] - a[activeMetric]),
    [activeMetric]
  )

  // Get selected category data for donut center
  const selectedCategoryData = donutData.find((d) => d.name === selectedCategory)
  const selectedValue = selectedCategoryData?.value || 0

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
        {kpis.map((kpi) => (
          <Card
            key={kpi.title}
            className={kpi.isTarget ? 'ring-1 ring-primary' : ''}
          >
            <CardHeader className="pb-1 pt-4 px-4">
              <CardTitle className="text-xs font-medium text-muted-foreground">{kpi.title}</CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-4">
              <div className="text-2xl font-bold tracking-tight">{kpi.value}</div>
              <p className={`text-xs mt-1 ${
                kpi.delta && kpi.delta.startsWith('+') ? 'text-emerald-400 font-medium' :
                kpi.delta && kpi.delta.startsWith('-') ? 'text-red-400 font-medium' :
                kpi.delta ? 'text-blue-400 font-medium' :
                'text-muted-foreground'
              }`}>
                {kpi.sub}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Revenue Total Comparison — Grouped Bars 2024 / 2025 / 2026 */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="border-b px-6 py-4">
            <CardTitle>Revenue Total por Año</CardTitle>
            <CardDescription>Comparación directa 2024 → 2025 → 2026 Target</CardDescription>
          </CardHeader>
          <CardContent className="px-2 pt-4 sm:p-6">
            <ChartContainer
              config={{
                revenue: { label: 'Revenue ($M)', color: '#2b7fff' },
              } satisfies ChartConfig}
              className="aspect-auto h-[250px] w-full"
            >
              <BarChart
                accessibilityLayer
                data={totalComparisonData}
                margin={{ top: 20, right: 30, left: 0, bottom: 10 }}
              >
                <CartesianGrid vertical={false} className="stroke-border/50" />
                <XAxis dataKey="year" tickLine={false} axisLine={false} tick={{ fontSize: 12 }} />
                <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 12 }} domain={[0, 6000]} />
                <ChartTooltip
                  content={
                    <ChartTooltipContent
                      className="w-[160px]"
                      labelFormatter={(v) => v}
                      formatter={(value) => `$${value}M`}
                    />
                  }
                />
                <Bar dataKey="revenue" radius={[6, 6, 0, 0]}>
                  {totalComparisonData.map((entry, i) => (
                    <Cell key={entry.year} fill={['#8ec5ff', '#2b7fff', '#155dfc'][i]} />
                  ))}
                  <LabelList
                    dataKey="revenue"
                    position="top"
                    fill="currentColor"
                    formatter={(v: number) => `$${v}M`}
                    fontSize={13}
                    fontWeight={600}
                  />
                </Bar>
              </BarChart>
            </ChartContainer>
          </CardContent>
          <CardFooter className="flex-col items-start gap-1 text-sm pt-0 px-6 pb-4">
            <div className="flex gap-2 font-medium leading-none">
              <span className="text-emerald-400">+$868M</span> en 2 años (+19.1%)
            </div>
          </CardFooter>
        </Card>

        {/* Mix Shift — 100% Stacked Area */}
        <Card>
          <CardHeader className="border-b px-6 py-4">
            <CardTitle>Evolución del Mix de Revenue</CardTitle>
            <CardDescription>Cómo cambia la composición (%) por categoría entre años</CardDescription>
          </CardHeader>
          <CardContent className="px-2 pt-4 sm:p-6">
            <ChartContainer config={mixShiftConfig} className="aspect-auto h-[250px] w-full">
              <AreaChart
                accessibilityLayer
                data={mixShiftData}
                stackOffset="expand"
                margin={{ top: 10, right: 30, left: 0, bottom: 10 }}
              >
                <CartesianGrid vertical={false} className="stroke-border/50" />
                <XAxis dataKey="year" tickLine={false} axisLine={false} tick={{ fontSize: 12 }} />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 11 }}
                  tickFormatter={(v) => `${Math.round(v * 100)}%`}
                />
                <ChartTooltip
                  content={
                    <ChartTooltipContent
                      className="w-[180px]"
                      labelFormatter={(v) => v}
                      formatter={(value) => `${Number(value).toFixed(1)}%`}
                    />
                  }
                />
                {mixShiftCategories.map((cat, i) => (
                  <Area
                    key={cat}
                    type="monotone"
                    dataKey={cat}
                    stackId="1"
                    stroke={STACK_COLORS[i] || '#94a3b8'}
                    fill={STACK_COLORS[i] || '#94a3b8'}
                    fillOpacity={0.85}
                  />
                ))}
              </AreaChart>
            </ChartContainer>
          </CardContent>
          <CardFooter className="flex-col items-start gap-1 text-sm pt-0 px-6 pb-4">
            <div className="flex gap-2 font-medium leading-none text-xs text-muted-foreground">
              Mac NB pasa de 13.5% → 19.9% | iPhone Pro cae de 23.7% → 7.9%
            </div>
          </CardFooter>
        </Card>
      </div>

      {/* Daily Revenue Curve — Shape of CyberDay */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="border-b px-6 py-4">
            <CardTitle>Curva Diaria de Revenue</CardTitle>
            <CardDescription>Distribución por día del evento — Día 1 concentra &gt;50%</CardDescription>
          </CardHeader>
          <CardContent className="px-2 pt-4 sm:p-6">
            {(() => {
              const curveData = dailyCurve['2024'].days.map((day, i) => ({
                day,
                '2024': dailyCurve['2024'].revenue[i],
                '2025': dailyCurve['2025'].revenue[i],
              }))
              return (
                <ChartContainer
                  config={{
                    '2024': { label: '2024', color: '#8ec5ff' },
                    '2025': { label: '2025', color: '#2b7fff' },
                  } satisfies ChartConfig}
                  className="aspect-auto h-[250px] w-full"
                >
                  <BarChart
                    accessibilityLayer
                    data={curveData}
                    margin={{ top: 20, right: 30, left: 0, bottom: 10 }}
                  >
                    <CartesianGrid vertical={false} className="stroke-border/50" />
                    <XAxis dataKey="day" tickLine={false} axisLine={false} tick={{ fontSize: 12 }} />
                    <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 12 }} />
                    <ChartTooltip
                      content={
                        <ChartTooltipContent
                          className="w-[180px]"
                          labelFormatter={(v) => v}
                          formatter={(value) => `$${value}M`}
                        />
                      }
                    />
                    <Bar dataKey="2024" fill="#8ec5ff" radius={[6, 6, 0, 0]}>
                      <LabelList dataKey="2024" position="top" fill="currentColor" formatter={(v: number) => `$${v}M`} fontSize={10} />
                    </Bar>
                    <Bar dataKey="2025" fill="#2b7fff" radius={[6, 6, 0, 0]}>
                      <LabelList dataKey="2025" position="top" fill="currentColor" formatter={(v: number) => `$${v}M`} fontSize={10} />
                    </Bar>
                  </BarChart>
                </ChartContainer>
              )
            })()}
          </CardContent>
          <CardFooter className="flex-col items-start gap-1 text-sm pt-0 px-6 pb-4">
            <div className="text-xs text-muted-foreground">
              Día 1: <span className="font-medium text-foreground">54% (2024)</span> → <span className="font-medium text-foreground">51% (2025)</span> del revenue total
            </div>
          </CardFooter>
        </Card>

        {/* ASP Comparison by Category */}
        <Card>
          <CardHeader className="border-b px-6 py-4">
            <CardTitle>Ticket Promedio por Categoría</CardTitle>
            <CardDescription>ASP 2024 vs 2025 (CLP miles) — explica divergencia revenue vs unidades</CardDescription>
          </CardHeader>
          <CardContent className="px-2 pt-4 sm:p-6">
            {(() => {
              const aspData = aspComparison.categories.map((cat, i) => ({
                name: cat,
                asp2024: aspComparison.asp_2024[i],
                asp2025: aspComparison.asp_2025[i],
                change: Math.round(((aspComparison.asp_2025[i] - aspComparison.asp_2024[i]) / aspComparison.asp_2024[i]) * 100),
              })).sort((a, b) => b.asp2025 - a.asp2025)
              return (
                <ChartContainer
                  config={{
                    asp2024: { label: 'ASP 2024', color: '#8ec5ff' },
                    asp2025: { label: 'ASP 2025', color: '#2b7fff' },
                  } satisfies ChartConfig}
                  className="aspect-auto h-[250px] w-full"
                >
                  <BarChart
                    accessibilityLayer
                    data={aspData}
                    layout="vertical"
                    margin={{ top: 10, right: 70, left: 90, bottom: 10 }}
                  >
                    <CartesianGrid horizontal={false} className="stroke-border/50" />
                    <XAxis type="number" tickLine={false} axisLine={false} tick={{ fontSize: 11 }} tickFormatter={(v) => `$${v}K`} />
                    <YAxis type="category" dataKey="name" tickLine={false} axisLine={false} tick={{ fontSize: 11 }} width={85} />
                    <ChartTooltip
                      content={
                        <ChartTooltipContent
                          className="w-[200px]"
                          labelFormatter={(v) => v}
                          formatter={(value, name) => `$${value}K`}
                        />
                      }
                    />
                    <Bar dataKey="asp2024" fill="#8ec5ff" radius={[0, 6, 6, 0]} barSize={8} />
                    <Bar dataKey="asp2025" fill="#2b7fff" radius={[0, 6, 6, 0]} barSize={8}>
                      <LabelList
                        dataKey="change"
                        position="right"
                        fill="currentColor"
                        formatter={(v: number) => `${v > 0 ? '+' : ''}${v}%`}
                        fontSize={10}
                      />
                    </Bar>
                  </BarChart>
                </ChartContainer>
              )
            })()}
          </CardContent>
          <CardFooter className="flex-col items-start gap-1 text-sm pt-0 px-6 pb-4">
            <div className="text-xs text-muted-foreground">
              Mac NB <span className="text-emerald-400 font-medium">+39%</span> | iPad <span className="text-emerald-400 font-medium">+50%</span> | Audio <span className="text-red-400 font-medium">-6%</span>
            </div>
          </CardFooter>
        </Card>
      </div>

      {/* Channel & Order KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Card>
          <CardHeader className="pb-1 pt-4 px-4">
            <CardTitle className="text-xs font-medium text-muted-foreground">Órdenes 2025</CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <div className="text-2xl font-bold tracking-tight">{orderMetrics['2025'].total_orders.toLocaleString()}</div>
            <p className="text-xs mt-1 text-emerald-400 font-medium">+10.5% vs 2024 ({orderMetrics['2024'].total_orders.toLocaleString()})</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-1 pt-4 px-4">
            <CardTitle className="text-xs font-medium text-muted-foreground">AOV 2025</CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <div className="text-2xl font-bold tracking-tight">${orderMetrics['2025'].aov}K</div>
            <p className="text-xs mt-1 text-red-400 font-medium">-2.6% vs 2024 (${orderMetrics['2024'].aov}K)</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-1 pt-4 px-4">
            <CardTitle className="text-xs font-medium text-muted-foreground">Canal Web 2025</CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <div className="text-2xl font-bold tracking-tight">{channelMix['2025'].Web.pct}%</div>
            <p className="text-xs mt-1 text-muted-foreground">${channelMix['2025'].Web.revenue.toLocaleString()}M revenue</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-1 pt-4 px-4">
            <CardTitle className="text-xs font-medium text-muted-foreground">Click & Go 2025</CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <div className="text-2xl font-bold tracking-tight">{channelMix['2025']['Click & Go'].pct}%</div>
            <p className="text-xs mt-1 text-muted-foreground">${channelMix['2025']['Click & Go'].revenue.toLocaleString()}M revenue</p>
          </CardContent>
        </Card>
      </div>

      {/* Per-Category Revenue Growth 2025 → 2026 (chart-bar-negative pattern) */}
      <Card>
        <CardHeader className="border-b px-6 py-4">
          <CardTitle>Cambio Revenue por Categoría (2025 → 2026)</CardTitle>
          <CardDescription>Crecimiento porcentual — verde = crece, rojo = decrece</CardDescription>
        </CardHeader>
        <CardContent className="px-2 pt-4 sm:p-6">
          <ChartContainer
            config={{
              growth: { label: 'Crecimiento %', color: '#2b7fff' },
            } satisfies ChartConfig}
            className="aspect-auto h-[400px] w-full"
          >
            <BarChart
              accessibilityLayer
              data={growthData}
              layout="vertical"
              margin={{ top: 10, right: 80, left: 90, bottom: 10 }}
            >
              <CartesianGrid horizontal={false} className="stroke-border/50" />
              <XAxis
                type="number"
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 11 }}
                tickFormatter={(v) => `${v}%`}
              />
              <YAxis
                type="category"
                dataKey="name"
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 11 }}
                width={85}
              />
              <ReferenceLine x={0} stroke="hsl(var(--border))" strokeWidth={1} />
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    className="w-[220px]"
                    labelFormatter={(v) => v}
                    formatter={(value, name, item) => {
                      const d = item?.payload
                      return `${Number(value).toFixed(1)}% ($${d?.rev2025}M → $${d?.rev2026}M)`
                    }}
                  />
                }
              />
              <Bar dataKey="growth" radius={[0, 6, 6, 0]}>
                {growthData.map((d) => (
                  <Cell
                    key={d.name}
                    fill={d.growth >= 0 ? '#10b981' : '#ef4444'}
                  />
                ))}
                <LabelList
                  dataKey="growth"
                  position="right"
                  fill="currentColor"
                  formatter={(v: number) => `${v > 0 ? '+' : ''}${v}%`}
                  fontSize={11}
                />
              </Bar>
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Slope Chart — Top 5 Categories across years */}
      <Card>
        <CardHeader className="border-b px-6 py-4">
          <CardTitle>Tendencia Revenue Top 5 Categorías</CardTitle>
          <CardDescription>Evolución 2024 → 2025 → 2026 Target ($M)</CardDescription>
        </CardHeader>
        <CardContent className="px-2 pt-4 sm:p-6">
          {(() => {
            const comparisonData = multiYearData.categories.map((cat, i) => ({
              name: cat,
              '2024': multiYearData.revenue['2024'][i] || 0,
              '2025': multiYearData.revenue['2025'][i] || 0,
              '2026': multiYearData.revenue['2026_target'][i] || 0,
            }))

            const top5cats = [...comparisonData]
              .sort((a, b) => b['2026'] - a['2026'])
              .slice(0, 5)

            const slopeData = [
              { year: '2024', ...Object.fromEntries(top5cats.map((cat) => [cat.name, cat['2024']])) },
              { year: '2025', ...Object.fromEntries(top5cats.map((cat) => [cat.name, cat['2025']])) },
              { year: '2026', ...Object.fromEntries(top5cats.map((cat) => [cat.name, cat['2026']])) },
            ]

            return (
              <ChartContainer
                config={Object.fromEntries(
                  top5cats.map((cat, i) => [
                    cat.name,
                    { label: cat.name, color: CHART_COLORS[i] || '#64748b' },
                  ])
                )}
                className="aspect-auto h-[300px] w-full"
              >
                <LineChart
                  accessibilityLayer
                  data={slopeData}
                  margin={{ top: 10, right: 30, left: 0, bottom: 10 }}
                >
                  <CartesianGrid vertical={false} className="stroke-border/50" />
                  <XAxis dataKey="year" tickLine={false} axisLine={false} tick={{ fontSize: 12 }} />
                  <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 12 }} />
                  <ChartTooltip
                    content={
                      <ChartTooltipContent
                        className="w-[160px]"
                        labelFormatter={(v) => v}
                        formatter={(value) => `$${value}M`}
                      />
                    }
                  />
                  {top5cats.map((cat, i) => (
                    <Line
                      key={cat.name}
                      type="monotone"
                      dataKey={cat.name}
                      stroke={CHART_COLORS[i] || '#64748b'}
                      strokeWidth={2}
                      dot={{ r: 4 }}
                      name={cat.name}
                    />
                  ))}
                </LineChart>
              </ChartContainer>
            )
          })()}
        </CardContent>
      </Card>

      {/* Bar Chart + Donut Chart */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Horizontal Bar Chart — 2 cols */}
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
            <ChartContainer config={chartConfig} className="aspect-auto h-[400px] w-full">
              <BarChart
                accessibilityLayer
                data={sortedBarData}
                layout="vertical"
                margin={{ top: 10, right: 100, left: 20, bottom: 10 }}
              >
                <CartesianGrid horizontal={false} className="stroke-border/50" />
                <XAxis type="number" tickLine={false} axisLine={false} tick={{ fontSize: 11 }} />
                <YAxis
                  type="category"
                  dataKey="name"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 11 }}
                  width={100}
                />
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
                  radius={[0, 6, 6, 0]}
                >
                  <LabelList
                    dataKey={activeMetric}
                    position="right"
                    fill="currentColor"
                    formatter={(v: number) => activeMetric === 'revenue' ? `$${v}M` : v}
                    fontSize={11}
                  />
                </Bar>
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Interactive Donut Chart — 1 col */}
        <Card className="flex flex-col">
          <CardHeader className="items-center pb-4 border-b">
            <CardTitle className="mb-3">Distribución Revenue</CardTitle>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Seleccionar categoría" />
              </SelectTrigger>
              <SelectContent>
                {donutData.map((d) => (
                  <SelectItem key={d.name} value={d.name}>
                    {d.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardHeader>
          <CardContent className="flex-1 pb-0">
            <ChartContainer config={donutConfig} className="mx-auto aspect-square max-h-[280px]">
              <PieChart accessibilityLayer>
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent hideLabel formatter={(v) => `$${v}M`} />}
                />
                <Pie
                  data={donutData}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={60}
                  outerRadius={100}
                  strokeWidth={2}
                  activeIndex={donutData.findIndex((d) => d.name === selectedCategory)}
                  activeShape={renderActiveShape}
                  onMouseEnter={(_, index) => {
                    if (donutData[index]) {
                      setSelectedCategory(donutData[index].name)
                    }
                  }}
                >
                  {donutData.map((_, i) => (
                    <Cell key={`cell-${i}`} fill={DONUT_COLORS[i]} />
                  ))}
                  <Label
                    content={({ viewBox }) => {
                      if (viewBox && 'cx' in viewBox && 'cy' in viewBox) {
                        return (
                          <text x={viewBox.cx} y={viewBox.cy} textAnchor="middle" dominantBaseline="middle">
                            <tspan x={viewBox.cx} y={viewBox.cy} className="fill-foreground text-2xl font-bold">
                              ${selectedValue}M
                            </tspan>
                            <tspan x={viewBox.cx} y={(viewBox.cy || 0) + 20} className="fill-muted-foreground text-xs">
                              {selectedCategory}
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
          <div className="px-6 pb-4 grid grid-cols-2 gap-x-2 gap-y-2 text-xs border-t pt-4">
            {donutData.map((d, i) => (
              <div
                key={d.name}
                className={`flex items-center gap-2 cursor-pointer px-2 py-1 rounded transition-colors ${
                  selectedCategory === d.name ? 'bg-muted' : 'hover:bg-muted/50'
                }`}
                onClick={() => setSelectedCategory(d.name)}
              >
                <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: DONUT_COLORS[i] }} />
                <span className="text-muted-foreground truncate flex-1">{d.name}</span>
                <span className="ml-auto font-medium">${d.value}M</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Launch Tracker & Sensitivity Analysis Tables */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Section 1: Launch Tracker Table */}
        <Card>
          <CardHeader>
            <CardTitle>Tracker de Lanzamientos</CardTitle>
            <CardDescription>Velocidad de ventas vs target CyberDay</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Producto</TableHead>
                  <TableHead>Lanzamiento</TableHead>
                  <TableHead className="text-right">Ventas</TableHead>
                  <TableHead className="text-right">Rate/día</TableHead>
                  <TableHead className="text-right">Target Cyber</TableHead>
                  <TableHead className="text-right">Multiplicador</TableHead>
                  <TableHead>Confianza</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {launchData.products
                  .sort((a, b) => a.multiplier - b.multiplier)
                  .map((product) => {
                    const confidenceColor =
                      product.confidence === 'Alta'
                        ? 'bg-emerald-400/20 text-emerald-600 dark:text-emerald-400'
                        : product.confidence === 'Media-Alta'
                          ? 'bg-amber-400/20 text-amber-600 dark:text-amber-400'
                          : 'bg-amber-400/20 text-amber-600 dark:text-amber-400'
                    return (
                      <TableRow key={product.product}>
                        <TableCell className="font-medium">{product.product}</TableCell>
                        <TableCell>{product.launchDate}</TableCell>
                        <TableCell className="text-right">${product.sales.toLocaleString()}</TableCell>
                        <TableCell className="text-right">${product.dailyRate.toLocaleString()}</TableCell>
                        <TableCell className="text-right">${product.cyberTarget.toLocaleString()}</TableCell>
                        <TableCell className="text-right font-semibold">{product.multiplier.toFixed(1)}x</TableCell>
                        <TableCell>
                          <Badge className={confidenceColor}>{product.confidence}</Badge>
                        </TableCell>
                      </TableRow>
                    )
                  })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Section 2: Sensitivity Analysis Table */}
        <Card>
          <CardHeader>
            <CardTitle>Análisis de Sensibilidad</CardTitle>
            <CardDescription>Escenarios pesimista/optimista — impacto en revenue ($M)</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Variable</TableHead>
                  <TableHead>Pesimista</TableHead>
                  <TableHead className="text-right">Δ Pes.</TableHead>
                  <TableHead>Optimista</TableHead>
                  <TableHead className="text-right">Δ Opt.</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sensitivityData.scenarios.map((scenario) => (
                  <TableRow key={scenario.variable}>
                    <TableCell className="font-medium flex items-center gap-2">
                      {scenario.variable}
                      {scenario.applied && <span className="text-lg">✅</span>}
                    </TableCell>
                    <TableCell>{scenario.pessimistic}</TableCell>
                    <TableCell
                      className={`text-right font-medium ${
                        scenario.pessDelta < 0 ? 'text-red-500' : 'text-emerald-400'
                      }`}
                    >
                      {scenario.pessDelta > 0 ? '+' : ''}{scenario.pessDelta.toFixed(2)}
                    </TableCell>
                    <TableCell>{scenario.optimistic}</TableCell>
                    <TableCell
                      className={`text-right font-medium ${
                        scenario.optDelta < 0 ? 'text-red-500' : 'text-emerald-400'
                      }`}
                    >
                      {scenario.optDelta > 0 ? '+' : ''}{scenario.optDelta.toFixed(2)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* iPhone Model Breakdown — Horizontal Bar Chart */}
      <Card>
        <CardHeader>
          <CardTitle>iPhone - Desglose de Modelos</CardTitle>
          <CardDescription>Unidades 2024/2025 y Revenue 2026 Target</CardDescription>
        </CardHeader>
        <CardContent className="px-2 pt-4 sm:p-6">
          {(() => {
            const barData = iphoneBreakdown.models.map((model, i) => ({
              model: `iPhone ${model}`,
              units_2024: iphoneBreakdown.units_2024[i] || 0,
              units_2025: iphoneBreakdown.units_2025[i] || 0,
              revenue_2026: iphoneBreakdown.revenue_2026[i] || 0,
            }))

            return (
              <ChartContainer
                config={{
                  units_2024: { label: 'Unidades 2024', color: '#8ec5ff' },
                  units_2025: { label: 'Unidades 2025', color: '#2b7fff' },
                } satisfies ChartConfig}
                className="aspect-auto h-[300px] w-full"
              >
                <BarChart
                  accessibilityLayer
                  data={barData}
                  layout="vertical"
                  margin={{ top: 10, right: 100, left: 80, bottom: 10 }}
                >
                  <CartesianGrid horizontal={false} className="stroke-border/50" />
                  <XAxis type="number" tickLine={false} axisLine={false} tick={{ fontSize: 11 }} />
                  <YAxis
                    type="category"
                    dataKey="model"
                    tickLine={false}
                    axisLine={false}
                    tick={{ fontSize: 11 }}
                    width={80}
                  />
                  <ChartTooltip
                    content={
                      <ChartTooltipContent
                        className="w-[160px]"
                        labelFormatter={(v) => v}
                        formatter={(value) => `${Number(value).toLocaleString()} uds`}
                      />
                    }
                  />
                  <Bar dataKey="units_2024" fill="#8ec5ff" radius={[0, 6, 6, 0]} />
                  <Bar dataKey="units_2025" fill="#2b7fff" radius={[0, 6, 6, 0]}>
                    <LabelList
                      dataKey="revenue_2026"
                      position="right"
                      fill="currentColor"
                      formatter={(v: number) => `$${v}M`}
                      fontSize={11}
                    />
                  </Bar>
                </BarChart>
              </ChartContainer>
            )
          })()}
        </CardContent>
      </Card>

      {/* Hourly Distribution & Regional Distribution */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Hourly Revenue Distribution */}
        <Card>
          <CardHeader className="border-b px-6 py-4">
            <CardTitle>Distribución Horaria de Revenue</CardTitle>
            <CardDescription>Revenue por hora del día — pico a medianoche (inicio) y mediodía</CardDescription>
          </CardHeader>
          <CardContent className="px-2 pt-4 sm:p-6">
            {(() => {
              const hourData = hourlyDist.hours.map((h) => ({
                hour: `${String(h).padStart(2, '0')}:00`,
                '2024': hourlyDist['2024'].revenue[h],
                '2025': hourlyDist['2025'].revenue[h],
              }))
              return (
                <ChartContainer
                  config={{
                    '2024': { label: '2024', color: '#8ec5ff' },
                    '2025': { label: '2025', color: '#2b7fff' },
                  } satisfies ChartConfig}
                  className="aspect-auto h-[280px] w-full"
                >
                  <AreaChart
                    accessibilityLayer
                    data={hourData}
                    margin={{ top: 10, right: 10, left: 0, bottom: 10 }}
                  >
                    <CartesianGrid vertical={false} className="stroke-border/50" />
                    <XAxis
                      dataKey="hour"
                      tickLine={false}
                      axisLine={false}
                      tick={{ fontSize: 10 }}
                      interval={2}
                    />
                    <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 11 }} />
                    <ChartTooltip
                      content={
                        <ChartTooltipContent
                          className="w-[160px]"
                          labelFormatter={(v) => v}
                          formatter={(value) => `$${value}M`}
                        />
                      }
                    />
                    <Area type="monotone" dataKey="2024" stroke="#8ec5ff" fill="#8ec5ff" fillOpacity={0.2} strokeWidth={2} />
                    <Area type="monotone" dataKey="2025" stroke="#2b7fff" fill="#2b7fff" fillOpacity={0.3} strokeWidth={2} />
                  </AreaChart>
                </ChartContainer>
              )
            })()}
          </CardContent>
          <CardFooter className="flex-col items-start gap-1 text-sm pt-0 px-6 pb-4">
            <div className="text-xs text-muted-foreground">
              Pico 12:00 ($427M en 2025) — Spike medianoche por apertura del evento
            </div>
          </CardFooter>
        </Card>

        {/* Regional Distribution */}
        <Card>
          <CardHeader className="border-b px-6 py-4">
            <CardTitle>Revenue por Región</CardTitle>
            <CardDescription>Concentración geográfica — RM = 65% del revenue</CardDescription>
          </CardHeader>
          <CardContent className="px-2 pt-4 sm:p-6">
            {(() => {
              const regData = regionalData.regions.map((reg, i) => ({
                region: reg,
                '2024': regionalData['2024'].revenue[i],
                '2025': regionalData['2025'].revenue[i],
              })).sort((a, b) => b['2025'] - a['2025'])
              return (
                <ChartContainer
                  config={{
                    '2024': { label: '2024', color: '#8ec5ff' },
                    '2025': { label: '2025', color: '#2b7fff' },
                  } satisfies ChartConfig}
                  className="aspect-auto h-[280px] w-full"
                >
                  <BarChart
                    accessibilityLayer
                    data={regData}
                    layout="vertical"
                    margin={{ top: 10, right: 60, left: 80, bottom: 10 }}
                  >
                    <CartesianGrid horizontal={false} className="stroke-border/50" />
                    <XAxis type="number" tickLine={false} axisLine={false} tick={{ fontSize: 11 }} />
                    <YAxis
                      type="category"
                      dataKey="region"
                      tickLine={false}
                      axisLine={false}
                      tick={{ fontSize: 10 }}
                      width={75}
                    />
                    <ChartTooltip
                      content={
                        <ChartTooltipContent
                          className="w-[180px]"
                          labelFormatter={(v) => v}
                          formatter={(value) => `$${value}M`}
                        />
                      }
                    />
                    <Bar dataKey="2024" fill="#8ec5ff" radius={[0, 6, 6, 0]} barSize={8} />
                    <Bar dataKey="2025" fill="#2b7fff" radius={[0, 6, 6, 0]} barSize={8}>
                      <LabelList
                        dataKey="2025"
                        position="right"
                        fill="currentColor"
                        formatter={(v: number) => `$${v}M`}
                        fontSize={10}
                      />
                    </Bar>
                  </BarChart>
                </ChartContainer>
              )
            })()}
          </CardContent>
          <CardFooter className="flex-col items-start gap-1 text-sm pt-0 px-6 pb-4">
            <div className="text-xs text-muted-foreground">
              Top 3 (RM + Valparaíso + Bío Bío) = 81% del revenue total
            </div>
          </CardFooter>
        </Card>
      </div>

      {/* ─── DIGITAL MARKETING SECTION ─── */}
      {/* GA Web Traffic KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        <Card>
          <CardHeader className="pb-1 pt-4 px-4">
            <CardTitle className="text-xs font-medium text-muted-foreground">Sesiones Web</CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <div className="text-2xl font-bold tracking-tight">{(gaTraffic.totals['2025'].sessions / 1000).toFixed(0)}K</div>
            <p className="text-xs mt-1 text-emerald-400 font-medium">+{gaTraffic.yoy.sessions.toFixed(1)}% vs 2024 ({(gaTraffic.totals['2024'].sessions / 1000).toFixed(0)}K)</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-1 pt-4 px-4">
            <CardTitle className="text-xs font-medium text-muted-foreground">Compras Online</CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <div className="text-2xl font-bold tracking-tight">{gaTraffic.totals['2025'].purchases.toLocaleString()}</div>
            <p className="text-xs mt-1 text-emerald-400 font-medium">+{gaTraffic.yoy.purchases.toFixed(1)}% vs 2024 ({gaTraffic.totals['2024'].purchases.toLocaleString()})</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-1 pt-4 px-4">
            <CardTitle className="text-xs font-medium text-muted-foreground">Bounce Rate</CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <div className="text-2xl font-bold tracking-tight">{gaTraffic.totals['2025'].avgBounceRate}%</div>
            <p className="text-xs mt-1 text-emerald-400 font-medium">{gaTraffic.yoy.bounceRate}% vs 2024 ({gaTraffic.totals['2024'].avgBounceRate}%)</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-1 pt-4 px-4">
            <CardTitle className="text-xs font-medium text-muted-foreground">Tasa Conversión</CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <div className="text-2xl font-bold tracking-tight">{gaTraffic.totals['2025'].conversionRate}%</div>
            <p className="text-xs mt-1 text-emerald-400 font-medium">+{gaTraffic.yoy.conversionRate.toFixed(1)}% vs 2024 ({gaTraffic.totals['2024'].conversionRate}%)</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-1 pt-4 px-4">
            <CardTitle className="text-xs font-medium text-muted-foreground">Add to Cart</CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <div className="text-2xl font-bold tracking-tight">{(gaTraffic.totals['2025'].addToCarts / 1000).toFixed(1)}K</div>
            <p className="text-xs mt-1 text-emerald-400 font-medium">+{gaTraffic.yoy.addToCarts.toFixed(1)}% vs 2024 ({(gaTraffic.totals['2024'].addToCarts / 1000).toFixed(1)}K)</p>
          </CardContent>
        </Card>
      </div>

      {/* GA Channels & Klaviyo Performance */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* GA Channel Acquisition */}
        <Card>
          <CardHeader className="border-b px-6 py-4">
            <CardTitle>Canales de Adquisición Web</CardTitle>
            <CardDescription>Sesiones por canal — Google Analytics CyberDay 2024 vs 2025</CardDescription>
          </CardHeader>
          <CardContent className="px-2 pt-4 sm:p-6">
            {(() => {
              const channelData = gaChannels.channels
                .map((ch) => ({
                  name: ch.name,
                  '2024': Math.round(ch.sessions2024 / 1000),
                  '2025': Math.round(ch.sessions2025 / 1000),
                  growth: ch.sessions2024 > 200 ? Math.round(((ch.sessions2025 - ch.sessions2024) / ch.sessions2024) * 100) : null,
                }))
                .sort((a, b) => b['2025'] - a['2025'])
              return (
                <ChartContainer
                  config={{
                    '2024': { label: '2024', color: '#8ec5ff' },
                    '2025': { label: '2025', color: '#2b7fff' },
                  } satisfies ChartConfig}
                  className="aspect-auto h-[300px] w-full"
                >
                  <BarChart
                    accessibilityLayer
                    data={channelData}
                    layout="vertical"
                    margin={{ top: 10, right: 70, left: 100, bottom: 10 }}
                  >
                    <CartesianGrid horizontal={false} className="stroke-border/50" />
                    <XAxis type="number" tickLine={false} axisLine={false} tick={{ fontSize: 11 }} tickFormatter={(v) => `${v}K`} />
                    <YAxis type="category" dataKey="name" tickLine={false} axisLine={false} tick={{ fontSize: 11 }} width={95} />
                    <ChartTooltip
                      content={
                        <ChartTooltipContent
                          className="w-[200px]"
                          labelFormatter={(v) => v}
                          formatter={(value) => `${value}K sesiones`}
                        />
                      }
                    />
                    <Bar dataKey="2024" fill="#8ec5ff" radius={[0, 6, 6, 0]} barSize={8} />
                    <Bar dataKey="2025" fill="#2b7fff" radius={[0, 6, 6, 0]} barSize={8}>
                      <LabelList
                        dataKey="growth"
                        position="right"
                        fill="currentColor"
                        formatter={(v: number | null) => v !== null ? `${v > 0 ? '+' : ''}${v}%` : 'NEW'}
                        fontSize={10}
                      />
                    </Bar>
                  </BarChart>
                </ChartContainer>
              )
            })()}
          </CardContent>
          <CardFooter className="flex-col items-start gap-1 text-sm pt-0 px-6 pb-4">
            <div className="text-xs text-muted-foreground">
              Paid Search <span className="text-emerald-400 font-medium">+268%</span> | Paid Social <span className="text-blue-400 font-medium">nuevo canal 2025</span>
            </div>
          </CardFooter>
        </Card>

        {/* Klaviyo Email Performance */}
        <Card>
          <CardHeader className="border-b px-6 py-4">
            <CardTitle>Email Marketing — Klaviyo</CardTitle>
            <CardDescription>Revenue atribuido por campaña CyberDay ($M CLP)</CardDescription>
          </CardHeader>
          <CardContent className="px-2 pt-4 sm:p-6">
            {(() => {
              const emailData = [
                ...klaviyoCampaigns['2025'].campaigns.map((c) => ({
                  name: c.name,
                  revenue: c.revenue,
                  conversions: c.conversions,
                  year: '2025',
                })),
              ].sort((a, b) => b.revenue - a.revenue)
              return (
                <ChartContainer
                  config={{
                    revenue: { label: 'Revenue ($M)', color: '#2b7fff' },
                  } satisfies ChartConfig}
                  className="aspect-auto h-[300px] w-full"
                >
                  <BarChart
                    accessibilityLayer
                    data={emailData}
                    layout="vertical"
                    margin={{ top: 10, right: 80, left: 110, bottom: 10 }}
                  >
                    <CartesianGrid horizontal={false} className="stroke-border/50" />
                    <XAxis type="number" tickLine={false} axisLine={false} tick={{ fontSize: 11 }} tickFormatter={(v) => `$${v}M`} />
                    <YAxis type="category" dataKey="name" tickLine={false} axisLine={false} tick={{ fontSize: 10 }} width={105} />
                    <ChartTooltip
                      content={
                        <ChartTooltipContent
                          className="w-[220px]"
                          labelFormatter={(v) => v}
                          formatter={(value, name, item) => {
                            const d = item?.payload
                            return `$${value}M (${d?.conversions?.toLocaleString()} conv.)`
                          }}
                        />
                      }
                    />
                    <Bar dataKey="revenue" fill="#2b7fff" radius={[0, 6, 6, 0]}>
                      {emailData.map((d, i) => (
                        <Cell key={d.name} fill={CHART_COLORS[Math.min(i, CHART_COLORS.length - 1)]} />
                      ))}
                      <LabelList
                        dataKey="revenue"
                        position="right"
                        fill="currentColor"
                        formatter={(v: number) => `$${v}M`}
                        fontSize={11}
                      />
                    </Bar>
                  </BarChart>
                </ChartContainer>
              )
            })()}
          </CardContent>
          <CardFooter className="flex-col items-start gap-1 text-sm pt-0 px-6 pb-4">
            <div className="text-xs text-muted-foreground">
              2025: <span className="font-medium text-foreground">$2,111M</span> atribuidos ({klaviyoCampaigns['2025'].totals.conversions.toLocaleString()} conv.)
              vs 2024: <span className="font-medium text-foreground">$1,938M</span> ({klaviyoCampaigns['2024'].totals.conversions.toLocaleString()} conv.)
              — <span className="text-emerald-400 font-medium">+8.9%</span> revenue
            </div>
          </CardFooter>
        </Card>
      </div>

      {/* Email KPI Summary Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Card>
          <CardHeader className="pb-1 pt-4 px-4">
            <CardTitle className="text-xs font-medium text-muted-foreground">Campañas Email</CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <div className="text-2xl font-bold tracking-tight">{klaviyoCampaigns['2025'].totals.campaigns}</div>
            <p className="text-xs mt-1 text-emerald-400 font-medium">vs {klaviyoCampaigns['2024'].totals.campaigns} en 2024 — más segmentación</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-1 pt-4 px-4">
            <CardTitle className="text-xs font-medium text-muted-foreground">Avg Open Rate</CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <div className="text-2xl font-bold tracking-tight">{klaviyoCampaigns['2025'].totals.avgOpenRate}%</div>
            <p className="text-xs mt-1 text-emerald-400 font-medium">+{klaviyoCampaigns.yoy.avgOpenRate}% vs 2024 ({klaviyoCampaigns['2024'].totals.avgOpenRate}%)</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-1 pt-4 px-4">
            <CardTitle className="text-xs font-medium text-muted-foreground">Avg Click Rate</CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <div className="text-2xl font-bold tracking-tight">{klaviyoCampaigns['2025'].totals.avgClickRate}%</div>
            <p className="text-xs mt-1 text-emerald-400 font-medium">+{klaviyoCampaigns.yoy.avgClickRate}% vs 2024 ({klaviyoCampaigns['2024'].totals.avgClickRate}%)</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-1 pt-4 px-4">
            <CardTitle className="text-xs font-medium text-muted-foreground">Revenue Atribuido</CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <div className="text-2xl font-bold tracking-tight">${klaviyoCampaigns['2025'].totals.revenue}M</div>
            <p className="text-xs mt-1 text-emerald-400 font-medium">+{klaviyoCampaigns.yoy.revenue}% vs 2024 (${klaviyoCampaigns['2024'].totals.revenue}M)</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
