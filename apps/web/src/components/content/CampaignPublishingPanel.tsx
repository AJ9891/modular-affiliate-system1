'use client'

import { useState } from 'react'
import {
  publishCampaign,
  updateCampaignDraft,
  type GeneratedContentPayload,
} from '@/lib/api/content-automation'

type Props = {
  campaignId: string
  content: GeneratedContentPayload
  disabled?: boolean
}

function defaultRunAt(): string {
  return new Date(Date.now() + 30 * 60 * 1000).toISOString().slice(0, 16)
}

export default function CampaignPublishingPanel({ campaignId, content, disabled = false }: Props) {
  const [runAt, setRunAt] = useState(defaultRunAt)
  const [working, setWorking] = useState<'now' | 'schedule' | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [publicPath, setPublicPath] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function saveThenPublish(mode: 'now' | 'schedule') {
    try {
      setWorking(mode)
      setError(null)
      setMessage(null)
      setPublicPath(null)

      await updateCampaignDraft(campaignId, content)
      const response = await publishCampaign(
        campaignId,
        mode === 'now'
          ? { mode: 'now' }
          : { mode: 'schedule', runAt: new Date(runAt).toISOString() }
      )

      setMessage(response.message)
      setPublicPath(response.publicPath || null)
    } catch (publishError) {
      setError(publishError instanceof Error ? publishError.message : 'Campaign could not be published.')
    } finally {
      setWorking(null)
    }
  }

  return (
    <section className="space-y-4 rounded-xl border border-rocket-400/30 bg-rocket-500/5 p-4">
      <div>
        <p className="text-xs uppercase tracking-system text-rocket-300">Publish</p>
        <h3 className="text-lg font-semibold text-text-primary">Choose when this campaign goes live</h3>
        <p className="mt-1 text-sm text-text-secondary">
          Publish Now makes the Launchpad funnel public. Schedule sends the campaign through your active CMS or webhook connection.
        </p>
      </div>

      {error ? (
        <div role="alert" className="rounded-lg border border-red-500/40 bg-red-500/10 p-3 text-sm text-red-200">{error}</div>
      ) : null}
      {message ? (
        <div role="status" className="rounded-lg border border-emerald-500/35 bg-emerald-500/10 p-3 text-sm text-emerald-200">
          <p>{message}</p>
          {publicPath ? (
            <a className="mt-2 inline-block font-medium text-emerald-100 underline" href={publicPath} target="_blank" rel="noreferrer">
              Open public funnel
            </a>
          ) : null}
        </div>
      ) : null}

      <div className="grid gap-3 md:grid-cols-2">
        <div className="space-y-3 rounded-lg border border-[var(--border-subtle)] p-4">
          <h4 className="font-medium text-text-primary">Publish now</h4>
          <p className="text-sm text-text-secondary">Saves your latest edits, then makes the linked funnel public immediately.</p>
          <button
            type="button"
            className="hud-button-primary w-full px-4 py-2"
            onClick={() => saveThenPublish('now')}
            disabled={disabled || Boolean(working)}
          >
            {working === 'now' ? 'Publishing...' : 'Publish Now'}
          </button>
        </div>

        <div className="space-y-3 rounded-lg border border-[var(--border-subtle)] p-4">
          <h4 className="font-medium text-text-primary">Schedule external publishing</h4>
          <label className="block space-y-2 text-sm text-text-secondary">
            <span>Date and time</span>
            <input
              className="hud-input w-full"
              type="datetime-local"
              value={runAt}
              onChange={(event) => setRunAt(event.target.value)}
              min={new Date(Date.now() + 5 * 60 * 1000).toISOString().slice(0, 16)}
            />
          </label>
          <button
            type="button"
            className="hud-button-secondary w-full px-4 py-2"
            onClick={() => saveThenPublish('schedule')}
            disabled={disabled || Boolean(working) || !runAt}
          >
            {working === 'schedule' ? 'Scheduling...' : 'Schedule Campaign'}
          </button>
        </div>
      </div>
    </section>
  )
}
