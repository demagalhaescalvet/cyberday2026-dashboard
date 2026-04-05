'use client'

import { useState, useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import bandasData from '@/data/bandas-cuotas.json'
import skuGridData from '@/data/sku-grid.json'

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
  style: 'currency',
  currency: 'CLP',
  minimumFractionDigits: 0,
})

function formatCLP(value: number): string {
  return clpFormatter.format(value)
}

function getDiscountBadgeColor(discountPercent: number): string {
  if (discountPercent > 0.15) return 'bg-green-500/10 text-green-700 dark:text-green-400'
  if (discountPercent >= 0.1) return 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-400'
  return 'bg-slate-500/10 text-slate-700 dark:text-slate-400'
}

function TierCard({ tier }: { tier: Tier }) {
  return (
    <Card className="dark:border-slate-700">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">{tier.name}</CardTitle>
        {tier.notes && (
          <CardDescription className="text-xs italic">{tier.notes}</CardDescription>
        )}
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

        <div className="space-y-2 border-t border-slate-200 pt-3 dark:border-slate-700">
          <div className="text-xs">
            <p className="text-muted-foreground">Monto Mín/Máx</p>
            <p className="font-mono text-sm">
              {formatCLP(tier.min_amount)} - {formatCLP(tier.max_amount)}
            </p>
          </div>
        </div>

        <div className="space-y-2 border-t border-slate-200 pt-3 dark:border-slate-700">
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
    <Card className="dark:border-slate-700">
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
    <Card className="dark:border-slate-700">
      <CardHeader>
        <CardTitle>Bonificaciones por Volumen</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {bonuses.map((bonus) => (
          <div key={bonus.threshold} className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="font-medium">{bonus.threshold}</span>
              <span className="font-semibold text-green-600 dark:text-green-400">
                +{bonus.percentage}%
              </span>
            </div>
            <div className="h-2 w-full rounded-full bg-slate-200 dark:bg-slate-700">
              <div
                className="h-full rounded-full bg-gradient-to-r from-green-400 to-green-600"
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
  const prefs = [
    { label: '3 cuotas', value: 15 },
    { label: '6 cuotas', value: 35 },
    { label: '12 cuotas', value: 40 },
    { label: '24+ cuotas', value: 10 },
  ]

  return (
    <Card className="dark:border-slate-700">
      <CardHeader>
        <CardTitle>Impacto Estimado</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground">Conversión Esperada</p>
          <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">25-30%</p>
        </div>

        <div className="space-y-1">
          <p className="text-sm text-muted-foreground">Aumento Ticket Promedio</p>
          <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">15-20%</p>
        </div>

        <div className="space-y-3 border-t border-slate-200 pt-4 dark:border-slate-700">
          <p className="text-sm font-semibold">Preferencia de Cuotas</p>
          <div className="space-y-2">
            {prefs.map((pref) => (
              <div key={pref.label} className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span>{pref.label}</span>
                  <span className="font-semibold">{pref.value}%</span>
                </div>
                <div className="h-2 w-full rounded-full bg-slate-200 dark:bg-slate-700">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-indigo-400 to-indigo-600"
                    style={{ width: `${pref.value}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
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
    <Card className="dark:border-slate-700">
      <CardHeader>
        <CardTitle>Grid de SKUs - Precios CyberDay</CardTitle>
        <CardDescription>
          {filteredSKUs.length} de {skuList.length} SKUs
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Input
          placeholder="Buscar por SKU o código real..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="dark:bg-slate-800"
        />

        <div className="overflow-x-auto">
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
                <TableRow key={sku.skuCode} className="hover:bg-slate-50 dark:hover:bg-slate-800">
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
                    <Badge className={`${getDiscountBadgeColor(sku.dcto)}`}>
                      {(sku.dcto * 100).toFixed(0)}%
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {filteredSKUs.length === 0 && (
          <div className="flex items-center justify-center py-8">
            <p className="text-muted-foreground">No se encontraron SKUs</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export function BandasView() {
  const tiers = bandasData.tiers as Tier[]

  return (
    <div className="space-y-6 p-4 sm:p-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Bandas & Cuotas</h1>
        <p className="text-muted-foreground mt-2">
          Estrategia de financiamiento y descuentos para CyberDay 2026
        </p>
      </div>

      {/* Financing Tiers Section */}
      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Opciones de Financiamiento</h2>
        <div className="grid auto-rows-max gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {tiers.map((tier) => (
            <TierCard key={tier.name} tier={tier} />
          ))}
        </div>
      </section>

      {/* Payment Methods & Impact Section */}
      <section className="grid gap-4 lg:grid-cols-2">
        <PaymentMethodsTable />
        <EstimatedImpactCard />
      </section>

      {/* Volume Bonuses Section */}
      <section>
        <VolumeBonusesCard />
      </section>

      {/* SKU Pricing Grid */}
      <section>
        <SKUPricingGrid />
      </section>
    </div>
  )
}
