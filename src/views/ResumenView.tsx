'use client'

import { useState, useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent, type ChartConfig } from '@/components/ui/chart'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  AreaChart, Area, LabelList, LineChart, Line, Cell,
  ReferenceLine, Legend,
} from 'recharts'
import multiYearData from '@/data/multi-year.json'
import dailyCurve from '@/data/daily-curve.json'
import aspComparison from '@/data/asp-comparison.json'
import orderMetrics from '@/data/order-metrics.json'
import channelMix from '@/data/channel-mix.json'
import hourlyDist from '@/data/hourly-distribution.json'
import regionalData from '@/data/regional.json'
import gaTraffic from '@/data/ga-traffic.json'
import gaChannels from '@/data/ga-channels.json'
import klaviyoCampaigns from '@/data/klaviyo-campaigns.json'
import launchData from '@/data/launch-tracker.json'
import sensitivityData from '@/data/sensitivity.json'
import productHierarchy from '@/data/product-hierarchy.json'
import priceVolumeData from '@/data/price-volume-decomposition.json'
import newReturningData from '@/data/ga-new-returning.json'

// ─── Multicolor palette for clear visual differentiation ───
const PALETTE = {
  blue:    '#2b7fff',
  sky:     '#38bdf8',
  indigo:  '#6366f1',
  violet:  '#8b5cf6',
  emerald: '#10b981',
  amber:   '#f59e0b',
  rose:    '#f43f5e',
  orange:  '#f97316',
  cyan:    '#06b6d4',
  slate:   '#64748b',
  lime:    '#84cc16',
  pink:    '#ec4899',
}

// Semantic year colors (high contrast)
const YEAR_COLORS = {
  '2024': '#38bdf8',   // sky
  '2025': '#2b7fff',   // blue
  '2026': '#6366f1',   // indigo
}

// Category colors (each visually distinct)
const CAT_COLORS = [
  '#2b7fff', '#f59e0b', '#10b981', '#f43f5e', '#8b5cf6',
  '#06b6d4', '#f97316', '#84cc16', '#ec4899', '#64748b',
]

// ─── Configs with year legends ───
const yearConfig = {
  '2024': { label: '2024', color: YEAR_COLORS['2024'] },
  '2025': { label: '2025', color: YEAR_COLORS['2025'] },
  '2026 Target': { label: '2026 Target', color: YEAR_COLORS['2026'] },
} satisfies ChartConfig

const twoYearConfig = {
  '2024': { label: '2024', color: YEAR_COLORS['2024'] },
  '2025': { label: '2025', color: YEAR_COLORS['2025'] },
} satisfies ChartConfig

// ─── Revenue total comparison ───
const totalComparisonData = [
  { year: '2024', revenue: 4553 },
  { year: '2025', revenue: 5047 },
  { year: '2026 Target', revenue: 5421 },
]

// ─── Mix-shift stacked area ───
const buildMixShiftData = () => {
  const catRevenue2026 = multiYearData.categories.map((cat, i) => ({
    name: cat, idx: i, rev2026: multiYearData.revenue['2026_target'][i] || 0,
  }))
  const top6 = [...catRevenue2026].sort((a, b) => b.rev2026 - a.rev2026).slice(0, 6)
  const years = ['2024', '2025', '2026_target'] as const
  const yearLabels = ['2024', '2025', '2026']

  return yearLabels.map((label, yi) => {
    const yearKey = years[yi]
    const entry: Record<string, number | string> = { year: label }
    const totalRev = multiYearData.revenue[yearKey].reduce((s: number, v: number) => s + v, 0)
    let top6Sum = 0
    for (const cat of top6) {
      const rev = multiYearData.revenue[yearKey][cat.idx] || 0
      entry[cat.name] = totalRev > 0 ? Math.round((rev / totalRev) * 1000) / 10 : 0
      top6Sum += rev
    }
    entry['Otros'] = totalRev > 0 ? Math.round(((totalRev - top6Sum) / totalRev) * 1000) / 10 : 0
    return entry
  })
}
const mixShiftData = buildMixShiftData()
const mixShiftCategories = Object.keys(mixShiftData[0] || {}).filter(k => k !== 'year')
const mixShiftConfig: ChartConfig = Object.fromEntries(
  mixShiftCategories.map((cat, i) => [cat, { label: cat, color: CAT_COLORS[i] || '#94a3b8' }])
)

// ─── Per-category revenue growth ───
const growthData = multiYearData.categories.map((cat, i) => {
  const rev2025 = multiYearData.revenue['2025'][i] || 0
  const rev2026 = multiYearData.revenue['2026_target'][i] || 0
  const growth = rev2025 > 0 ? ((rev2026 - rev2025) / rev2025) * 100 : (rev2026 > 0 ? 999 : 0)
  return { name: cat, growth: Math.round(growth * 10) / 10, rev2025, rev2026, delta: rev2026 - rev2025 }
}).filter(d => d.rev2025 > 10 || d.rev2026 > 10).sort((a, b) => b.growth - a.growth)

// ─── Top 5 line chart ───
const buildSlopeData = () => {
  const comparison = multiYearData.categories.map((cat, i) => ({
    name: cat,
    '2024': multiYearData.revenue['2024'][i] || 0,
    '2025': multiYearData.revenue['2025'][i] || 0,
    '2026': multiYearData.revenue['2026_target'][i] || 0,
  }))
  const top5 = [...comparison].sort((a, b) => b['2026'] - a['2026']).slice(0, 5)
  return {
    data: [
      { year: '2024', ...Object.fromEntries(top5.map(c => [c.name, c['2024']])) },
      { year: '2025', ...Object.fromEntries(top5.map(c => [c.name, c['2025']])) },
      { year: '2026', ...Object.fromEntries(top5.map(c => [c.name, c['2026']])) },
    ],
    cats: top5,
  }
}
const slopeInfo = buildSlopeData()

// ─── KPI summary ───
const kpis = [
  { title: 'Revenue 2024', value: '$4.553M', sub: 'Cifra histórica', delta: null },
  { title: 'Revenue 2025', value: '$5.047M', sub: '+10.9% vs 2024', delta: '+10.9%' },
  { title: 'Target 2026', value: '$5.421M', sub: '+7.4% vs 2025', delta: '+7.4%' },
  { title: 'Sesiones Web', value: `${(gaTraffic.totals['2025'].sessions / 1000).toFixed(0)}K`, sub: `+${gaTraffic.yoy.sessions.toFixed(0)}% vs 2024`, delta: `+${gaTraffic.yoy.sessions.toFixed(0)}%` },
  { title: 'Compras Online', value: gaTraffic.totals['2025'].purchases.toLocaleString(), sub: `+${gaTraffic.yoy.purchases.toFixed(0)}% vs 2024`, delta: `+${gaTraffic.yoy.purchases.toFixed(0)}%` },
  { title: 'Bounce Rate', value: `${gaTraffic.totals['2025'].avgBounceRate}%`, sub: `${gaTraffic.yoy.bounceRate}% vs 2024`, delta: `${gaTraffic.yoy.bounceRate}%` },
  { title: 'Órdenes 2025', value: orderMetrics['2025'].total_orders.toLocaleString(), sub: `+10.5% vs 2024`, delta: '+10.5%' },
  { title: 'AOV 2025', value: `$${orderMetrics['2025'].aov}K`, sub: `-2.6% vs 2024`, delta: '-2.6%' },
]

export function ResumenView() {
  const [selectedGrupo, setSelectedGrupo] = useState<string>(productHierarchy.grupos[0]?.name || '')

  // Grupo drill-down data
  const selectedGrupoData = useMemo(() => {
    return productHierarchy.grupos.find(g => g.name === selectedGrupo)
  }, [selectedGrupo])

  return (
    <div className="space-y-4">
      {/* ═══ KPI STRIP ═══ */}
      <div className="grid grid-cols-2 sm:grid-cols-4 xl:grid-cols-8 gap-2">
        {kpis.map((kpi) => (
          <Card key={kpi.title} className="py-0">
            <CardContent className="px-3 py-3">
              <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">{kpi.title}</p>
              <div className="text-lg font-bold tracking-tight mt-0.5">{kpi.value}</div>
              <p className={`text-[10px] mt-0.5 ${
                kpi.delta?.startsWith('+') ? 'text-emerald-400 font-medium' :
                kpi.delta?.startsWith('-') ? 'text-red-400 font-medium' :
                'text-muted-foreground'
              }`}>{kpi.sub}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* ═══ ROW 1: Revenue Total + Mix Shift + Tendencia Top 5 ═══ */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        {/* Revenue Total */}
        <Card>
          <CardHeader className="border-b px-4 py-3">
            <CardTitle className="text-sm">Revenue Total por Año</CardTitle>
          </CardHeader>
          <CardContent className="px-2 pt-3 pb-2">
            <ChartContainer config={yearConfig} className="aspect-auto h-[220px] w-full">
              <BarChart accessibilityLayer data={totalComparisonData} margin={{ top: 20, right: 20, left: 0, bottom: 0 }}>
                <CartesianGrid vertical={false} className="stroke-border/50" />
                <XAxis dataKey="year" tickLine={false} axisLine={false} tick={{ fontSize: 11 }} />
                <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 10 }} domain={[0, 6000]} />
                <ChartTooltip content={<ChartTooltipContent className="w-[140px]" formatter={(v) => `$${v}M`} />} />
                <ChartLegend content={<ChartLegendContent />} />
                <Bar dataKey="revenue" radius={[6, 6, 0, 0]}>
                  {totalComparisonData.map((e, i) => (
                    <Cell key={e.year} fill={[YEAR_COLORS['2024'], YEAR_COLORS['2025'], YEAR_COLORS['2026']][i]} />
                  ))}
                  <LabelList dataKey="revenue" position="top" fill="currentColor" formatter={(v: number) => `$${v}M`} fontSize={11} fontWeight={600} />
                </Bar>
              </BarChart>
            </ChartContainer>
          </CardContent>
          <CardFooter className="px-4 pb-3 pt-0">
            <span className="text-xs text-muted-foreground"><span className="text-emerald-400 font-medium">+$868M</span> en 2 años (+19.1%)</span>
          </CardFooter>
        </Card>

        {/* Mix Shift Stacked Area */}
        <Card>
          <CardHeader className="border-b px-4 py-3">
            <CardTitle className="text-sm">Evolución Mix Revenue (%)</CardTitle>
          </CardHeader>
          <CardContent className="px-2 pt-3 pb-2">
            <ChartContainer config={mixShiftConfig} className="aspect-auto h-[220px] w-full">
              <AreaChart accessibilityLayer data={mixShiftData} stackOffset="expand" margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid vertical={false} className="stroke-border/50" />
                <XAxis dataKey="year" tickLine={false} axisLine={false} tick={{ fontSize: 11 }} />
                <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 10 }} tickFormatter={(v) => `${Math.round(v * 100)}%`} />
                <ChartTooltip content={<ChartTooltipContent className="w-[160px]" formatter={(v) => `${Number(v).toFixed(1)}%`} />} />
                <ChartLegend content={<ChartLegendContent />} />
                {mixShiftCategories.map((cat, i) => (
                  <Area key={cat} type="monotone" dataKey={cat} stackId="1" stroke={CAT_COLORS[i] || '#94a3b8'} fill={CAT_COLORS[i] || '#94a3b8'} fillOpacity={0.8} />
                ))}
              </AreaChart>
            </ChartContainer>
          </CardContent>
          <CardFooter className="px-4 pb-3 pt-0">
            <span className="text-xs text-muted-foreground">Mac NB: 13.5% → 19.9% | iPhone Pro: 23.7% → 7.9%</span>
          </CardFooter>
        </Card>

        {/* Top 5 Slope/Line Chart */}
        <Card>
          <CardHeader className="border-b px-4 py-3">
            <CardTitle className="text-sm">Tendencia Top 5 Categorías</CardTitle>
          </CardHeader>
          <CardContent className="px-2 pt-3 pb-2">
            <ChartContainer
              config={Object.fromEntries(slopeInfo.cats.map((c, i) => [c.name, { label: c.name, color: CAT_COLORS[i] }]))}
              className="aspect-auto h-[220px] w-full"
            >
              <LineChart accessibilityLayer data={slopeInfo.data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid vertical={false} className="stroke-border/50" />
                <XAxis dataKey="year" tickLine={false} axisLine={false} tick={{ fontSize: 11 }} />
                <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 10 }} />
                <ChartTooltip content={<ChartTooltipContent className="w-[150px]" formatter={(v) => `$${v}M`} />} />
                <ChartLegend content={<ChartLegendContent />} />
                {slopeInfo.cats.map((cat, i) => (
                  <Line key={cat.name} type="monotone" dataKey={cat.name} stroke={CAT_COLORS[i]} strokeWidth={2} dot={{ r: 3 }} />
                ))}
              </LineChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* ═══ ROW 2: Daily Curve + ASP Comparison ═══ */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="border-b px-4 py-3">
            <CardTitle className="text-sm">Curva Diaria de Revenue</CardTitle>
            <CardDescription className="text-xs">Día 1 concentra &gt;50% del revenue</CardDescription>
          </CardHeader>
          <CardContent className="px-2 pt-3 pb-2">
            {(() => {
              const curveData = dailyCurve['2024'].days.map((day, i) => ({
                day, '2024': dailyCurve['2024'].revenue[i], '2025': dailyCurve['2025'].revenue[i],
              }))
              return (
                <ChartContainer config={twoYearConfig} className="aspect-auto h-[220px] w-full">
                  <BarChart accessibilityLayer data={curveData} margin={{ top: 20, right: 20, left: 0, bottom: 0 }}>
                    <CartesianGrid vertical={false} className="stroke-border/50" />
                    <XAxis dataKey="day" tickLine={false} axisLine={false} tick={{ fontSize: 11 }} />
                    <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 10 }} />
                    <ChartTooltip content={<ChartTooltipContent className="w-[160px]" formatter={(v) => `$${v}M`} />} />
                    <ChartLegend content={<ChartLegendContent />} />
                    <Bar dataKey="2024" fill={YEAR_COLORS['2024']} radius={[6, 6, 0, 0]}>
                      <LabelList dataKey="2024" position="top" fill="currentColor" formatter={(v: number) => `$${v}M`} fontSize={10} />
                    </Bar>
                    <Bar dataKey="2025" fill={YEAR_COLORS['2025']} radius={[6, 6, 0, 0]}>
                      <LabelList dataKey="2025" position="top" fill="currentColor" formatter={(v: number) => `$${v}M`} fontSize={10} />
                    </Bar>
                  </BarChart>
                </ChartContainer>
              )
            })()}
          </CardContent>
        </Card>

        {/* ASP Comparison */}
        <Card>
          <CardHeader className="border-b px-4 py-3">
            <CardTitle className="text-sm">Ticket Promedio por Categoría (ASP)</CardTitle>
            <CardDescription className="text-xs">CLP miles — explica divergencia revenue vs unidades</CardDescription>
          </CardHeader>
          <CardContent className="px-2 pt-3 pb-2">
            {(() => {
              const aspData = aspComparison.categories.map((cat, i) => ({
                name: cat,
                'ASP 2024': aspComparison.asp_2024[i],
                'ASP 2025': aspComparison.asp_2025[i],
                change: Math.round(((aspComparison.asp_2025[i] - aspComparison.asp_2024[i]) / aspComparison.asp_2024[i]) * 100),
              })).sort((a, b) => b['ASP 2025'] - a['ASP 2025'])
              const aspConfig = {
                'ASP 2024': { label: 'ASP 2024', color: YEAR_COLORS['2024'] },
                'ASP 2025': { label: 'ASP 2025', color: YEAR_COLORS['2025'] },
              } satisfies ChartConfig
              return (
                <ChartContainer config={aspConfig} className="aspect-auto h-[220px] w-full">
                  <BarChart accessibilityLayer data={aspData} layout="vertical" margin={{ top: 0, right: 60, left: 80, bottom: 0 }}>
                    <CartesianGrid horizontal={false} className="stroke-border/50" />
                    <XAxis type="number" tickLine={false} axisLine={false} tick={{ fontSize: 10 }} tickFormatter={(v) => `$${v}K`} />
                    <YAxis type="category" dataKey="name" tickLine={false} axisLine={false} tick={{ fontSize: 10 }} width={75} />
                    <ChartTooltip content={<ChartTooltipContent className="w-[180px]" formatter={(v) => `$${v}K`} />} />
                    <ChartLegend content={<ChartLegendContent />} />
                    <Bar dataKey="ASP 2024" fill={YEAR_COLORS['2024']} radius={[0, 6, 6, 0]} barSize={7} />
                    <Bar dataKey="ASP 2025" fill={YEAR_COLORS['2025']} radius={[0, 6, 6, 0]} barSize={7}>
                      <LabelList dataKey="change" position="right" fill="currentColor" formatter={(v: number) => `${v > 0 ? '+' : ''}${v}%`} fontSize={9} />
                    </Bar>
                  </BarChart>
                </ChartContainer>
              )
            })()}
          </CardContent>
        </Card>
      </div>

      {/* ═══ ROW 3: Growth by Category (full width) ═══ */}
      <Card>
        <CardHeader className="border-b px-4 py-3">
          <CardTitle className="text-sm">Cambio Revenue por Categoría (2025 → 2026)</CardTitle>
          <CardDescription className="text-xs">Verde = crece, rojo = decrece</CardDescription>
        </CardHeader>
        <CardContent className="px-2 pt-3 pb-2">
          <ChartContainer
            config={{ growth: { label: 'Crecimiento %', color: PALETTE.blue } } satisfies ChartConfig}
            className="aspect-auto h-[350px] w-full"
          >
            <BarChart accessibilityLayer data={growthData} layout="vertical" margin={{ top: 0, right: 70, left: 80, bottom: 0 }}>
              <CartesianGrid horizontal={false} className="stroke-border/50" />
              <XAxis type="number" tickLine={false} axisLine={false} tick={{ fontSize: 10 }} tickFormatter={(v) => `${v}%`} />
              <YAxis type="category" dataKey="name" tickLine={false} axisLine={false} tick={{ fontSize: 10 }} width={75} />
              <ReferenceLine x={0} stroke="hsl(var(--border))" strokeWidth={1} />
              <ChartTooltip
                content={<ChartTooltipContent className="w-[220px]" formatter={(value, name, item) => {
                  const d = item?.payload
                  return `${Number(value).toFixed(1)}% ($${d?.rev2025}M → $${d?.rev2026}M)`
                }} />}
              />
              <Bar dataKey="growth" radius={[0, 6, 6, 0]}>
                {growthData.map((d) => (<Cell key={d.name} fill={d.growth >= 0 ? PALETTE.emerald : PALETTE.rose} />))}
                <LabelList dataKey="growth" position="right" fill="currentColor" formatter={(v: number) => `${v > 0 ? '+' : ''}${v}%`} fontSize={10} />
              </Bar>
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* ═══ ROW 4: Product Hierarchy Drill-Down ═══ */}
      <Card>
        <CardHeader className="border-b px-4 py-3 flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-sm">Jerarquía de Producto: Grupo → Propiedad</CardTitle>
            <CardDescription className="text-xs">Revenue y unidades 2024 vs 2025 por grupo y propiedad</CardDescription>
          </div>
          <Select value={selectedGrupo} onValueChange={setSelectedGrupo}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Seleccionar grupo" />
            </SelectTrigger>
            <SelectContent>
              {productHierarchy.grupos.filter(g => g.revenue2025 > 0 || g.revenue2024 > 0).map((g) => (
                <SelectItem key={g.name} value={g.name}>{g.name} — ${g.revenue2025}M</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardHeader>
        <CardContent className="px-0 pt-0 pb-0">
          <div className="grid grid-cols-1 xl:grid-cols-2">
            {/* Left: Grupo-level overview bar */}
            <div className="border-r p-4">
              <h4 className="text-xs font-medium text-muted-foreground mb-3">Todos los Grupos — Revenue ($M)</h4>
              <ChartContainer config={twoYearConfig} className="aspect-auto h-[320px] w-full">
                <BarChart
                  accessibilityLayer
                  data={productHierarchy.grupos.filter(g => g.revenue2025 > 5 || g.revenue2024 > 5).slice(0, 12)}
                  layout="vertical"
                  margin={{ top: 0, right: 50, left: 100, bottom: 0 }}
                >
                  <CartesianGrid horizontal={false} className="stroke-border/50" />
                  <XAxis type="number" tickLine={false} axisLine={false} tick={{ fontSize: 10 }} />
                  <YAxis type="category" dataKey="name" tickLine={false} axisLine={false} tick={{ fontSize: 10 }} width={95} />
                  <ChartTooltip content={<ChartTooltipContent className="w-[180px]" formatter={(v) => `$${v}M`} />} />
                  <ChartLegend content={<ChartLegendContent />} />
                  <Bar dataKey="revenue2024" name="2024" fill={YEAR_COLORS['2024']} radius={[0, 6, 6, 0]} barSize={7} />
                  <Bar dataKey="revenue2025" name="2025" fill={YEAR_COLORS['2025']} radius={[0, 6, 6, 0]} barSize={7}>
                    <LabelList dataKey="revenue2025" position="right" fill="currentColor" formatter={(v: number) => `$${v}M`} fontSize={9} />
                  </Bar>
                </BarChart>
              </ChartContainer>
            </div>

            {/* Right: Propiedad drill-down for selected grupo */}
            <div className="p-4">
              <h4 className="text-xs font-medium text-muted-foreground mb-3">
                <span className="text-foreground font-semibold">{selectedGrupo}</span> — Propiedades
                {selectedGrupoData && (
                  <span className="ml-2">
                    ${selectedGrupoData.revenue2024}M → ${selectedGrupoData.revenue2025}M
                    <span className={`ml-1 ${selectedGrupoData.revenue2025 >= selectedGrupoData.revenue2024 ? 'text-emerald-400' : 'text-red-400'}`}>
                      ({selectedGrupoData.revenue2024 > 0
                        ? `${((selectedGrupoData.revenue2025 - selectedGrupoData.revenue2024) / selectedGrupoData.revenue2024 * 100).toFixed(0)}%`
                        : 'nuevo'})
                    </span>
                  </span>
                )}
              </h4>
              {selectedGrupoData && selectedGrupoData.propiedades.length > 0 ? (
                <div className="overflow-auto max-h-[320px]">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-xs">Propiedad</TableHead>
                        <TableHead className="text-xs text-right">Rev 2024</TableHead>
                        <TableHead className="text-xs text-right">Rev 2025</TableHead>
                        <TableHead className="text-xs text-right">Δ%</TableHead>
                        <TableHead className="text-xs text-right">Uds 2024</TableHead>
                        <TableHead className="text-xs text-right">Uds 2025</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {selectedGrupoData.propiedades
                        .filter(p => p.revenue2024 > 0 || p.revenue2025 > 0)
                        .map((prop) => {
                          const pctChange = prop.revenue2024 > 0
                            ? ((prop.revenue2025 - prop.revenue2024) / prop.revenue2024 * 100)
                            : (prop.revenue2025 > 0 ? 999 : 0)
                          return (
                            <TableRow key={prop.name}>
                              <TableCell className="text-xs font-medium">{prop.name}</TableCell>
                              <TableCell className="text-xs text-right">${prop.revenue2024}M</TableCell>
                              <TableCell className="text-xs text-right font-medium">${prop.revenue2025}M</TableCell>
                              <TableCell className={`text-xs text-right font-medium ${pctChange >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                                {pctChange === 999 ? 'NUEVO' : `${pctChange > 0 ? '+' : ''}${pctChange.toFixed(0)}%`}
                              </TableCell>
                              <TableCell className="text-xs text-right text-muted-foreground">{prop.units2024.toLocaleString()}</TableCell>
                              <TableCell className="text-xs text-right">{prop.units2025.toLocaleString()}</TableCell>
                            </TableRow>
                          )
                        })}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <p className="text-xs text-muted-foreground">Sin datos de propiedades</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ═══ ROW 5: Hourly + Regional ═══ */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="border-b px-4 py-3">
            <CardTitle className="text-sm">Distribución Horaria Revenue</CardTitle>
            <CardDescription className="text-xs">Pico medianoche (apertura) y mediodía</CardDescription>
          </CardHeader>
          <CardContent className="px-2 pt-3 pb-2">
            {(() => {
              const hourData = hourlyDist.hours.map((h) => ({
                hour: `${String(h).padStart(2, '0')}h`,
                '2024': hourlyDist['2024'].revenue[h],
                '2025': hourlyDist['2025'].revenue[h],
              }))
              return (
                <ChartContainer config={twoYearConfig} className="aspect-auto h-[220px] w-full">
                  <AreaChart accessibilityLayer data={hourData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <CartesianGrid vertical={false} className="stroke-border/50" />
                    <XAxis dataKey="hour" tickLine={false} axisLine={false} tick={{ fontSize: 9 }} interval={2} />
                    <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 10 }} />
                    <ChartTooltip content={<ChartTooltipContent className="w-[140px]" formatter={(v) => `$${v}M`} />} />
                    <ChartLegend content={<ChartLegendContent />} />
                    <Area type="monotone" dataKey="2024" stroke={YEAR_COLORS['2024']} fill={YEAR_COLORS['2024']} fillOpacity={0.15} strokeWidth={2} />
                    <Area type="monotone" dataKey="2025" stroke={YEAR_COLORS['2025']} fill={YEAR_COLORS['2025']} fillOpacity={0.25} strokeWidth={2} />
                  </AreaChart>
                </ChartContainer>
              )
            })()}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="border-b px-4 py-3">
            <CardTitle className="text-sm">Revenue por Región</CardTitle>
            <CardDescription className="text-xs">RM + Valparaíso + Bío Bío = 81%</CardDescription>
          </CardHeader>
          <CardContent className="px-2 pt-3 pb-2">
            {(() => {
              const regData = regionalData.regions.map((reg, i) => ({
                region: reg, '2024': regionalData['2024'].revenue[i], '2025': regionalData['2025'].revenue[i],
              })).sort((a, b) => b['2025'] - a['2025'])
              return (
                <ChartContainer config={twoYearConfig} className="aspect-auto h-[220px] w-full">
                  <BarChart accessibilityLayer data={regData} layout="vertical" margin={{ top: 0, right: 50, left: 80, bottom: 0 }}>
                    <CartesianGrid horizontal={false} className="stroke-border/50" />
                    <XAxis type="number" tickLine={false} axisLine={false} tick={{ fontSize: 10 }} />
                    <YAxis type="category" dataKey="region" tickLine={false} axisLine={false} tick={{ fontSize: 9 }} width={75} />
                    <ChartTooltip content={<ChartTooltipContent className="w-[160px]" formatter={(v) => `$${v}M`} />} />
                    <ChartLegend content={<ChartLegendContent />} />
                    <Bar dataKey="2024" fill={YEAR_COLORS['2024']} radius={[0, 6, 6, 0]} barSize={7} />
                    <Bar dataKey="2025" fill={YEAR_COLORS['2025']} radius={[0, 6, 6, 0]} barSize={7}>
                      <LabelList dataKey="2025" position="right" fill="currentColor" formatter={(v: number) => `$${v}M`} fontSize={9} />
                    </Bar>
                  </BarChart>
                </ChartContainer>
              )
            })()}
          </CardContent>
        </Card>
      </div>

      {/* ═══ ROW 6: GA Channels + Klaviyo Email ═══ */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="border-b px-4 py-3">
            <CardTitle className="text-sm">Canales de Adquisición Web (GA)</CardTitle>
            <CardDescription className="text-xs">Sesiones por canal — CyberDay 2024 vs 2025</CardDescription>
          </CardHeader>
          <CardContent className="px-2 pt-3 pb-2">
            {(() => {
              const channelData = gaChannels.channels
                .map((ch) => ({
                  name: ch.name,
                  '2024': Math.round(ch.sessions2024 / 1000),
                  '2025': Math.round(ch.sessions2025 / 1000),
                }))
                .sort((a, b) => b['2025'] - a['2025'])
              return (
                <ChartContainer config={twoYearConfig} className="aspect-auto h-[260px] w-full">
                  <BarChart accessibilityLayer data={channelData} layout="vertical" margin={{ top: 0, right: 50, left: 100, bottom: 0 }}>
                    <CartesianGrid horizontal={false} className="stroke-border/50" />
                    <XAxis type="number" tickLine={false} axisLine={false} tick={{ fontSize: 10 }} tickFormatter={(v) => `${v}K`} />
                    <YAxis type="category" dataKey="name" tickLine={false} axisLine={false} tick={{ fontSize: 10 }} width={95} />
                    <ChartTooltip content={<ChartTooltipContent className="w-[180px]" formatter={(v) => `${v}K sesiones`} />} />
                    <ChartLegend content={<ChartLegendContent />} />
                    <Bar dataKey="2024" fill={YEAR_COLORS['2024']} radius={[0, 6, 6, 0]} barSize={7} />
                    <Bar dataKey="2025" fill={YEAR_COLORS['2025']} radius={[0, 6, 6, 0]} barSize={7} />
                  </BarChart>
                </ChartContainer>
              )
            })()}
          </CardContent>
          <CardFooter className="px-4 pb-3 pt-0">
            <span className="text-xs text-muted-foreground">Paid Search <span className="text-emerald-400 font-medium">+268%</span> · Paid Social <span className="text-blue-400 font-medium">nuevo 2025</span></span>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader className="border-b px-4 py-3">
            <CardTitle className="text-sm">Email Marketing — Klaviyo 2025</CardTitle>
            <CardDescription className="text-xs">Revenue atribuido por campaña ($M CLP)</CardDescription>
          </CardHeader>
          <CardContent className="px-2 pt-3 pb-2">
            {(() => {
              const emailData = klaviyoCampaigns['2025'].campaigns
                .map((c) => ({ name: c.name, revenue: c.revenue, conversions: c.conversions }))
                .sort((a, b) => b.revenue - a.revenue)
              return (
                <ChartContainer
                  config={{ revenue: { label: 'Revenue ($M)', color: PALETTE.blue } } satisfies ChartConfig}
                  className="aspect-auto h-[260px] w-full"
                >
                  <BarChart accessibilityLayer data={emailData} layout="vertical" margin={{ top: 0, right: 60, left: 105, bottom: 0 }}>
                    <CartesianGrid horizontal={false} className="stroke-border/50" />
                    <XAxis type="number" tickLine={false} axisLine={false} tick={{ fontSize: 10 }} tickFormatter={(v) => `$${v}M`} />
                    <YAxis type="category" dataKey="name" tickLine={false} axisLine={false} tick={{ fontSize: 9 }} width={100} />
                    <ChartTooltip content={<ChartTooltipContent className="w-[200px]" formatter={(v, n, item) => `$${v}M (${item?.payload?.conversions?.toLocaleString()} conv.)`} />} />
                    <Bar dataKey="revenue" radius={[0, 6, 6, 0]}>
                      {emailData.map((_, i) => (<Cell key={i} fill={CAT_COLORS[i % CAT_COLORS.length]} />))}
                      <LabelList dataKey="revenue" position="right" fill="currentColor" formatter={(v: number) => `$${v}M`} fontSize={10} />
                    </Bar>
                  </BarChart>
                </ChartContainer>
              )
            })()}
          </CardContent>
          <CardFooter className="px-4 pb-3 pt-0">
            <span className="text-xs text-muted-foreground">
              Total 2025: <span className="font-medium text-foreground">${klaviyoCampaigns['2025'].totals.revenue}M</span> vs 2024: ${klaviyoCampaigns['2024'].totals.revenue}M
              <span className="text-emerald-400 font-medium ml-1">+{klaviyoCampaigns.yoy.revenue}%</span>
            </span>
          </CardFooter>
        </Card>
      </div>

      {/* ═══ ROW 7: Growth Decomposition + New vs Returning ═══ */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        {/* Waterfall: Price vs Volume */}
        <Card>
          <CardHeader className="border-b px-4 py-3">
            <CardTitle className="text-sm">Descomposición del Crecimiento</CardTitle>
            <CardDescription className="text-xs">Revenue +10.9% → ¿precio o volumen?</CardDescription>
          </CardHeader>
          <CardContent className="px-2 pt-3 pb-2">
            {(() => {
              // Build waterfall
              const waterfallData = [
                { name: '2024', value: 4553, fill: YEAR_COLORS['2024'], display: 4553 },
                { name: 'Volumen\n(+0.9%)', value: 39, fill: PALETTE.amber, display: 39 },
                { name: 'Precio/ASP\n(+9.9%)', value: 455, fill: PALETTE.rose, display: 455 },
                { name: '2025', value: 5047, fill: YEAR_COLORS['2025'], display: 5047 },
              ]
              // Stacked waterfall: invisible base + visible bar
              const waterfallStacked = waterfallData.map((d, i) => {
                if (i === 0) return { ...d, base: 0, bar: d.value }
                if (i === waterfallData.length - 1) return { ...d, base: 0, bar: d.value }
                const prevTotal = waterfallStacked ? waterfallData.slice(0, i).reduce((s, x, xi) => xi === 0 ? x.value : s + x.value, 0) : 0
                return { ...d, base: prevTotal, bar: d.value }
              })
              // Manually compute bases
              const stacked = [
                { name: '2024', base: 0, bar: 4553, fill: YEAR_COLORS['2024'], label: '$4,553M' },
                { name: 'Volumen (+0.9%)', base: 4553, bar: 39, fill: PALETTE.amber, label: '+$39M' },
                { name: 'Precio/ASP (+9.9%)', base: 4592, bar: 455, fill: PALETTE.rose, label: '+$455M' },
                { name: '2025', base: 0, bar: 5047, fill: YEAR_COLORS['2025'], label: '$5,047M' },
              ]
              const wfConfig: ChartConfig = {
                base: { label: 'Base', color: 'transparent' },
                bar: { label: 'Valor', color: PALETTE.blue },
              }
              return (
                <ChartContainer config={wfConfig} className="aspect-auto h-[220px] w-full">
                  <BarChart accessibilityLayer data={stacked} margin={{ top: 20, right: 10, left: 0, bottom: 0 }}>
                    <CartesianGrid vertical={false} className="stroke-border/50" />
                    <XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ fontSize: 10 }} />
                    <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 10 }} domain={[0, 5500]} />
                    <ChartTooltip content={<ChartTooltipContent className="w-[160px]" formatter={(v, name) => name === 'base' ? null : `$${v}M`} />} />
                    <Bar dataKey="base" stackId="a" fill="transparent" radius={0} />
                    <Bar dataKey="bar" stackId="a" radius={[6, 6, 0, 0]}>
                      {stacked.map((e, i) => (
                        <Cell key={i} fill={e.fill} />
                      ))}
                      <LabelList dataKey="label" position="top" fill="currentColor" fontSize={10} fontWeight={600} />
                    </Bar>
                  </BarChart>
                </ChartContainer>
              )
            })()}
          </CardContent>
          <CardFooter className="px-4 pb-3 pt-0">
            <span className="text-xs text-muted-foreground">
              <span className="text-rose-400 font-medium">92%</span> del crecimiento viene de precio · Solo <span className="text-amber-400 font-medium">8%</span> por volumen
            </span>
          </CardFooter>
        </Card>

        {/* New vs Returning visitors */}
        <Card>
          <CardHeader className="border-b px-4 py-3">
            <CardTitle className="text-sm">New vs Returning Visitors</CardTitle>
            <CardDescription className="text-xs">La base se está fidelizando — Returning +114% YoY</CardDescription>
          </CardHeader>
          <CardContent className="px-2 pt-3 pb-2">
            {(() => {
              const nrConfig: ChartConfig = {
                '2024': { label: '2024', color: YEAR_COLORS['2024'] },
                '2025': { label: '2025', color: YEAR_COLORS['2025'] },
              }
              const chartData = [
                { type: 'New', '2024': Math.round(newReturningData['2024'].new / 1000), '2025': Math.round(newReturningData['2025'].new / 1000) },
                { type: 'Returning', '2024': Math.round(newReturningData['2024'].returning / 1000), '2025': Math.round(newReturningData['2025'].returning / 1000) },
              ]
              return (
                <div className="space-y-3">
                  <ChartContainer config={nrConfig} className="aspect-auto h-[160px] w-full">
                    <BarChart accessibilityLayer data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                      <CartesianGrid vertical={false} className="stroke-border/50" />
                      <XAxis dataKey="type" tickLine={false} axisLine={false} tick={{ fontSize: 11 }} />
                      <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 10 }} tickFormatter={(v) => `${v}K`} />
                      <ChartTooltip content={<ChartTooltipContent className="w-[160px]" formatter={(v) => `${v}K sesiones`} />} />
                      <ChartLegend content={<ChartLegendContent />} />
                      <Bar dataKey="2024" fill={YEAR_COLORS['2024']} radius={[6, 6, 0, 0]} barSize={28}>
                        <LabelList dataKey="2024" position="top" fill="currentColor" formatter={(v: number) => `${v}K`} fontSize={10} />
                      </Bar>
                      <Bar dataKey="2025" fill={YEAR_COLORS['2025']} radius={[6, 6, 0, 0]} barSize={28}>
                        <LabelList dataKey="2025" position="top" fill="currentColor" formatter={(v: number) => `${v}K`} fontSize={10} fontWeight={600} />
                      </Bar>
                    </BarChart>
                  </ChartContainer>
                  {/* Composition mini-bars */}
                  <div className="grid grid-cols-2 gap-3 px-2">
                    {newReturningData.composition.map((yr) => (
                      <div key={yr.year} className="space-y-1">
                        <p className="text-[10px] font-medium text-muted-foreground text-center">{yr.year}</p>
                        <div className="flex h-3 rounded-full overflow-hidden">
                          <div className="bg-sky-400" style={{ width: `${yr.New}%` }} title={`New ${yr.New}%`} />
                          <div className="bg-blue-500" style={{ width: `${yr.Returning}%` }} title={`Returning ${yr.Returning}%`} />
                          <div className="bg-muted" style={{ width: `${100 - yr.New - yr.Returning}%` }} />
                        </div>
                        <div className="flex justify-between text-[9px] text-muted-foreground">
                          <span>New {yr.New}%</span>
                          <span>Ret. {yr.Returning}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )
            })()}
          </CardContent>
          <CardFooter className="px-4 pb-3 pt-0">
            <span className="text-xs text-muted-foreground">
              Returning <span className="text-emerald-400 font-medium">+114%</span> · New <span className="text-blue-400 font-medium">+72%</span> · Share Returning: 36% → 42%
            </span>
          </CardFooter>
        </Card>
      </div>

      {/* ═══ ROW 8: Email KPIs + Channel/Order KPIs ═══ */}
      <div className="grid grid-cols-2 sm:grid-cols-4 xl:grid-cols-8 gap-2">
        {[
          { t: 'Campañas Email', v: String(klaviyoCampaigns['2025'].totals.campaigns), s: `vs ${klaviyoCampaigns['2024'].totals.campaigns} en 2024`, d: '+' },
          { t: 'Open Rate', v: `${klaviyoCampaigns['2025'].totals.avgOpenRate}%`, s: `vs ${klaviyoCampaigns['2024'].totals.avgOpenRate}%`, d: '+' },
          { t: 'Click Rate', v: `${klaviyoCampaigns['2025'].totals.avgClickRate}%`, s: `vs ${klaviyoCampaigns['2024'].totals.avgClickRate}%`, d: '+' },
          { t: 'Rev Atribuido', v: `$${klaviyoCampaigns['2025'].totals.revenue}M`, s: `+${klaviyoCampaigns.yoy.revenue}% vs 2024`, d: '+' },
          { t: 'Canal Web', v: `${channelMix['2025'].Web.pct}%`, s: `$${channelMix['2025'].Web.revenue.toLocaleString()}M`, d: null },
          { t: 'Click & Go', v: `${channelMix['2025']['Click & Go'].pct}%`, s: `$${channelMix['2025']['Click & Go'].revenue.toLocaleString()}M`, d: null },
          { t: 'Tasa Conv.', v: `${gaTraffic.totals['2025'].conversionRate}%`, s: `+${gaTraffic.yoy.conversionRate.toFixed(0)}% vs 2024`, d: '+' },
          { t: 'Add to Cart', v: `${(gaTraffic.totals['2025'].addToCarts / 1000).toFixed(1)}K`, s: `+${gaTraffic.yoy.addToCarts.toFixed(0)}% vs 2024`, d: '+' },
        ].map((k) => (
          <Card key={k.t} className="py-0">
            <CardContent className="px-3 py-3">
              <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">{k.t}</p>
              <div className="text-lg font-bold tracking-tight mt-0.5">{k.v}</div>
              <p className={`text-[10px] mt-0.5 ${k.d === '+' ? 'text-emerald-400 font-medium' : k.d === '-' ? 'text-red-400 font-medium' : 'text-muted-foreground'}`}>{k.s}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* ═══ ROW 9: Launch Tracker + Sensitivity ═══ */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="border-b px-4 py-3">
            <CardTitle className="text-sm">Tracker de Lanzamientos</CardTitle>
            <CardDescription className="text-xs">Velocidad de ventas vs target CyberDay</CardDescription>
          </CardHeader>
          <CardContent className="px-2 pt-2 pb-2">
            <div className="overflow-auto max-h-[300px]">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs">Producto</TableHead>
                    <TableHead className="text-xs">Lanzamiento</TableHead>
                    <TableHead className="text-xs text-right">Rate/día</TableHead>
                    <TableHead className="text-xs text-right">Target</TableHead>
                    <TableHead className="text-xs text-right">Mult.</TableHead>
                    <TableHead className="text-xs">Conf.</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {launchData.products.sort((a, b) => a.multiplier - b.multiplier).map((p) => (
                    <TableRow key={p.product}>
                      <TableCell className="text-xs font-medium">{p.product}</TableCell>
                      <TableCell className="text-xs">{p.launchDate}</TableCell>
                      <TableCell className="text-xs text-right">${p.dailyRate.toLocaleString()}</TableCell>
                      <TableCell className="text-xs text-right">${p.cyberTarget.toLocaleString()}</TableCell>
                      <TableCell className="text-xs text-right font-semibold">{p.multiplier.toFixed(1)}x</TableCell>
                      <TableCell>
                        <Badge className={
                          p.confidence === 'Alta' ? 'bg-emerald-400/20 text-emerald-400' :
                          'bg-amber-400/20 text-amber-400'
                        }>{p.confidence}</Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="border-b px-4 py-3">
            <CardTitle className="text-sm">Análisis de Sensibilidad</CardTitle>
            <CardDescription className="text-xs">Escenarios pesimista/optimista — impacto en revenue ($M)</CardDescription>
          </CardHeader>
          <CardContent className="px-2 pt-2 pb-2">
            <div className="overflow-auto max-h-[300px]">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs">Variable</TableHead>
                    <TableHead className="text-xs">Pesimista</TableHead>
                    <TableHead className="text-xs text-right">Δ</TableHead>
                    <TableHead className="text-xs">Optimista</TableHead>
                    <TableHead className="text-xs text-right">Δ</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sensitivityData.scenarios.map((s) => (
                    <TableRow key={s.variable}>
                      <TableCell className="text-xs font-medium flex items-center gap-1">
                        {s.variable}{s.applied && <span className="text-sm">✅</span>}
                      </TableCell>
                      <TableCell className="text-xs">{s.pessimistic}</TableCell>
                      <TableCell className={`text-xs text-right font-medium ${s.pessDelta < 0 ? 'text-red-400' : 'text-emerald-400'}`}>
                        {s.pessDelta > 0 ? '+' : ''}{s.pessDelta.toFixed(2)}
                      </TableCell>
                      <TableCell className="text-xs">{s.optimistic}</TableCell>
                      <TableCell className={`text-xs text-right font-medium ${s.optDelta < 0 ? 'text-red-400' : 'text-emerald-400'}`}>
                        {s.optDelta > 0 ? '+' : ''}{s.optDelta.toFixed(2)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
