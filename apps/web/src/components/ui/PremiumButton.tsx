'use client'

import React from 'react'
import { motion, MotionProps } from 'framer-motion'
import { cn } from '@/lib/utils'

export interface PremiumButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost'
  size?: 'sm' | 'md' | 'lg' | 'xl'
  glow?: boolean
  loading?: boolean
  icon?: React.ReactNode
  children: React.ReactNode
  asMotion?: boolean
}

const buttonVariants = {
  primary: 'btn-launch-premium',
  secondary: 'btn-secondary-premium', 
  outline: 'bg-transparent border-2 border-brand-orange text-brand-orange hover:bg-brand-orange hover:text-white transition-all duration-200',
  ghost: 'bg-transparent text-white hover:bg-white/10 transition-all duration-200'
}

const sizeVariants = {
  sm: 'px-4 py-2 text-sm',
  md: 'px-6 py-3 text-base',
  lg: 'px-8 py-4 text-lg', 
  xl: 'px-10 py-5 text-xl'
}

const glowVariants = {
  primary: 'glow-launch',
  secondary: 'glow-premium',
  outline: 'glow-cyan',
  ghost: ''
}

export function PremiumButton({
  variant = 'primary',
  size = 'md', 
  glow = false,
  loading = false,
  icon,
  children,
  className = '',
  asMotion = true,
  disabled,
  ...props
}: PremiumButtonProps) {
  const { onAnimationStart, ...rest } = props

  const baseClasses = cn(
    'inline-flex items-center justify-center gap-2 font-semibold rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed',
    buttonVariants[variant],
    sizeVariants[size],
    glow && glowVariants[variant],
    className
  )

  const motionProps: MotionProps = {
    whileHover: disabled || loading ? undefined : { scale: 1.02 },
    whileTap: disabled || loading ? undefined : { scale: 0.98 },
    transition: { duration: 0.2, ease: 'easeOut' }
  }

  const content = (
    <>
      {loading ? (
        <div className="loading-premium h-5 w-5 rounded-full" />
      ) : icon ? (
        icon
      ) : null}
      {children}
    </>
  )

  if (asMotion && !disabled && !loading) {
    return (
      <motion.button
        className={baseClasses}
        disabled={disabled || loading}
        {...motionProps}
        {...(rest as any)}
      >
        {content}
      </motion.button>
    )
  }

  return (
    <button
      className={baseClasses}
      disabled={disabled || loading}
      onAnimationStart={onAnimationStart}
      {...rest}
    >
      {content}
    </button>
  )
}

export default PremiumButton
