import type { ReactNode } from 'react'

type StatsGridProps = {
  children: ReactNode
}

export function StatsGrid({ children }: StatsGridProps) {
  return <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">{children}</section>
}
