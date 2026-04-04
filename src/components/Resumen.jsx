import { useState } from 'react';
import {
  BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { categories, units2024, units2025, units2026, rev2024, rev2025, rev2026, totalUnits, totalRev } from '../data/dashboard';
import { formatCLP } from '../lib/utils';

export default function Resumen() {
  const [viewMode, setViewMode] = useState('revenue'); // 'revenue' or 'units'

  // Calculate totals
  const tRev2024 = totalRev(rev2024);
  const tRev2025 = totalRev(rev2025);
  const tRev2026 = totalRev(rev2026);
  const tUnits2026 = totalUnits(units2026);

  // Calculate ticket promedio 2026 (in CLP, millions)
  const avgTicketM = tRev2026 / tUnits2026; // millions
  const avgTicketK = avgTicketM * 1e3; // thousands

  // Calculate growth percentages
  const growthRev2025vs2024 = ((tRev2025 - tRev2024) / tRev2024) * 100;
  const growthRev2026vs2025 = ((tRev2026 - tRev2025) / tRev2025) * 100;

  // Short category labels
  const shortLabels = [
    'iPh Pro', 'iPh Pro Max', 'iPh Air', 'iPh 17', 'iPh Budget',
    'Audio Apple', 'Mac NB', 'Mac DT', 'iPad', 'Apple Watch',
    'Acc Apple', 'Audio 3P', 'Prot 3P', 'Fundas 3P', 'Carga 3P',
    'Almac 3P', 'Otros 3P'
  ];

  // Prepare bar chart data - use abbreviated labels
  const barChartData = categories.map((cat, idx) => ({
    name: shortLabels[idx],
    '2024': viewMode === 'revenue' ? rev2024[idx] : units2024[idx],
    '2025': viewMode === 'revenue' ? rev2025[idx] : units2025[idx],
    '2026T': viewMode === 'revenue' ? rev2026[idx] : units2026[idx],
  }));

  // iPhone Revenue Chart (categories 0-4)
  const iphoneData = categories.slice(0, 5).map((cat, idx) => ({
    name: shortLabels[idx],
    '2024': rev2024[idx],
    '2025': rev2025[idx],
    '2026T': rev2026[idx],
  }));

  // Mix Revenue 2026 (Pie chart) - all categories
  const pieData = categories.map((cat, idx) => ({
    name: shortLabels[idx],
    value: rev2026[idx],
  })).filter(item => item.value > 0);

  // Calculate Apple vs 3P for ticket promedio label
  const appleRev2026 = rev2026.slice(0, 11).reduce((a, b) => a + b, 0);
  const thirdPartyRev2026 = rev2026.slice(11).reduce((a, b) => a + b, 0);
  const appleUnits = units2026.slice(0, 11).reduce((a, b) => a + b, 0);
  const thirdPartyUnits = units2026.slice(11).reduce((a, b) => a + b, 0);
  const appleTicket = Math.round((appleRev2026 / appleUnits) * 1e3);
  const thirdPartyTicket = Math.round((thirdPartyRev2026 / thirdPartyUnits) * 1e3);

  const chartColors = {
    '2024': '#4b5563',
    '2025': '#3dd68c',
    '2026T': '#22c55e',
  };

  return (
    <div className="flex-1 overflow-auto bg-[#0a0e1a] p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Resumen Histórico Cyber Day</h1>
          <p className="text-sm text-slate-400">Comparativo 2024 · 2025 · Target 2026 · Valores netos sin IVA</p>
        </div>

        {/* 4 KPI Cards */}
        <div className="grid grid-cols-4 gap-4">
          {/* Revenue 2024 */}
          <div className="rounded-xl border border-[#1e293b] bg-[#111827] p-5">
            <div className="text-sm text-slate-400 mb-2">Revenue 2024</div>
            <div className="text-2xl font-bold text-white mb-3">{formatCLP(tRev2024 * 1e6)}</div>
            <div className="text-xs font-medium text-slate-500 bg-slate-800/50 px-2 py-1 rounded inline-block">baseline</div>
          </div>

          {/* Revenue 2025 */}
          <div className="rounded-xl border border-[#1e293b] bg-[#111827] p-5">
            <div className="text-sm text-slate-400 mb-2">Revenue 2025</div>
            <div className="text-2xl font-bold text-white mb-3">{formatCLP(tRev2025 * 1e6)}</div>
            <div className="text-xs font-medium text-green-600 bg-green-900/30 px-2 py-1 rounded inline-block">
              +{growthRev2025vs2024.toFixed(1)}% vs 2024
            </div>
          </div>

          {/* Target 2026 */}
          <div className="rounded-xl border border-[#1e293b] bg-[#111827] p-5">
            <div className="text-sm text-slate-400 mb-2">Target 2026</div>
            <div className="text-2xl font-bold text-white mb-3">{formatCLP(tRev2026 * 1e6)}</div>
            <div className="text-xs font-medium text-green-600 bg-green-900/30 px-2 py-1 rounded inline-block">
              +{growthRev2026vs2025.toFixed(1)}% vs 2025
            </div>
          </div>

          {/* Ticket Promedio 2026 */}
          <div className="rounded-xl border border-[#1e293b] bg-[#111827] p-5">
            <div className="text-sm text-slate-400 mb-2">Ticket Promedio 2026</div>
            <div className="text-2xl font-bold text-white mb-3">{formatCLP(avgTicketK * 1e3)}</div>
            <div className="text-xs font-medium text-amber-600 bg-amber-900/30 px-2 py-1 rounded inline-block">
              Apple ${appleTicket}K · 3P ${thirdPartyTicket}K
            </div>
          </div>
        </div>

        {/* Evolution by Category */}
        <div className="rounded-xl border border-[#1e293b] bg-[#111827] p-5">
          <div className="flex justify-between items-center mb-5">
            <h2 className="text-lg font-bold text-white">Evolución por Categoría</h2>
            <div className="flex gap-2">
              <button
                onClick={() => setViewMode('revenue')}
                className={`px-3 py-1 text-sm rounded font-medium transition-all ${
                  viewMode === 'revenue'
                    ? 'bg-blue-600/30 text-blue-300'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Revenue
              </button>
              <button
                onClick={() => setViewMode('units')}
                className={`px-3 py-1 text-sm rounded font-medium transition-all ${
                  viewMode === 'units'
                    ? 'bg-blue-600/30 text-blue-300'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Unidades
              </button>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={barChartData} margin={{ top: 20, right: 30, left: 0, bottom: 60 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis
                dataKey="name"
                stroke="#64748b"
                angle={-45}
                textAnchor="end"
                height={120}
                tick={{ fontSize: 12 }}
              />
              <YAxis stroke="#64748b" tick={{ fontSize: 12 }} />
              <Tooltip
                contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
                labelStyle={{ color: '#e2e8f0' }}
                formatter={(value) => viewMode === 'revenue' ? formatCLP(value * 1e6) : value}
              />
              <Legend wrapperStyle={{ paddingTop: '20px' }} />
              <Bar dataKey="2024" fill={chartColors['2024']} />
              <Bar dataKey="2025" fill={chartColors['2025']} />
              <Bar dataKey="2026T" fill={chartColors['2026T']} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Two side-by-side charts */}
        <div className="grid grid-cols-2 gap-4">
          {/* iPhone Revenue Chart */}
          <div className="rounded-xl border border-[#1e293b] bg-[#111827] p-5">
            <h3 className="text-lg font-bold text-white mb-5">iPhone — Revenue por Tier</h3>
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={iphoneData} margin={{ top: 20, right: 30, left: 0, bottom: 40 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis
                  dataKey="name"
                  stroke="#64748b"
                  angle={-45}
                  textAnchor="end"
                  height={100}
                  tick={{ fontSize: 12 }}
                />
                <YAxis stroke="#64748b" tick={{ fontSize: 12 }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
                  labelStyle={{ color: '#e2e8f0' }}
                  formatter={(value) => formatCLP(value * 1e6)}
                />
                <Legend wrapperStyle={{ paddingTop: '20px' }} />
                <Bar dataKey="2024" fill={chartColors['2024']} />
                <Bar dataKey="2025" fill={chartColors['2025']} />
                <Bar dataKey="2026T" fill={chartColors['2026T']} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Mix Revenue 2026 Pie Chart */}
          <div className="rounded-xl border border-[#1e293b] bg-[#111827] p-5">
            <h3 className="text-lg font-bold text-white mb-5">Mix Revenue 2026</h3>
            <ResponsiveContainer width="100%" height={350}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={80}
                  outerRadius={120}
                  paddingAngle={2}
                  dataKey="value"
                  label={({ name, value }) => `${name} ${formatCLP(value * 1e6)}`}
                  labelLine={true}
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={getColorByIndex(index)} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
                  labelStyle={{ color: '#e2e8f0' }}
                  formatter={(value) => formatCLP(value * 1e6)}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper function to generate distinct colors for pie chart
function getColorByIndex(index) {
  const colors = [
    '#4f8cf7', '#9b7af7', '#f0b840', '#38d4e8', '#3dd68c',
    '#e870b0', '#4f8cf7', '#5a9cf7', '#f0b840', '#3dd68c',
    '#7a8599', '#e87070', '#c490f7', '#7ac4f7', '#70c8a0',
    '#d4a040', '#a0a8b8'
  ];
  return colors[index % colors.length];
}
