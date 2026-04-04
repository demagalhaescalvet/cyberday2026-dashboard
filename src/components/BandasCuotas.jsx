import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
  ScatterChart,
  Scatter,
} from 'recharts';
import {
  priceBands,
  priceLabels,
  bandDist,
  cuotaLabels,
  cuotaDist,
  cuotaBand1,
  cuotaBand2,
  cuotaBand3,
} from '../data/dashboard';
import { formatCLP } from '../lib/utils';

const BandasCuotas = () => {
  // Band color scheme
  const bandColors = {
    band1: '#3b82f6', // blue
    band2: '#06b6d4', // cyan
    band3: '#f59e0b', // amber
    band4: '#a855f7', // purple
    band5: '#ec4899', // pink
  };

  const bandNames = ['band1', 'band2', 'band3', 'band4', 'band5'];

  // Prepare price distribution chart data
  const priceChartData = priceLabels.map((label, idx) => ({
    label,
    band1: bandDist.band1[idx],
    band2: bandDist.band2[idx],
    band3: bandDist.band3[idx],
    band4: bandDist.band4[idx],
    band5: bandDist.band5[idx],
  }));

  // Month names for cuota heatmap
  const monthNames = [
    'Ene',
    'Feb',
    'Mar',
    'Abr',
    'May',
    'Jun',
    'Jul',
    'Ago',
    'Sep',
    'Oct',
    'Nov',
    'Dic',
  ];

  // Prepare cuota band data for horizontal stacked bar
  const cuotaBandData = [
    {
      name: 'Banda 1',
      'Sin cuotas': cuotaBand1[0],
      '3 cuotas': cuotaBand1[1],
      '6 cuotas': cuotaBand1[2],
      '12 cuotas': cuotaBand1[3],
      '24 cuotas': cuotaBand1[4],
      '36+ cuotas': cuotaBand1[5],
    },
    {
      name: 'Banda 2',
      'Sin cuotas': cuotaBand2[0],
      '3 cuotas': cuotaBand2[1],
      '6 cuotas': cuotaBand2[2],
      '12 cuotas': cuotaBand2[3],
      '24 cuotas': cuotaBand2[4],
      '36+ cuotas': cuotaBand2[5],
    },
    {
      name: 'Banda 3',
      'Sin cuotas': cuotaBand3[0],
      '3 cuotas': cuotaBand3[1],
      '6 cuotas': cuotaBand3[2],
      '12 cuotas': cuotaBand3[3],
      '24 cuotas': cuotaBand3[4],
      '36+ cuotas': cuotaBand3[5],
    },
  ];

  // Heatmap color intensity helper
  const getHeatmapColor = (value) => {
    if (value >= 45) return 'bg-pink-900 text-pink-100';
    if (value >= 35) return 'bg-pink-800 text-pink-100';
    if (value >= 25) return 'bg-pink-700 text-pink-100';
    if (value >= 15) return 'bg-pink-600 text-pink-100';
    if (value >= 5) return 'bg-pink-500 text-white';
    return 'bg-gray-700 text-gray-300';
  };

  return (
    <div className="w-full">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">
          Bandas de Precio & Cuotas
        </h1>
        <p className="text-gray-400">
          Precios con IVA · Target 2026
        </p>
      </div>

      {/* Price Bands Summary - 5 cards in a row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        {priceBands.map((band, idx) => {
          const bandKey = bandNames[idx];
          const color = bandColors[bandKey];
          return (
            <div
              key={idx}
              className="bg-[#111827] rounded-xl border border-[#1e293b] p-5"
              style={{
                borderLeftWidth: '4px',
                borderLeftColor: color,
              }}
            >
              <div className="mb-3">
                <h3
                  className="text-sm font-semibold mb-1"
                  style={{ color }}
                >
                  {band.band}
                </h3>
              </div>

              <div className="space-y-2 text-xs">
                <div>
                  <span className="text-gray-400">Units</span>
                  <p className="text-white font-semibold">
                    {band.u26.toLocaleString()}
                  </p>
                </div>
                <div>
                  <span className="text-gray-400">Revenue</span>
                  <p className="text-white font-semibold">
                    {formatCLP(band.r26 * 1e6)}
                  </p>
                </div>
                <div>
                  <span className="text-gray-400">% Mix</span>
                  <p className="text-white font-semibold">
                    {band.pct}%
                  </p>
                </div>
                <div className="pt-2 border-t border-[#1e293b]">
                  <span className="text-gray-500 text-xs">
                    {band.products}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Price Distribution Chart */}
      <div className="bg-[#111827] rounded-xl border border-[#1e293b] p-5 mb-8">
        <h2 className="text-lg font-semibold text-white mb-4">
          Distribución de Precios por Banda
        </h2>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={priceChartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
            <XAxis
              dataKey="label"
              tick={{ fill: '#9ca3af', fontSize: 12 }}
              angle={-45}
              textAnchor="end"
              height={80}
            />
            <YAxis tick={{ fill: '#9ca3af', fontSize: 12 }} />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1f2937',
                border: '1px solid #374151',
                borderRadius: '8px',
              }}
              labelStyle={{ color: '#fff' }}
            />
            <Legend
              wrapperStyle={{ paddingTop: '20px' }}
              iconType="square"
            />
            <Bar dataKey="band1" fill={bandColors.band1} stackId="a" />
            <Bar dataKey="band2" fill={bandColors.band2} stackId="a" />
            <Bar dataKey="band3" fill={bandColors.band3} stackId="a" />
            <Bar dataKey="band4" fill={bandColors.band4} stackId="a" />
            <Bar dataKey="band5" fill={bandColors.band5} stackId="a" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Cuotas Analysis Section */}
      <div className="space-y-6">
        {/* Horizontal stacked bar for banda distribution */}
        <div className="bg-[#111827] rounded-xl border border-[#1e293b] p-5">
          <h2 className="text-lg font-semibold text-white mb-4">
            Distribución de Cuotas por Banda
          </h2>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart
              data={cuotaBandData}
              layout="vertical"
              margin={{ top: 5, right: 30, left: 100, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis type="number" tick={{ fill: '#9ca3af', fontSize: 12 }} />
              <YAxis
                type="category"
                dataKey="name"
                tick={{ fill: '#9ca3af', fontSize: 12 }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1f2937',
                  border: '1px solid #374151',
                  borderRadius: '8px',
                }}
                labelStyle={{ color: '#fff' }}
              />
              <Legend
                wrapperStyle={{ paddingTop: '20px' }}
                iconType="square"
              />
              <Bar dataKey="Sin cuotas" fill="#06b6d4" stackId="a" />
              <Bar dataKey="3 cuotas" fill="#3b82f6" stackId="a" />
              <Bar dataKey="6 cuotas" fill="#8b5cf6" stackId="a" />
              <Bar dataKey="12 cuotas" fill="#f59e0b" stackId="a" />
              <Bar dataKey="24 cuotas" fill="#ec4899" stackId="a" />
              <Bar dataKey="36+ cuotas" fill="#ef4444" stackId="a" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Monthly cuota distribution heatmap */}
        <div className="bg-[#111827] rounded-xl border border-[#1e293b] p-5">
          <h2 className="text-lg font-semibold text-white mb-4">
            Distribución Mensual de Cuotas (% por método)
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-[#1e293b]">
                  <th className="text-left py-2 px-3 text-gray-400 font-medium w-16">
                    Mes
                  </th>
                  {cuotaLabels.map((label) => (
                    <th
                      key={label}
                      className="text-center py-2 px-2 text-gray-400 font-medium"
                    >
                      {label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {monthNames.map((month, monthIdx) => (
                  <tr key={monthIdx} className="border-b border-[#1e293b]">
                    <td className="py-2 px-3 text-gray-300 font-medium">
                      {month}
                    </td>
                    {cuotaDist[monthIdx].map((value, cuotaIdx) => (
                      <td
                        key={cuotaIdx}
                        className={`text-center py-2 px-2 font-semibold rounded ${getHeatmapColor(
                          value
                        )}`}
                      >
                        {value}%
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Methodology Note */}
      <div className="mt-8 bg-[#0f172a] rounded-lg border border-[#1e293b] p-4">
        <p className="text-xs text-gray-500 leading-relaxed">
          <span className="font-semibold text-gray-400">Metodología:</span>{' '}
          Bandas de precio y cuotas reflejan el precio que ve el cliente al comprar.
          Fuentes: Cyber 2024 (15,322 txns), Cyber 2025 (15,134 txns). Proyección
          2026 reconstruida desde 226 SKUs del mix ideal.
        </p>
      </div>
    </div>
  );
};

export default BandasCuotas;
