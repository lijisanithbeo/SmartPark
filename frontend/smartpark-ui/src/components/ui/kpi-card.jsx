import * as React from 'react'
import { TrendingUp, TrendingDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

const colorMap = {
  blue: 'bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400',
  green: 'bg-green-50 text-green-600 dark:bg-green-950 dark:text-green-400',
  orange: 'bg-orange-50 text-orange-600 dark:bg-orange-950 dark:text-orange-400',
  red: 'bg-red-50 text-red-600 dark:bg-red-950 dark:text-red-400',
  purple: 'bg-purple-50 text-purple-600 dark:bg-purple-950 dark:text-purple-400',
  teal: 'bg-teal-50 text-teal-600 dark:bg-teal-950 dark:text-teal-400',
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
  const colorClasses = colorMap[color] || colorMap.blue

  if (loading) {
    return (
      <Card className={cn('glass-card rounded-xl p-6 hover:shadow-fluent-md transition-shadow duration-200', className)}>
        <CardContent className="p-0">
          <div className="flex items-start justify-between">
            <div className="flex-1 space-y-3">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-8 w-32" />
              <Skeleton className="h-3 w-40" />
              <Skeleton className="h-5 w-20" />
            </div>
            <Skeleton className="h-12 w-12 rounded-full" />
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={cn('glass-card rounded-xl p-6 hover:shadow-fluent-md transition-shadow duration-200', className)}>
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
            <div className={cn('flex h-12 w-12 shrink-0 items-center justify-center rounded-full', colorClasses)}>
              <Icon className="h-6 w-6" />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
