'use client'

import { useState, useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from '@/components/ui/chart'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts'
import bandasData from '@/data/bandas-cuotas.json'
import skuGridData from '@/data/sku-grid.json'
import priceBandsData from '@/data/price-bands.json'

type Tier = {
  name: string
  installments: number
  interest_rate: number
  discount_percentage: number
  min_amount: number
  max_amount: number
  target_categories: string[]
  active: boolean
  notes?: string
}

type SKUItem = {
  realSku: string
  pvp: number
  cyberPrice: number
  dcto: number
}

const clpFormatter = new Intl.NumberFormat('es-CL', {
  style: 'currency', currency: 'CLP', minimumFractionDigits: 0,
})

function formatCLP(value: number): string {
  return clpFormatter.format(value)
}

function getDiscountBadgeColor(discountPercent: number): string {
  if (discountPercent > 0.15) return 'bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 border-emerald-500/30'
  if (discountPercent >= 0.1) return 'bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 border-amber-500/30'
  return 'bg-muted text-muted-foreground'
}

// Installment preference data for horizontal bar chart
const installmentPrefs = [
  { cuotas: '3 cuotas', pct: 15 },
  { cuotas: '6 cuotas', pct: 35 },
  { cuotas: '12 cuotas', pct: 40 },
  { cuotas: '24+ cuotas', pct: 10 },
]

const prefChartConfig = {
  pct: { label: 'Preferencia', color: '#2b7fff' },
} satisfies ChartConfig

function TierCard({ tier }: { tier: Tier }) {
  const isRecommended = tier.installments === 24
  const cardClasses = isRecommended ? 'ring-2 ring-primary' : ''

  return (
    <Card className={cardClasses}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            <CardTitle className="text-lg">{tier.name}</CardTitle>
            {tier.notes && (
              <CardDescription className="text-xs italic">{tier.notes}</CardDescription>
            )}
          </div>
          {isRecommended && (
            <Badge className="whitespace-nowrap">Recomendado</Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-baseline justify-between">
          <span className="text-sm text-muted-foreground">Cuotas</span>
          <span className="text-4xl font-bold text-primary">{tier.installments}</span>
        </div>

        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <p className="text-muted-foreground text-xs">Tasa de Interés</p>
            <p className="font-semibold">{tier.interest_rate}%</p>
          </div>
          <div>
            <p className="text-muted-foreground text-xs">Descuento</p>
            <p className="font-semibold">{tier.discount_percentage}%</p>
          </div>
        </div>

        <div className="space-y-2 border-t border-border pt-3">
          <div className="text-xs">
            <p className="text-muted-foreground">Monto Mín/Máx</p>
            <p className="font-mono text-sm">
              {formatCLP(tier.min_amount)} - {formatCLP(tier.max_amount)}
            </p>
          </div>
        </div>

        <div className="space-y-2 border-t border-border pt-3">
          <p className="text-xs text-muted-foreground">Categorías</p>
          <div className="flex flex-wrap gap-1">
            {tier.target_categories.map((cat) => (
              <Badge key={cat} variant="secondary" className="text-xs">
                {cat}
              </Badge>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function PaymentMethodsTable() {
  const paymentMethods = [
    { method: 'Efectivo', discount: 'Sin descuento' },
    { method: 'Tarjeta Débito', discount: '0.5%' },
    { method: 'TDC 3 Cuotas', discount: '0%' },
    { method: 'TDC 6 Cuotas', discount: '1.5%' },
    { method: 'TDC 12 Cuotas', discount: '2%' },
    { method: 'BCI Especial', discount: '3% (24 cuotas)' },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle>Descuentos por Método de Pago</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead>Método de Pago</TableHead>
              <TableHead className="text-right">Descuento</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paymentMethods.map((item) => (
              <TableRow key={item.method}>
                <TableCell className="font-medium">{item.method}</TableCell>
                <TableCell className="text-right font-semibold">{item.discount}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}

function VolumeBonusesCard() {
  const bonuses = [
    { threshold: '3+ productos', percentage: 1.0 },
    { threshold: '5+ productos', percentage: 2.0 },
    { threshold: '10+ productos', percentage: 3.0 },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle>Bonificaciones por Volumen</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {bonuses.map((bonus) => (
          <div key={bonus.threshold} className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="font-medium">{bonus.threshold}</span>
              <span className="font-semibold text-emerald-400">
                +{bonus.percentage}%
              </span>
            </div>
            <div className="h-2 w-full rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-emerald-500 transition-all"
                style={{ width: `${Math.min((bonus.percentage / 3) * 100, 100)}%` }}
              />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}

function EstimatedImpactCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Impacto Estimado</CardTitle>
        <CardDescription>Proyección basada en historial CyberDay</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Conversión Esperada</p>
            <p className="text-3xl font-bold text-primary">25-30%</p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Aumento Ticket</p>
            <p className="text-3xl font-bold text-primary">15-20%</p>
          </div>
        </div>

        <div className="border-t border-border pt-4">
          <p className="text-sm font-semibold mb-3">Preferencia de Cuotas</p>
          <ChartContainer config={prefChartConfig} className="h-[160px] w-full">
            <BarChart
              accessibilityLayer
              data={installmentPrefs}
              layout="vertical"
              margin={{ top: 0, right: 16, left: 0, bottom: 0 }}
            >
              <CartesianGrid horizontal={false} className="stroke-border/50" />
              <YAxis
                dataKey="cuotas"
                type="category"
                tickLine={false}
                axisLine={false}
                width={80}
                tick={{ fontSize: 11 }}
              />
              <XAxis
                type="number"
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 11 }}
                tickFormatter={(v) => `${v}%`}
              />
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent formatter={(v) => `${v}%`} />}
              />
              <Bar dataKey="pct" fill="#2b7fff" radius={[0, 6, 6, 0]} />
            </BarChart>
          </ChartContainer>
        </div>
      </CardContent>
    </Card>
  )
}

function SKUPricingGrid() {
  const [searchTerm, setSearchTerm] = useState('')

  const skuList = useMemo(() => {
    return Object.entries(skuGridData).map(([key, data]) => ({
      skuCode: key,
      ...(data as SKUItem),
    }))
  }, [])

  const filteredSKUs = useMemo(() => {
    if (!searchTerm) return skuList
    const term = searchTerm.toLowerCase()
    return skuList.filter(
      (sku) =>
        sku.skuCode.toLowerCase().includes(term) ||
        sku.realSku.toLowerCase().includes(term)
    )
  }, [skuList, searchTerm])

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <CardTitle>Grid de SKUs — Precios CyberDay</CardTitle>
            <CardDescription>{filteredSKUs.length} de {skuList.length} SKUs</CardDescription>
          </div>
          <Input
            placeholder="Buscar por SKU o código real..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-[250px] h-8 text-sm"
          />
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto max-h-[400px] overflow-y-auto">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead>SKU</TableHead>
                <TableHead>Código Real</TableHead>
                <TableHead className="text-right">PVP</TableHead>
                <TableHead className="text-right">Precio Cyber</TableHead>
                <TableHead className="text-right">Descuento</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSKUs.map((sku) => (
                <TableRow key={sku.skuCode}>
                  <TableCell className="font-mono text-sm font-medium">{sku.skuCode}</TableCell>
                  <TableCell className="font-mono text-xs text-muted-foreground">
                    {sku.realSku}
                  </TableCell>
                  <TableCell className="text-right text-sm">
                    <span className="text-muted-foreground line-through">
                      {formatCLP(sku.pvp)}
                    </span>
                  </TableCell>
                  <TableCell className="text-right font-semibold">{formatCLP(sku.cyberPrice)}</TableCell>
                  <TableCell className="text-right">
                    <Badge className={getDiscountBadgeColor(sku.dcto)}>
                      {(sku.dcto * 100).toFixed(0)}%
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
              {filteredSKUs.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                    No se encontraron SKUs
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}

function PriceBandsDistribution() {
  const data = priceBandsData as {
    bands: Array<{ band: string; u26: number; r26: number; pct: number; products: string }>
    insights: { dominant_band: string; growing_band: string; volume_band: string }
    recommendations: string[]
  }

  const bands = data.bands
  const totalUnits = bands.reduce((sum, b) => sum + b.u26, 0)
  const totalRevenue = bands.reduce((sum, b) => sum + b.r26, 0)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Distribución por Banda de Precio</CardTitle>
        <CardDescription>Unidades, revenue y productos representativos por rango CLP</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Table Section */}
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead>Banda</TableHead>
                <TableHead className="text-right">Uds 2026</TableHead>
                <TableHead className="text-right">Rev ($M)</TableHead>
                <TableHead className="text-right">% Units</TableHead>
                <TableHead>Productos</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {bands.map((band) => (
                <TableRow key={band.band}>
                  <TableCell className="font-medium">{band.band}</TableCell>
                  <TableCell className="text-right font-mono text-sm">
                    {band.u26.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-right font-mono text-sm">
                    ${band.r26}M
                  </TableCell>
                  <TableCell className="text-right font-mono text-sm">
                    {band.pct}%
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">{band.products}</TableCell>
                </TableRow>
              ))}
              {/* Total Row */}
              <TableRow className="border-t-2 border-border font-semibold bg-muted/50 hover:bg-muted/50">
                <TableCell>Total</TableCell>
                <TableCell className="text-right font-mono">
                  {totalUnits.toLocaleString()}
                </TableCell>
                <TableCell className="text-right font-mono">
                  ${totalRevenue}M
                </TableCell>
                <TableCell className="text-right font-mono">100%</TableCell>
                <TableCell />
              </TableRow>
            </TableBody>
          </Table>
        </div>

        {/* Insights Cards Grid */}
        <div className="grid gap-3 md:grid-cols-3">
          <div className="rounded-lg border border-border bg-background p-3 space-y-2 border-l-4 border-l-blue-500">
            <p className="text-xs font-semibold text-muted-foreground">Banda Dominante</p>
            <p className="text-sm leading-snug">{data.insights.dominant_band}</p>
          </div>
          <div className="rounded-lg border border-border bg-background p-3 space-y-2 border-l-4 border-l-amber-500">
            <p className="text-xs font-semibold text-muted-foreground">Banda en Crecimiento</p>
            <p className="text-sm leading-snug">{data.insights.growing_band}</p>
          </div>
          <div className="rounded-lg border border-border bg-background p-3 space-y-2 border-l-4 border-l-emerald-500">
            <p className="text-xs font-semibold text-muted-foreground">Banda de Volumen</p>
            <p className="text-sm leading-snug">{data.insights.volume_band}</p>
          </div>
        </div>

        {/* Recommendations Section */}
        <div className="border-t border-border pt-4">
          <h4 className="font-semibold text-sm mb-3">Recomendaciones</h4>
          <ul className="space-y-2">
            {data.recommendations.map((rec, idx) => (
              <li key={idx} className="flex gap-3 text-sm">
                <span className="text-muted-foreground font-semibold min-w-6">{idx + 1}.</span>
                <span>{rec}</span>
              </li>
            ))}
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}

function ExpandableSKUGrid() {
  const [isExpanded, setIsExpanded] = useState(false)
  const skuList = useMemo(() => {
    return Object.entries(skuGridData).map(([key, data]) => ({
      skuCode: key,
      ...(data as SKUItem),
    }))
  }, [])

  return (
    <div className="space-y-3">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="inline-flex items-center gap-2 px-4 py-2 rounded-md border border-border bg-background hover:bg-muted transition-colors font-medium text-sm"
      >
        <span>{isExpanded ? '▼' : '▶'}</span>
        Ver Grid de SKUs ({skuList.length})
      </button>
      {isExpanded && <SKUPricingGrid />}
    </div>
  )
}

export function BandasView() {
  const tiers = bandasData.tiers as Tier[]

  return (
    <div className="space-y-6">
      {/* Financing Tiers */}
      <div className="grid auto-rows-max gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {tiers.map((tier) => (
          <TierCard key={tier.name} tier={tier} />
        ))}
      </div>

      {/* Payment Methods + Impact */}
      <div className="grid gap-4 lg:grid-cols-3">
        <PaymentMethodsTable />
        <EstimatedImpactCard />
        <VolumeBonusesCard />
      </div>

      {/* Price Bands Distribution */}
      <PriceBandsDistribution />

      {/* SKU Pricing Grid — Expandable */}
      <ExpandableSKUGrid />
    </div>
  )
}
