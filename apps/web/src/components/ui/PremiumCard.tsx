'use client'

import React from 'react'
import { motion, MotionProps } from 'framer-motion'
import { cn } from '@/lib/utils'

export interface PremiumCardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'launch' | 'elevated' | 'glass'
  interactive?: boolean
  glow?: boolean
  asMotion?: boolean
  children: React.ReactNode
}

const cardVariants = {
  default: 'card-premium',
  launch: 'card-launch',
  elevated: 'card-premium bg-surface-elevated',
  glass: 'card-premium backdrop-blur-xl bg-white/5 border-white/10'
}

const glowVariants = {
  default: 'glow-premium',
  launch: 'glow-launch',
  elevated: 'glow-cyan',
  glass: 'glow-premium'
}

export function PremiumCard({
  variant = 'default',
  interactive = false,
  glow = false,
  asMotion = true,
  children,
  className = '',
  ...props
}: PremiumCardProps) {
  const { onAnimationStart, ...rest } = props

  const baseClasses = cn(
    cardVariants[variant],
    glow && glowVariants[variant],
    interactive && 'cursor-pointer',
    className
  )

  const motionProps: MotionProps = {
    whileHover: interactive ? { 
      scale: 1.02,
      y: -2
    } : undefined,
    transition: { 
      duration: 0.3, 
      ease: [0.4, 0, 0.2, 1] 
    },
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 }
  }

  if (asMotion) {
    return (
      <motion.div
        className={baseClasses}
        {...motionProps}
        {...(rest as any)}
      >
        {children}
      </motion.div>
    )
  }

  return (
    <div className={baseClasses} onAnimationStart={onAnimationStart} {...rest}>
      {children}
    </div>
  )
}

// Convenience components for common use cases
export function LaunchCard({ children, ...props }: Omit<PremiumCardProps, 'variant'>) {
  return (
    <PremiumCard variant="launch" interactive glow {...props}>
      {children}
    </PremiumCard>
  )
}

export function GlassCard({ children, ...props }: Omit<PremiumCardProps, 'variant'>) {
  return (
    <PremiumCard variant="glass" {...props}>
      {children}
    </PremiumCard>
  )
}

export function ElevatedCard({ children, ...props }: Omit<PremiumCardProps, 'variant'>) {
  return (
    <PremiumCard variant="elevated" interactive {...props}>
      {children}
    </PremiumCard>
  )
}

export default PremiumCard
