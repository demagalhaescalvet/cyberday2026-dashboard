'use client'

import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts'
import type { ProductMixCategory, ProductMixSubcategory, ProductMixSKU } from '@/types/product-mix'
import productMixData from '@/data/product-mix.json'

const clpFormatter = new Intl.NumberFormat('es-CL', {
  style: 'currency',
  currency: 'CLP',
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
})

export function MixIdealView() {
  const [searchTerm, setSearchTerm] = useState('')
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null)

  // Calculate totals
  const categories = useMemo(() => {
    const data = productMixData as unknown as { categories: ProductMixCategory[] }
    return data.categories
  }, [])

  const totalRevenue = useMemo(
    () => categories.reduce((sum, cat) => sum + cat.revenue, 0),
    [categories]
  )

  const totalUnits = useMemo(() => categories.reduce((sum, cat) => sum + cat.units, 0), [categories])

  // Filter categories by search term
  const filteredCategories = useMemo(
    () => categories.filter((cat) => cat.name.toLowerCase().includes(searchTerm.toLowerCase())),
    [categories, searchTerm]
  )

  // Sort by revenue descending
  const sortedCategories = useMemo(
    () => [...filteredCategories].sort((a, b) => b.revenue - a.revenue),
    [filteredCategories]
  )

  // Prepare data for revenue distribution chart
  const chartData = useMemo(
    () =>
      sortedCategories.map((cat) => ({
        name: cat.name,
        revenue: cat.revenue,
        percentage: ((cat.revenue / totalRevenue) * 100).toFixed(1),
        color: cat.color,
      })),
    [sortedCategories, totalRevenue]
  )

  const toggleExpand = (categoryName: string) => {
    setExpandedCategory(expandedCategory === categoryName ? null : categoryName)
  }

  return (
    <div className="space-y-6">
      {/* Search Filter */}
      <Card className="dark:bg-slate-950 dark:border-slate-800">
        <CardContent className="pt-6">
          <Input
            placeholder="Filter by category name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="dark:bg-slate-900 dark:border-slate-700 dark:text-slate-100"
          />
        </CardContent>
      </Card>

      {/* Category Overview Table */}
      <Card className="dark:bg-slate-950 dark:border-slate-800">
        <CardHeader>
          <CardTitle className="text-lg">Category Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="dark:border-slate-700">
                  <TableHead className="dark:text-slate-300">Icon</TableHead>
                  <TableHead className="dark:text-slate-300">Category</TableHead>
                  <TableHead className="text-right dark:text-slate-300">Units</TableHead>
                  <TableHead className="text-right dark:text-slate-300">Revenue (M)</TableHead>
                  <TableHead className="text-right dark:text-slate-300">ASP (K)</TableHead>
                  <TableHead className="text-right dark:text-slate-300">% of Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedCategories.map((category) => {
                  const revenuePercentage = ((category.revenue / totalRevenue) * 100).toFixed(1)
                  const isExpanded = expandedCategory === category.name

                  return (
                    <tbody key={category.name}>
                      <TableRow
                        onClick={() => toggleExpand(category.name)}
                        className="cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-900 dark:border-slate-700 transition-colors"
                      >
                        <TableCell className="dark:text-slate-300 text-xl">{category.icon}</TableCell>
                        <TableCell className="font-medium dark:text-slate-100">{category.name}</TableCell>
                        <TableCell className="text-right dark:text-slate-300">
                          {category.units.toLocaleString()}
                        </TableCell>
                        <TableCell className="text-right dark:text-slate-300">
                          {clpFormatter.format(category.revenue)}
                        </TableCell>
                        <TableCell className="text-right dark:text-slate-300">
                          {clpFormatter.format(category.asp)}
                        </TableCell>
                        <TableCell className="text-right dark:text-slate-300">{revenuePercentage}%</TableCell>
                      </TableRow>

                      {/* Expandable Subcategories */}
                      {isExpanded && (
                        <TableRow className="dark:bg-slate-900 dark:border-slate-700">
                          <TableCell colSpan={6} className="p-4">
                            <div className="space-y-4">
                              <h4 className="font-semibold dark:text-slate-100">Subcategories</h4>
                              <div className="space-y-3">
                                {category.subcategories.map((subcat) => (
                                  <div
                                    key={subcat.name}
                                    className="border dark:border-slate-700 rounded-lg p-3 space-y-2"
                                  >
                                    <div className="flex items-center justify-between">
                                      <span className="font-medium dark:text-slate-200">{subcat.name}</span>
                                      <span className="text-sm dark:text-slate-400">
                                        {subcat.units.toLocaleString()} units
                                      </span>
                                    </div>

                                    {/* Progress bar */}
                                    <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                                      <div
                                        className="h-2 rounded-full bg-blue-500"
                                        style={{
                                          width: `${((subcat.units / category.units) * 100).toFixed(1)}%`,
                                        }}
                                      />
                                    </div>

                                    <div className="flex justify-between text-sm dark:text-slate-400">
                                      <span>ASP: {clpFormatter.format(subcat.asp)}</span>
                                      <span>Revenue: {clpFormatter.format(subcat.revenue)}</span>
                                    </div>

                                    {/* SKUs */}
                                    {subcat.skus && subcat.skus.length > 0 && (
                                      <div className="mt-2 ml-4 space-y-1 text-sm">
                                        <p className="font-semibold dark:text-slate-300">SKUs:</p>
                                        {subcat.skus.map((sku) => (
                                          <div key={sku.sku} className="dark:text-slate-400 flex justify-between">
                                            <span>
                                              {sku.sku} - {sku.name}
                                            </span>
                                            <span>{sku.units.toLocaleString()} @ {clpFormatter.format(sku.price)}</span>
                                          </div>
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                    </tbody>
                  )
                })}

                {/* Total Row */}
                <TableRow className="font-bold dark:border-slate-700 bg-slate-50 dark:bg-slate-900">
                  <TableCell colSpan={2} className="dark:text-slate-100">
                    TOTAL
                  </TableCell>
                  <TableCell className="text-right dark:text-slate-100">
                    {totalUnits.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-right dark:text-slate-100">
                    {clpFormatter.format(totalRevenue)}
                  </TableCell>
                  <TableCell className="text-right dark:text-slate-100">
                    {clpFormatter.format(totalRevenue / totalUnits)}
                  </TableCell>
                  <TableCell className="text-right dark:text-slate-100">100%</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Revenue Distribution Chart */}
      <Card className="dark:bg-slate-950 dark:border-slate-800">
        <CardHeader>
          <CardTitle className="text-lg">Revenue Distribution by Category</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="w-full h-96">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                layout="vertical"
                margin={{ top: 5, right: 30, left: 180, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis type="number" stroke="#94a3b8" />
                <YAxis dataKey="name" type="category" width={170} stroke="#94a3b8" />
                <Tooltip
                  formatter={(value: number) => clpFormatter.format(value)}
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    border: '1px solid #475569',
                    borderRadius: '8px',
                  }}
                  labelStyle={{ color: '#e2e8f0' }}
                />
                <Bar dataKey="revenue" fill="#3b82f6" radius={[0, 8, 8, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="dark:bg-slate-950 dark:border-slate-800">
          <CardHeader>
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold dark:text-slate-100">{clpFormatter.format(totalRevenue)}</p>
          </CardContent>
        </Card>

        <Card className="dark:bg-slate-950 dark:border-slate-800">
          <CardHeader>
            <CardTitle className="text-sm font-medium">Total Units</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold dark:text-slate-100">{totalUnits.toLocaleString()}</p>
          </CardContent>
        </Card>

        <Card className="dark:bg-slate-950 dark:border-slate-800">
          <CardHeader>
            <CardTitle className="text-sm font-medium">Avg ASP</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold dark:text-slate-100">
              {clpFormatter.format(totalRevenue / totalUnits)}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
