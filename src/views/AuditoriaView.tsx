'use client'

import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import type { PricingAuditItem } from '@/data/pricing-audit'
import pricingData from '@/data/pricing-audit.json'

function formatPrice(price: number): string {
  return new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price)
}

function formatPercent(value: number): string {
  return new Intl.NumberFormat('es-CL', {
    style: 'percent',
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  }).format(value / 100)
}

function getBadgeColor(status: string): string {
  switch (status) {
    case 'match':
      return 'bg-blue-900/30 text-blue-100 hover:bg-blue-900/40'
    case 'warn':
      return 'bg-yellow-900/30 text-yellow-100 hover:bg-yellow-900/40'
    case 'ok':
      return 'bg-green-900/30 text-green-100 hover:bg-green-900/40'
    default:
      return ''
  }
}

function getStatusLabel(status: string): string {
  switch (status) {
    case 'match':
      return 'Iguala'
    case 'warn':
      return 'Revisar'
    case 'ok':
      return 'OK'
    default:
      return status
  }
}

type StatusFilter = 'todos' | 'ok' | 'match' | 'warn'

interface PricingAuditData {
  total_products: number
  status_breakdown: {
    match: number
    ok: number
    warn: number
  }
  products: Array<PricingAuditItem>
}

export function AuditoriaView() {
  const [searchQuery, setSearchQuery] = useState('')
  const [activeTab, setActiveTab] = useState<StatusFilter>('todos')

  const data = pricingData as PricingAuditData

  const filteredProducts = useMemo(() => {
    let filtered = data.products

    // Filter by status
    if (activeTab !== 'todos') {
      filtered = filtered.filter((item) => item.status === activeTab)
    }

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter((item) =>
        item.product.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    }

    return filtered
  }, [searchQuery, activeTab])

  const calculateDiscount = (pvpMO: number, cyberPlan: number): number => {
    return ((pvpMO - cyberPlan) / pvpMO) * 100
  }

  const calculateDifference = (cyberPlan: number, marketLow: number): number => {
    return cyberPlan - marketLow
  }

  const getComparisonColor = (difference: number): string => {
    if (difference < 0) return 'text-green-400' // Cheaper
    if (difference > 0) return 'text-red-400' // More expensive
    return 'text-gray-400' // Equal
  }

  return (
    <div className="space-y-6">
      {/* Status Summary KPIs */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              OK
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-400">
              {data.status_breakdown.ok}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {((data.status_breakdown.ok / data.total_products) * 100).toFixed(1)}% del total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Iguala
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-400">
              {data.status_breakdown.match}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {((data.status_breakdown.match / data.total_products) * 100).toFixed(1)}% del total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Revisar
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-400">
              {data.status_breakdown.warn}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {((data.status_breakdown.warn / data.total_products) * 100).toFixed(1)}% del total
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Card with Filters and Table */}
      <Card>
        <CardHeader>
          <CardTitle>Auditoría de Precios - CyberDay 2026</CardTitle>
          <p className="text-sm text-muted-foreground mt-2">
            Total de {data.total_products} productos
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Search Input */}
          <Input
            placeholder="Buscar por nombre de producto..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="max-w-md"
          />

          {/* Filter Tabs */}
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as StatusFilter)}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="todos">
                Todos <span className="ml-2 text-xs">({data.total_products})</span>
              </TabsTrigger>
              <TabsTrigger value="ok">
                OK <span className="ml-2 text-xs">({data.status_breakdown.ok})</span>
              </TabsTrigger>
              <TabsTrigger value="match">
                Iguala <span className="ml-2 text-xs">({data.status_breakdown.match})</span>
              </TabsTrigger>
              <TabsTrigger value="warn">
                Revisar <span className="ml-2 text-xs">({data.status_breakdown.warn})</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab} className="mt-6">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="min-w-[200px]">Producto</TableHead>
                      <TableHead className="text-right">PVP MacOnline</TableHead>
                      <TableHead className="text-right">Cyber Plan</TableHead>
                      <TableHead className="text-right">Mín. Mercado</TableHead>
                      <TableHead className="text-right">Descuento</TableHead>
                      <TableHead className="text-right">Dif. vs Mercado</TableHead>
                      <TableHead>Comparación</TableHead>
                      <TableHead>Tienda</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead>Nota</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredProducts.length > 0 ? (
                      filteredProducts.map((item, index) => {
                        const discount = calculateDiscount(item.pvpMO, item.cyberPlan)
                        const difference = calculateDifference(item.cyberPlan, item.marketLow)
                        const comparisonColor = getComparisonColor(difference)

                        // Calculate bar width for visual comparison (0-100%)
                        const maxPrice = Math.max(item.cyberPlan, item.marketLow)
                        const cyberBarWidth = (item.cyberPlan / maxPrice) * 100
                        const marketBarWidth = (item.marketLow / maxPrice) * 100

                        return (
                          <TableRow key={index}>
                            <TableCell className="font-bold">{item.product}</TableCell>
                            <TableCell className="text-right font-mono text-sm">
                              {formatPrice(item.pvpMO)}
                            </TableCell>
                            <TableCell className="text-right font-mono text-sm">
                              {formatPrice(item.cyberPlan)}
                            </TableCell>
                            <TableCell className="text-right font-mono text-sm">
                              {formatPrice(item.marketLow)}
                            </TableCell>
                            <TableCell className="text-right font-mono text-sm font-semibold text-green-400">
                              {discount.toFixed(1)}%
                            </TableCell>
                            <TableCell className={`text-right font-mono text-sm font-semibold ${comparisonColor}`}>
                              {difference >= 0 ? '+' : ''}{formatPrice(difference)}
                            </TableCell>
                            <TableCell>
                              <div className="space-y-1 w-32">
                                <div className="flex gap-1 items-center text-xs">
                                  <div className="flex-1 bg-gray-700 rounded h-2 relative overflow-hidden">
                                    <div
                                      className="bg-blue-500 h-full transition-all"
                                      style={{ width: `${cyberBarWidth}%` }}
                                    />
                                  </div>
                                </div>
                                <div className="flex gap-1 items-center text-xs">
                                  <div className="flex-1 bg-gray-700 rounded h-2 relative overflow-hidden">
                                    <div
                                      className="bg-purple-500 h-full transition-all"
                                      style={{ width: `${marketBarWidth}%` }}
                                    />
                                  </div>
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  <span className="inline-block w-2 h-2 bg-blue-500 rounded mr-1" />
                                  Cyber
                                  <span className="inline-block w-2 h-2 bg-purple-500 rounded ml-2 mr-1" />
                                  Mercado
                                </div>
                              </div>
                            </TableCell>
                            <TableCell className="text-sm">{item.marketStore}</TableCell>
                            <TableCell>
                              <Badge className={getBadgeColor(item.status)}>
                                {getStatusLabel(item.status)}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-sm text-muted-foreground">
                              {item.note}
                            </TableCell>
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
              <p className="text-sm text-muted-foreground mt-4">
                Mostrando {filteredProducts.length} de {data.total_products} productos
              </p>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
