import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import pricingData from '@/data/pricing-audit.json'

function formatPrice(price: number): string {
  return new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price)
}

function getBadgeVariant(status: string): 'default' | 'secondary' | 'destructive' | 'outline' {
  switch (status) {
    case 'match':
      return 'default'
    case 'warn':
      return 'destructive'
    case 'ok':
      return 'secondary'
    default:
      return 'outline'
  }
}

function getBadgeColor(status: string): string {
  switch (status) {
    case 'match':
      return 'bg-green-900/30 text-green-100 hover:bg-green-900/40'
    case 'warn':
      return 'bg-yellow-900/30 text-yellow-100 hover:bg-yellow-900/40'
    case 'ok':
      return 'bg-blue-900/30 text-blue-100 hover:bg-blue-900/40'
    default:
      return ''
  }
}

export function AuditoriaView() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Auditoría de Precios - CyberDay 2026</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Producto</TableHead>
                <TableHead className="text-right">PVP MacOnline</TableHead>
                <TableHead className="text-right">Cyber Plan</TableHead>
                <TableHead className="text-right">Min Mercado</TableHead>
                <TableHead>Tienda</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Nota</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pricingData.map((item, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium">{item.product}</TableCell>
                  <TableCell className="text-right font-mono text-sm">
                    {formatPrice(item.pvpMO)}
                  </TableCell>
                  <TableCell className="text-right font-mono text-sm">
                    {formatPrice(item.cyberPlan)}
                  </TableCell>
                  <TableCell className="text-right font-mono text-sm">
                    {formatPrice(item.marketLow)}
                  </TableCell>
                  <TableCell className="text-sm">{item.marketStore}</TableCell>
                  <TableCell>
                    <Badge className={getBadgeColor(item.status)}>
                      {item.status === 'match'
                        ? 'Iguala'
                        : item.status === 'warn'
                          ? 'Revisar'
                          : 'OK'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">{item.note}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}
