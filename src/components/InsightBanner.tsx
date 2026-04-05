'use client'

import { AlertTriangle, TrendingUp, TrendingDown, Lightbulb, Target, Zap, ChevronRight } from 'lucide-react'

type InsightVariant = 'opportunity' | 'warning' | 'win' | 'insight' | 'action'

interface InsightBannerProps {
  variant: InsightVariant
  headline: string
  detail?: string
  metric?: string
  metricLabel?: string
  ctaLabel?: string
  ctaTarget?: string
}

const variantConfig: Record<InsightVariant, { icon: typeof TrendingUp; bg: string; border: string; iconColor: string; metricColor: string }> = {
  opportunity: { icon: Lightbulb, bg: 'bg-amber-500/8', border: 'border-amber-500/25', iconColor: 'text-amber-400', metricColor: 'text-amber-400' },
  warning:     { icon: AlertTriangle, bg: 'bg-red-500/8', border: 'border-red-500/25', iconColor: 'text-red-400', metricColor: 'text-red-400' },
  win:         { icon: TrendingUp, bg: 'bg-emerald-500/8', border: 'border-emerald-500/25', iconColor: 'text-emerald-400', metricColor: 'text-emerald-400' },
  insight:     { icon: Target, bg: 'bg-blue-500/8', border: 'border-blue-500/25', iconColor: 'text-blue-400', metricColor: 'text-blue-400' },
  action:      { icon: Zap, bg: 'bg-violet-500/8', border: 'border-violet-500/25', iconColor: 'text-violet-400', metricColor: 'text-violet-400' },
}

export function InsightBanner({ variant, headline, detail, metric, metricLabel, ctaLabel, ctaTarget }: InsightBannerProps) {
  const config = variantConfig[variant]
  const Icon = config.icon

  const handleCta = () => {
    if (!ctaTarget) return
    const el = document.getElementById(ctaTarget)
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <div className={`flex items-center gap-3 rounded-lg border px-4 py-3 ${config.bg} ${config.border}`}>
      <Icon className={`h-5 w-5 shrink-0 ${config.iconColor}`} />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium leading-snug">{headline}</p>
        {detail && <p className="text-xs text-muted-foreground mt-0.5">{detail}</p>}
        {ctaLabel && ctaTarget && (
          <button
            onClick={handleCta}
            className={`inline-flex items-center gap-0.5 text-xs font-medium mt-1 hover:underline ${config.iconColor}`}
          >
            {ctaLabel} <ChevronRight className="h-3 w-3" />
          </button>
        )}
      </div>
      {metric && (
        <div className="text-right shrink-0">
          <div className={`text-lg font-bold ${config.metricColor}`}>{metric}</div>
          {metricLabel && <p className="text-[11px] text-muted-foreground">{metricLabel}</p>}
        </div>
      )}
    </div>
  )
}
