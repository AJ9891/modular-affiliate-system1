'use client'

import { useEffect, useMemo, useRef, useState } from 'react'

interface AnimatedNumberProps {
  value: number
  durationMs?: number
  formatter?: (value: number) => string
  className?: string
}

export default function AnimatedNumber({
  value,
  durationMs = 750,
  formatter,
  className,
}: AnimatedNumberProps) {
  const [displayValue, setDisplayValue] = useState(value)
  const valueRef = useRef(value)

  const resolvedFormatter = useMemo(
    () =>
      formatter ??
      ((input: number) =>
        Math.round(input).toLocaleString('en-US')),
    [formatter]
  )

  useEffect(() => {
    if (typeof window === 'undefined') {
      setDisplayValue(value)
      valueRef.current = value
      return
    }

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setDisplayValue(value)
      valueRef.current = value
      return
    }

    if (valueRef.current === value) {
      return
    }

    const from = valueRef.current
    const delta = value - from
    const startedAt = performance.now()
    let frame = 0

    const tick = (timestamp: number) => {
      const progress = Math.min((timestamp - startedAt) / durationMs, 1)
      const eased = 1 - (1 - progress) ** 3
      const next = from + delta * eased

      valueRef.current = next
      setDisplayValue(next)

      if (progress < 1) {
        frame = window.requestAnimationFrame(tick)
        return
      }

      valueRef.current = value
      setDisplayValue(value)
    }

    frame = window.requestAnimationFrame(tick)
    return () => window.cancelAnimationFrame(frame)
  }, [durationMs, value])

  return <span className={className}>{resolvedFormatter(displayValue)}</span>
}
