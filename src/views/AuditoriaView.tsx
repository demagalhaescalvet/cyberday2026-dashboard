'use client'

import { useState, useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { InsightBanner } from '@/components/InsightBanner'
import { Separator } from '@/components/ui/separator'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from '@/components/ui/chart'
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, ZAxis, ReferenceLine, Cell } from 'recharts'
import type { PricingAuditItem } from '@/data/pricing-audit'
import pricingData from '@/data/pricing-audit.json'

const STATUS_COLORS = { ok: '#10b981', match: '#3b82f6', warn: '#f59e0b' }

function formatPrice(price: number): string {
  return new Intl.NumberFormat('es-CL', {
    style: 'currency', currency: 'CLP', minimumFractionDigits: 0, maximumFractionDigits: 0,
  }).format(price)
}

function getBadgeColor(status: string): string {
  switch (status) {
    case 'match': return 'bg-blue-500/20 text-blue-300 hover:bg-blue-500/30 border-blue-500/30'
    case 'warn': return 'bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 border-amber-500/30'
    case 'ok': return 'bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 border-emerald-500/30'
    default: return ''
  }
}

function getStatusLabel(status: string): string {
  switch (status) {
    case 'match': return 'Iguala'
    case 'warn': return 'Revisar'
    case 'ok': return 'OK'
    default: return status
  }
}

type StatusFilter = 'todos' | 'ok' | 'match' | 'warn'
type SortColumn = 'product' | 'pvpMO' | 'cyberPlan' | 'marketLow' | 'discount' | 'diff'
type SortDir = 'asc' | 'desc'

interface PricingAuditData {
  total_products: number
  status_breakdown: { match: number; ok: number; warn: number }
  products: Array<PricingAuditItem>
}

export function AuditoriaView() {
  const [searchQuery, setSearchQuery] = useState('')
  const [activeTab, setActiveTab] = useState<StatusFilter>('todos')
  const [sortColumn, setSortColumn] = useState<SortColumn>('diff')
  const [sortDir, setSortDir] = useState<SortDir>('desc')
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set())

  const data = pricingData as PricingAuditData

  const filteredProducts = useMemo(() => {
    let filtered = data.products
    if (activeTab !== 'todos') filtered = filtered.filter((i) => i.status === activeTab)
    if (searchQuery) filtered = filtered.filter((i) => i.product.toLowerCase().includes(searchQuery.toLowerCase()))
    return filtered
  }, [searchQuery, activeTab])

  const sortedProducts = useMemo(() => {
    const sorted = [...filteredProducts]
    sorted.sort((a, b) => {
      let aVal: number | string = ''
      let bVal: number | string = ''

      if (sortColumn === 'product') { aVal = a.product.toLowerCase(); bVal = b.product.toLowerCase() }
      else if (sortColumn === 'pvpMO') { aVal = a.pvpMO; bVal = b.pvpMO }
      else if (sortColumn === 'cyberPlan') { aVal = a.cyberPlan; bVal = b.cyberPlan }
      else if (sortColumn === 'marketLow') { aVal = a.marketLow; bVal = b.marketLow }
      else if (sortColumn === 'discount') { aVal = ((a.pvpMO - a.cyberPlan) / a.pvpMO) * 100; bVal = ((b.pvpMO - b.cyberPlan) / b.pvpMO) * 100 }
      else if (sortColumn === 'diff') { aVal = a.cyberPlan - a.marketLow; bVal = b.cyberPlan - b.marketLow }

      if (typeof aVal === 'string' && typeof bVal === 'string') return sortDir === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal)
      const numA = typeof aVal === 'number' ? aVal : 0
      const numB = typeof bVal === 'number' ? bVal : 0
      return sortDir === 'asc' ? numA - numB : numB - numA
    })
    return sorted
  }, [filteredProducts, sortColumn, sortDir])

  const toggleRowExpand = (index: number) => {
    const newExpanded = new Set(expandedRows)
    if (newExpanded.has(index)) newExpanded.delete(index)
    else newExpanded.add(index)
    setExpandedRows(newExpanded)
  }

  const handleHeaderClick = (column: SortColumn) => {
    if (sortColumn === column) setSortDir(sortDir === 'asc' ? 'desc' : 'asc')
    else { setSortColumn(column); setSortDir(column === 'product' ? 'asc' : 'desc') }
  }

  const competitiveCount = data.products.filter((p) => p.cyberPlan <= p.marketLow).length
  const competitivePct = Math.round((competitiveCount / data.total_products) * 100)

  const avgDiscount = useMemo(() => {
    const total = data.products.reduce((s, p) => s + ((p.pvpMO - p.cyberPlan) / p.pvpMO) * 100, 0)
    return (total / data.products.length).toFixed(1)
  }, [])

  const scatterData = useMemo(() => {
    return data.products.map(item => ({
      x: item.marketLow,
      y: item.cyberPlan,
      name: item.product,
      status: item.status,
    }))
  }, [])

  const minPrice = Math.min(...data.products.map(p => Math.min(p.marketLow, p.cyberPlan)))
  const maxPrice = Math.max(...data.products.map(p => Math.max(p.marketLow, p.cyberPlan)))

  const scatterConfig = {
    ok: { label: 'OK', color: STATUS_COLORS.ok },
    match: { label: 'Iguala', color: STATUS_COLORS.match },
    warn: { label: 'Revisar', color: STATUS_COLORS.warn },
  } satisfies ChartConfig

  const renderSortIcon = (column: SortColumn) => {
    if (sortColumn !== column) return null
    return sortDir === 'asc' ? ' ▲' : ' ▼'
  }

  return (
    <div className="space-y-4">
      {/* Compact KPI Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-3">
        <Card className="p-3 col-span-2 sm:col-span-1">
          <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Competitividad</p>
          <p className="text-2xl font-bold mt-1">{competitivePct}%</p>
          <div className="h-2 w-full rounded-full bg-muted mt-1.5 overflow-hidden">
            <div className="h-full rounded-full bg-emerald-500 transition-all" style={{ width: `${competitivePct}%` }} />
          </div>
          <p className="text-[11px] text-muted-foreground mt-1">{competitiveCount}/{data.total_products} precio ≤ mercado</p>
        </Card>
        <Card className="p-3">
          <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Productos</p>
          <p className="text-2xl font-bold mt-1">{data.total_products}</p>
        </Card>
        <Card className="p-3">
          <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Dcto Promedio</p>
          <p className="text-2xl font-bold mt-1">{avgDiscount}%</p>
        </Card>
        <Card className="p-3">
          <p className="text-[11px] font-medium text-emerald-400 uppercase tracking-wider">OK</p>
          <p className="text-2xl font-bold text-emerald-400 mt-1">{data.status_breakdown.ok}</p>
          <p className="text-[11px] text-muted-foreground">{((data.status_breakdown.ok / data.total_products) * 100).toFixed(0)}%</p>
        </Card>
        <Card className="p-3">
          <p className="text-[11px] font-medium text-blue-400 uppercase tracking-wider">Iguala</p>
          <p className="text-2xl font-bold text-blue-400 mt-1">{data.status_breakdown.match}</p>
          <p className="text-[11px] text-muted-foreground">{((data.status_breakdown.match / data.total_products) * 100).toFixed(0)}%</p>
        </Card>
        <Card className="p-3">
          <p className="text-[11px] font-medium text-amber-400 uppercase tracking-wider">Revisar</p>
          <p className="text-2xl font-bold text-amber-400 mt-1">{data.status_breakdown.warn}</p>
          <p className="text-[11px] text-muted-foreground">{((data.status_breakdown.warn / data.total_products) * 100).toFixed(0)}%</p>
        </Card>
      </div>

      <InsightBanner
        variant="win"
        headline="94% de competitividad — 48 de 51 productos están a precio de mercado o mejor."
        detail="Solo 6 productos necesitan revisión: AirPods Max (+$9K), AirPods 4 (+$7K), HomePod mini (+$3.3K). Los 3 representan accesorios de audio donde la competencia es más agresiva."
        metric="6"
        metricLabel="productos a revisar"
      />

      {/* Scatter Plot */}
      <Card>
        <CardHeader className="pb-2 pt-4 px-4">
          <CardTitle className="text-sm">Análisis de Competitividad</CardTitle>
          <CardDescription className="text-xs">Precio CyberDay vs Precio Mercado (diagonal = paridad)</CardDescription>
        </CardHeader>
        <CardContent className="px-2 pb-2">
          <ChartContainer config={scatterConfig} className="w-full h-[320px]">
            <ScatterChart margin={{ top: 20, right: 30, left: 20, bottom: 20 }} accessibilityLayer>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                type="number"
                dataKey="x"
                name="Mercado"
                tick={{ fontSize: 10 }}
                tickFormatter={(v) => `$${Math.round(v / 1000)}k`}
                domain={[minPrice * 0.9, maxPrice * 1.05]}
                label={{ value: 'Precio Mercado', position: 'bottom', offset: 0, style: { fontSize: 11 } }}
              />
              <YAxis
                type="number"
                dataKey="y"
                name="CyberDay"
                tick={{ fontSize: 10 }}
                tickFormatter={(v) => `$${Math.round(v / 1000)}k`}
                domain={[minPrice * 0.9, maxPrice * 1.05]}
                label={{ value: 'Precio Cyber', angle: -90, position: 'insideLeft', offset: 10, style: { fontSize: 11 } }}
              />
              <ZAxis range={[40, 40]} />
              <ChartTooltip
                cursor={{ strokeDasharray: '3 3' }}
                content={<ChartTooltipContent formatter={(v, name) => {
                  if (name === 'x') return `Mercado: ${formatPrice(Number(v))}`
                  if (name === 'y') return `Cyber: ${formatPrice(Number(v))}`
                  return String(v)
                }} />}
              />
              <ReferenceLine
                segment={[
                  { x: minPrice * 0.9, y: minPrice * 0.9 },
                  { x: maxPrice * 1.05, y: maxPrice * 1.05 },
                ]}
                stroke="#64748b"
                strokeDasharray="5 5"
                strokeWidth={1}
              />
              <Scatter name="Productos" data={scatterData}>
                {scatterData.map((entry, idx) => (
                  <Cell key={`cell-${idx}`} fill={STATUS_COLORS[entry.status as keyof typeof STATUS_COLORS] || '#64748b'} />
                ))}
              </Scatter>
            </ScatterChart>
          </ChartContainer>
          {/* Manual legend */}
          <div className="flex justify-center gap-6 mt-2 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: STATUS_COLORS.ok }} />OK (bajo diagonal)</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: STATUS_COLORS.match }} />Iguala</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: STATUS_COLORS.warn }} />Revisar (sobre diagonal)</span>
          </div>
        </CardContent>
      </Card>

      {/* Main Table Card */}
      <Card>
        <CardHeader className="pb-2 pt-4 px-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <CardTitle className="text-sm">Auditoría de Precios</CardTitle>
              <CardDescription className="text-xs">{data.total_products} productos · Dcto promedio {avgDiscount}%</CardDescription>
            </div>
            <Input placeholder="Buscar producto..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="max-w-[220px] h-8 text-sm" />
          </div>
        </CardHeader>
        <CardContent className="space-y-3 px-2 pb-2">
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as StatusFilter)}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="todos">Todos ({data.total_products})</TabsTrigger>
              <TabsTrigger value="ok">OK ({data.status_breakdown.ok})</TabsTrigger>
              <TabsTrigger value="match">Iguala ({data.status_breakdown.match})</TabsTrigger>
              <TabsTrigger value="warn">Revisar ({data.status_breakdown.warn})</TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab} className="mt-3">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-8" />
                      <TableHead className="min-w-[160px] cursor-pointer hover:text-foreground" onClick={() => handleHeaderClick('product')}>
                        Producto{renderSortIcon('product')}
                      </TableHead>
                      <TableHead className="text-right cursor-pointer hover:text-foreground" onClick={() => handleHeaderClick('pvpMO')}>
                        PVP{renderSortIcon('pvpMO')}
                      </TableHead>
                      <TableHead className="text-right cursor-pointer hover:text-foreground" onClick={() => handleHeaderClick('cyberPlan')}>
                        Cyber{renderSortIcon('cyberPlan')}
                      </TableHead>
                      <TableHead className="text-right cursor-pointer hover:text-foreground" onClick={() => handleHeaderClick('marketLow')}>
                        Mercado{renderSortIcon('marketLow')}
                      </TableHead>
                      <TableHead className="text-right cursor-pointer hover:text-foreground" onClick={() => handleHeaderClick('discount')}>
                        Dcto{renderSortIcon('discount')}
                      </TableHead>
                      <TableHead className="text-right cursor-pointer hover:text-foreground" onClick={() => handleHeaderClick('diff')}>
                        Δ Mercado{renderSortIcon('diff')}
                      </TableHead>
                      <TableHead className="w-[120px]">vs Mercado</TableHead>
                      <TableHead>Estado</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sortedProducts.length > 0 ? (
                      sortedProducts.map((item, index) => {
                        const discount = ((item.pvpMO - item.cyberPlan) / item.pvpMO) * 100
                        const diff = item.cyberPlan - item.marketLow
                        const isExpanded = expandedRows.has(index)

                        return (
                          <tbody key={`group-${index}`}>
                            <TableRow className="cursor-pointer hover:bg-muted/50" onClick={() => toggleRowExpand(index)}>
                              <TableCell className="w-8 text-center">
                                <span className="text-muted-foreground text-lg">{isExpanded ? '−' : '+'}</span>
                              </TableCell>
                              <TableCell className="font-medium text-sm">{item.product}</TableCell>
                              <TableCell className="text-right font-mono text-xs">{formatPrice(item.pvpMO)}</TableCell>
                              <TableCell className="text-right font-mono text-xs">{formatPrice(item.cyberPlan)}</TableCell>
                              <TableCell className="text-right font-mono text-xs">{formatPrice(item.marketLow)}</TableCell>
                              <TableCell className="text-right font-mono text-xs font-semibold text-emerald-400">{discount.toFixed(1)}%</TableCell>
                              <TableCell className={`text-right font-mono text-xs font-semibold ${diff < 0 ? 'text-emerald-400' : diff > 0 ? 'text-amber-400' : 'text-muted-foreground'}`}>
                                {diff >= 0 ? '+' : ''}{formatPrice(diff)}
                              </TableCell>
                              <TableCell>
                                <div className="w-[110px]">
                                  <div className="relative h-3.5 bg-muted rounded overflow-hidden">
                                    <div
                                      className="absolute left-0 top-0 h-full rounded"
                                      style={{
                                        width: `${Math.min((item.cyberPlan / item.marketLow) * 100, 100)}%`,
                                        backgroundColor: item.cyberPlan <= item.marketLow ? STATUS_COLORS.ok : STATUS_COLORS.warn,
                                      }}
                                    />
                                    <div className="absolute right-0 top-0 h-full w-0.5 bg-foreground/50" />
                                  </div>
                                  <p className="text-[11px] text-muted-foreground mt-0.5">{((item.cyberPlan / item.marketLow) * 100).toFixed(0)}% del mercado</p>
                                </div>
                              </TableCell>
                              <TableCell>
                                <Badge className={getBadgeColor(item.status)}>{getStatusLabel(item.status)}</Badge>
                              </TableCell>
                            </TableRow>
                            {isExpanded && (
                              <TableRow className="bg-muted/40">
                                <TableCell colSpan={9} className="px-6 py-3">
                                  <div className="space-y-3">
                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                      <div>
                                        <p className="text-muted-foreground text-xs font-medium">Tienda</p>
                                        <p className="text-foreground font-medium">{item.marketStore}</p>
                                      </div>
                                      <div>
                                        <p className="text-muted-foreground text-xs font-medium">Nota</p>
                                        <p className="text-foreground">{item.note || '—'}</p>
                                      </div>
                                    </div>
                                    <div>
                                      <p className="text-muted-foreground text-xs font-medium mb-2">Comparación Detallada</p>
                                      <div className="space-y-1.5">
                                        <div className="flex items-center gap-2">
                                          <span className="text-xs w-14 text-muted-foreground">Cyber</span>
                                          <div className="flex-1 bg-background rounded h-3 overflow-hidden">
                                            <div className="h-full transition-all rounded" style={{ width: `${(item.cyberPlan / Math.max(item.cyberPlan, item.marketLow)) * 100}%`, backgroundColor: STATUS_COLORS.match }} />
                                          </div>
                                          <span className="text-xs font-mono w-24 text-right">{formatPrice(item.cyberPlan)}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                          <span className="text-xs w-14 text-muted-foreground">Mercado</span>
                                          <div className="flex-1 bg-background rounded h-3 overflow-hidden">
                                            <div className="h-full transition-all rounded" style={{ width: `${(item.marketLow / Math.max(item.cyberPlan, item.marketLow)) * 100}%`, backgroundColor: '#8b5cf6' }} />
                                          </div>
                                          <span className="text-xs font-mono w-24 text-right">{formatPrice(item.marketLow)}</span>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </TableCell>
                              </TableRow>
                            )}
                          </tbody>
                        )
                      })
                    ) : (
                      <TableRow>
                        <TableCell colSpan={9} className="text-center text-muted-foreground py-8">No se encontraron productos</TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
              <p className="text-xs text-muted-foreground mt-2">{sortedProducts.length} de {data.total_products} productos</p>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <Separator className="my-2" />
      <InsightBanner
        variant="action"
        headline="Acciones: (1) Bajar AirPods Max a $549.990 (paridad mercado), (2) AirPods 4 a $119.990, (3) Mantener HomePod mini — el delta es mínimo ($3.3K)."
        detail="Ajustar estos 3 productos costaría ~$19K en margen total pero protege la percepción de competitividad CyberDay en toda la categoría audio."
      />
    </div>
  )
}
