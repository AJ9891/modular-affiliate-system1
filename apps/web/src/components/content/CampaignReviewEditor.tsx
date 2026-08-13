'use client'

import { useState } from 'react'
import CampaignPublishingPanel from './CampaignPublishingPanel'
import {
  regenerateCampaignSection,
  updateCampaignDraft,
  type CampaignSection,
  type GeneratedContentPayload,
} from '@/lib/api/content-automation'

type Props = {
  campaignId: string
  content: GeneratedContentPayload
  onChange: (content: GeneratedContentPayload) => void
}

function sectionLabel(section: CampaignSection): string {
  if (section === 'emails') return 'email sequence'
  return section
}

export default function CampaignReviewEditor({ campaignId, content, onChange }: Props) {
  const [saving, setSaving] = useState(false)
  const [regenerating, setRegenerating] = useState<CampaignSection | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  function updateFunnel(field: 'headline' | 'subheadline' | 'cta', value: string) {
    const blocks = content.funnel.blocks.map((block) => {
      if (block.type !== 'hero' || typeof block.content !== 'object' || block.content === null) return block
      return {
        ...block,
        content: { ...block.content, [field]: value },
      }
    })

    onChange({
      ...content,
      funnel: { ...content.funnel, [field]: value, blocks },
    })
    setMessage(null)
  }

  function updateArticle(field: 'metaTitle' | 'metaDescription' | 'markdown', value: string) {
    onChange({
      ...content,
      article: { ...content.article, [field]: value },
    })
    setMessage(null)
  }

  function updateEmail(index: number, field: 'subject' | 'preview' | 'body' | 'cta', value: string) {
    onChange({
      ...content,
      emails: content.emails.map((email, emailIndex) =>
        emailIndex === index ? { ...email, [field]: value } : email
      ),
    })
    setMessage(null)
  }

  async function saveDraft() {
    try {
      setSaving(true)
      setError(null)
      const response = await updateCampaignDraft(campaignId, content)
      onChange(response.content)
      setMessage('Draft saved.')
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Draft could not be saved.')
    } finally {
      setSaving(false)
    }
  }

  async function regenerate(section: CampaignSection) {
    try {
      setRegenerating(section)
      setError(null)
      setMessage(null)
      const response = await regenerateCampaignSection(campaignId, section)
      onChange(response.content)
      setMessage(`New ${sectionLabel(section)} saved to your draft.`)
    } catch (regenerateError) {
      setError(regenerateError instanceof Error ? regenerateError.message : 'That section could not be regenerated.')
    } finally {
      setRegenerating(null)
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 rounded-xl border border-[var(--border-subtle)] p-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h3 className="font-semibold text-text-primary">Review and edit</h3>
          <p className="text-sm text-text-secondary">Change any field, then save. Regenerate only the section you want replaced.</p>
        </div>
        <button type="button" className="hud-button-primary px-5 py-2" onClick={saveDraft} disabled={saving || Boolean(regenerating)}>
          {saving ? 'Saving...' : 'Save Draft'}
        </button>
      </div>

      {error ? (
        <div role="alert" className="rounded-lg border border-red-500/40 bg-red-500/10 p-3 text-sm text-red-200">{error}</div>
      ) : null}
      {message ? (
        <div role="status" className="rounded-lg border border-emerald-500/35 bg-emerald-500/10 p-3 text-sm text-emerald-200">{message}</div>
      ) : null}

      <section className="space-y-4 rounded-xl border border-[var(--border-subtle)] p-4">
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-lg font-semibold text-text-primary">Funnel</h3>
          <button type="button" className="hud-button-secondary px-3 py-2 text-sm" onClick={() => regenerate('funnel')} disabled={Boolean(regenerating) || saving}>
            {regenerating === 'funnel' ? 'Regenerating...' : 'Regenerate Funnel'}
          </button>
        </div>
        <label className="block space-y-2 text-sm text-text-secondary">
          <span>Headline</span>
          <input className="hud-input w-full" value={content.funnel.headline} onChange={(event) => updateFunnel('headline', event.target.value)} />
        </label>
        <label className="block space-y-2 text-sm text-text-secondary">
          <span>Subheadline</span>
          <textarea className="hud-input min-h-24 w-full resize-y" value={content.funnel.subheadline} onChange={(event) => updateFunnel('subheadline', event.target.value)} />
        </label>
        <label className="block space-y-2 text-sm text-text-secondary">
          <span>Button text</span>
          <input className="hud-input w-full" value={content.funnel.cta} onChange={(event) => updateFunnel('cta', event.target.value)} />
        </label>
      </section>

      <section className="space-y-4 rounded-xl border border-[var(--border-subtle)] p-4">
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-lg font-semibold text-text-primary">Article</h3>
          <button type="button" className="hud-button-secondary px-3 py-2 text-sm" onClick={() => regenerate('article')} disabled={Boolean(regenerating) || saving}>
            {regenerating === 'article' ? 'Regenerating...' : 'Regenerate Article'}
          </button>
        </div>
        <label className="block space-y-2 text-sm text-text-secondary">
          <span>Search title</span>
          <input className="hud-input w-full" value={content.article.metaTitle} onChange={(event) => updateArticle('metaTitle', event.target.value)} />
        </label>
        <label className="block space-y-2 text-sm text-text-secondary">
          <span>Search description</span>
          <textarea className="hud-input min-h-20 w-full resize-y" value={content.article.metaDescription} onChange={(event) => updateArticle('metaDescription', event.target.value)} />
        </label>
        <label className="block space-y-2 text-sm text-text-secondary">
          <span>Article</span>
          <textarea className="hud-input min-h-80 w-full resize-y font-mono text-sm" value={content.article.markdown} onChange={(event) => updateArticle('markdown', event.target.value)} />
        </label>
      </section>

      <section className="space-y-4 rounded-xl border border-[var(--border-subtle)] p-4">
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-lg font-semibold text-text-primary">Email sequence</h3>
          <button type="button" className="hud-button-secondary px-3 py-2 text-sm" onClick={() => regenerate('emails')} disabled={Boolean(regenerating) || saving}>
            {regenerating === 'emails' ? 'Regenerating...' : 'Regenerate Emails'}
          </button>
        </div>
        {content.emails.map((email, index) => (
          <article key={index} className="space-y-3 rounded-lg border border-[var(--border-subtle)] bg-[rgba(10,16,24,0.4)] p-4">
            <h4 className="font-medium text-text-primary">Email {index + 1}</h4>
            <label className="block space-y-2 text-sm text-text-secondary">
              <span>Subject</span>
              <input className="hud-input w-full" value={email.subject} onChange={(event) => updateEmail(index, 'subject', event.target.value)} />
            </label>
            <label className="block space-y-2 text-sm text-text-secondary">
              <span>Preview text</span>
              <input className="hud-input w-full" value={email.preview} onChange={(event) => updateEmail(index, 'preview', event.target.value)} />
            </label>
            <label className="block space-y-2 text-sm text-text-secondary">
              <span>Message</span>
              <textarea className="hud-input min-h-36 w-full resize-y" value={email.body} onChange={(event) => updateEmail(index, 'body', event.target.value)} />
            </label>
            <label className="block space-y-2 text-sm text-text-secondary">
              <span>Button text</span>
              <input className="hud-input w-full" value={email.cta} onChange={(event) => updateEmail(index, 'cta', event.target.value)} />
            </label>
          </article>
        ))}
      </section>

      <CampaignPublishingPanel
        campaignId={campaignId}
        content={content}
        disabled={saving || Boolean(regenerating)}
      />
    </div>
  )
}
