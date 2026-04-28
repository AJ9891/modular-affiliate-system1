'use client'

import Link from 'next/link'
import WorkspacePanel from '@/components/cockpit/WorkspacePanel'

type UnifiedBuilderWorkspaceProps = {
  source: 'builder' | 'builder-v2' | 'visual-builder'
}

const sourceLabels: Record<UnifiedBuilderWorkspaceProps['source'], string> = {
  builder: 'Code Builder',
  'builder-v2': 'Builder V2',
  'visual-builder': 'Visual Builder',
}

export default function UnifiedBuilderWorkspace({ source }: UnifiedBuilderWorkspaceProps) {
  return (
    <main className="cockpit-shell page-engineering-bay py-8">
      <div className="cockpit-container max-w-6xl space-y-6">
        <section className="hud-panel">
          <p className="text-xs uppercase tracking-system text-text-secondary">Funnel Builder</p>
          <h1 className="text-3xl font-semibold text-text-primary md:text-4xl">Unified Funnel Builder Workspace</h1>
          <p className="mt-2 text-sm text-text-secondary">
            Entry point: {sourceLabels[source]}. Build strategy and execution paths are consolidated here.
          </p>
        </section>

        <section className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <WorkspacePanel
            title="AI Funnel Composer"
            description="Generate complete funnels, copy, and optimization prompts with guided AI workflows."
            actions={
              <Link href="/ai-generator" className="hud-button-primary px-3 py-1.5 text-xs">
                Open AI Composer
              </Link>
            }
            expandable
          >
            <p className="text-sm text-text-secondary">
              Use this mode for fast first drafts and conversion-focused content generation.
            </p>
          </WorkspacePanel>

          <WorkspacePanel
            title="Manual Funnel Registry"
            description="Create, edit, and publish funnels through the structured funnel registry and editor."
            actions={
              <Link href="/funnels" className="hud-button-secondary px-3 py-1.5 text-xs">
                Open Funnels
              </Link>
            }
            expandable
          >
            <p className="text-sm text-text-secondary">
              Use this mode for precise edits, page-level control, and lifecycle management.
            </p>
          </WorkspacePanel>
        </section>
      </div>
    </main>
  )
}
