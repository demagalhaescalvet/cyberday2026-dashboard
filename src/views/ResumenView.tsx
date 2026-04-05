import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ChartContainer, type ChartConfig } from '@/components/ui/chart'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import revenueData from '@/data/revenue.json'
import unitsData from '@/data/units.json'
import kpiData from '@/data/kpi.json'

// Chart configurations
const revenueChartConfig = {
  revenue: {
    label: 'Ingresos',
    color: 'hsl(var(--chart-1))',
  },
} satisfies ChartConfig

const unitsChartConfig = {
  units: {
    label: 'Unidades',
    color: 'hsl(var(--chart-2))',
  },
} satisfies ChartConfig

// Prepare chart data from JSON files
const revenueChartData = revenueData.categories.map((category, index) => ({
  name: category,
  revenue: revenueData.revenue_millions[index] || 0,
}))

const unitsChartData = unitsData.categories.map((category, index) => ({
  name: category,
  units: unitsData.units[index] || 0,
}))

// Number formatter for CLP currency
const formatCLP = (value: number) => {
  return new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value)
}

const formatNumber = (value: number) => {
  return new Intl.NumberFormat('es-CL', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value)
}

export function ResumenView() {
  return (
    <div className="space-y-6">
      {/* KPI Cards - 6 cards in 3 columns */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Revenue 2024 */}
        <Card className="border border-border bg-card hover:border-primary/50 transition-colors">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Revenue 2024</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="text-3xl font-bold text-foreground">$4.553M</div>
            <p className="text-xs text-muted-foreground">Cifra histórica</p>
          </CardContent>
        </Card>

        {/* Revenue 2025 */}
        <Card className="border border-border bg-card hover:border-primary/50 transition-colors">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Revenue 2025</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="text-3xl font-bold text-foreground">$5.047M</div>
            <p className="text-xs text-green-500 font-semibold">+10.9% vs 2024</p>
          </CardContent>
        </Card>

        {/* Target 2026 */}
        <Card className="border border-border bg-card hover:border-primary/50 transition-colors">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Target 2026</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="text-3xl font-bold text-foreground">$5.421M</div>
            <p className="text-xs text-green-500 font-semibold">+7.4% vs 2025</p>
          </CardContent>
        </Card>

        {/* Growth 2025 */}
        <Card className="border border-border bg-card hover:border-primary/50 transition-colors">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Growth 2025</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="text-3xl font-bold text-green-500">+10.9%</div>
            <p className="text-xs text-muted-foreground">vs 2024</p>
          </CardContent>
        </Card>

        {/* Growth 2026 */}
        <Card className="border border-border bg-card hover:border-primary/50 transition-colors">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Growth 2026</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="text-3xl font-bold text-green-500">+7.4%</div>
            <p className="text-xs text-muted-foreground">Target growth</p>
          </CardContent>
        </Card>

        {/* Ticket Promedio */}
        <Card className="border border-border bg-card hover:border-primary/50 transition-colors">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Ticket Promedio</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="text-3xl font-bold text-foreground">$290K</div>
            <p className="text-xs text-muted-foreground">Promedio por orden</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section with Tabs */}
      <Tabs defaultValue="revenue" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2 bg-muted p-1 rounded-lg">
          <TabsTrigger value="revenue" className="font-semibold">
            Ingresos
          </TabsTrigger>
          <TabsTrigger value="units" className="font-semibold">
            Unidades
          </TabsTrigger>
        </TabsList>

        {/* Revenue Chart Tab */}
        <TabsContent value="revenue" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-bold">Ingresos por Categoría (Millones $)</CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer config={revenueChartConfig} className="w-full h-96">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={revenueChartData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 120 }}
                    layout="vertical"
                  >
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" vertical={true} horizontal={false} />
                    <XAxis type="number" tick={{ fontSize: 12 }} />
                    <YAxis
                      dataKey="name"
                      type="category"
                      width={120}
                      tick={{ fontSize: 11 }}
                      interval={0}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                      }}
                      formatter={(value) => [`${formatNumber(value as number)}M`, 'Ingresos']}
                      labelFormatter={(label) => `${label}`}
                    />
                    <Bar
                      dataKey="revenue"
                      fill="hsl(var(--chart-1))"
                      name="Ingresos"
                      radius={[0, 8, 8, 0]}
                      isAnimationActive={true}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Units Chart Tab */}
        <TabsContent value="units" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-bold">Unidades Vendidas por Categoría</CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer config={unitsChartConfig} className="w-full h-96">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={unitsChartData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 120 }}
                    layout="vertical"
                  >
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" vertical={true} horizontal={false} />
                    <XAxis type="number" tick={{ fontSize: 12 }} />
                    <YAxis
                      dataKey="name"
                      type="category"
                      width={120}
                      tick={{ fontSize: 11 }}
                      interval={0}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                      }}
                      formatter={(value) => [formatNumber(value as number), 'Unidades']}
                      labelFormatter={(label) => `${label}`}
                    />
                    <Bar
                      dataKey="units"
                      fill="hsl(var(--chart-2))"
                      name="Unidades"
                      radius={[0, 8, 8, 0]}
                      isAnimationActive={true}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Summary Stats Card */}
      <Card className="border border-border/50 bg-card">
        <CardHeader>
          <CardTitle className="text-base font-bold">Resumen de Métricas 2026</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Total Ingresos Objetivo</p>
              <p className="text-2xl font-bold">$5.421M</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Unidades Objetivo</p>
              <p className="text-2xl font-bold">18,670</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Crecimiento Promedio</p>
              <p className="text-2xl font-bold text-green-500">+9.2%</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
