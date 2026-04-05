'use client'

import { useState, useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from '@/components/ui/chart'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, LabelList, Cell, RadarChart, Radar, PolarGrid, PolarAngleAxis } from 'recharts'
import type { ProductMixCategory } from '@/types/product-mix'
import productMixData from '@/data/product-mix.json'
import elasticityData from '@/data/elasticity.json'
import multiYearData from '@/data/multi-year.json'

const CHART_COLORS = ['#2b7fff', '#155dfc', '#1447e6', '#193cb8', '#8ec5ff', '#60a5fa', '#3b82f6', '#2563eb', '#1d4ed8', '#1e40af', '#64748b']

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

    // Apply sorting
    filtered.sort((a, b) => {
      let aVal: number | string
      let bVal: number | string

      switch (sortColumn) {
        case 'name':
          aVal = a.name
          bVal = b.name
          break
        case 'units':
          aVal = a.units
          bVal = b.units
          break
        case 'revenue':
          aVal = a.revenue
          bVal = b.revenue
          break
        case 'asp':
          aVal = a.asp
          bVal = b.asp
          break
        case 'pct':
          aVal = (a.revenue / totalRevenue) * 100
          bVal = (b.revenue / totalRevenue) * 100
          break
      }

      if (sortDir === 'asc') {
        return aVal > bVal ? 1 : -1
      } else {
        return aVal < bVal ? 1 : -1
      }
    })

    return filtered
  }, [categories, searchTerm, sortColumn, sortDir, totalRevenue])

  const barChartData = useMemo(() => {
    // Sort by revenue descending for the bar chart
    return [...categories].sort((a, b) => b.revenue - a.revenue).map((c) => ({
      name: c.name,
      value: c.revenue
    }))
  }, [categories])

  const radarTop5 = useMemo(() => {
    // Get top 5 categories by revenue
    const top5Categories = [...categories].sort((a, b) => b.revenue - a.revenue).slice(0, 5)

    // Find max values for normalization
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
        elasticity: Math.round((elasticity / maxElasticity) * 100)
      }
    })
  }, [categories])

  const growthData = useMemo(() => {
    return [...categories]
      .sort((a, b) => b.revenue - a.revenue)
      .map(cat => {
        const units2025 = (multiYearData.units['2025'] as any)?.[cat.name] || 0
        const units2026 = (multiYearData.units['2026_target'] as any)?.[cat.name] || 0
        const growthPct = units2025 > 0 ? ((units2026 - units2025) / units2025) * 100 : 0
        return {
          name: cat.name,
          growth: growthPct
        }
      })
  }, [categories])

  const toggleExpand = (name: string) => setExpandedCategory(expandedCategory === name ? null : name)

  const handleHeaderClick = (col: SortColumn) => {
    if (sortColumn === col) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc')
    } else {
      setSortColumn(col)
      setSortDir('desc')
    }
  }

  // Calculate KPI data
  const topCategory = sorted[0] || categories[0]
  const top3Revenue = sorted.slice(0, 3).reduce((sum, c) => sum + c.revenue, 0)
  const concentrationPct = totalRevenue > 0 ? (top3Revenue / totalRevenue) * 100 : 0
  const highestAspCategory = sorted.reduce((prev, current) => {
    return current.asp > prev.asp ? current : prev
  }, sorted[0] || categories[0])

  const renderSortIndicator = (col: SortColumn) => {
    if (sortColumn !== col) return ''
    return sortDir === 'asc' ? ' ▲' : ' ▼'
  }

  return (
    <div className="space-y-6">
      {/* Improved KPI Cards */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-1 pt-4 px-4">
            <CardTitle className="text-xs font-medium text-muted-foreground">Top Categoría</CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <div className="flex items-center gap-2">
              <span className="text-2xl">{topCategory.icon}</span>
              <div>
                <p className="text-sm font-medium text-muted-foreground">{topCategory.name}</p>
                <p className="text-2xl font-bold">${topCategory.revenue}M</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-1 pt-4 px-4">
            <CardTitle className="text-xs font-medium text-muted-foreground">Mayor Concentración</CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <p className="text-xs text-muted-foreground mb-1">Top 3 categorías</p>
            <p className="text-2xl font-bold">{concentrationPct.toFixed(1)}%</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-1 pt-4 px-4">
            <CardTitle className="text-xs font-medium text-muted-foreground">ASP Más Alto</CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <div className="flex items-center gap-2">
              <span className="text-2xl">{highestAspCategory.icon}</span>
              <div>
                <p className="text-sm font-medium text-muted-foreground">{highestAspCategory.name}</p>
                <p className="text-2xl font-bold">{clpFormatter.format(highestAspCategory.asp)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Horizontal Bar Chart - Revenue por Categoría */}
      <Card className="flex flex-col">
        <CardHeader className="pb-3">
          <CardTitle>Revenue por Categoría (Ranked)</CardTitle>
          <CardDescription>Todas las categorías ordenadas por revenue descendente</CardDescription>
        </CardHeader>
        <CardContent className="flex-1">
          <ChartContainer config={{ revenue: { label: 'Revenue', color: '#2b7fff' } }} className="w-full">
            <BarChart data={barChartData} layout="vertical" height={500} margin={{ left: 100, right: 80 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis dataKey="name" type="category" width={95} tick={{ fontSize: 12 }} />
              <ChartTooltip cursor={false} content={<ChartTooltipContent formatter={(v) => `$${v}M`} />} />
              <Bar dataKey="value" fill="#2b7fff" accessibilityLayer>
                <LabelList dataKey="value" position="right" formatter={(v) => `$${v}M`} />
              </Bar>
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Details Table */}
      <Card className="flex flex-col">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle>Detalle por Categoría</CardTitle>
              <Input
                placeholder="Filtrar..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-[200px] h-8 text-sm"
              />
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto max-h-[500px] overflow-y-auto">
              <Table className="table-fixed w-full">
                <colgroup>
                  <col className="w-10" />
                  <col className="w-[30%]" />
                  <col className="w-[12%]" />
                  <col className="w-[14%]" />
                  <col className="w-[12%]" />
                  <col className="w-[10%]" />
                  <col className="w-[18%]" />
                </colgroup>
                <TableHeader>
                  <TableRow>
                    <TableHead></TableHead>
                    <TableHead
                      className="cursor-pointer select-none hover:text-foreground transition-colors"
                      onClick={() => handleHeaderClick('name')}
                    >
                      Categoría{renderSortIndicator('name')}
                    </TableHead>
                    <TableHead
                      className="text-right cursor-pointer select-none hover:text-foreground transition-colors"
                      onClick={() => handleHeaderClick('units')}
                    >
                      Uds{renderSortIndicator('units')}
                    </TableHead>
                    <TableHead
                      className="text-right cursor-pointer select-none hover:text-foreground transition-colors"
                      onClick={() => handleHeaderClick('revenue')}
                    >
                      Rev (M){renderSortIndicator('revenue')}
                    </TableHead>
                    <TableHead
                      className="text-right cursor-pointer select-none hover:text-foreground transition-colors"
                      onClick={() => handleHeaderClick('asp')}
                    >
                      ASP{renderSortIndicator('asp')}
                    </TableHead>
                    <TableHead
                      className="text-right cursor-pointer select-none hover:text-foreground transition-colors"
                      onClick={() => handleHeaderClick('pct')}
                    >
                      %{renderSortIndicator('pct')}
                    </TableHead>
                    <TableHead>Mix</TableHead>
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
                            <span className="text-lg transition-transform inline-block" style={{
                              transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)',
                            }}>
                              ▸
                            </span>
                          </TableCell>
                          <TableCell className="font-medium">
                            <span className="text-lg mr-2">{cat.icon}</span>
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
                                style={{ width: `${pct}%`, backgroundColor: CHART_COLORS[idx % CHART_COLORS.length] }}
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
                                      <div className="h-1.5 rounded-full bg-primary" style={{ width: `${((sub.units / cat.units) * 100).toFixed(1)}%` }} />
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

      {/* Elasticity & Discount Matrix */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Elasticidad & Matriz de Descuentos</CardTitle>
          <CardDescription>Coeficiente de elasticidad y tiers de descuento por categoría</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Categoría</TableHead>
                  <TableHead className="text-right">Elasticidad</TableHead>
                  <TableHead className="text-right">Dcto Conservador</TableHead>
                  <TableHead className="text-right">Dcto Base</TableHead>
                  <TableHead className="text-right">Dcto Agresivo</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {Object.entries(elasticityData.categories).map(([categoryName, data]) => {
                  const elasticity = (data as any).elasticity
                  let elasticityColor = 'bg-amber-400/20 text-amber-600 dark:text-amber-400'
                  if (elasticity < 0.8) {
                    elasticityColor = 'bg-emerald-400/20 text-emerald-600 dark:text-emerald-400'
                  } else if (elasticity > 1.2) {
                    elasticityColor = 'bg-red-400/20 text-red-600 dark:text-red-400'
                  }

                  return (
                    <TableRow key={categoryName}>
                      <TableCell className="font-medium">{categoryName}</TableCell>
                      <TableCell className="text-right">
                        <Badge variant="outline" className={elasticityColor}>
                          {elasticity.toFixed(2)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">{((data as any).dctoCons * 100).toFixed(0)}%</TableCell>
                      <TableCell className="text-right">{((data as any).dctoBase * 100).toFixed(0)}%</TableCell>
                      <TableCell className="text-right">{((data as any).dctoAggr * 100).toFixed(0)}%</TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Growth % Bar Chart - Per Category */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Crecimiento de Unidades (2025-2026)</CardTitle>
          <CardDescription>Porcentaje de crecimiento por categoría</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={{ growth: { label: 'Growth %', color: '#2b7fff' } }} className="w-full">
            <BarChart data={growthData} layout="vertical" height={500} margin={{ left: 100, right: 60 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis dataKey="name" type="category" width={95} tick={{ fontSize: 12 }} />
              <ChartTooltip cursor={false} content={<ChartTooltipContent formatter={(v) => `${v.toFixed(1)}%`} />} />
              <Bar dataKey="growth">
                {growthData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.growth >= 0 ? '#10b981' : '#ef4444'}
                  />
                ))}
                <LabelList dataKey="growth" position="right" formatter={(v) => `${Number(v).toFixed(1)}%`} />
              </Bar>
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Radar Chart - Top 5 Categories */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Top 5 Categorías - Análisis Multidimensional</CardTitle>
          <CardDescription>Comparación normalizada de Units, Revenue, ASP y Elasticidad</CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center">
          <ChartContainer config={{ units: { label: 'Units', color: '#2b7fff' }, revenue: { label: 'Revenue', color: '#155dfc' }, asp: { label: 'ASP', color: '#1447e6' }, elasticity: { label: 'Elasticity', color: '#193cb8' } }} className="w-full aspect-square max-w-[400px]">
            <RadarChart data={radarTop5} accessibilityLayer>
              <PolarGrid strokeDasharray="3 3" />
              <PolarAngleAxis dataKey="name" />
              <ChartTooltip cursor={false} content={<ChartTooltipContent formatter={(v) => `${v}/100`} />} />
              <Radar name="Units" dataKey="units" stroke="#2b7fff" fill="#2b7fff" fillOpacity={0.25} />
              <Radar name="Revenue" dataKey="revenue" stroke="#155dfc" fill="#155dfc" fillOpacity={0.25} />
              <Radar name="ASP" dataKey="asp" stroke="#1447e6" fill="#1447e6" fillOpacity={0.25} />
              <Radar name="Elasticity" dataKey="elasticity" stroke="#193cb8" fill="#193cb8" fillOpacity={0.25} />
            </RadarChart>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  )
}
