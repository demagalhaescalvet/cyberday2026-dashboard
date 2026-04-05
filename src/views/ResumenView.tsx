import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ChartContainer, type ChartConfig } from '@/components/ui/chart'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import revenueData from '@/data/revenue.json'

const chartConfig = {
  revenue: {
    label: 'Ingresos',
    color: '#2b7fff',
  },
} satisfies ChartConfig

const categories = [
  'iPh Pro',
  'iPh Pro Max',
  'iPh Air',
  'iPh 17',
  'iPh Budget',
  'Audio Apple',
  'Mac NB',
  'Mac DT',
  'iPad',
  'Apple Watch',
  'Acc Apple',
  'Audio 3P',
  'Prot 3P',
  'Fundas 3P',
  'Carga 3P',
  'Almac 3P',
  'Otros 3P',
]

const chartData = categories.map((category, index) => ({
  name: category,
  revenue: revenueData[index] || 0,
}))

export function ResumenView() {
  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Revenue 2024</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$4.553M</div>
            <p className="text-xs text-muted-foreground mt-1">Cifra histórica</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Revenue 2025</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$5.047M</div>
            <p className="text-xs text-muted-foreground mt-1">+10.9% vs 2024</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Target 2026</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$5.421M</div>
            <p className="text-xs text-muted-foreground mt-1">+7.4% vs 2025</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Ticket Promedio</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$290K</div>
            <p className="text-xs text-muted-foreground mt-1">Promedio por orden</p>
          </CardContent>
        </Card>
      </div>

      {/* Revenue by Category Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Ingresos por Categoría</CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig}>
            <BarChart
              data={chartData}
              margin={{ top: 20, right: 30, left: 20, bottom: 100 }}
            >
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis
                dataKey="name"
                angle={-45}
                textAnchor="end"
                height={100}
                tick={{ fontSize: 12 }}
              />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'var(--card)',
                  border: '1px solid var(--border)',
                  borderRadius: '8px',
                }}
                formatter={(value) => `$${value}M`}
              />
              <Legend />
              <Bar dataKey="revenue" fill="#2b7fff" name="Ingresos (M)" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  )
}
