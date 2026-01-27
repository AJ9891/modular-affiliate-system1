'use client'

import React from 'react'
import { cn } from '@/lib/utils'

export interface PremiumTypographyProps {
  variant?: 'h1' | 'h2' | 'h3' | 'h4' | 'body' | 'caption' | 'gradient'
  className?: string
  children: React.ReactNode
  as?: keyof JSX.IntrinsicElements
}

const typographyVariants = {
  h1: 'heading-premium text-5xl md:text-7xl font-extrabold text-white leading-tight',
  h2: 'heading-premium text-4xl md:text-5xl font-bold text-white leading-tight',
  h3: 'heading-premium text-3xl md:text-4xl font-bold text-white leading-tight', 
  h4: 'heading-premium text-2xl md:text-3xl font-semibold text-white leading-tight',
  body: 'body-premium text-base md:text-lg text-slate-300 leading-relaxed',
  caption: 'text-sm text-slate-400 leading-relaxed',
  gradient: 'text-brand-gradient text-4xl md:text-6xl font-extrabold leading-tight'
}

const defaultElements = {
  h1: 'h1',
  h2: 'h2', 
  h3: 'h3',
  h4: 'h4',
  body: 'p',
  caption: 'span',
  gradient: 'span'
} as const

export function PremiumTypography({
  variant = 'body',
  className = '',
  children,
  as,
  ...props
}: PremiumTypographyProps & React.HTMLAttributes<HTMLElement>) {
  const Element = as || defaultElements[variant]
  const classes = cn(typographyVariants[variant], className)

  return React.createElement(Element, { className: classes, ...props }, children)
}

// Convenience components
export function PremiumHeading({ 
  level = 1, 
  gradient = false,
  children, 
  ...props 
}: { 
  level?: 1 | 2 | 3 | 4
  gradient?: boolean
  children: React.ReactNode
} & Omit<PremiumTypographyProps, 'variant' | 'children'>) {
  if (gradient) {
    return (
      <PremiumTypography variant="gradient" as={`h${level}` as keyof JSX.IntrinsicElements} {...props}>
        {children}
      </PremiumTypography>
    )
  }
  
  const variant = `h${level}` as 'h1' | 'h2' | 'h3' | 'h4'
  return (
    <PremiumTypography variant={variant} {...props}>
      {children}
    </PremiumTypography>
  )
}

export function PremiumText({ children, ...props }: Omit<PremiumTypographyProps, 'variant' | 'children'> & { children: React.ReactNode }) {
  return (
    <PremiumTypography variant="body" {...props}>
      {children}
    </PremiumTypography>
  )
}

export function PremiumCaption({ children, ...props }: Omit<PremiumTypographyProps, 'variant' | 'children'> & { children: React.ReactNode }) {
  return (
    <PremiumTypography variant="caption" {...props}>
      {children}
    </PremiumTypography>
  )
}

export default PremiumTypography