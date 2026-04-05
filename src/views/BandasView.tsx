'use client'

import { useState, useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent, type ChartConfig } from '@/components/ui/chart'
import { BarChart, Bar, AreaChart, Area, XAxis, YAxis, CartesianGrid } from 'recharts'
import { InsightBanner } from '@/components/InsightBanner'
import { Separator } from '@/components/ui/separator'
import bandasData from '@/data/bandas-cuotas.json'
import skuGridData from '@/data/sku-grid.json'
import priceBandsData from '@/data/price-bands.json'
import detailedBandsData from '@/data/price-bands-detailed.json'
import installmentData from '@/data/installment-distribution.json'

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

const TIER_COLORS = ['#f59e0b', '#10b981', '#2b7fff', '#8b5cf6', '#f43f5e', '#06b6d4']

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

const installmentPrefs = [
  { cuotas: '3 cuotas', pct: 15 },
  { cuotas: '6 cuotas', pct: 35 },
  { cuotas: '12 cuotas', pct: 40 },
  { cuotas: '24+ cuotas', pct: 10 },
]

const prefChartConfig = {
  pct: { label: 'Preferencia', color: '#2b7fff' },
} satisfies ChartConfig

function TierCard({ tier, index }: { tier: Tier; index: number }) {
  const isRecommended = tier.installments === 24
  const cardClasses = isRecommended ? 'ring-2 ring-primary bg-primary/5 scale-[1.02]' : ''
  const accentColor = TIER_COLORS[index % TIER_COLORS.length]

  return (
    <Card className={cardClasses}>
      <CardHeader className="pb-2 pt-4 px-4">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            <CardTitle className="text-base">{tier.name}</CardTitle>
            {tier.notes && (
              <CardDescription className="text-xs italic">{tier.notes}</CardDescription>
            )}
          </div>
          {isRecommended && <Badge className="whitespace-nowrap">Recomendado</Badge>}
        </div>
      </CardHeader>
      <CardContent className="space-y-3 px-4 pb-4">
        <div className="flex items-baseline justify-between">
          <span className="text-sm text-muted-foreground">Cuotas</span>
          <span className="text-3xl font-bold" style={{ color: accentColor }}>{tier.installments}</span>
        </div>

        <div className="grid grid-cols-2 gap-2 text-sm">
          <div>
            <p className="text-muted-foreground text-xs">Tasa</p>
            <p className="font-semibold">{tier.interest_rate}%</p>
          </div>
          <div>
            <p className="text-muted-foreground text-xs">Dcto</p>
            <p className="font-semibold">{tier.discount_percentage}%</p>
          </div>
        </div>

        <div className="space-y-1 border-t border-border pt-2 text-xs">
          <p className="text-muted-foreground">Monto Mín/Máx</p>
          <p className="font-mono text-sm">{formatCLP(tier.min_amount)} - {formatCLP(tier.max_amount)}</p>
        </div>

        <div className="space-y-1 border-t border-border pt-2">
          <p className="text-xs text-muted-foreground">Categorías</p>
          <div className="flex flex-wrap gap-1">
            {tier.target_categories.map((cat) => (
              <Badge key={cat} variant="secondary" className="text-xs">{cat}</Badge>
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
      <CardHeader className="pb-2 pt-4 px-4">
        <CardTitle className="text-sm">Descuentos por Método de Pago</CardTitle>
      </CardHeader>
      <CardContent className="px-2 pb-2">
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
                <TableCell className="font-medium text-sm">{item.method}</TableCell>
                <TableCell className="text-right font-semibold text-sm">{item.discount}</TableCell>
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
    { threshold: '3+ productos', percentage: 1.0, color: '#10b981' },
    { threshold: '5+ productos', percentage: 2.0, color: '#2b7fff' },
    { threshold: '10+ productos', percentage: 3.0, color: '#8b5cf6' },
  ]

  return (
    <Card>
      <CardHeader className="pb-2 pt-4 px-4">
        <CardTitle className="text-sm">Bonificaciones por Volumen</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 px-4 pb-4">
        {bonuses.map((bonus) => (
          <div key={bonus.threshold} className="space-y-1.5">
            <div className="flex justify-between text-sm">
              <span className="font-medium">{bonus.threshold}</span>
              <span className="font-semibold" style={{ color: bonus.color }}>+{bonus.percentage}%</span>
            </div>
            <div className="h-2 w-full rounded-full bg-muted">
              <div className="h-full rounded-full transition-all" style={{ width: `${Math.min((bonus.percentage / 3) * 100, 100)}%`, backgroundColor: bonus.color }} />
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
      <CardHeader className="pb-2 pt-4 px-4">
        <CardTitle className="text-sm">Impacto Estimado</CardTitle>
        <CardDescription className="text-xs">Proyección basada en historial CyberDay</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 px-4 pb-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Conversión Esperada</p>
            <p className="text-2xl font-bold text-emerald-500">25-30%</p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Aumento Ticket</p>
            <p className="text-2xl font-bold text-blue-500">15-20%</p>
          </div>
        </div>

        <div className="border-t border-border pt-3">
          <p className="text-sm font-semibold mb-2">Preferencia de Cuotas</p>
          <ChartContainer config={prefChartConfig} className="h-[140px] w-full">
            <BarChart accessibilityLayer data={installmentPrefs} layout="vertical" margin={{ top: 0, right: 16, left: 0, bottom: 0 }}>
              <CartesianGrid horizontal={false} className="stroke-border/50" />
              <YAxis dataKey="cuotas" type="category" tickLine={false} axisLine={false} width={75} tick={{ fontSize: 10 }} />
              <XAxis type="number" tickLine={false} axisLine={false} tick={{ fontSize: 10 }} tickFormatter={(v) => `${v}%`} />
              <ChartTooltip cursor={false} content={<ChartTooltipContent formatter={(v) => `${v}%`} />} />
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
    return skuList.filter((sku) => sku.skuCode.toLowerCase().includes(term) || sku.realSku.toLowerCase().includes(term))
  }, [skuList, searchTerm])

  return (
    <Card>
      <CardHeader className="pb-2 pt-4 px-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <CardTitle className="text-sm">Grid de SKUs — Precios CyberDay</CardTitle>
            <CardDescription className="text-xs">{filteredSKUs.length} de {skuList.length} SKUs</CardDescription>
          </div>
          <Input placeholder="Buscar por SKU..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="max-w-[220px] h-8 text-sm" />
        </div>
      </CardHeader>
      <CardContent className="px-2 pb-2">
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
                  <TableCell className="font-mono text-xs text-muted-foreground">{sku.realSku}</TableCell>
                  <TableCell className="text-right text-sm"><span className="text-muted-foreground line-through">{formatCLP(sku.pvp)}</span></TableCell>
                  <TableCell className="text-right font-semibold">{formatCLP(sku.cyberPrice)}</TableCell>
                  <TableCell className="text-right"><Badge className={getDiscountBadgeColor(sku.dcto)}>{(sku.dcto * 100).toFixed(0)}%</Badge></TableCell>
                </TableRow>
              ))}
              {filteredSKUs.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground py-8">No se encontraron SKUs</TableCell>
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
      <CardHeader className="pb-2 pt-4 px-4">
        <CardTitle className="text-sm">Distribución por Banda de Precio</CardTitle>
        <CardDescription className="text-xs">Unidades, revenue y productos representativos por rango CLP</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 px-2 pb-3">
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
                  <TableCell className="font-medium text-sm">{band.band}</TableCell>
                  <TableCell className="text-right font-mono text-sm">{band.u26.toLocaleString()}</TableCell>
                  <TableCell className="text-right font-mono text-sm">${band.r26}M</TableCell>
                  <TableCell className="text-right font-mono text-sm">{band.pct}%</TableCell>
                  <TableCell className="text-xs text-muted-foreground">{band.products}</TableCell>
                </TableRow>
              ))}
              <TableRow className="border-t-2 border-border font-semibold bg-muted/50 hover:bg-muted/50">
                <TableCell>Total</TableCell>
                <TableCell className="text-right font-mono">{totalUnits.toLocaleString()}</TableCell>
                <TableCell className="text-right font-mono">${totalRevenue}M</TableCell>
                <TableCell className="text-right font-mono">100%</TableCell>
                <TableCell />
              </TableRow>
            </TableBody>
          </Table>
        </div>

        {/* Insights */}
        <div className="grid gap-3 md:grid-cols-3">
          <div className="rounded-lg border border-border bg-background p-3 space-y-1 border-l-4 border-l-blue-500">
            <p className="text-xs font-semibold text-muted-foreground">Banda Dominante</p>
            <p className="text-sm leading-snug">{data.insights.dominant_band}</p>
          </div>
          <div className="rounded-lg border border-border bg-background p-3 space-y-1 border-l-4 border-l-amber-500">
            <p className="text-xs font-semibold text-muted-foreground">Banda en Crecimiento</p>
            <p className="text-sm leading-snug">{data.insights.growing_band}</p>
          </div>
          <div className="rounded-lg border border-border bg-background p-3 space-y-1 border-l-4 border-l-emerald-500">
            <p className="text-xs font-semibold text-muted-foreground">Banda de Volumen</p>
            <p className="text-sm leading-snug">{data.insights.volume_band}</p>
          </div>
        </div>

        {/* Recommendations */}
        <div className="border-t border-border pt-3">
          <h4 className="font-semibold text-sm mb-2">Recomendaciones</h4>
          <ul className="space-y-1.5">
            {data.recommendations.map((rec, idx) => (
              <li key={idx} className="flex gap-3 text-sm">
                <span className="text-muted-foreground font-semibold min-w-5">{idx + 1}.</span>
                <span>{rec}</span>
              </li>
            ))}
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}

function DetailedBandsTable() {
  const data = detailedBandsData as {
    bands: string[]
    units: { '2024': number[]; '2025': number[]; '2026_target': number[] }
    revenue_millions: { '2024': number[]; '2025': number[]; '2026_target': number[] }
  }

  const rows = data.bands.map((band, idx) => ({
    band,
    u2024: data.units['2024'][idx],
    u2025: data.units['2025'][idx],
    u2026: data.units['2026_target'][idx],
    r2024: data.revenue_millions['2024'][idx],
    r2025: data.revenue_millions['2025'][idx],
    r2026: data.revenue_millions['2026_target'][idx],
  }))

  const totals = {
    u2024: rows.reduce((sum, r) => sum + r.u2024, 0),
    u2025: rows.reduce((sum, r) => sum + r.u2025, 0),
    u2026: rows.reduce((sum, r) => sum + r.u2026, 0),
    r2024: rows.reduce((sum, r) => sum + r.r2024, 0),
    r2025: rows.reduce((sum, r) => sum + r.r2025, 0),
    r2026: rows.reduce((sum, r) => sum + r.r2026, 0),
  }

  const maxU2026 = Math.max(...rows.map(r => r.u2026))
  const maxU2026Idx = rows.findIndex(r => r.u2026 === maxU2026)

  const getUnitBg = (value: number, max: number) => {
    const pct = (value / max) * 100
    if (pct < 25) return ''
    if (pct < 50) return 'bg-blue-500/15'
    if (pct < 75) return 'bg-blue-500/25'
    return 'bg-blue-500/40'
  }

  const getRevBg = (value: number, max: number) => {
    const pct = (value / max) * 100
    if (pct < 25) return ''
    if (pct < 50) return 'bg-emerald-500/15'
    if (pct < 75) return 'bg-emerald-500/25'
    return 'bg-emerald-500/40'
  }

  const maxU2024 = Math.max(...rows.map(r => r.u2024))
  const maxU2025 = Math.max(...rows.map(r => r.u2025))
  const maxR2024 = Math.max(...rows.map(r => r.r2024))
  const maxR2025 = Math.max(...rows.map(r => r.r2025))
  const maxR2026 = Math.max(...rows.map(r => r.r2026))

  return (
    <Card>
      <CardHeader className="pb-2 pt-4 px-4">
        <CardTitle className="text-sm">Distribución Detallada por Banda de Precio</CardTitle>
        <CardDescription className="text-xs">12 bandas — unidades y revenue 2024/2025/2026</CardDescription>
      </CardHeader>
      <CardContent className="px-2 pb-2">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead>Banda</TableHead>
                <TableHead className="text-right">Uds 24</TableHead>
                <TableHead className="text-right">Uds 25</TableHead>
                <TableHead className="text-right">Uds 26</TableHead>
                <TableHead className="text-right">Rev 24</TableHead>
                <TableHead className="text-right">Rev 25</TableHead>
                <TableHead className="text-right">Rev 26</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((row, idx) => {
                const isBolded = idx === maxU2026Idx
                return (
                  <TableRow key={row.band} className={isBolded ? 'font-bold' : ''}>
                    <TableCell className="font-medium text-sm">{row.band}</TableCell>
                    <TableCell className={`text-right font-mono text-sm ${getUnitBg(row.u2024, maxU2024)}`}>{row.u2024.toLocaleString()}</TableCell>
                    <TableCell className={`text-right font-mono text-sm ${getUnitBg(row.u2025, maxU2025)}`}>{row.u2025.toLocaleString()}</TableCell>
                    <TableCell className={`text-right font-mono text-sm ${getUnitBg(row.u2026, maxU2026)}`}>{row.u2026.toLocaleString()}</TableCell>
                    <TableCell className={`text-right font-mono text-sm ${getRevBg(row.r2024, maxR2024)}`}>{row.r2024.toLocaleString()}</TableCell>
                    <TableCell className={`text-right font-mono text-sm ${getRevBg(row.r2025, maxR2025)}`}>{row.r2025.toLocaleString()}</TableCell>
                    <TableCell className={`text-right font-mono text-sm ${getRevBg(row.r2026, maxR2026)}`}>{row.r2026.toLocaleString()}</TableCell>
                  </TableRow>
                )
              })}
              <TableRow className="border-t-2 border-border font-semibold bg-muted/50 hover:bg-muted/50">
                <TableCell>Total</TableCell>
                <TableCell className="text-right font-mono">{totals.u2024.toLocaleString()}</TableCell>
                <TableCell className="text-right font-mono">{totals.u2025.toLocaleString()}</TableCell>
                <TableCell className="text-right font-mono">{totals.u2026.toLocaleString()}</TableCell>
                <TableCell className="text-right font-mono">{totals.r2024.toLocaleString()}</TableCell>
                <TableCell className="text-right font-mono">{totals.r2025.toLocaleString()}</TableCell>
                <TableCell className="text-right font-mono">{totals.r2026.toLocaleString()}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}

function InstallmentDistributionChart() {
  const data = installmentData as {
    tiers: string[]
    units_by_year: { '2024': number[]; '2025': number[]; '2026_target': number[] }
  }

  const areaData = [
    { year: '2024', 'Sin Cuotas': data.units_by_year['2024'][0], '3 Cuotas': data.units_by_year['2024'][1], '6 Cuotas': data.units_by_year['2024'][2], '12 Cuotas': data.units_by_year['2024'][3], '24 Cuotas': data.units_by_year['2024'][4], '36+ Cuotas': data.units_by_year['2024'][5] },
    { year: '2025', 'Sin Cuotas': data.units_by_year['2025'][0], '3 Cuotas': data.units_by_year['2025'][1], '6 Cuotas': data.units_by_year['2025'][2], '12 Cuotas': data.units_by_year['2025'][3], '24 Cuotas': data.units_by_year['2025'][4], '36+ Cuotas': data.units_by_year['2025'][5] },
    { year: '2026', 'Sin Cuotas': data.units_by_year['2026_target'][0], '3 Cuotas': data.units_by_year['2026_target'][1], '6 Cuotas': data.units_by_year['2026_target'][2], '12 Cuotas': data.units_by_year['2026_target'][3], '24 Cuotas': data.units_by_year['2026_target'][4], '36+ Cuotas': data.units_by_year['2026_target'][5] },
  ]

  const chartConfig = {
    'Sin Cuotas': { label: 'Sin Cuotas', color: TIER_COLORS[0] },
    '3 Cuotas': { label: '3 Cuotas', color: TIER_COLORS[1] },
    '6 Cuotas': { label: '6 Cuotas', color: TIER_COLORS[2] },
    '12 Cuotas': { label: '12 Cuotas', color: TIER_COLORS[3] },
    '24 Cuotas': { label: '24 Cuotas', color: TIER_COLORS[4] },
    '36+ Cuotas': { label: '36+ Cuotas', color: TIER_COLORS[5] },
  } satisfies ChartConfig

  return (
    <Card>
      <CardHeader className="pb-2 pt-4 px-4">
        <CardTitle className="text-sm">Distribución por Tipo de Cuota</CardTitle>
        <CardDescription className="text-xs">Composición de tiers de cuotas por año (2024→2026)</CardDescription>
      </CardHeader>
      <CardContent className="px-2 pb-2">
        <ChartContainer config={chartConfig} className="h-[280px] w-full">
          <AreaChart accessibilityLayer data={areaData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }} stackOffset="expand">
            <CartesianGrid className="stroke-border/50" />
            <XAxis dataKey="year" tickLine={false} axisLine={false} tick={{ fontSize: 11 }} />
            <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 11 }} tickFormatter={(v) => `${Math.round(v * 100)}%`} />
            <ChartTooltip cursor={false} content={<ChartTooltipContent formatter={(v) => `${(Number(v) * 100).toFixed(1)}%`} />} />
            <Area type="monotone" dataKey="Sin Cuotas" fill={TIER_COLORS[0]} stroke={TIER_COLORS[0]} stackId="a" fillOpacity={0.8} />
            <Area type="monotone" dataKey="3 Cuotas" fill={TIER_COLORS[1]} stroke={TIER_COLORS[1]} stackId="a" fillOpacity={0.8} />
            <Area type="monotone" dataKey="6 Cuotas" fill={TIER_COLORS[2]} stroke={TIER_COLORS[2]} stackId="a" fillOpacity={0.8} />
            <Area type="monotone" dataKey="12 Cuotas" fill={TIER_COLORS[3]} stroke={TIER_COLORS[3]} stackId="a" fillOpacity={0.8} />
            <Area type="monotone" dataKey="24 Cuotas" fill={TIER_COLORS[4]} stroke={TIER_COLORS[4]} stackId="a" fillOpacity={0.8} />
            <Area type="monotone" dataKey="36+ Cuotas" fill={TIER_COLORS[5]} stroke={TIER_COLORS[5]} stackId="a" fillOpacity={0.8} />
            <ChartLegend content={<ChartLegendContent />} />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}

function InstallmentMixHeatmap() {
  const data = installmentData as {
    mix_by_price_band: {
      bands: string[]
      percentages: number[][]
    }
  }

  const tiers = ['Sin Cuotas', '3 Cuotas', '6 Cuotas', '12 Cuotas', '24 Cuotas', '36+ Cuotas']

  const getHeatmapStyle = (pct: number, tierIdx: number): React.CSSProperties => {
    if (pct === 0) return {}
    const color = TIER_COLORS[tierIdx]
    const opacity = pct < 5 ? 0.12 : pct < 15 ? 0.25 : pct < 30 ? 0.4 : pct < 45 ? 0.55 : 0.7
    return { backgroundColor: `${color}${Math.round(opacity * 255).toString(16).padStart(2, '0')}` }
  }

  return (
    <Card>
      <CardHeader className="pb-2 pt-4 px-4">
        <CardTitle className="text-sm">Mix de Cuotas por Banda de Precio</CardTitle>
        <CardDescription className="text-xs">Distribución porcentual por tier y banda</CardDescription>
      </CardHeader>
      <CardContent className="px-2 pb-2">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead>Banda</TableHead>
                {tiers.map((tier, i) => (
                  <TableHead key={tier} className="text-center text-xs">
                    <span className="inline-block w-2 h-2 rounded-full mr-1" style={{ backgroundColor: TIER_COLORS[i] }} />
                    {tier}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.mix_by_price_band.bands.map((band, bandIdx) => (
                <TableRow key={band}>
                  <TableCell className="font-medium text-sm">{band}</TableCell>
                  {data.mix_by_price_band.percentages[bandIdx].map((percentage, tierIdx) => (
                    <TableCell key={`${band}-${tierIdx}`} className="text-center font-mono text-sm" style={getHeatmapStyle(percentage, tierIdx)}>
                      {percentage}%
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}

function ExpandableDetailedBandsTable() {
  const [isExpanded, setIsExpanded] = useState(false)

  return (
    <div className="space-y-3">
      <button onClick={() => setIsExpanded(!isExpanded)} className="inline-flex items-center gap-2 px-4 py-2 rounded-md border border-border bg-background hover:bg-muted transition-colors font-medium text-sm">
        <span>{isExpanded ? '▼' : '▶'}</span>
        Ver distribución detallada (12 bandas)
      </button>
      {isExpanded && <DetailedBandsTable />}
    </div>
  )
}

function ExpandableSKUGrid() {
  const [isExpanded, setIsExpanded] = useState(false)
  const skuList = useMemo(() => Object.entries(skuGridData).map(([key, data]) => ({ skuCode: key, ...(data as SKUItem) })), [])

  return (
    <div className="space-y-3">
      <button onClick={() => setIsExpanded(!isExpanded)} className="inline-flex items-center gap-2 px-4 py-2 rounded-md border border-border bg-background hover:bg-muted transition-colors font-medium text-sm">
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
    <div className="space-y-4">
      <InsightBanner
        variant="insight"
        headline="12 cuotas domina con 40% de preferencia. Oportunidad: la banda $500K–$1M está creciendo +35% — asegurar stock de iPad y Apple Watch."
        detail="El 45% del revenue se concentra sobre $1M con solo 20% de unidades. 24 cuotas (BCI) es clave para productos premium."
        metric="40%"
        metricLabel="prefieren 12 cuotas"
      />

      {/* Financing Tiers */}
      <div className="grid auto-rows-max gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {tiers.map((tier, idx) => (
          <TierCard key={tier.name} tier={tier} index={idx} />
        ))}
      </div>

      {/* Payment Methods + Impact + Volume — 3 columns */}
      <div className="grid gap-4 lg:grid-cols-3">
        <PaymentMethodsTable />
        <EstimatedImpactCard />
        <VolumeBonusesCard />
      </div>

      {/* Two-column: Price Bands + Installment Distribution */}
      <div className="grid lg:grid-cols-2 gap-4">
        <InstallmentDistributionChart />
        <InstallmentMixHeatmap />
      </div>

      {/* Price Bands Distribution */}
      <PriceBandsDistribution />

      {/* Detailed Bands Table — Expandable */}
      <ExpandableDetailedBandsTable />

      {/* SKU Pricing Grid — Expandable */}
      <ExpandableSKUGrid />

      <Separator className="my-2" />
      <InsightBanner
        variant="action"
        headline="Acciones: (1) Empujar 24 cuotas BCI para Mac NB y iPad Pro (>$1M), (2) Activar 6 cuotas sin interés para banda $200K–$500K, (3) Negociar tasa 0% en 12 cuotas con más emisores."
        detail="La combinación de cuotas largas + descuento CyberDay es el principal driver de conversión en productos premium."
      />
    </div>
  )
}
