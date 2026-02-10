'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'

export interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'warning' | 'destructive' | 'success'
}

const variantStyles: Record<NonNullable<AlertProps['variant']>, string> = {
  default: 'bg-muted/40 border border-border text-foreground',
  warning: 'bg-amber-50 border border-amber-200 text-amber-900',
  destructive: 'bg-red-50 border border-red-200 text-red-900',
  success: 'bg-green-50 border border-green-200 text-green-900'
}

const Alert = React.forwardRef<HTMLDivElement, AlertProps>(
  ({ className, variant = 'default', ...props }, ref) => (
    <div
      ref={ref}
      role="alert"
      className={cn(
        'relative w-full rounded-lg px-4 py-3 text-sm',
        variantStyles[variant],
        className
      )}
      {...props}
    />
  )
)
Alert.displayName = 'Alert'

export interface AlertDescriptionProps extends React.HTMLAttributes<HTMLDivElement> {}

const AlertDescription = React.forwardRef<HTMLDivElement, AlertDescriptionProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('text-sm leading-relaxed', className)}
      {...props}
    />
  )
)
AlertDescription.displayName = 'AlertDescription'

export { Alert, AlertDescription }
