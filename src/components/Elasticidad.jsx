import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import { elasticity, units2026, totalUnits } from '../data/dashboard';
import { cn } from '../lib/utils';

const Elasticidad = () => {
  const baselineUnits = totalUnits(units2026);

  // Calculate scenario totals
  const pessimisticTotal = baselineUnits + elasticity.reduce((sum, item) => sum + item.pessDelta, 0);
  const optimisticTotal = baselineUnits + elasticity.reduce((sum, item) => sum + item.optDelta, 0);

  // Prepare tornado chart data - showing impact from baseline
  const tornadoData = elasticity.map((item) => ({
    variable: item.variable,
    pessimistic: item.pessDelta,
    optimistic: item.optDelta,
  }));

  // Custom tooltip for tornado chart
  const TornadoTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-[#1f2937] border border-[#374151] rounded p-3 text-xs text-white">
          <p className="font-semibold">{data.variable}</p>
          <p className="text-red-400">Pesimista: {data.pessimistic} u</p>
          <p className="text-green-400">Optimista: {data.optimistic} u</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="border-b border-[#374151] pb-4">
        <h1 className="text-3xl font-bold text-white">Análisis de Elasticidad Precio-Demanda</h1>
        <p className="text-[#9ca3af] mt-1">Variables de sensibilidad CyberDay 2026</p>
      </div>

      {/* Base Scenario Card */}
      <div className={cn(
        'bg-[#111827] rounded-xl border border-[#1e293b] p-5',
        'flex items-center justify-between'
      )}>
        <div>
          <p className="text-[#9ca3af] text-sm font-medium">Escenario Base 2026</p>
          <p className="text-3xl font-bold text-white mt-2">{baselineUnits.toLocaleString()} unidades</p>
          <p className="text-[#6b7280] text-xs mt-1">Baseline de proyección</p>
        </div>
        <div className="text-5xl opacity-10">📊</div>
      </div>

      {/* Sensitivity Table */}
      <div className={cn(
        'bg-[#111827] rounded-xl border border-[#1e293b] p-5',
        'overflow-x-auto'
      )}>
        <h2 className="text-xl font-semibold text-white mb-4">Tabla de Sensibilidad</h2>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#374151]">
              <th className="text-left py-3 px-4 text-[#9ca3af] font-semibold">Variable</th>
              <th className="text-center py-3 px-4 text-[#9ca3af] font-semibold">Pesimista</th>
              <th className="text-center py-3 px-4 text-[#9ca3af] font-semibold">Δ Unidades</th>
              <th className="text-center py-3 px-4 text-[#9ca3af] font-semibold">Optimista</th>
              <th className="text-center py-3 px-4 text-[#9ca3af] font-semibold">Δ Unidades</th>
              <th className="text-center py-3 px-4 text-[#9ca3af] font-semibold">Estado</th>
            </tr>
          </thead>
          <tbody>
            {elasticity.map((item, idx) => (
              <tr
                key={idx}
                className={cn(
                  'border-b border-[#1e293b]',
                  idx % 2 === 0 ? 'bg-[#0f172a]' : 'bg-[#111827]'
                )}
              >
                <td className="py-4 px-4 text-white font-medium">{item.variable}</td>
                <td className="py-4 px-4 text-center text-[#9ca3af]">{item.pessimistic}</td>
                <td className={cn(
                  'py-4 px-4 text-center font-semibold',
                  item.pessDelta < 0 ? 'text-red-400' : 'text-[#9ca3af]'
                )}>
                  {item.pessDelta < 0 ? '' : '+'}{item.pessDelta}
                </td>
                <td className="py-4 px-4 text-center text-[#9ca3af]">{item.optimistic}</td>
                <td className={cn(
                  'py-4 px-4 text-center font-semibold',
                  item.optDelta > 0 ? 'text-green-400' : item.optDelta < 0 ? 'text-amber-400' : 'text-[#9ca3af]'
                )}>
                  {item.optDelta > 0 ? '+' : ''}{item.optDelta}
                </td>
                <td className="py-4 px-4 text-center">
                  {item.applied ? (
                    <span className="inline-flex items-center gap-1 bg-green-500/20 text-green-400 px-2 py-1 rounded text-xs font-semibold">
                      ✓ Aplicado
                    </span>
                  ) : (
                    <span className="text-[#6b7280] text-xs">—</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Tornado/Waterfall Chart */}
      <div className={cn(
        'bg-[#111827] rounded-xl border border-[#1e293b] p-5'
      )}>
        <h2 className="text-xl font-semibold text-white mb-4">Diagrama de Tornado - Impacto por Variable</h2>
        <ResponsiveContainer width="100%" height={320}>
          <BarChart
            data={tornadoData}
            layout="vertical"
            margin={{ top: 5, right: 30, left: 250, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis type="number" stroke="#9ca3af" />
            <YAxis dataKey="variable" type="category" width={245} stroke="#9ca3af" tick={{ fontSize: 12 }} />
            <Tooltip content={<TornadoTooltip />} />
            <Bar dataKey="pessimistic" stackId="a" fill="#ef4444" radius={[0, 4, 4, 0]} />
            <Bar dataKey="optimistic" stackId="a" fill="#10b981" radius={[4, 0, 0, 4]} />
          </BarChart>
        </ResponsiveContainer>
        <div className="flex gap-6 mt-4 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-red-500"></div>
            <span className="text-[#9ca3af]">Impacto Pesimista</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-green-500"></div>
            <span className="text-[#9ca3af]">Impacto Optimista</span>
          </div>
        </div>
      </div>

      {/* Scenario Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Pessimistic */}
        <div className={cn(
          'bg-[#111827] rounded-xl border border-[#1e293b] p-5',
          'border-l-4 border-l-red-500'
        )}>
          <p className="text-[#9ca3af] text-sm font-medium">Escenario Pesimista</p>
          <p className="text-3xl font-bold text-red-400 mt-2">{pessimisticTotal.toLocaleString()}</p>
          <p className="text-[#6b7280] text-xs mt-1">
            {pessimisticTotal < baselineUnits ? '-' : '+'}{Math.abs(pessimisticTotal - baselineUnits).toLocaleString()} vs base
          </p>
          <div className="mt-3 flex items-center gap-2">
            <div className="flex-1 h-2 bg-[#374151] rounded overflow-hidden">
              <div
                className="h-full bg-red-500"
                style={{ width: '33%' }}
              ></div>
            </div>
          </div>
        </div>

        {/* Base */}
        <div className={cn(
          'bg-[#111827] rounded-xl border border-[#1e293b] p-5',
          'border-l-4 border-l-blue-500'
        )}>
          <p className="text-[#9ca3af] text-sm font-medium">Escenario Base</p>
          <p className="text-3xl font-bold text-blue-400 mt-2">{baselineUnits.toLocaleString()}</p>
          <p className="text-[#6b7280] text-xs mt-1">Baseline proyectado</p>
          <div className="mt-3 flex items-center gap-2">
            <div className="flex-1 h-2 bg-[#374151] rounded overflow-hidden">
              <div
                className="h-full bg-blue-500"
                style={{ width: '50%' }}
              ></div>
            </div>
          </div>
        </div>

        {/* Optimistic */}
        <div className={cn(
          'bg-[#111827] rounded-xl border border-[#1e293b] p-5',
          'border-l-4 border-l-green-500'
        )}>
          <p className="text-[#9ca3af] text-sm font-medium">Escenario Optimista</p>
          <p className="text-3xl font-bold text-green-400 mt-2">{optimisticTotal.toLocaleString()}</p>
          <p className="text-[#6b7280] text-xs mt-1">
            +{(optimisticTotal - baselineUnits).toLocaleString()} vs base
          </p>
          <div className="mt-3 flex items-center gap-2">
            <div className="flex-1 h-2 bg-[#374151] rounded overflow-hidden">
              <div
                className="h-full bg-green-500"
                style={{ width: '67%' }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* Key Insight */}
      <div className={cn(
        'bg-gradient-to-r from-[#0f172a] to-[#111827] rounded-xl border border-[#374151] p-5'
      )}>
        <p className="text-[#9ca3af] text-sm font-medium mb-2">INSIGHT CLAVE</p>
        <p className="text-white leading-relaxed">
          <span className="font-semibold text-amber-400">CVR Mobile</span> tiene el mayor impacto potencial (±336 unidades).
          <span className="font-semibold text-amber-400 ml-1">MacBook Neo adopción</span> es la segunda variable más sensible.
        </p>
      </div>
    </div>
  );
};

export default Elasticidad;
