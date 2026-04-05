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
  AreaChart, Area, LabelList,
} from 'recharts'
import revenueData from '@/data/revenue.json'
import unitsData from '@/data/units.json'
import launchData from '@/data/launch-tracker.json'
import sensitivityData from '@/data/sensitivity.json'
import multiYearData from '@/data/multi-year.json'
import iphoneBreakdown from '@/data/iphone-breakdown.json'

// Hex colors for the 5 chart slots
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
  { title: 'Revenue 2024', value: '$4.553M', sub: 'Cifra histórica', delta: null, isTarget: false },
  { title: 'Revenue 2025', value: '$5.047M', sub: '+10.9% vs 2024', delta: '+10.9%', isTarget: false },
  { title: 'Target 2026', value: '$5.421M', sub: '+7.4% vs 2025', delta: '+7.4%', isTarget: true },
  { title: 'Ticket Promedio', value: '$290K', sub: 'Promedio por orden', delta: null, isTarget: false },
  { title: 'Unidades 2026', value: '18,670', sub: '+1.7% vs 2025', delta: '+1.7%', isTarget: false },
  { title: 'Categorías', value: '17', sub: 'Apple + 3P', delta: null, isTarget: false },
]

// Revenue trend data
const trendData = [
  { year: '2024', revenue: 4553, units: 11700 },
  { year: '2025', revenue: 5047, units: 11800 },
  { year: '2026 Target', revenue: 5421, units: 12000 },
]

const trendConfig: ChartConfig = {
  revenue: { label: 'Ingresos (M)', color: '#2b7fff' },
  units: { label: 'Unidades', color: '#8ec5ff' },
} satisfies ChartConfig

// Custom active sector renderer for interactive donut
const renderActiveShape = (props: PieSectorShapeProps & { outerRadius?: number }) => {
  const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill } = props
  const RADIAN = Math.PI / 180
  const radius = (innerRadius || 0) + ((outerRadius || 0) - (innerRadius || 0)) * 0.5
  const x = (cx || 0) + radius * Math.cos(-RADIAN * (startAngle || 0 + endAngle || 0) / 2)
  const y = (cy || 0) + radius * Math.sin(-RADIAN * (startAngle || 0 + endAngle || 0) / 2)

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
              <p className={`text-xs mt-1 ${kpi.delta ? 'text-emerald-400 font-medium' : 'text-muted-foreground'}`}>
                {kpi.sub}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Revenue Evolution Trend Chart */}
      <Card>
        <CardHeader className="flex flex-col items-stretch border-b p-0 sm:flex-row">
          <div className="flex flex-1 flex-col justify-center gap-1 px-6 pt-4 pb-3 sm:py-4">
            <CardTitle>Evolución Revenue 2024 → 2026</CardTitle>
            <CardDescription>Ingresos y unidades por año</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="px-2 pt-4 sm:p-6">
          <ChartContainer config={trendConfig} className="aspect-auto h-[250px] w-full">
            <AreaChart
              accessibilityLayer
              data={trendData}
              margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
            >
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2b7fff" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#2b7fff" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorUnits" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8ec5ff" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#8ec5ff" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} className="stroke-border/50" />
              <XAxis
                dataKey="year"
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 12 }}
              />
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
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="#2b7fff"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorRevenue)"
                name="Ingresos (M)"
              />
              <Area
                type="monotone"
                dataKey="units"
                stroke="#8ec5ff"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorUnits)"
                stackId="1"
                name="Unidades"
              />
            </AreaChart>
          </ChartContainer>
        </CardContent>
        <CardFooter className="flex-col items-start gap-2 text-sm pt-2">
          <div className="flex gap-2 font-medium leading-none">
            Crecimiento Target 2026 <span className="text-emerald-400">+7.4% vs 2025</span>
          </div>
          <div className="flex gap-2 text-xs text-muted-foreground">
            De $5.047M (2025) a $5.421M (2026 target)
          </div>
        </CardFooter>
      </Card>

      {/* Year-over-Year Category Comparison */}
      <Card>
        <CardHeader className="flex flex-col items-stretch border-b p-0 sm:flex-row">
          <div className="flex flex-1 flex-col justify-center gap-1 px-6 pt-4 pb-3 sm:py-4">
            <CardTitle>Comparación Categorías por Año</CardTitle>
            <CardDescription>Revenue 2024 vs 2025 vs 2026 Target (Top 8)</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="px-2 pt-4 sm:p-6">
          {(() => {
            // Build comparison data for top 8 categories by 2025 revenue
            const comparisonData = multiYearData.categories.map((cat, i) => ({
              name: cat,
              '2024': multiYearData.revenue['2024'][i] || 0,
              '2025': multiYearData.revenue['2025'][i] || 0,
              '2026': multiYearData.revenue['2026_target'][i] || 0,
            }))

            const top8 = [...comparisonData]
              .sort((a, b) => b['2025'] - a['2025'])
              .slice(0, 8)

            return (
              <ChartContainer
                config={{
                  '2024': { label: '2024', color: '#8ec5ff' },
                  '2025': { label: '2025', color: '#2b7fff' },
                  '2026': { label: '2026 Target', color: '#155dfc' },
                } satisfies ChartConfig}
                className="aspect-auto h-[350px] w-full"
              >
                <BarChart
                  accessibilityLayer
                  data={top8}
                  layout="vertical"
                  margin={{ top: 10, right: 30, left: 100, bottom: 10 }}
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
                        formatter={(value) => `$${value}M`}
                      />
                    }
                  />
                  <Bar dataKey="2024" fill="#8ec5ff" radius={[0, 6, 6, 0]} />
                  <Bar dataKey="2025" fill="#2b7fff" radius={[0, 6, 6, 0]} />
                  <Bar dataKey="2026" fill="#155dfc" radius={[0, 6, 6, 0]} />
                </BarChart>
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
                    dataKey="name"
                    position="insideLeft"
                    fill="currentColor"
                    offset={8}
                    fontSize={11}
                  />
                  <LabelList
                    dataKey={activeMetric}
                    position="right"
                    fill="currentColor"
                    formatter={(v) => activeMetric === 'revenue' ? `$${v}M` : v}
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

      {/* iPhone Model Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>iPhone - Desglose de Modelos</CardTitle>
          <CardDescription>Unidades 2024/2025 y Revenue 2026 Target</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Modelo</TableHead>
                <TableHead className="text-right">Unidades 2024</TableHead>
                <TableHead className="text-right">Unidades 2025</TableHead>
                <TableHead className="text-right">Crecimiento %</TableHead>
                <TableHead className="text-right">Revenue 2026</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {iphoneBreakdown.models.map((model, i) => {
                const units2024 = iphoneBreakdown.units_2024[i] || 0
                const units2025 = iphoneBreakdown.units_2025[i] || 0
                const revenue2026 = iphoneBreakdown.revenue_2026[i] || 0
                const growth = units2024 > 0 ? ((units2025 - units2024) / units2024) * 100 : 0

                return (
                  <TableRow key={model}>
                    <TableCell className="font-medium">iPhone {model}</TableCell>
                    <TableCell className="text-right">{units2024.toLocaleString()}</TableCell>
                    <TableCell className="text-right">{units2025.toLocaleString()}</TableCell>
                    <TableCell className="text-right">
                      <span
                        className={`font-medium ${
                          growth > 0 ? 'text-emerald-400' : growth < 0 ? 'text-red-500' : 'text-muted-foreground'
                        }`}
                      >
                        {growth > 0 ? '+' : ''}{growth.toFixed(1)}%
                      </span>
                    </TableCell>
                    <TableCell className="text-right font-semibold">${revenue2026}M</TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
