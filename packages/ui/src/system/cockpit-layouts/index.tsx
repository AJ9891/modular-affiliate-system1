import { ReactNode } from 'react'

interface CockpitLayoutProps {
  header: ReactNode
  sidebar: ReactNode
  children: ReactNode
  footer?: ReactNode
}

export function CockpitLayout({
  header,
  sidebar,
  children,
  footer,
}: CockpitLayoutProps) {
  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      <header className="border-b border-slate-200 bg-white/95 px-6 py-4 shadow-sm">
        {header}
      </header>
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-4 px-4 py-4 md:grid-cols-[18rem_minmax(0,1fr)]">
        <aside className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          {sidebar}
        </aside>
        <main className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          {children}
        </main>
      </div>
      {footer ? (
        <footer className="border-t border-slate-200 bg-white px-6 py-4">
          {footer}
        </footer>
      ) : null}
    </div>
  )
}

interface CockpitMetricCardProps {
  label: string
  value: string | number
  change?: string
}

export function CockpitMetricCard({ label, value, change }: CockpitMetricCardProps) {
  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-slate-900">{value}</p>
      {change ? <p className="mt-1 text-xs text-slate-600">{change}</p> : null}
    </div>
  )
}
