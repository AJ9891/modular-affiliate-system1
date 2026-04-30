'use client'

import { useState } from 'react'
import type { GeneratedContentPayload } from '@/lib/api/content-automation'
import { createPublishSchedule } from '@/lib/api/content-automation'

interface ScheduleComposerProps {
  content: GeneratedContentPayload | null
  funnelId: string | null
  onScheduled: () => Promise<void> | void
}

function defaultRunAt() {
  const date = new Date(Date.now() + 15 * 60 * 1000)
  return date.toISOString().slice(0, 16)
}

export default function ScheduleComposer({ content, funnelId, onScheduled }: ScheduleComposerProps) {
  const [title, setTitle] = useState('')
  const [runAt, setRunAt] = useState(defaultRunAt())
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function saveSchedule() {
    if (!content) {
      setError('Generate content first')
      return
    }

    try {
      setSaving(true)
      setError(null)

      await createPublishSchedule({
        title: title.trim() || content.title,
        runAt: new Date(runAt).toISOString(),
        funnelId: funnelId || undefined,
        content: {
          type: 'article_and_funnel',
          payload: content as unknown as Record<string, unknown>,
        },
      })

      setTitle('')
      await onScheduled()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create schedule')
    } finally {
      setSaving(false)
    }
  }

  return (
    <section className="hud-panel space-y-3">
      <div>
        <p className="text-xs uppercase tracking-system text-text-secondary">Schedule</p>
        <h2 className="text-lg font-semibold text-text-primary">Schedule Posting</h2>
      </div>

      <div className="grid grid-cols-1 gap-2 md:grid-cols-3">
        <input
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          className="hud-input"
          placeholder="Schedule title"
        />
        <input
          value={runAt}
          onChange={(event) => setRunAt(event.target.value)}
          className="hud-input"
          type="datetime-local"
        />
        <button
          type="button"
          onClick={saveSchedule}
          disabled={saving || !content}
          className="hud-button-primary px-4 py-2"
        >
          {saving ? 'Scheduling...' : 'Create Schedule'}
        </button>
      </div>

      {error && <p className="text-sm text-red-300">{error}</p>}
    </section>
  )
}
