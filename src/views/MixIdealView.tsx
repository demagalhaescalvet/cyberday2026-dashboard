'use client'

import { useState, useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent, type ChartConfig } from '@/components/ui/chart'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, LabelList, Cell, RadarChart, Radar, PolarGrid, PolarAngleAxis } from 'recharts'
import type { ProductMixCategory } from '@/types/product-mix'
import productMixData from '@/data/product-mix.json'
import elasticityData from '@/data/elasticity.json'
import multiYearData from '@/data/multi-year.json'

const CAT_COLORS = ['#2b7fff', '#f59e0b', '#10b981', '#f43f5e', '#8b5cf6', '#06b6d4', '#f97316', '#84cc16', '#ec4899', '#64748b']
const RADAR_COLORS = { units: '#2b7fff', revenue: '#10b981', asp: '#f59e0b', elasticity: '#f43f5e' }

const clpFormatter = new Intl.NumberFormat('es-CL', {
  style: 'currency', currency: 'CLP', minimumFractionDigits: 0, maximumFractionDigits: 0,
})

type SortColumn = 'name' | 'units' | 'revenue' | 'asp' | 'pct'
type SortDir = 'asc' | 'desc'

export function MixIdealView() {
  const [searchTerm, setSearchTerm] = useState('')
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null)
  const [sortColumn, setSortColumn] = useState<SortColumn>('revenue')
  const [sortDir, setSortDir] = useState<SortDir>('desc')

  const categories = useMemo(() => {
    const data = productMixData as unknown as { categories: ProductMixCategory[] }
    return data.categories
  }, [])

  const totalRevenue = useMemo(() => categories.reduce((s, c) => s + c.revenue, 0), [categories])
  const totalUnits = useMemo(() => categories.reduce((s, c) => s + c.units, 0), [categories])

  const sorted = useMemo(() => {
    let filtered = [...categories].filter((c) => c.name.toLowerCase().includes(searchTerm.toLowerCase()))

    filtered.sort((a, b) => {
      let aVal: number | string
      let bVal: number | string

      switch (sortColumn) {
        case 'name': aVal = a.name; bVal = b.name; break
        case 'units': aVal = a.units; bVal = b.units; break
        case 'revenue': aVal = a.revenue; bVal = b.revenue; break
        case 'asp': aVal = a.asp; bVal = b.asp; break
        case 'pct': aVal = (a.revenue / totalRevenue) * 100; bVal = (b.revenue / totalRevenue) * 100; break
      }

      if (sortDir === 'asc') return aVal > bVal ? 1 : -1
      return aVal < bVal ? 1 : -1
    })

    return filtered
  }, [categories, searchTerm, sortColumn, sortDir, totalRevenue])

  const barChartData = useMemo(() => {
    return [...categories].sort((a, b) => b.revenue - a.revenue).map((c, i) => ({
      name: c.name,
      value: c.revenue,
      fill: CAT_COLORS[i % CAT_COLORS.length],
    }))
  }, [categories])

  const radarTop5 = useMemo(() => {
    const top5Categories = [...categories].sort((a, b) => b.revenue - a.revenue).slice(0, 5)
    const maxUnits = Math.max(...categories.map(c => c.units))
    const maxRevenue = Math.max(...categories.map(c => c.revenue))
    const maxAsp = Math.max(...categories.map(c => c.asp))
    const maxElasticity = Math.max(...Object.values(elasticityData.categories).map((d: any) => d.elasticity))

    return top5Categories.map(cat => {
      const elasticity = (elasticityData.categories[cat.name] as any)?.elasticity || 0
      return {
        name: cat.name,
        units: Math.round((cat.units / maxUnits) * 100),
        revenue: Math.round((cat.revenue / maxRevenue) * 100),
        asp: Math.round((cat.asp / maxAsp) * 100),
        elasticity: Math.round((elasticity / maxElasticity) * 100),
      }
    })
  }, [categories])

  const growthData = useMemo(() => {
    return [...categories]
      .sort((a, b) => b.revenue - a.revenue)
      .map(cat => {
        const catIdx = multiYearData.categories.indexOf(cat.name)
        const units2025 = catIdx >= 0 ? (multiYearData.units['2025'][catIdx] || 0) : 0
        const units2026 = catIdx >= 0 ? (multiYearData.units['2026_target'][catIdx] || 0) : 0
        const growthPct = units2025 > 0 ? ((units2026 - units2025) / units2025) * 100 : 0
        return { name: cat.name, growth: growthPct }
      })
  }, [categories])

  const toggleExpand = (name: string) => setExpandedCategory(expandedCategory === name ? null : name)

  const handleHeaderClick = (col: SortColumn) => {
    if (sortColumn === col) setSortDir(sortDir === 'asc' ? 'desc' : 'asc')
    else { setSortColumn(col); setSortDir('desc') }
  }

  const topCategory = sorted[0] || categories[0]
  const top3Revenue = sorted.slice(0, 3).reduce((sum, c) => sum + c.revenue, 0)
  const concentrationPct = totalRevenue > 0 ? (top3Revenue / totalRevenue) * 100 : 0
  const highestAspCategory = sorted.reduce((prev, current) => current.asp > prev.asp ? current : prev, sorted[0] || categories[0])

  const renderSortIndicator = (col: SortColumn) => {
    if (sortColumn !== col) return ''
    return sortDir === 'asc' ? ' ▲' : ' ▼'
  }

  const barConfig = barChartData.reduce((acc, item) => {
    acc[item.name] = { label: item.name, color: item.fill }
    return acc
  }, {} as Record<string, { label: string; color: string }>) satisfies ChartConfig

  const radarConfig = {
    units: { label: 'Units', color: RADAR_COLORS.units },
    revenue: { label: 'Revenue', color: RADAR_COLORS.revenue },
    asp: { label: 'ASP', color: RADAR_COLORS.asp },
    elasticity: { label: 'Elasticity', color: RADAR_COLORS.elasticity },
  } satisfies ChartConfig

  const growthConfig = {
    positive: { label: 'Crecimiento', color: '#10b981' },
    negative: { label: 'Decrecimiento', color: '#ef4444' },
  } satisfies ChartConfig

  return (
    <div className="space-y-4">
      {/* Compact KPI Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 xl:grid-cols-6 gap-3">
        <Card className="p-3">
          <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Categorías</p>
          <p className="text-xl font-bold mt-1">{categories.length}</p>
        </Card>
        <Card className="p-3">
          <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Unidades Total</p>
          <p className="text-xl font-bold mt-1">{totalUnits.toLocaleString()}</p>
        </Card>
        <Card className="p-3">
          <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Revenue Total</p>
          <p className="text-xl font-bold mt-1">${totalRevenue}M</p>
        </Card>
        <Card className="p-3">
          <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Top Categoría</p>
          <p className="text-xl font-bold mt-1">{topCategory.name}</p>
          <p className="text-xs text-muted-foreground">${topCategory.revenue}M</p>
        </Card>
        <Card className="p-3">
          <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Concentración Top 3</p>
          <p className="text-xl font-bold mt-1">{concentrationPct.toFixed(1)}%</p>
        </Card>
        <Card className="p-3">
          <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">ASP Más Alto</p>
          <p className="text-xl font-bold mt-1">{clpFormatter.format(highestAspCategory.asp)}</p>
          <p className="text-xs text-muted-foreground">{highestAspCategory.name}</p>
        </Card>
      </div>

      {/* Two-column: Bar Chart + Radar */}
      <div className="grid lg:grid-cols-5 gap-4">
        {/* Revenue Bar Chart */}
        <Card className="lg:col-span-3 flex flex-col">
          <CardHeader className="pb-2 pt-4 px-4">
            <CardTitle className="text-sm">Revenue por Categoría</CardTitle>
            <CardDescription className="text-xs">Ranking 2026 target ($M)</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 px-2 pb-2">
            <ChartContainer config={barConfig} className="w-full h-[420px]">
              <BarChart data={barChartData} layout="vertical" margin={{ left: 90, right: 60 }} accessibilityLayer>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 11 }} />
                <YAxis dataKey="name" type="category" width={85} tick={{ fontSize: 11 }} />
                <ChartTooltip cursor={false} content={<ChartTooltipContent formatter={(v) => `$${v}M`} />} />
                <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                  {barChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                  <LabelList dataKey="value" position="right" formatter={(v: number) => `$${v}M`} className="text-xs" />
                </Bar>
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Radar Chart */}
        <Card className="lg:col-span-2 flex flex-col">
          <CardHeader className="pb-2 pt-4 px-4">
            <CardTitle className="text-sm">Top 5 — Multidimensional</CardTitle>
            <CardDescription className="text-xs">Units, Revenue, ASP, Elasticidad (normalizados)</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 flex justify-center items-center px-2 pb-2">
            <ChartContainer config={radarConfig} className="w-full aspect-square max-w-[340px]">
              <RadarChart data={radarTop5} accessibilityLayer>
                <PolarGrid strokeDasharray="3 3" />
                <PolarAngleAxis dataKey="name" tick={{ fontSize: 10 }} />
                <ChartTooltip cursor={false} content={<ChartTooltipContent formatter={(v) => `${v}/100`} />} />
                <Radar name="Units" dataKey="units" stroke={RADAR_COLORS.units} fill={RADAR_COLORS.units} fillOpacity={0.2} />
                <Radar name="Revenue" dataKey="revenue" stroke={RADAR_COLORS.revenue} fill={RADAR_COLORS.revenue} fillOpacity={0.2} />
                <Radar name="ASP" dataKey="asp" stroke={RADAR_COLORS.asp} fill={RADAR_COLORS.asp} fillOpacity={0.2} />
                <Radar name="Elasticity" dataKey="elasticity" stroke={RADAR_COLORS.elasticity} fill={RADAR_COLORS.elasticity} fillOpacity={0.2} />
                <ChartLegend content={<ChartLegendContent />} />
              </RadarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* Details Table */}
      <Card className="flex flex-col">
        <CardHeader className="pb-2 pt-4 px-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm">Detalle por Categoría</CardTitle>
            <Input
              placeholder="Filtrar..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-[200px] h-8 text-sm"
            />
          </div>
        </CardHeader>
        <CardContent className="px-2 pb-2">
          <div className="overflow-x-auto max-h-[500px] overflow-y-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-8"></TableHead>
                  <TableHead className="cursor-pointer select-none hover:text-foreground transition-colors" onClick={() => handleHeaderClick('name')}>
                    Categoría{renderSortIndicator('name')}
                  </TableHead>
                  <TableHead className="text-right cursor-pointer select-none hover:text-foreground transition-colors" onClick={() => handleHeaderClick('units')}>
                    Uds{renderSortIndicator('units')}
                  </TableHead>
                  <TableHead className="text-right cursor-pointer select-none hover:text-foreground transition-colors" onClick={() => handleHeaderClick('revenue')}>
                    Rev (M){renderSortIndicator('revenue')}
                  </TableHead>
                  <TableHead className="text-right cursor-pointer select-none hover:text-foreground transition-colors" onClick={() => handleHeaderClick('asp')}>
                    ASP{renderSortIndicator('asp')}
                  </TableHead>
                  <TableHead className="text-right cursor-pointer select-none hover:text-foreground transition-colors" onClick={() => handleHeaderClick('pct')}>
                    %{renderSortIndicator('pct')}
                  </TableHead>
                  <TableHead className="w-[120px]">Mix</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sorted.map((cat, idx) => {
                  const pct = (cat.revenue / totalRevenue) * 100
                  const isExpanded = expandedCategory === cat.name
                  return (
                    <tbody key={cat.name}>
                      <TableRow
                        onClick={() => toggleExpand(cat.name)}
                        className="cursor-pointer hover:bg-muted/50 transition-colors"
                      >
                        <TableCell className="text-center">
                          <span className="text-lg transition-transform inline-block" style={{ transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)' }}>
                            ▸
                          </span>
                        </TableCell>
                        <TableCell className="font-medium">
                          <span className="inline-block w-2.5 h-2.5 rounded-full mr-2" style={{ backgroundColor: CAT_COLORS[idx % CAT_COLORS.length] }} />
                          {cat.name}
                        </TableCell>
                        <TableCell className="text-right tabular-nums">{cat.units.toLocaleString()}</TableCell>
                        <TableCell className="text-right tabular-nums">${cat.revenue}M</TableCell>
                        <TableCell className="text-right tabular-nums">{clpFormatter.format(cat.asp)}</TableCell>
                        <TableCell className="text-right tabular-nums">{pct.toFixed(1)}%</TableCell>
                        <TableCell>
                          <div className="w-full bg-muted rounded-full h-2">
                            <div
                              className="h-2 rounded-full transition-all"
                              style={{ width: `${pct}%`, backgroundColor: CAT_COLORS[idx % CAT_COLORS.length] }}
                            />
                          </div>
                        </TableCell>
                      </TableRow>
                      {isExpanded && (
                        <TableRow>
                          <TableCell colSpan={7} className="bg-muted/30 p-4">
                            <div className="space-y-3">
                              <p className="text-sm font-semibold">Subcategorías</p>
                              {cat.subcategories.map((sub) => (
                                <div key={sub.name} className="border border-border rounded-lg p-3 space-y-2">
                                  <div className="flex items-center justify-between text-sm">
                                    <span className="font-medium">{sub.name}</span>
                                    <span className="text-muted-foreground">{sub.units.toLocaleString()} uds — ${sub.revenue}M</span>
                                  </div>
                                  <div className="w-full bg-muted rounded-full h-1.5">
                                    <div className="h-1.5 rounded-full" style={{ width: `${((sub.units / cat.units) * 100).toFixed(1)}%`, backgroundColor: CAT_COLORS[idx % CAT_COLORS.length] }} />
                                  </div>
                                  {sub.skus && sub.skus.length > 0 && (
                                    <div className="ml-2 mt-1 space-y-0.5 text-xs text-muted-foreground">
                                      {sub.skus.map((sku) => (
                                        <div key={sku.sku} className="flex justify-between">
                                          <span>{sku.name}</span>
                                          <span>{sku.units} @ {clpFormatter.format(sku.price)}</span>
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                    </tbody>
                  )
                })}
                <TableRow className="font-bold bg-muted/50">
                  <TableCell />
                  <TableCell>TOTAL</TableCell>
                  <TableCell className="text-right tabular-nums">{totalUnits.toLocaleString()}</TableCell>
                  <TableCell className="text-right tabular-nums">${totalRevenue}M</TableCell>
                  <TableCell className="text-right tabular-nums">{clpFormatter.format(Math.round(totalRevenue / totalUnits * 1000))}</TableCell>
                  <TableCell className="text-right">100%</TableCell>
                  <TableCell />
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Two-column: Elasticity + Growth */}
      <div className="grid lg:grid-cols-2 gap-4">
        {/* Elasticity Matrix */}
        <Card>
          <CardHeader className="pb-2 pt-4 px-4">
            <CardTitle className="text-sm">Elasticidad & Descuentos</CardTitle>
            <CardDescription className="text-xs">Coeficiente y tiers por categoría</CardDescription>
          </CardHeader>
          <CardContent className="px-2 pb-2">
            <div className="overflow-x-auto max-h-[500px] overflow-y-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Categoría</TableHead>
                    <TableHead className="text-right">Elast.</TableHead>
                    <TableHead className="text-right">Cons.</TableHead>
                    <TableHead className="text-right">Base</TableHead>
                    <TableHead className="text-right">Agr.</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {Object.entries(elasticityData.categories).map(([categoryName, data]) => {
                    const elasticity = (data as any).elasticity
                    let elasticityColor = 'bg-amber-400/20 text-amber-600 dark:text-amber-400'
                    if (elasticity < 0.8) elasticityColor = 'bg-emerald-400/20 text-emerald-600 dark:text-emerald-400'
                    else if (elasticity > 1.2) elasticityColor = 'bg-red-400/20 text-red-600 dark:text-red-400'

                    return (
                      <TableRow key={categoryName}>
                        <TableCell className="font-medium text-sm">{categoryName}</TableCell>
                        <TableCell className="text-right">
                          <Badge variant="outline" className={elasticityColor}>{elasticity.toFixed(2)}</Badge>
                        </TableCell>
                        <TableCell className="text-right text-sm">{((data as any).dctoCons * 100).toFixed(0)}%</TableCell>
                        <TableCell className="text-right text-sm">{((data as any).dctoBase * 100).toFixed(0)}%</TableCell>
                        <TableCell className="text-right text-sm">{((data as any).dctoAggr * 100).toFixed(0)}%</TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Growth Chart */}
        <Card>
          <CardHeader className="pb-2 pt-4 px-4">
            <CardTitle className="text-sm">Crecimiento Uds 2025→2026</CardTitle>
            <CardDescription className="text-xs">Porcentaje de crecimiento target por categoría</CardDescription>
          </CardHeader>
          <CardContent className="px-2 pb-2">
            <ChartContainer config={growthConfig} className="w-full h-[420px]">
              <BarChart data={growthData} layout="vertical" margin={{ left: 90, right: 50 }} accessibilityLayer>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 11 }} tickFormatter={(v) => `${v}%`} />
                <YAxis dataKey="name" type="category" width={85} tick={{ fontSize: 11 }} />
                <ChartTooltip cursor={false} content={<ChartTooltipContent formatter={(v) => `${Number(v).toFixed(1)}%`} />} />
                <Bar dataKey="growth" radius={[0, 4, 4, 0]}>
                  {growthData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.growth >= 0 ? '#10b981' : '#ef4444'} />
                  ))}
                  <LabelList dataKey="growth" position="right" formatter={(v: number) => `${Number(v).toFixed(1)}%`} className="text-xs" />
                </Bar>
              </BarChart>
            </ChartContainer>
            {/* Manual legend for growth */}
            <div className="flex justify-center gap-6 mt-2 text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />Crecimiento</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-red-500" />Decrecimiento</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
