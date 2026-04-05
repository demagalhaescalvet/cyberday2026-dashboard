'use client'

import { useState, useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import { ChartContainer, type ChartConfig } from '@/components/ui/chart'
import { ScatterChart, Scatter, ZAxis, ReferenceLine } from 'recharts'
import type { PricingAuditItem } from '@/data/pricing-audit'
import pricingData from '@/data/pricing-audit.json'

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

      if (sortColumn === 'product') {
        aVal = a.product.toLowerCase()
        bVal = b.product.toLowerCase()
      } else if (sortColumn === 'pvpMO') {
        aVal = a.pvpMO
        bVal = b.pvpMO
      } else if (sortColumn === 'cyberPlan') {
        aVal = a.cyberPlan
        bVal = b.cyberPlan
      } else if (sortColumn === 'marketLow') {
        aVal = a.marketLow
        bVal = b.marketLow
      } else if (sortColumn === 'discount') {
        aVal = ((a.pvpMO - a.cyberPlan) / a.pvpMO) * 100
        bVal = ((b.pvpMO - b.cyberPlan) / b.pvpMO) * 100
      } else if (sortColumn === 'diff') {
        aVal = a.cyberPlan - a.marketLow
        bVal = b.cyberPlan - b.marketLow
      }

      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return sortDir === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal)
      }
      const numA = typeof aVal === 'number' ? aVal : 0
      const numB = typeof bVal === 'number' ? bVal : 0
      return sortDir === 'asc' ? numA - numB : numB - numA
    })
    return sorted
  }, [filteredProducts, sortColumn, sortDir])

  const toggleRowExpand = (index: number) => {
    const newExpanded = new Set(expandedRows)
    if (newExpanded.has(index)) {
      newExpanded.delete(index)
    } else {
      newExpanded.add(index)
    }
    setExpandedRows(newExpanded)
  }

  const handleHeaderClick = (column: SortColumn) => {
    if (sortColumn === column) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc')
    } else {
      setSortColumn(column)
      setSortDir(column === 'product' ? 'asc' : 'desc')
    }
  }

  // Competitiveness score: % of products where cyber <= market
  const competitiveCount = data.products.filter((p) => p.cyberPlan <= p.marketLow).length
  const competitivePct = Math.round((competitiveCount / data.total_products) * 100)

  // Average discount
  const avgDiscount = useMemo(() => {
    const total = data.products.reduce((s, p) => s + ((p.pvpMO - p.cyberPlan) / p.pvpMO) * 100, 0)
    return (total / data.products.length).toFixed(1)
  }, [])

  const renderSortIcon = (column: SortColumn) => {
    if (sortColumn !== column) return null
    return sortDir === 'asc' ? ' ▲' : ' ▼'
  }

  return (
    <div className="space-y-6">
      {/* KPI Row */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        {/* Competitiveness KPI */}
        <Card className="col-span-1 lg:col-span-2 flex flex-col justify-center p-6">
          <div className="space-y-3">
            <p className="text-xs font-medium text-muted-foreground">Competitividad</p>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-bold">{competitivePct}%</span>
              <span className="text-sm text-muted-foreground">{competitiveCount}/{data.total_products}</span>
            </div>
            <div className="h-3 w-full rounded-full bg-muted overflow-hidden">
              <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${competitivePct}%` }} />
            </div>
            <p className="text-xs text-muted-foreground">productos con precio ≤ mercado</p>
          </div>
        </Card>

        <Card>
          <CardHeader className="pb-1 pt-3 px-4">
            <CardTitle className="text-xs font-medium text-muted-foreground">Total Productos</CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-3">
            <div className="text-2xl font-bold">{data.total_products}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-1 pt-3 px-4">
            <CardTitle className="text-xs font-medium text-emerald-400">OK</CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-3">
            <div className="text-2xl font-bold text-emerald-400">{data.status_breakdown.ok}</div>
            <p className="text-xs text-muted-foreground">{((data.status_breakdown.ok / data.total_products) * 100).toFixed(0)}%</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-1 pt-3 px-4">
            <CardTitle className="text-xs font-medium text-blue-400">Iguala</CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-3">
            <div className="text-2xl font-bold text-blue-400">{data.status_breakdown.match}</div>
            <p className="text-xs text-muted-foreground">{((data.status_breakdown.match / data.total_products) * 100).toFixed(0)}%</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-1 pt-3 px-4">
            <CardTitle className="text-xs font-medium text-amber-400">Revisar</CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-3">
            <div className="text-2xl font-bold text-amber-400">{data.status_breakdown.warn}</div>
            <p className="text-xs text-muted-foreground">{((data.status_breakdown.warn / data.total_products) * 100).toFixed(0)}%</p>
          </CardContent>
        </Card>
      </div>

      {/* Scatter Plot: Cyber vs Market Price */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Análisis de Competitividad</CardTitle>
          <CardDescription>Precio CyberDay vs Precio Mercado</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="w-full h-[350px]">
            <ChartContainer config={{}} className="w-full h-full">
              <ScatterChart margin={{ top: 20, right: 30, left: 60, bottom: 60 }} accessibilityLayer>
                <ZAxis dataKey="status" type="category" width={0} height={0} />
                <ReferenceLine segment={[
                  { x: Math.min(...data.products.map(p => p.marketLow)), y: Math.min(...data.products.map(p => p.marketLow)) },
                  { x: Math.max(...data.products.map(p => p.marketLow)), y: Math.max(...data.products.map(p => p.marketLow)) }
                ]} stroke="#64748b" strokeDasharray="5 5" strokeWidth={1} />
                <Scatter
                  name="Productos"
                  data={data.products.map(item => ({
                    x: item.marketLow,
                    y: item.cyberPlan,
                    name: item.product,
                    status: item.status
                  }))}
                  fill="#8b5cf6"
                >
                  {data.products.map((item, idx) => {
                    let color = '#10b981' // emerald for ok
                    if (item.status === 'match') color = '#3b82f6' // blue
                    if (item.status === 'warn') color = '#f59e0b' // amber
                    return <circle key={idx} cx={0} cy={0} r={4} fill={color} />
                  })}
                </Scatter>
              </ScatterChart>
            </ChartContainer>
          </div>
          <p className="text-xs text-muted-foreground text-center mt-4">
            Puntos bajo la diagonal = precio competitivo vs mercado
          </p>
        </CardContent>
      </Card>

      {/* Main Table Card */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <CardTitle>Auditoría de Precios</CardTitle>
              <CardDescription>{data.total_products} productos · Descuento promedio {avgDiscount}%</CardDescription>
            </div>
            <Input
              placeholder="Buscar producto..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="max-w-[250px] h-8 text-sm"
            />
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as StatusFilter)}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="todos">Todos ({data.total_products})</TabsTrigger>
              <TabsTrigger value="ok">OK ({data.status_breakdown.ok})</TabsTrigger>
              <TabsTrigger value="match">Iguala ({data.status_breakdown.match})</TabsTrigger>
              <TabsTrigger value="warn">Revisar ({data.status_breakdown.warn})</TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab} className="mt-4">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-8" />
                      <TableHead className="min-w-[180px] cursor-pointer hover:text-foreground" onClick={() => handleHeaderClick('product')}>
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
                      <TableHead className="w-[140px]">vs Mercado</TableHead>
                      <TableHead>Estado</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sortedProducts.length > 0 ? (
                      sortedProducts.map((item, index) => {
                        const discount = ((item.pvpMO - item.cyberPlan) / item.pvpMO) * 100
                        const diff = item.cyberPlan - item.marketLow
                        const maxPrice = Math.max(item.cyberPlan, item.marketLow)
                        const cyberW = (item.cyberPlan / maxPrice) * 100
                        const marketW = (item.marketLow / maxPrice) * 100
                        const isExpanded = expandedRows.has(index)

                        return (
                          <TableRow key={`row-${index}`}>
                            <TableCell className="w-8">
                              <button
                                onClick={() => toggleRowExpand(index)}
                                className="text-muted-foreground hover:text-foreground transition-colors text-lg h-6 w-6 flex items-center justify-center"
                              >
                                {isExpanded ? '−' : '+'}
                              </button>
                            </TableCell>
                            <TableCell className="font-medium">{item.product}</TableCell>
                            <TableCell className="text-right font-mono text-xs">{formatPrice(item.pvpMO)}</TableCell>
                            <TableCell className="text-right font-mono text-xs">{formatPrice(item.cyberPlan)}</TableCell>
                            <TableCell className="text-right font-mono text-xs">{formatPrice(item.marketLow)}</TableCell>
                            <TableCell className="text-right font-mono text-xs font-semibold text-emerald-400">
                              {discount.toFixed(1)}%
                            </TableCell>
                            <TableCell className={`text-right font-mono text-xs font-semibold ${diff < 0 ? 'text-emerald-400' : diff > 0 ? 'text-amber-400' : 'text-muted-foreground'}`}>
                              {diff >= 0 ? '+' : ''}{formatPrice(diff)}
                            </TableCell>
                            <TableCell>
                              <div className="w-[130px]">
                                <div className="relative h-4 bg-muted rounded overflow-hidden">
                                  <div
                                    className={`absolute left-0 top-0 h-full rounded ${item.cyberPlan <= item.marketLow ? 'bg-emerald-500' : 'bg-amber-500'}`}
                                    style={{ width: `${(item.cyberPlan / item.marketLow) * 100}%` }}
                                  />
                                  <div className="absolute right-0 top-0 h-full w-0.5 bg-foreground/50" title="Precio Mercado" />
                                </div>
                                <div className="text-[10px] text-muted-foreground mt-0.5">
                                  {((item.cyberPlan / item.marketLow) * 100).toFixed(0)}% del mercado
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge className={getBadgeColor(item.status)}>{getStatusLabel(item.status)}</Badge>
                            </TableCell>
                          </TableRow>
                        )
                      })
                    ) : null}
                    {sortedProducts.length > 0 && sortedProducts.map((item, index) => {
                      const isExpanded = expandedRows.has(index)
                      if (!isExpanded) return null

                      return (
                        <TableRow key={`expanded-${index}`} className="bg-muted/40">
                          <TableCell colSpan={9} className="px-6 py-4">
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
                                <div className="space-y-2">
                                  <div className="bg-background rounded h-3 overflow-hidden">
                                    <div className="bg-blue-500 h-full transition-all" style={{ width: `${(item.cyberPlan / Math.max(item.cyberPlan, item.marketLow)) * 100}%` }} />
                                  </div>
                                  <div className="bg-background rounded h-3 overflow-hidden">
                                    <div className="bg-violet-500 h-full transition-all" style={{ width: `${(item.marketLow / Math.max(item.cyberPlan, item.marketLow)) * 100}%` }} />
                                  </div>
                                  <div className="flex gap-4 text-xs text-muted-foreground">
                                    <span className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-blue-500" />CyberDay: {formatPrice(item.cyberPlan)}</span>
                                    <span className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-violet-500" />Mercado: {formatPrice(item.marketLow)}</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </TableCell>
                        </TableRow>
                      )
                    })}
                    {sortedProducts.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={9} className="text-center text-muted-foreground py-8">
                          No se encontraron productos
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
              <p className="text-xs text-muted-foreground mt-3">
                {sortedProducts.length} de {data.total_products} productos
              </p>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
