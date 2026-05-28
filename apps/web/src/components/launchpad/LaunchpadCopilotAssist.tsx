'use client'

import { useMemo, useState } from 'react'
import { ChevronDown, ChevronUp, Headphones, Mic, Send, Volume2 } from 'lucide-react'
import {
  getLaunchpadCopilotReply,
  type LaunchpadCopilotContext,
  type LaunchpadCopilotTargetStep,
} from '@/lib/launchpad/copilot'

interface LaunchpadCopilotAssistProps {
  context: LaunchpadCopilotContext
  onJumpToStep: (targetStep: LaunchpadCopilotTargetStep) => void
}

export default function LaunchpadCopilotAssist({
  context,
  onJumpToStep,
}: LaunchpadCopilotAssistProps) {
  const [question, setQuestion] = useState('')
  const [lastReply, setLastReply] = useState(() =>
    getLaunchpadCopilotReply("what's next", context)
  )
  const [voiceEnabled, setVoiceEnabled] = useState(false)
  const [isCollapsed, setIsCollapsed] = useState(false)

  const quickPrompts = useMemo(
    () => ['What is the best next step?', 'How do I improve this CTA?', 'Are we launch-ready?'],
    []
  )

  const askCopilot = (text: string) => {
    const reply = getLaunchpadCopilotReply(text, context)
    setLastReply(reply)
    setQuestion('')
  }

  const speakReply = () => {
    if (typeof window === 'undefined') return
    if (!('speechSynthesis' in window)) return
    const utterance = new SpeechSynthesisUtterance(lastReply.message)
    utterance.rate = 1
    utterance.pitch = 1
    window.speechSynthesis.cancel()
    window.speechSynthesis.speak(utterance)
  }

  if (isCollapsed) {
    return (
      <aside className="fixed bottom-4 right-4 z-40">
        <button
          type="button"
          onClick={() => setIsCollapsed(false)}
          className="inline-flex items-center gap-2 rounded-full border border-cyan-300/35 bg-[rgba(8,14,22,0.94)] px-4 py-3 text-sm font-semibold text-cyan-100 shadow-2xl backdrop-blur hover:border-cyan-200/70"
          aria-expanded="false"
          aria-label="Open AI Copilot Assist"
        >
          <Headphones size={16} />
          AI Copilot
          <ChevronUp size={15} />
        </button>
      </aside>
    )
  }

  return (
    <aside className="fixed bottom-4 right-4 z-40 w-[min(94vw,360px)] rounded-xl border border-cyan-300/35 bg-[rgba(8,14,22,0.94)] p-4 shadow-2xl backdrop-blur">
      <div className="mb-3 flex items-center justify-between">
        <p className="inline-flex items-center gap-2 text-sm font-semibold text-cyan-100">
          <Headphones size={16} />
          AI Copilot Assist
        </p>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setVoiceEnabled((value) => !value)}
            className={`inline-flex items-center gap-1 rounded-md border px-2 py-1 text-xs ${
              voiceEnabled
                ? 'border-rocket-400/50 bg-rocket-500/20 text-rocket-100'
                : 'border-[var(--border-subtle)] text-text-secondary'
            }`}
          >
            <Mic size={12} />
            {voiceEnabled ? 'Voice On' : 'Voice Off'}
          </button>
          <button
            type="button"
            onClick={() => setIsCollapsed(true)}
            className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-[var(--border-subtle)] text-text-secondary hover:text-text-primary"
            aria-expanded="true"
            aria-label="Collapse AI Copilot Assist"
          >
            <ChevronDown size={15} />
          </button>
        </div>
      </div>

      <p className="mb-3 text-xs text-text-secondary">
        Ask for your next move. I suggest one action and route you there without interrupting your workflow.
      </p>

      <div className="mb-3 rounded-lg border border-[var(--border-subtle)] bg-[rgba(255,255,255,0.03)] p-3">
        <p className="text-sm text-text-primary">{lastReply.message}</p>
        <div className="mt-3 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => onJumpToStep(lastReply.targetStep)}
            className="btn-launch-premium rounded-md px-3 py-1.5 text-xs font-semibold"
          >
            {lastReply.suggestedAction}
          </button>
          {voiceEnabled ? (
            <button
              type="button"
              onClick={speakReply}
              className="inline-flex items-center gap-1 rounded-md border border-[var(--border-subtle)] px-3 py-1.5 text-xs text-text-secondary"
            >
              <Volume2 size={12} />
              Read aloud
            </button>
          ) : null}
        </div>
      </div>

      <div className="mb-2 flex flex-wrap gap-2">
        {quickPrompts.map((prompt) => (
          <button
            key={prompt}
            type="button"
            onClick={() => askCopilot(prompt)}
            className="rounded-md border border-[var(--border-subtle)] px-2 py-1 text-[11px] text-text-secondary hover:text-text-primary"
          >
            {prompt}
          </button>
        ))}
      </div>

      <form
        onSubmit={(event) => {
          event.preventDefault()
          askCopilot(question)
        }}
        className="flex items-center gap-2"
      >
        <input
          value={question}
          onChange={(event) => setQuestion(event.target.value)}
          placeholder="Ask Copilot..."
          className="hud-input h-9 flex-1 text-xs"
        />
        <button type="submit" className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-[var(--border-subtle)] text-text-secondary">
          <Send size={13} />
        </button>
      </form>
    </aside>
  )
}
