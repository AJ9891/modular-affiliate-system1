'use client'

import { FormEvent, useMemo, useState } from 'react'
import { Link2, Loader2, Wand2 } from 'lucide-react'

type Tone = 'professional' | 'casual' | 'urgent' | 'friendly'

export interface LinkIngestionPayload {
  url: string
  nicheHint?: string
  audienceHint?: string
  tone?: Tone
}

interface LinkIngestionFormProps {
  generating: boolean
  defaultValues?: Partial<LinkIngestionPayload>
  onGenerate: (payload: LinkIngestionPayload) => Promise<void>
}

const TONES: Tone[] = ['professional', 'casual', 'urgent', 'friendly']

export default function LinkIngestionForm({ generating, defaultValues, onGenerate }: LinkIngestionFormProps) {
  const [url, setUrl] = useState(defaultValues?.url || '')
  const [nicheHint, setNicheHint] = useState(defaultValues?.nicheHint || '')
  const [audienceHint, setAudienceHint] = useState(defaultValues?.audienceHint || '')
  const [tone, setTone] = useState<Tone>(defaultValues?.tone || 'professional')

  const canSubmit = useMemo(() => url.trim().length > 7 && !generating, [url, generating])

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!canSubmit) return

    await onGenerate({
      url: url.trim(),
      nicheHint: nicheHint.trim() || undefined,
      audienceHint: audienceHint.trim() || undefined,
      tone,
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <label className="block">
        <span className="mb-2 block text-xs uppercase tracking-system text-text-secondary">Affiliate / Offer URL</span>
        <div className="relative">
          <Link2 className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-text-secondary" />
          <input
            value={url}
            onChange={(event) => setUrl(event.target.value)}
            placeholder="https://example.com/offer"
            className="hud-input w-full pl-10"
            required
            inputMode="url"
            autoComplete="url"
          />
        </div>
      </label>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <label className="block">
          <span className="mb-2 block text-xs uppercase tracking-system text-text-secondary">Niche Hint (Optional)</span>
          <input
            value={nicheHint}
            onChange={(event) => setNicheHint(event.target.value)}
            placeholder="Affiliate marketing"
            className="hud-input w-full"
          />
        </label>

        <label className="block">
          <span className="mb-2 block text-xs uppercase tracking-system text-text-secondary">Audience Hint (Optional)</span>
          <input
            value={audienceHint}
            onChange={(event) => setAudienceHint(event.target.value)}
            placeholder="First-time affiliates"
            className="hud-input w-full"
          />
        </label>
      </div>

      <label className="block">
        <span className="mb-2 block text-xs uppercase tracking-system text-text-secondary">Tone</span>
        <select value={tone} onChange={(event) => setTone(event.target.value as Tone)} className="hud-select w-full">
          {TONES.map((option) => (
            <option key={option} value={option}>
              {option[0].toUpperCase() + option.slice(1)}
            </option>
          ))}
        </select>
      </label>

      <button type="submit" disabled={!canSubmit} className="hud-button-primary inline-flex w-full items-center justify-center gap-2 px-4 py-2">
        {generating ? (
          <>
            <Loader2 className="size-4 animate-spin" />
            Generating Funnel
          </>
        ) : (
          <>
            <Wand2 className="size-4" />
            Generate Funnel From Link
          </>
        )}
      </button>
    </form>
  )
}
