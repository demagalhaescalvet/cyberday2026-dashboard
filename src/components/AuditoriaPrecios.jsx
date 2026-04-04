import { useState, useMemo } from 'react';
import { pricing, marketComparison } from '../data/dashboard';
import { formatPrice, cn } from '../lib/utils';

// Category mapping by SKU prefix
const getCategoryFromSku = (sku) => {
  if (/^AP4|^APMax|^APPro/.test(sku)) return 'Audio Apple';
  if (/^iPh|^iPM|^iPhAir/.test(sku)) return 'iPhone';
  if (/^MBA|^MBP|^MBNeo/.test(sku)) return 'Mac Notebook';
  if (/^Mmini|^MStudio|^MPro|^iMac/.test(sku)) return 'Mac Desktop';
  if (/^iPad/.test(sku)) return 'iPad';
  if (/^AW|^AWS/.test(sku)) return 'Apple Watch';
  if (/^HP|^HPmini|^HP2/.test(sku)) return 'HomePod';
  if (/^BLK|^BOSE|^MRS|^SON|^SC/.test(sku)) return 'Audio 3P';
  if (/^DEC|^F-|^Fundas|^BT-|^Beats|^EarPods/.test(sku)) return 'Fundas 3P';
  if (/^Cable|^Carg|^GMO|^HYP|^Hubs|^LVL|^XT|^ZG|^ZN/.test(sku)) return 'Carga & Acc 3P';
  if (/^SD|^NBL|^NU|^STL/.test(sku)) return 'Almacenamiento 3P';
  if (/^MK|^MKB|^MKF|^MMouse|^MTrack|^Mochilas|^OTR|^OtrosAcc|^Protectores/.test(sku)) return 'Otros 3P';
  if (/^Band|^AirTag|^ATV|^MS-365|^DST/.test(sku)) return 'Accesorios Apple';
  return 'Otros';
};

// Product mapping from market comparison
const getMarketComparison = (sku) => {
  const skuLower = sku.toLowerCase();
  return marketComparison.find(m =>
    skuLower.includes(m.product.toLowerCase()) ||
    m.product.toLowerCase().includes(skuLower.split('-')[0])
  );
};

export default function AuditoriaPrecios() {
  const [activeSubView, setActiveSubView] = useState('tabla');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: 'sku', direction: 'asc' });
  const [simulatedPrices, setSimulatedPrices] = useState({});

  // Transform pricing data
  const skuList = useMemo(() => {
    return Object.entries(pricing).map(([sku, data]) => {
      const category = getCategoryFromSku(sku);
      const marketData = getMarketComparison(sku);
      const cyberPrice = simulatedPrices[sku] ?? data.cyberPrice;
      const dcto = ((data.pvp - cyberPrice) / data.pvp) * 100;
      const isAboveMarket = marketData && cyberPrice > marketData.marketLow;

      return {
        sku,
        category,
        realSku: data.realSku,
        pvp: data.pvp,
        cyberPrice,
        dctoOriginal: data.dcto * 100,
        dcto: dcto,
        marketLow: marketData?.marketLow,
        marketStore: marketData?.marketStore,
        status: isAboveMarket ? 'warn' : (marketData?.status || 'ok'),
        isSimulated: sku in simulatedPrices,
      };
    });
  }, [simulatedPrices]);

  // Filter and sort
  const filteredSkus = useMemo(() => {
    let result = skuList;

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(s =>
        s.sku.toLowerCase().includes(term) ||
        s.category.toLowerCase().includes(term) ||
        s.realSku.toLowerCase().includes(term)
      );
    }

    if (selectedCategory) {
      result = result.filter(s => s.category === selectedCategory);
    }

    result.sort((a, b) => {
      const aVal = a[sortConfig.key];
      const bVal = b[sortConfig.key];
      const direction = sortConfig.direction === 'asc' ? 1 : -1;

      if (typeof aVal === 'string') {
        return direction * aVal.localeCompare(bVal);
      }
      return direction * (aVal - bVal);
    });

    return result;
  }, [skuList, searchTerm, selectedCategory, sortConfig]);

  // Calculate KPIs
  const kpis = useMemo(() => {
    const aboveMarket = skuList.filter(s => s.status === 'warn').length;
    const avgDcto = skuList.reduce((sum, s) => sum + s.dcto, 0) / skuList.length;
    return {
      total: skuList.length,
      avgDcto,
      alerts: aboveMarket,
    };
  }, [skuList]);

  // Category analysis
  const categoryAnalysis = useMemo(() => {
    const byCategory = {};
    skuList.forEach(s => {
      if (!byCategory[s.category]) {
        byCategory[s.category] = [];
      }
      byCategory[s.category].push(s);
    });

    return Object.entries(byCategory)
      .map(([cat, skus]) => ({
        category: cat,
        count: skus.length,
        avgDcto: (skus.reduce((sum, s) => sum + s.dcto, 0) / skus.length),
        minDcto: Math.min(...skus.map(s => s.dcto)),
        maxDcto: Math.max(...skus.map(s => s.dcto)),
      }))
      .sort((a, b) => b.avgDcto - a.avgDcto);
  }, [skuList]);

  // Alerts
  const alerts = useMemo(() => {
    const aboveMarket = skuList
      .filter(s => s.status === 'warn' && s.marketLow)
      .sort((a, b) => (b.cyberPrice - b.marketLow) - (a.cyberPrice - a.marketLow))
      .slice(0, 10);

    const topDiscounts = skuList
      .sort((a, b) => b.dcto - a.dcto)
      .slice(0, 10);

    const bottomDiscounts = skuList
      .sort((a, b) => a.dcto - b.dcto)
      .slice(0, 10);

    return { aboveMarket, topDiscounts, bottomDiscounts };
  }, [skuList]);

  const statusColor = (status) => {
    switch(status) {
      case 'ok': return 'bg-[#3dd68c]/20 text-[#3dd68c]';
      case 'warn': return 'bg-[#f0b840]/20 text-[#f0b840]';
      case 'match': return 'bg-[#4f8cf7]/20 text-[#4f8cf7]';
      default: return 'bg-gray-700/20 text-gray-400';
    }
  };

  const statusLabel = (status) => {
    return { ok: 'OK', warn: 'ALERTA', match: 'MATCH' }[status] || status;
  };

  return (
    <div className="space-y-5">
      {/* Sub-view Navigation */}
      <div className="flex gap-2 border-b border-[#1e293b] pb-3">
        {[
          { id: 'tabla', label: 'Tabla Completa' },
          { id: 'dcto', label: 'Análisis Dcto' },
          { id: 'alertas', label: 'Alertas' },
          { id: 'simulador', label: 'Simulador' },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveSubView(tab.id)}
            className={cn(
              'px-4 py-2 rounded-lg text-sm font-medium transition-all',
              activeSubView === tab.id
                ? 'bg-[#4f8cf7] text-white'
                : 'text-gray-400 hover:text-gray-300'
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Sub-view 1: Tabla Completa */}
      {activeSubView === 'tabla' && (
        <div className="space-y-5">
          {/* KPI Badges */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-[#111827] rounded-xl border border-[#1e293b] p-4">
              <div className="text-gray-400 text-sm mb-1">SKUs Total</div>
              <div className="text-2xl font-bold text-white">{kpis.total}</div>
            </div>
            <div className="bg-[#111827] rounded-xl border border-[#1e293b] p-4">
              <div className="text-gray-400 text-sm mb-1">Dcto Promedio</div>
              <div className="text-2xl font-bold text-[#3dd68c]">{kpis.avgDcto.toFixed(1)}%</div>
            </div>
            <div className="bg-[#111827] rounded-xl border border-[#1e293b] p-4">
              <div className="text-gray-400 text-sm mb-1">Alertas</div>
              <div className="text-2xl font-bold text-[#f0b840]">{kpis.alerts}</div>
            </div>
          </div>

          {/* Search & Filter */}
          <div className="flex gap-3">
            <input
              type="text"
              placeholder="Buscar SKU, categoría..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 bg-[#111827] border border-[#1e293b] rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-[#4f8cf7]"
            />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-[#111827] border border-[#1e293b] rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[#4f8cf7]"
            >
              <option value="">Todas las categorías</option>
              {categoryAnalysis.map(cat => (
                <option key={cat.category} value={cat.category}>
                  {cat.category}
                </option>
              ))}
            </select>
          </div>

          {/* Table */}
          <div className="bg-[#111827] rounded-xl border border-[#1e293b] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-[#0f172a] border-b border-[#1e293b]">
                  <tr>
                    {[
                      { key: 'sku', label: 'SKU ID' },
                      { key: 'category', label: 'Categoría' },
                      { key: 'pvp', label: 'PVP' },
                      { key: 'cyberPrice', label: 'Cyber Price' },
                      { key: 'dcto', label: 'Dcto %' },
                      { key: 'marketLow', label: 'Market Low' },
                      { key: 'status', label: 'Estado' },
                    ].map(col => (
                      <th
                        key={col.key}
                        onClick={() => setSortConfig({
                          key: col.key,
                          direction: sortConfig.key === col.key && sortConfig.direction === 'asc' ? 'desc' : 'asc'
                        })}
                        className="px-4 py-3 text-left text-gray-400 font-medium cursor-pointer hover:text-gray-300"
                      >
                        {col.label}
                        {sortConfig.key === col.key && (
                          <span className="ml-1">{sortConfig.direction === 'asc' ? '↑' : '↓'}</span>
                        )}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredSkus.map((sku, idx) => (
                    <tr key={sku.sku} className={idx % 2 === 0 ? 'bg-[#0f172a]/50' : ''}>
                      <td className="px-4 py-3 text-white font-mono text-xs">{sku.sku}</td>
                      <td className="px-4 py-3 text-gray-300">{sku.category}</td>
                      <td className="px-4 py-3 text-gray-400">{formatPrice(sku.pvp)}</td>
                      <td className="px-4 py-3 text-[#3dd68c]">{formatPrice(sku.cyberPrice)}</td>
                      <td className="px-4 py-3 text-white">{sku.dcto.toFixed(1)}%</td>
                      <td className="px-4 py-3 text-gray-400">
                        {sku.marketLow ? formatPrice(sku.marketLow) : '—'}
                      </td>
                      <td className="px-4 py-3">
                        <span className={cn('px-2 py-1 rounded text-xs font-medium', statusColor(sku.status))}>
                          {statusLabel(sku.status)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Sub-view 2: Análisis Dcto */}
      {activeSubView === 'dcto' && (
        <div className="grid grid-cols-2 gap-4">
          {categoryAnalysis.map(cat => (
            <div key={cat.category} className="bg-[#111827] rounded-xl border border-[#1e293b] p-5">
              <div className="font-semibold text-white mb-1">{cat.category}</div>
              <div className="text-sm text-gray-400 mb-3">{cat.count} SKUs</div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Promedio:</span>
                  <span className="text-lg font-bold text-[#3dd68c]">{cat.avgDcto.toFixed(1)}%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Rango:</span>
                  <span className="text-sm text-gray-300">
                    {cat.minDcto.toFixed(1)}% — {cat.maxDcto.toFixed(1)}%
                  </span>
                </div>
              </div>

              {/* Progress bar */}
              <div className="mt-4 bg-[#0f172a] rounded-full h-2 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-[#4f8cf7] to-[#3dd68c]"
                  style={{ width: `${Math.min(cat.avgDcto, 100)}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Sub-view 3: Alertas */}
      {activeSubView === 'alertas' && (
        <div className="space-y-6">
          {/* Above Market */}
          <div className="bg-[#111827] rounded-xl border border-[#1e293b] p-5">
            <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
              <span className="w-2 h-2 bg-[#f0b840] rounded-full" />
              Productos sobre Mercado
            </h3>
            <div className="space-y-3">
              {alerts.aboveMarket.length > 0 ? (
                alerts.aboveMarket.map(sku => (
                  <div key={sku.sku} className="bg-[#0f172a] rounded-lg p-3 border border-[#1e293b]">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-mono text-sm text-white">{sku.sku}</div>
                        <div className="text-xs text-gray-400 mt-1">{sku.category}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-[#f0b840] font-bold">
                          +{formatPrice(sku.cyberPrice - (sku.marketLow || 0))}
                        </div>
                        <div className="text-xs text-gray-400">vs mercado</div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-gray-400 text-sm py-4 text-center">Sin alertas</div>
              )}
            </div>
          </div>

          {/* Top Discounts */}
          <div className="bg-[#111827] rounded-xl border border-[#1e293b] p-5">
            <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
              <span className="w-2 h-2 bg-[#3dd68c] rounded-full" />
              Top 10: Mayor Descuento
            </h3>
            <div className="space-y-2">
              {alerts.topDiscounts.map((sku, idx) => (
                <div key={sku.sku} className="flex justify-between items-center p-2 bg-[#0f172a] rounded">
                  <div className="text-xs">
                    <div className="text-gray-300">{sku.sku}</div>
                  </div>
                  <div className="font-bold text-[#3dd68c]">{sku.dcto.toFixed(1)}%</div>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom Discounts */}
          <div className="bg-[#111827] rounded-xl border border-[#1e293b] p-5">
            <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
              <span className="w-2 h-2 bg-[#4f8cf7] rounded-full" />
              Top 10: Menor Descuento
            </h3>
            <div className="space-y-2">
              {alerts.bottomDiscounts.map((sku, idx) => (
                <div key={sku.sku} className="flex justify-between items-center p-2 bg-[#0f172a] rounded">
                  <div className="text-xs">
                    <div className="text-gray-300">{sku.sku}</div>
                  </div>
                  <div className="font-bold text-[#4f8cf7]">{sku.dcto.toFixed(1)}%</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Sub-view 4: Simulador */}
      {activeSubView === 'simulador' && (
        <div className="space-y-5">
          {/* Filter */}
          <div className="flex gap-3">
            <input
              type="text"
              placeholder="Buscar SKU..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 bg-[#111827] border border-[#1e293b] rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-[#4f8cf7]"
            />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-[#111827] border border-[#1e293b] rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[#4f8cf7]"
            >
              <option value="">Todas las categorías</option>
              {categoryAnalysis.map(cat => (
                <option key={cat.category} value={cat.category}>
                  {cat.category}
                </option>
              ))}
            </select>
          </div>

          {/* Editable Table */}
          <div className="bg-[#111827] rounded-xl border border-[#1e293b] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-[#0f172a] border-b border-[#1e293b]">
                  <tr>
                    <th className="px-4 py-3 text-left text-gray-400 font-medium">SKU</th>
                    <th className="px-4 py-3 text-right text-gray-400 font-medium">PVP</th>
                    <th className="px-4 py-3 text-right text-gray-400 font-medium">Cyber Price</th>
                    <th className="px-4 py-3 text-right text-gray-400 font-medium">Dcto %</th>
                    <th className="px-4 py-3 text-right text-gray-400 font-medium">Delta</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSkus.map((sku, idx) => {
                    const simPrice = simulatedPrices[sku.sku] ?? sku.cyberPrice;
                    const simDcto = ((sku.pvp - simPrice) / sku.pvp) * 100;
                    const delta = simPrice - (simulatedPrices[sku.sku] ? pricing[sku.sku].cyberPrice : sku.cyberPrice);

                    return (
                      <tr key={sku.sku} className={idx % 2 === 0 ? 'bg-[#0f172a]/50' : ''}>
                        <td className="px-4 py-3 text-white font-mono text-xs">{sku.sku}</td>
                        <td className="px-4 py-3 text-right text-gray-400">{formatPrice(sku.pvp)}</td>
                        <td className="px-4 py-3 text-right">
                          <input
                            type="number"
                            value={simPrice}
                            onChange={(e) => {
                              const newVal = parseInt(e.target.value) || 0;
                              if (newVal === pricing[sku.sku].cyberPrice) {
                                const updated = { ...simulatedPrices };
                                delete updated[sku.sku];
                                setSimulatedPrices(updated);
                              } else {
                                setSimulatedPrices({
                                  ...simulatedPrices,
                                  [sku.sku]: newVal,
                                });
                              }
                            }}
                            className="w-24 bg-[#0f172a] border border-[#1e293b] rounded px-2 py-1 text-white text-right focus:outline-none focus:border-[#4f8cf7]"
                          />
                        </td>
                        <td className="px-4 py-3 text-right text-[#3dd68c] font-medium">
                          {simDcto.toFixed(1)}%
                        </td>
                        <td className="px-4 py-3 text-right">
                          <span className={delta !== 0 ? 'text-[#f0b840] font-medium' : 'text-gray-400'}>
                            {delta !== 0 ? (delta > 0 ? '+' : '') + formatPrice(delta) : '—'}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Revenue Impact Summary */}
          {Object.keys(simulatedPrices).length > 0 && (
            <div className="bg-[#111827] rounded-xl border border-[#1e293b] p-5">
              <h3 className="text-white font-semibold mb-3">Resumen de Cambios</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-gray-400 text-sm mb-1">SKUs Modificados</div>
                  <div className="text-2xl font-bold text-white">
                    {Object.keys(simulatedPrices).length}
                  </div>
                </div>
                <div>
                  <div className="text-gray-400 text-sm mb-1">Impacto Total Estimado</div>
                  <div className="text-2xl font-bold text-[#3dd68c]">
                    {formatPrice(
                      Object.entries(simulatedPrices).reduce((sum, [sku, price]) => {
                        const original = pricing[sku]?.cyberPrice || 0;
                        return sum + (price - original);
                      }, 0)
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
