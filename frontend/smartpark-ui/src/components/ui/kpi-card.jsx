import * as React from 'react'
import { TrendingUp, TrendingDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

const colorMap = {
  blue:   { bg: '#DBEAFE', color: '#1D4ED8' },
  green:  { bg: '#D1FAE5', color: '#059669' },
  orange: { bg: '#FEF3C7', color: '#D97706' },
  purple: { bg: '#EDE9FE', color: '#7C3AED' },
  teal:   { bg: '#DBEAFE', color: '#2563EB' },
  red:    { bg: '#FEE2E2', color: '#DC2626' },
}

export function KpiCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  trendLabel,
  color = 'blue',
  loading = false,
  className,
}) {
  const colorStyle = colorMap[color] || colorMap.blue

  if (loading) {
    return (
      <Card className={cn('rounded-xl p-6 hover:shadow-md transition-shadow duration-200', className)}>
        <CardContent className="p-0">
          <div className="flex items-start justify-between">
            <div className="flex-1 space-y-3">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-8 w-32" />
              <Skeleton className="h-3 w-40" />
              <Skeleton className="h-5 w-20" />
            </div>
            <Skeleton className="h-12 w-12 rounded-lg" />
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={cn('rounded-xl p-6 hover:shadow-md transition-shadow duration-200', className)}>
      <CardContent className="p-0">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-muted-foreground truncate">{title}</p>
            <p className="mt-1 text-3xl font-bold tracking-tight">{value}</p>
            {subtitle && (
              <p className="mt-1 text-sm text-muted-foreground truncate">{subtitle}</p>
            )}
            {trend !== undefined && (
              <div className="mt-2 flex items-center gap-1">
                {trend > 0 ? (
                  <>
                    <TrendingUp className="h-4 w-4 text-green-500" />
                    <span className="text-xs font-medium text-green-600 dark:text-green-400">
                      +{trend}%{trendLabel ? ` ${trendLabel}` : ''}
                    </span>
                  </>
                ) : trend < 0 ? (
                  <>
                    <TrendingDown className="h-4 w-4 text-red-500" />
                    <span className="text-xs font-medium text-red-600 dark:text-red-400">
                      {trend}%{trendLabel ? ` ${trendLabel}` : ''}
                    </span>
                  </>
                ) : (
                  <span className="text-xs font-medium text-muted-foreground">
                    0%{trendLabel ? ` ${trendLabel}` : ''}
                  </span>
                )}
              </div>
            )}
          </div>
          {Icon && (
            <div
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg"
              style={{ background: colorStyle.bg }}
            >
              <Icon className="h-6 w-6" style={{ color: colorStyle.color }} />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
