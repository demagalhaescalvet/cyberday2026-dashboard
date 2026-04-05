'use client'

import { AlertTriangle, TrendingUp, TrendingDown, Lightbulb, Target, Zap } from 'lucide-react'

type InsightVariant = 'opportunity' | 'warning' | 'win' | 'insight' | 'action'

interface InsightBannerProps {
  variant: InsightVariant
  headline: string
  detail?: string
  metric?: string
  metricLabel?: string
}

const variantConfig: Record<InsightVariant, { icon: typeof TrendingUp; bg: string; border: string; iconColor: string; metricColor: string }> = {
  opportunity: { icon: Lightbulb, bg: 'bg-amber-500/5', border: 'border-amber-500/20', iconColor: 'text-amber-400', metricColor: 'text-amber-400' },
  warning:     { icon: AlertTriangle, bg: 'bg-red-500/5', border: 'border-red-500/20', iconColor: 'text-red-400', metricColor: 'text-red-400' },
  win:         { icon: TrendingUp, bg: 'bg-emerald-500/5', border: 'border-emerald-500/20', iconColor: 'text-emerald-400', metricColor: 'text-emerald-400' },
  insight:     { icon: Target, bg: 'bg-blue-500/5', border: 'border-blue-500/20', iconColor: 'text-blue-400', metricColor: 'text-blue-400' },
  action:      { icon: Zap, bg: 'bg-violet-500/5', border: 'border-violet-500/20', iconColor: 'text-violet-400', metricColor: 'text-violet-400' },
}

export function InsightBanner({ variant, headline, detail, metric, metricLabel }: InsightBannerProps) {
  const config = variantConfig[variant]
  const Icon = config.icon

  return (
    <div className={`flex items-center gap-3 rounded-lg border px-4 py-3 ${config.bg} ${config.border}`}>
      <Icon className={`h-5 w-5 shrink-0 ${config.iconColor}`} />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium leading-snug">{headline}</p>
        {detail && <p className="text-xs text-muted-foreground mt-0.5">{detail}</p>}
      </div>
      {metric && (
        <div className="text-right shrink-0">
          <div className={`text-lg font-bold ${config.metricColor}`}>{metric}</div>
          {metricLabel && <p className="text-[10px] text-muted-foreground">{metricLabel}</p>}
        </div>
      )}
    </div>
  )
}
