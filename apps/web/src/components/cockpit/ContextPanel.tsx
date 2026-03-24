'use client'

import { useMemo, useState } from 'react'
import type { ElementType } from 'react'
import Link from 'next/link'
import { SlidersHorizontal, X, Filter, Wrench, Mail, BarChart3, Bell } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ContextPanelProps {
  pathname: string
  collapsed: boolean
  mobileOpen: boolean
  onCloseMobile: () => void
  onToggleCollapsed: () => void
}

interface ContextSection {
  title: string
  description: string
  icon: ElementType
  controls: Array<{ label: string; value?: string; href?: string }>
}

function resolveContext(pathname: string): { heading: string; sections: ContextSection[] } {
  if (pathname.startsWith('/funnels') || pathname.startsWith('/visual-builder')) {
    return {
      heading: 'Funnel Controls',
      sections: [
        {
          title: 'Block Settings',
          description: 'Tune structure and conversion intent for current funnel step.',
          icon: Wrench,
          controls: [
            { label: 'Template', value: 'Lead Magnet' },
            { label: 'Publish Status', value: 'Draft' },
            { label: 'CTA Variant', value: 'Primary' },
            { label: 'Open Visual Builder', href: '/visual-builder' },
          ],
        },
        {
          title: 'Launch Options',
          description: 'Keep funnel state aligned before publishing.',
          icon: SlidersHorizontal,
          controls: [
            { label: 'Tracking', value: 'Enabled' },
            { label: 'A/B Variant', value: 'Variant A' },
            { label: 'Preview Mode', value: 'On' },
            { label: 'Funnels Workspace', href: '/funnels' },
          ],
        },
      ],
    }
  }

  if (pathname.startsWith('/analytics') || pathname.startsWith('/dashboard')) {
    return {
      heading: 'Analytics Filters',
      sections: [
        {
          title: 'Time Range',
          description: 'Control time window and attribution granularity.',
          icon: Filter,
          controls: [
            { label: 'Range', value: '30 days' },
            { label: 'Attribution', value: 'Last click' },
            { label: 'Timezone', value: 'UTC' },
            { label: 'Open Dashboard', href: '/dashboard' },
          ],
        },
        {
          title: 'Comparison',
          description: 'Compare baseline period and watch trend deltas.',
          icon: BarChart3,
          controls: [
            { label: 'Compare To', value: 'Previous period' },
            { label: 'Signal Threshold', value: 'Medium' },
            { label: 'Funnels Data Source', href: '/funnels' },
          ],
        },
      ],
    }
  }

  if (pathname.startsWith('/email')) {
    return {
      heading: 'Campaign Settings',
      sections: [
        {
          title: 'Audience',
          description: 'Adjust target segment and send behavior.',
          icon: Mail,
          controls: [
            { label: 'Segment', value: 'All Subscribers' },
            { label: 'Send Window', value: 'Weekday mornings' },
            { label: 'Compliance', value: 'Enabled' },
            { label: 'Subscribers List', href: '/subscribers' },
          ],
        },
        {
          title: 'Optimization',
          description: 'Quick operational settings for campaigns.',
          icon: SlidersHorizontal,
          controls: [
            { label: 'Subject Test', value: 'Variant A/B' },
            { label: 'Tracking Pixels', value: 'On' },
            { label: 'Email Workspace', href: '/email' },
          ],
        },
      ],
    }
  }

  if (pathname.startsWith('/subscribers')) {
    return {
      heading: 'Audience Filters',
      sections: [
        {
          title: 'Subscriber Query',
          description: 'Filter list by source and search intent.',
          icon: Filter,
          controls: [
            { label: 'Primary Segment', value: 'All sources' },
            { label: 'Search Scope', value: 'Email + funnel id' },
            { label: 'Open Email Console', href: '/email' },
          ],
        },
        {
          title: 'List Operations',
          description: 'Quick access to core audience workflows.',
          icon: SlidersHorizontal,
          controls: [
            { label: 'Funnels Source', href: '/funnels' },
            { label: 'Export Readiness', value: 'Operational' },
          ],
        },
      ],
    }
  }

  if (pathname.startsWith('/templates')) {
    return {
      heading: 'Template Filters',
      sections: [
        {
          title: 'Template Library',
          description: 'Configure voice and category overlays.',
          icon: Wrench,
          controls: [
            { label: 'Voice Mode', value: 'All' },
            { label: 'Category', value: 'All' },
            { label: 'Open Email Templates', href: '/email' },
          ],
        },
        {
          title: 'Composition Workflow',
          description: 'Jump to generation and publish controls.',
          icon: SlidersHorizontal,
          controls: [
            { label: 'AI Generator', href: '/ai-generator' },
            { label: 'Visual Builder', href: '/visual-builder' },
          ],
        },
      ],
    }
  }

  if (pathname.startsWith('/settings')) {
    return {
      heading: 'Account Controls',
      sections: [
        {
          title: 'Profile',
          description: 'Core account and plan-level controls.',
          icon: Wrench,
          controls: [
            { label: 'Plan Save', value: 'Manual' },
            { label: 'Billing Center', href: '/subscription' },
          ],
        },
        {
          title: 'Security & Keys',
          description: 'Provider secret configuration posture.',
          icon: Bell,
          controls: [
            { label: 'OpenAI Key', value: 'Env managed' },
            { label: 'Stripe Key', value: 'Env managed' },
            { label: 'Domain Settings', href: '/domains' },
          ],
        },
      ],
    }
  }

  return {
    heading: 'Context Console',
    sections: [
      {
        title: 'System Status',
        description: 'Operational quick scan for your current workspace.',
        icon: SlidersHorizontal,
        controls: [
          { label: 'Sync', value: 'Healthy' },
          { label: 'Queue', value: 'Nominal' },
          { label: 'Alerts', value: '0 critical' },
        ],
      },
      {
        title: 'Notifications',
        description: 'Stay aware of blockers and action items.',
        icon: Bell,
        controls: [{ label: 'No urgent notifications' }],
      },
    ],
  }
}

export default function ContextPanel({
  pathname,
  collapsed,
  mobileOpen,
  onCloseMobile,
  onToggleCollapsed,
}: ContextPanelProps) {
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({})
  const context = useMemo(() => resolveContext(pathname), [pathname])

  const toggleSection = (title: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [title]: !prev[title],
    }))
  }

  return (
    <>
      {!collapsed && (
        <aside
          className={cn(
            'fixed inset-y-0 right-0 z-40 w-80 border-l border-[var(--border-elevated)] bg-[rgba(5,11,18,0.96)] px-4 py-4 backdrop-blur-xl transition-transform duration-300',
            mobileOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'
          )}
        >
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-system text-text-secondary">Context Panel</p>
              <h3 className="text-base font-semibold text-text-primary">{context.heading}</h3>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onToggleCollapsed}
                className="hidden rounded-md border border-[var(--border-subtle)] px-2 py-1 text-xs text-text-secondary hover:text-text-primary lg:inline-flex"
              >
                Collapse
              </button>
              <button
                type="button"
                onClick={onCloseMobile}
                className="rounded-md border border-[var(--border-subtle)] p-1 text-text-secondary hover:text-text-primary lg:hidden"
                aria-label="Close context panel"
              >
                <X size={14} />
              </button>
            </div>
          </div>

          <div className="space-y-3 overflow-y-auto pb-20">
            {context.sections.map((section) => {
              const expanded = expandedSections[section.title] ?? true
              const Icon = section.icon

              return (
                <section key={section.title} className="rounded-xl border border-[var(--border-subtle)] bg-[rgba(11,18,27,0.74)]">
                  <button
                    type="button"
                    onClick={() => toggleSection(section.title)}
                    className="w-full px-3 py-3 text-left"
                    aria-expanded={expanded}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex min-w-0 items-center gap-2">
                        <Icon size={14} className="text-text-secondary" />
                        <p className="truncate text-sm font-medium text-text-primary">{section.title}</p>
                      </div>
                      <span className="text-xs text-text-secondary">{expanded ? 'Hide' : 'Show'}</span>
                    </div>
                    <p className="mt-1 text-xs text-text-secondary">{section.description}</p>
                  </button>

                  {expanded && (
                    <div className="space-y-1 border-t border-[var(--border-subtle)] px-3 py-3">
                      {section.controls.map((control) =>
                        control.href ? (
                          <Link
                            key={control.label}
                            href={control.href}
                            className="flex items-center justify-between gap-2 rounded-md border border-[var(--border-subtle)] px-2 py-1.5 text-xs text-text-secondary transition hover:border-[var(--border-focus)] hover:text-text-primary"
                          >
                            <span>{control.label}</span>
                            <span>Open</span>
                          </Link>
                        ) : (
                          <div key={control.label} className="flex items-center justify-between gap-2 rounded-md border border-[var(--border-subtle)] px-2 py-1.5 text-xs">
                            <span className="text-text-secondary">{control.label}</span>
                            {control.value && <span className="text-text-primary">{control.value}</span>}
                          </div>
                        )
                      )}
                    </div>
                  )}
                </section>
              )
            })}
          </div>
        </aside>
      )}

      <button
        type="button"
        onClick={onToggleCollapsed}
        className={cn(
          'fixed bottom-5 right-5 z-50 inline-flex items-center gap-2 rounded-full border border-[var(--border-elevated)] bg-[rgba(8,15,24,0.92)] px-4 py-2 text-xs text-text-secondary shadow-lg backdrop-blur transition hover:text-text-primary',
          !collapsed && 'hidden lg:inline-flex'
        )}
      >
        <SlidersHorizontal size={14} />
        <span>Context</span>
      </button>

      {!collapsed && mobileOpen && <div className="fixed inset-0 z-30 bg-black/45 lg:hidden" onClick={onCloseMobile} />}
    </>
  )
}
