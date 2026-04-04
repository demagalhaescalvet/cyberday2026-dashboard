import { Treemap, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { categories, units2026, rev2026, colors, icons, featured, totalUnits, totalRev } from '../data/dashboard';
import { formatCLP } from '../lib/utils';

export default function MixIdeal() {
  const tU = totalUnits(units2026);
  const tR = totalRev(rev2026);
  const avgTicket = Math.round(tR / tU * 1e6 / 1e3);

  // Apple group (indices 0-10) and 3rd Party (indices 11-16)
  const appleData = categories.slice(0, 11).map((cat, idx) => ({
    category: cat,
    icon: icons[idx],
    units: units2026[idx],
    revenue: rev2026[idx],
    color: colors[idx],
    pct: (rev2026[idx] / tR * 100),
  }));

  const thirdPartyData = categories.slice(11).map((cat, idx) => ({
    category: cat,
    icon: icons[idx + 11],
    units: units2026[idx + 11],
    revenue: rev2026[idx + 11],
    color: colors[idx + 11],
    pct: (rev2026[idx + 11] / tR * 100),
  }));

  const appleSubtotal = { units: appleData.reduce((a, b) => a + b.units, 0), revenue: appleData.reduce((a, b) => a + b.revenue, 0) };
  const tpSubtotal = { units: thirdPartyData.reduce((a, b) => a + b.units, 0), revenue: thirdPartyData.reduce((a, b) => a + b.revenue, 0) };

  // iPhone mix detail (indices 0-4)
  const iphoneData = categories.slice(0, 5).map((cat, idx) => ({
    name: cat.replace('iPhone ', ''),
    units: units2026[idx],
    revenue: rev2026[idx],
  }));

  // Treemap data for revenue distribution
  const treemapData = categories.map((cat, idx) => ({
    name: cat,
    value: rev2026[idx],
    fill: colors[idx],
  }));

  return (
    <div className="flex-1 bg-[#0d1117] overflow-auto">
      <div className="p-6 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-white mb-1">Mix Ideal — Target CyberDay 2026</h1>
          <p className="text-sm text-muted-foreground">Plan de unidades y revenue por categoría</p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-[#111827] rounded-xl border border-[#1e293b] p-5">
            <div className="text-xs uppercase tracking-widest text-muted-foreground mb-2">Total Units</div>
            <div className="text-2xl font-bold text-cyan">{tU.toLocaleString()}u</div>
          </div>
          <div className="bg-[#111827] rounded-xl border border-[#1e293b] p-5">
            <div className="text-xs uppercase tracking-widest text-muted-foreground mb-2">Total Revenue</div>
            <div className="text-2xl font-bold text-green">${tR.toLocaleString()}M</div>
          </div>
          <div className="bg-[#111827] rounded-xl border border-[#1e293b] p-5">
            <div className="text-xs uppercase tracking-widest text-muted-foreground mb-2">Ticket Promedio</div>
            <div className="text-2xl font-bold text-amber">${avgTicket}K</div>
          </div>
        </div>

        {/* Category Table */}
        <div className="space-y-4">
          {/* Apple Group */}
          <div className="bg-[#111827] rounded-xl border border-[#1e293b] overflow-hidden">
            <div className="px-5 py-3 border-b border-[#1e293b] bg-[#0f172a]">
              <h2 className="font-semibold text-white">Apple</h2>
            </div>
            <table className="w-full text-sm">
              <thead className="bg-[#0f172a] border-b border-[#1e293b]">
                <tr>
                  <th className="text-left px-5 py-3 text-muted-foreground font-medium">Categoría</th>
                  <th className="text-right px-5 py-3 text-muted-foreground font-medium">Units 2026</th>
                  <th className="text-right px-5 py-3 text-muted-foreground font-medium">Revenue 2026</th>
                  <th className="text-right px-5 py-3 text-muted-foreground font-medium">% Mix</th>
                  <th className="text-left px-5 py-3 text-muted-foreground font-medium">Distribution</th>
                </tr>
              </thead>
              <tbody>
                {appleData.map((item, idx) => (
                  <tr key={idx} className="border-b border-[#1e293b] hover:bg-[#1a2332] transition-colors">
                    <td className="px-5 py-3 text-white">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{item.icon}</span>
                        <span>{item.category}</span>
                      </div>
                    </td>
                    <td className="text-right px-5 py-3 text-cyan">{item.units.toLocaleString()}</td>
                    <td className="text-right px-5 py-3 text-green">${item.revenue.toLocaleString()}M</td>
                    <td className="text-right px-5 py-3 text-amber font-medium">{item.pct.toFixed(1)}%</td>
                    <td className="px-5 py-3">
                      <div className="w-32 bg-[#0f172a] rounded-full h-1.5 overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all"
                          style={{
                            width: `${item.pct * 3}%`,
                            backgroundColor: item.color,
                          }}
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="px-5 py-3 bg-[#0f172a] border-t border-[#1e293b] flex justify-between text-sm font-semibold text-muted-foreground">
              <span>Subtotal Apple</span>
              <span>{appleSubtotal.units.toLocaleString()}u</span>
              <span>${appleSubtotal.revenue.toLocaleString()}M</span>
            </div>
          </div>

          {/* 3rd Party Group */}
          <div className="bg-[#111827] rounded-xl border border-[#1e293b] overflow-hidden">
            <div className="px-5 py-3 border-b border-[#1e293b] bg-[#0f172a]">
              <h2 className="font-semibold text-white">3rd Party</h2>
            </div>
            <table className="w-full text-sm">
              <thead className="bg-[#0f172a] border-b border-[#1e293b]">
                <tr>
                  <th className="text-left px-5 py-3 text-muted-foreground font-medium">Categoría</th>
                  <th className="text-right px-5 py-3 text-muted-foreground font-medium">Units 2026</th>
                  <th className="text-right px-5 py-3 text-muted-foreground font-medium">Revenue 2026</th>
                  <th className="text-right px-5 py-3 text-muted-foreground font-medium">% Mix</th>
                  <th className="text-left px-5 py-3 text-muted-foreground font-medium">Distribution</th>
                </tr>
              </thead>
              <tbody>
                {thirdPartyData.map((item, idx) => (
                  <tr key={idx} className="border-b border-[#1e293b] hover:bg-[#1a2332] transition-colors">
                    <td className="px-5 py-3 text-white">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{item.icon}</span>
                        <span>{item.category}</span>
                      </div>
                    </td>
                    <td className="text-right px-5 py-3 text-cyan">{item.units.toLocaleString()}</td>
                    <td className="text-right px-5 py-3 text-green">${item.revenue.toLocaleString()}M</td>
                    <td className="text-right px-5 py-3 text-amber font-medium">{item.pct.toFixed(1)}%</td>
                    <td className="px-5 py-3">
                      <div className="w-32 bg-[#0f172a] rounded-full h-1.5 overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all"
                          style={{
                            width: `${item.pct * 3}%`,
                            backgroundColor: item.color,
                          }}
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="px-5 py-3 bg-[#0f172a] border-t border-[#1e293b] flex justify-between text-sm font-semibold text-muted-foreground">
              <span>Subtotal 3rd Party</span>
              <span>{tpSubtotal.units.toLocaleString()}u</span>
              <span>${tpSubtotal.revenue.toLocaleString()}M</span>
            </div>
          </div>
        </div>

        {/* Revenue Distribution Treemap */}
        <div className="bg-[#111827] rounded-xl border border-[#1e293b] p-5">
          <h3 className="font-semibold text-white mb-4">Revenue Distribution by Category</h3>
          <ResponsiveContainer width="100%" height={300}>
            <Treemap
              data={treemapData}
              dataKey="value"
              fill="#8884d8"
              stroke="#333"
              strokeWidth={2}
            >
              <Tooltip
                contentStyle={{
                  backgroundColor: '#111827',
                  border: '1px solid #1e293b',
                  borderRadius: '8px',
                }}
                formatter={(value) => `$${value.toLocaleString()}M`}
              />
            </Treemap>
          </ResponsiveContainer>
        </div>

        {/* iPhone Mix Detail */}
        <div className="bg-[#111827] rounded-xl border border-[#1e293b] p-5">
          <h3 className="font-semibold text-white mb-4">iPhone Mix Detail</h3>
          <div className="space-y-4">
            {iphoneData.map((item, idx) => {
              const ticket = Math.round(item.revenue / item.units * 1e6 / 1e3);
              return (
                <div key={idx} className="border-b border-[#1e293b] pb-4 last:border-0">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{icons[idx]}</span>
                      <span className="text-sm font-medium text-white">{item.name}</span>
                    </div>
                    <div className="flex gap-6 text-sm">
                      <div>
                        <div className="text-muted-foreground text-xs">Units</div>
                        <div className="text-cyan font-semibold">{item.units.toLocaleString()}</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground text-xs">Revenue</div>
                        <div className="text-green font-semibold">${item.revenue.toLocaleString()}M</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground text-xs">Ticket</div>
                        <div className="text-amber font-semibold">${ticket}K</div>
                      </div>
                    </div>
                  </div>
                  <div className="bg-[#0f172a] rounded-full h-2 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${(item.units / Math.max(...iphoneData.map(d => d.units))) * 100}%`,
                        backgroundColor: colors[idx],
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
          <div className="mt-6 grid grid-cols-5 gap-2">
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={iphoneData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="name" stroke="#64748b" style={{ fontSize: '12px' }} />
                <YAxis stroke="#64748b" style={{ fontSize: '12px' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#111827',
                    border: '1px solid #1e293b',
                    borderRadius: '8px',
                  }}
                />
                <Bar dataKey="units" fill="#06b6d4" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
