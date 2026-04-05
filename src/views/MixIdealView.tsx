'use client'

import { useState, useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from '@/components/ui/chart'
import { PieChart, Pie, Cell, Label } from 'recharts'
import type { ProductMixCategory } from '@/types/product-mix'
import productMixData from '@/data/product-mix.json'

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

  const donutData = useMemo(() => sorted.map((c) => ({ name: c.name, value: c.revenue })), [sorted])
  const donutConfig: ChartConfig = Object.fromEntries(
    donutData.map((d, i) => [d.name, { label: d.name, color: CHART_COLORS[i % CHART_COLORS.length] }])
  )

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

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Donut */}
        <Card className="flex flex-col">
          <CardHeader className="items-center pb-0">
            <CardTitle>Mix por Categoría</CardTitle>
            <CardDescription>Distribución de revenue</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 pb-0">
            <ChartContainer config={donutConfig} className="mx-auto aspect-square max-h-[280px]">
              <PieChart accessibilityLayer>
                <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel formatter={(v) => `$${v}M`} />} />
                <Pie data={donutData} dataKey="value" nameKey="name" innerRadius={65} strokeWidth={2}>
                  {donutData.map((_, i) => (
                    <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                  ))}
                  <Label
                    content={({ viewBox }) => {
                      if (viewBox && 'cx' in viewBox && 'cy' in viewBox) {
                        return (
                          <text x={viewBox.cx} y={viewBox.cy} textAnchor="middle" dominantBaseline="middle">
                            <tspan x={viewBox.cx} y={viewBox.cy} className="fill-foreground text-2xl font-bold">
                              {sorted.length}
                            </tspan>
                            <tspan x={viewBox.cx} y={(viewBox.cy || 0) + 20} className="fill-muted-foreground text-xs">
                              categorías
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
          <div className="px-4 pb-4 flex flex-wrap gap-x-3 gap-y-1 text-xs justify-center">
            {donutData.slice(0, 6).map((d, i) => (
              <div key={d.name} className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: CHART_COLORS[i] }} />
                <span className="text-muted-foreground">{d.name}</span>
              </div>
            ))}
            {donutData.length > 6 && <span className="text-muted-foreground">+{donutData.length - 6} más</span>}
          </div>
        </Card>

        {/* Table */}
        <Card className="xl:col-span-2">
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
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-8"></TableHead>
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
      </div>
    </div>
  )
}
