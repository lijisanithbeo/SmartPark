import * as React from 'react'
import { cn } from '@/lib/utils'

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}) {
  return (
    <div className={cn('flex flex-col items-center justify-center py-12 text-center', className)}>
      {Icon && (
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
          <Icon className="h-8 w-8 text-muted-foreground" />
        </div>
      )}
      {title && (
        <h3 className="mb-1 text-lg font-semibold">{title}</h3>
      )}
      {description && (
        <p className="mb-4 max-w-sm text-sm text-muted-foreground">{description}</p>
      )}
      {action && (
        <div className="mt-2">{action}</div>
      )}
    </div>
  )
}
