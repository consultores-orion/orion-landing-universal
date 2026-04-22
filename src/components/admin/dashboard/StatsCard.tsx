'use client'

import type { ElementType } from 'react'
import { TrendingUp, TrendingDown, Minus, Users, Puzzle, Languages, Clock } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'

// Icon name → component mapping (resolved client-side to avoid
// passing React components across the Server → Client boundary)
const iconMap: Record<string, ElementType> = {
  users: Users,
  puzzle: Puzzle,
  languages: Languages,
  clock: Clock,
}

interface StatsCardProps {
  title: string
  value: string | number
  subtitle: string
  icon: string
  trend?: 'up' | 'down' | 'neutral'
  trendValue?: string
}

export function StatsCard({ title, value, subtitle, icon, trend, trendValue }: StatsCardProps) {
  const Icon = iconMap[icon] ?? Minus
  const TrendIcon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : Minus

  const trendColor =
    trend === 'up'
      ? 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950 dark:text-emerald-400'
      : trend === 'down'
        ? 'text-red-600 bg-red-50 dark:bg-red-950 dark:text-red-400'
        : 'text-muted-foreground bg-muted'

  return (
    <Card className="relative overflow-hidden">
      <CardContent className="pt-4">
        {/* Icon circle — top-right */}
        <div className="bg-primary/10 text-primary absolute top-4 right-4 flex h-10 w-10 items-center justify-center rounded-full">
          <Icon className="h-5 w-5" aria-hidden="true" />
        </div>

        {/* Value */}
        <p className="text-muted-foreground text-sm font-medium">{title}</p>
        <p className="text-foreground mt-1 text-3xl font-bold tracking-tight">{value}</p>

        {/* Subtitle + trend */}
        <div className="mt-2 flex items-center gap-2">
          <p className="text-muted-foreground text-sm">{subtitle}</p>
          {trend && trendValue && (
            <span
              className={cn(
                'inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-xs font-medium',
                trendColor,
              )}
            >
              <TrendIcon className="h-3 w-3" aria-hidden="true" />
              {trendValue}
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
