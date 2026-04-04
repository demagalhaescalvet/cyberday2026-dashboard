import { cn } from '../lib/utils';
import { categories, units2024, units2025, units2026, rev2024, rev2025, rev2026, totalUnits, totalRev } from '../data/dashboard';

export default function Sidebar({ tabs, activeTab, onTabChange }) {
  const tU = totalUnits(units2026);
  const tR = totalRev(rev2026);
  const appleR = rev2026.slice(0,11).reduce((a,b)=>a+b,0);
  const tpR = rev2026.slice(11).reduce((a,b)=>a+b,0);
  const avgTicket = Math.round(tR / tU * 1e6 / 1e3);

  return (
    <aside className="w-52 min-w-52 bg-[#0d1117] border-r border-border flex flex-col h-screen">
      {/* Logo */}
      <div className="p-4 pb-2 flex items-center gap-2">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue to-purple flex items-center justify-center text-white text-xs font-bold">MO</div>
        <div>
          <div className="text-sm font-semibold text-foreground">MacOnline</div>
          <div className="text-[10px] text-muted-foreground uppercase tracking-wider">Cyber Day 2026</div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-2 py-3 space-y-0.5">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={cn(
              'w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-left transition-all text-sm',
              activeTab === tab.id
                ? 'bg-[#1e293b] text-white'
                : 'text-muted-foreground hover:text-foreground hover:bg-[#1e293b]/50'
            )}
          >
            <span className="text-base">{tab.icon}</span>
            <div className="min-w-0">
              <div className="font-medium truncate">{tab.label}</div>
              <div className="text-[10px] text-muted-foreground">{tab.sublabel}</div>
            </div>
          </button>
        ))}
      </nav>

      {/* Footer stats */}
      <div className="p-3 border-t border-border">
        <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Revenue Target</div>
        <div className="text-xl font-bold text-green">${tR.toLocaleString()}M</div>
        <div className="flex gap-1.5 mt-1.5 flex-wrap">
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#1e293b] text-cyan">{tU.toLocaleString()}u</span>
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#1e293b] text-amber">${avgTicket}K avg</span>
        </div>
        <div className="flex gap-1.5 mt-1 flex-wrap">
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#1e293b] text-green">${appleR.toLocaleString()}M</span>
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#1e293b] text-pink">3P ${tpR}M</span>
        </div>
        <div className="text-[9px] text-muted-foreground mt-1.5">Valores netos (sin IVA) · 157K txns · Abr 2026</div>
      </div>
    </aside>
  );
}
