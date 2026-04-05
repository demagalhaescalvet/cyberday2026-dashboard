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
import { RadialBarChart, RadialBar, PolarGrid, PolarRadiusAxis, Label } from 'recharts'
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

interface PricingAuditData {
  total_products: number
  status_breakdown: { match: number; ok: number; warn: number }
  products: Array<PricingAuditItem>
}

export function AuditoriaView() {
  const [searchQuery, setSearchQuery] = useState('')
  const [activeTab, setActiveTab] = useState<StatusFilter>('todos')

  const data = pricingData as PricingAuditData

  const filteredProducts = useMemo(() => {
    let filtered = data.products
    if (activeTab !== 'todos') filtered = filtered.filter((i) => i.status === activeTab)
    if (searchQuery) filtered = filtered.filter((i) => i.product.toLowerCase().includes(searchQuery.toLowerCase()))
    return filtered
  }, [searchQuery, activeTab])

  // Competitiveness score: % of products where cyber <= market
  const competitiveCount = data.products.filter((p) => p.cyberPlan <= p.marketLow).length
  const competitivePct = Math.round((competitiveCount / data.total_products) * 100)

  // Average discount
  const avgDiscount = useMemo(() => {
    const total = data.products.reduce((s, p) => s + ((p.pvpMO - p.cyberPlan) / p.pvpMO) * 100, 0)
    return (total / data.products.length).toFixed(1)
  }, [])

  const gaugeData = [{ value: competitivePct, fill: '#2b7fff' }]
  const gaugeConfig = { value: { label: 'Competitividad', color: '#2b7fff' } } satisfies ChartConfig

  return (
    <div className="space-y-6">
      {/* KPI Row */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        {/* Radial gauge */}
        <Card className="row-span-2 lg:row-span-1 lg:col-span-1 flex flex-col items-center justify-center py-2">
          <ChartContainer config={gaugeConfig} className="mx-auto aspect-square max-h-[120px]">
            <RadialBarChart data={gaugeData} startAngle={180} endAngle={180 - (competitivePct / 100) * 360} outerRadius={55} innerRadius={45}>
              <PolarGrid gridType="circle" radialLines={false} stroke="none" className="first:fill-muted last:fill-background" polarRadius={[55, 45]} />
              <RadialBar dataKey="value" background cornerRadius={10} />
              <PolarRadiusAxis tick={false} tickLine={false} axisLine={false}>
                <Label
                  content={({ viewBox }) => {
                    if (viewBox && 'cx' in viewBox && 'cy' in viewBox) {
                      return (
                        <text x={viewBox.cx} y={viewBox.cy} textAnchor="middle" dominantBaseline="middle">
                          <tspan x={viewBox.cx} y={viewBox.cy} className="fill-foreground text-xl font-bold">{competitivePct}%</tspan>
                          <tspan x={viewBox.cx} y={(viewBox.cy || 0) + 16} className="fill-muted-foreground text-[10px]">competitivo</tspan>
                        </text>
                      )
                    }
                  }}
                />
              </PolarRadiusAxis>
            </RadialBarChart>
          </ChartContainer>
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
                      <TableHead className="min-w-[180px]">Producto</TableHead>
                      <TableHead className="text-right">PVP</TableHead>
                      <TableHead className="text-right">Cyber</TableHead>
                      <TableHead className="text-right">Mercado</TableHead>
                      <TableHead className="text-right">Dcto</TableHead>
                      <TableHead className="text-right">Δ Mercado</TableHead>
                      <TableHead className="w-[140px]">Comparación</TableHead>
                      <TableHead>Tienda</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead>Nota</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredProducts.length > 0 ? (
                      filteredProducts.map((item, index) => {
                        const discount = ((item.pvpMO - item.cyberPlan) / item.pvpMO) * 100
                        const diff = item.cyberPlan - item.marketLow
                        const maxPrice = Math.max(item.cyberPlan, item.marketLow)
                        const cyberW = (item.cyberPlan / maxPrice) * 100
                        const marketW = (item.marketLow / maxPrice) * 100

                        return (
                          <TableRow key={index}>
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
                              <div className="space-y-1 w-[130px]">
                                <div className="bg-muted rounded h-2 overflow-hidden">
                                  <div className="bg-blue-500 h-full transition-all" style={{ width: `${cyberW}%` }} />
                                </div>
                                <div className="bg-muted rounded h-2 overflow-hidden">
                                  <div className="bg-violet-500 h-full transition-all" style={{ width: `${marketW}%` }} />
                                </div>
                                <div className="flex gap-3 text-[10px] text-muted-foreground">
                                  <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-blue-500" />Cyber</span>
                                  <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-violet-500" />Mercado</span>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell className="text-xs">{item.marketStore}</TableCell>
                            <TableCell>
                              <Badge className={getBadgeColor(item.status)}>{getStatusLabel(item.status)}</Badge>
                            </TableCell>
                            <TableCell className="text-xs text-muted-foreground max-w-[150px] truncate">{item.note}</TableCell>
                          </TableRow>
                        )
                      })
                    ) : (
                      <TableRow>
                        <TableCell colSpan={10} className="text-center text-muted-foreground py-8">
                          No se encontraron productos
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
              <p className="text-xs text-muted-foreground mt-3">
                {filteredProducts.length} de {data.total_products} productos
              </p>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
