'use client'

import { useEffect, useMemo, useState } from 'react'
import { CheckCircle } from 'lucide-react'
import {
  GUIDED_BUILDER_HIGHLIGHT_INTERVAL_MS,
  GUIDED_BUILDER_IDLE_PROMPT_DELAY_MS,
  GUIDED_BUILDER_MODULES,
  getGuidedBuilderHelpMessage,
  getNextGuidedBuilderModuleIndex,
} from '@/lib/launchpad/guidedBuilder'

type LaunchpadTemplate = {
  name: string
  description: string
  blocks: number
  conversions: string
  category: string
}

interface GuidedBuilderFlightProps {
  templates: LaunchpadTemplate[]
  selectedTemplate: string
  createdFunnelPath: string
  onSelectTemplate: (template: LaunchpadTemplate) => void
}

export default function GuidedBuilderFlight({
  templates,
  selectedTemplate,
  createdFunnelPath,
  onSelectTemplate,
}: GuidedBuilderFlightProps) {
  const [highlightedModuleIndex, setHighlightedModuleIndex] = useState(0)
  const [showAdaptiveHelp, setShowAdaptiveHelp] = useState(false)
  const [expandedHelp, setExpandedHelp] = useState(false)

  const highlightedModule = GUIDED_BUILDER_MODULES[highlightedModuleIndex]

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setHighlightedModuleIndex((current) =>
        getNextGuidedBuilderModuleIndex(current, GUIDED_BUILDER_MODULES.length)
      )
    }, GUIDED_BUILDER_HIGHLIGHT_INTERVAL_MS)

    return () => window.clearInterval(intervalId)
  }, [])

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setShowAdaptiveHelp(true)
    }, GUIDED_BUILDER_IDLE_PROMPT_DELAY_MS)

    return () => window.clearTimeout(timeoutId)
  }, [highlightedModuleIndex, selectedTemplate])

  const activeTemplate = useMemo(
    () => templates.find((template) => template.category === selectedTemplate) || null,
    [templates, selectedTemplate]
  )

  const handleInteraction = () => {
    if (showAdaptiveHelp) setShowAdaptiveHelp(false)
  }

  return (
    <div className="mb-8 space-y-5">
      <div className="rounded-lg border border-cyan-300/35 bg-cyan-500/10 p-4 text-left">
        <p className="text-xs font-semibold uppercase tracking-wide text-cyan-100">Guided Builder Flight</p>
        <p className="mt-1 text-sm text-cyan-50">
          That {highlightedModule.title} section? Think of it as your flight plan component. We help you tune it for lift.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
        {GUIDED_BUILDER_MODULES.map((module, index) => {
          const highlighted = index === highlightedModuleIndex
          return (
            <button
              key={module.id}
              type="button"
              onClick={() => {
                setHighlightedModuleIndex(index)
                handleInteraction()
              }}
              className={`rounded-lg border p-3 text-left transition ${
                highlighted
                  ? 'border-rocket-500 bg-[var(--accent-soft)] shadow-[0_0_0_1px_rgba(249,115,22,0.35)]'
                  : 'border-[var(--border-elevated)] hover:border-[var(--border-focus)]'
              }`}
            >
              <p className="text-sm font-semibold text-text-primary">{module.title}</p>
              <p className="mt-1 text-xs text-text-secondary">{module.explanation}</p>
            </button>
          )
        })}
      </div>

      {showAdaptiveHelp ? (
        <div className="rounded-lg border border-amber-300/35 bg-amber-500/10 p-4 text-left">
          <p className="text-sm text-amber-100">Need help here? We can walk this together.</p>
          <button
            type="button"
            onClick={() => setExpandedHelp((value) => !value)}
            className="mt-2 rounded-md border border-amber-300/40 px-3 py-1.5 text-xs text-amber-100 hover:bg-amber-400/10"
          >
            {expandedHelp ? 'Hide hint' : 'Show contextual hint'}
          </button>
          {expandedHelp ? (
            <p className="mt-2 text-xs text-amber-50">{getGuidedBuilderHelpMessage(highlightedModule.id)}</p>
          ) : null}
        </div>
      ) : null}

      <div className="grid grid-cols-2 gap-4">
        {templates.map((template, index) => (
          <div
            key={index}
            onClick={() => {
              handleInteraction()
              onSelectTemplate(template)
            }}
            className={`
              p-6 border-2 rounded-lg cursor-pointer transition-all
              ${selectedTemplate === template.category
                ? 'border-rocket-500 bg-[var(--accent-soft)] shadow-lg'
                : 'border-[var(--border-elevated)] hover:border-[var(--border-focus)]'
              }
            `}
          >
            <div className="flex items-start justify-between mb-2">
              <h4 className="font-bold text-text-primary">{template.name}</h4>
              {selectedTemplate === template.category ? (
                <CheckCircle size={20} className="text-rocket-500" />
              ) : null}
            </div>
            <p className="text-sm text-text-secondary mb-3">{template.description}</p>
            <div className="flex justify-between text-xs text-text-secondary">
              <span>{template.blocks} blocks</span>
              <span className="font-semibold text-emerald-300">{template.conversions} CVR</span>
            </div>
          </div>
        ))}
      </div>

      {createdFunnelPath ? (
        <div className="rounded-lg border border-emerald-300/35 bg-emerald-500/10 p-4 text-left">
          <p className="text-sm font-semibold text-emerald-200">
            Working draft created from {activeTemplate?.name || 'selected template'}
          </p>
          <p className="mt-1 text-xs text-emerald-100">Preview URL: {createdFunnelPath}</p>
          <a
            href={createdFunnelPath}
            target="_blank"
            rel="noreferrer"
            className="mt-3 inline-flex rounded-md border border-emerald-300/40 px-3 py-1.5 text-xs font-semibold text-emerald-100 hover:bg-emerald-400/10"
          >
            Open Preview
          </a>
        </div>
      ) : null}
    </div>
  )
}

