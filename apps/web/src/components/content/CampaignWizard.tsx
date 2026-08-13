'use client'

import { useMemo, useState } from 'react'
import {
  buildCampaign as requestCampaignBuild,
  lookupGoogleKeywords,
  type CampaignBuildResponse,
  type GeneratedContentPayload,
} from '@/lib/api/content-automation'

type CampaignGoal = 'sales' | 'leads' | 'traffic' | 'promotion'
type BrandStyle = 'boost' | 'anchor' | 'glitch'
type WizardStep = 1 | 2 | 3 | 4 | 5 | 6

const STEP_LABELS = ['Product', 'Goal', 'Keyword', 'Style', 'Build', 'Review'] as const

const GOALS: Array<{ id: CampaignGoal; title: string; description: string }> = [
  { id: 'sales', title: 'Make sales', description: 'Build a direct product-focused campaign.' },
  { id: 'leads', title: 'Collect email leads', description: 'Lead with value and an email signup.' },
  { id: 'traffic', title: 'Get website visitors', description: 'Create content designed to earn clicks.' },
  { id: 'promotion', title: 'Promote a product', description: 'Explain the offer and why it matters.' },
]

const STYLES: Array<{ id: BrandStyle; title: string; description: string; sample: string }> = [
  {
    id: 'boost',
    title: 'Boost',
    description: 'Upbeat and encouraging',
    sample: 'You have the idea. Let’s turn it into a campaign people can act on.',
  },
  {
    id: 'anchor',
    title: 'Anchor',
    description: 'Direct and practical',
    sample: 'Clear offer. Useful proof. One next step. Nothing extra.',
  },
  {
    id: 'glitch',
    title: 'Glitch',
    description: 'Funny and sarcastic',
    sample: 'Another “effortless” system? Cute. Let’s build one that actually explains the offer.',
  },
]

const GOAL_AUDIENCES: Record<CampaignGoal, string> = {
  sales: 'People comparing options and ready to make a purchase',
  leads: 'Interested visitors willing to exchange their email for useful information',
  traffic: 'Searchers looking for practical answers and relevant resources',
  promotion: 'Potential customers who need to understand the product and its benefits',
}

const STYLE_TONES = {
  boost: 'friendly',
  anchor: 'professional',
  glitch: 'casual',
} as const

function normalizeOptionalUrl(value: string): string | undefined {
  const trimmed = value.trim()
  if (!trimmed) return undefined
  if (/^https?:\/\//i.test(trimmed)) return trimmed
  return `https://${trimmed}`
}

function choiceClass(selected: boolean): string {
  return [
    'rounded-xl border p-4 text-left transition',
    selected
      ? 'border-rocket-400 bg-rocket-500/10 ring-1 ring-rocket-400/40'
      : 'border-[var(--border-subtle)] bg-[rgba(10,16,24,0.55)] hover:border-rocket-500/35',
  ].join(' ')
}

export default function CampaignWizard() {
  const [step, setStep] = useState<WizardStep>(1)
  const [sourceUrl, setSourceUrl] = useState('')
  const [productDescription, setProductDescription] = useState('')
  const [goal, setGoal] = useState<CampaignGoal>('sales')
  const [keywordTopic, setKeywordTopic] = useState('')
  const [keyword, setKeyword] = useState('')
  const [keywordOptions, setKeywordOptions] = useState<string[]>([])
  const [style, setStyle] = useState<BrandStyle>('anchor')
  const [content, setContent] = useState<GeneratedContentPayload | null>(null)
  const [funnelId, setFunnelId] = useState<string | null>(null)
  const [warnings, setWarnings] = useState<string[]>([])
  const [ingestion, setIngestion] = useState<CampaignBuildResponse['ingestion'] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [keywordLoading, setKeywordLoading] = useState(false)
  const [building, setBuilding] = useState(false)

  const productSeed = productDescription.trim() || keywordTopic.trim()
  const canContinueProduct = Boolean(sourceUrl.trim() || productDescription.trim())
  const selectedStyle = STYLES.find((item) => item.id === style) || STYLES[1]
  const progress = Math.round((step / STEP_LABELS.length) * 100)

  const buildSummary = useMemo(
    () => [
      { label: 'Product source', value: sourceUrl.trim() || 'Your written description' },
      { label: 'Goal', value: GOALS.find((item) => item.id === goal)?.title || goal },
      { label: 'Keyword', value: keyword.trim() || productSeed || 'Not selected' },
      { label: 'Style', value: selectedStyle.title },
    ],
    [goal, keyword, productSeed, selectedStyle.title, sourceUrl]
  )

  function goNext() {
    setError(null)
    if (step === 1 && !canContinueProduct) {
      setError('Paste a public product link or describe what you are promoting.')
      return
    }
    if (step === 3 && !keyword.trim()) {
      setError('Choose a related search or enter your own keyword.')
      return
    }
    setStep((current) => Math.min(6, current + 1) as WizardStep)
  }

  function goBack() {
    setError(null)
    setStep((current) => Math.max(1, current - 1) as WizardStep)
  }

  async function findKeywords() {
    const query = keywordTopic.trim() || productDescription.trim()
    if (!query) {
      setError('Enter a short topic or product description first.')
      return
    }

    try {
      setKeywordLoading(true)
      setError(null)
      const result = await lookupGoogleKeywords({ query, locale: 'en-US' })
      const options = result.keywords.map((item) => item.keyword).filter(Boolean).slice(0, 6)
      setKeywordOptions(options)
      setKeyword((current) => current || options[0] || query)
    } catch (lookupError) {
      setError(lookupError instanceof Error ? lookupError.message : 'Related search lookup failed. You can enter a keyword manually.')
      setKeywordOptions([])
      setKeyword((current) => current || query)
    } finally {
      setKeywordLoading(false)
    }
  }

  async function buildCampaign() {
    const finalKeyword = keyword.trim() || productSeed
    if (!finalKeyword) {
      setError('Choose a keyword before building your campaign.')
      setStep(3)
      return
    }

    try {
      setBuilding(true)
      setError(null)
      setWarnings([])
      setIngestion(null)
      const response = await requestCampaignBuild({
        sourceUrl: normalizeOptionalUrl(sourceUrl),
        productDescription: productDescription.trim() || undefined,
        goal,
        keyword: finalKeyword,
        tone: STYLE_TONES[style],
      })
      setContent(response.content)
      setFunnelId(response.saved.funnelId)
      setWarnings(response.warnings || [])
      setIngestion(response.ingestion)
      setStep(6)
    } catch (buildError) {
      setError(buildError instanceof Error ? buildError.message : 'Campaign generation failed.')
    } finally {
      setBuilding(false)
    }
  }

  return (
    <main className="cockpit-shell py-8">
      <div className="cockpit-container max-w-5xl space-y-6">
        <section className="hud-panel space-y-4">
          <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-xs uppercase tracking-system text-text-secondary">Campaign Wizard</p>
              <h1 className="text-3xl font-semibold text-text-primary md:text-4xl">Build a complete campaign</h1>
              <p className="mt-2 text-sm text-text-secondary">Answer a few plain-language questions. Launchpad handles the technical pieces.</p>
            </div>
            <p className="text-sm text-text-secondary">Step {step} of {STEP_LABELS.length}</p>
          </div>

          <div className="h-2 overflow-hidden rounded-full bg-[rgba(255,255,255,0.08)]">
            <div className="h-full bg-rocket-400 transition-all" style={{ width: `${progress}%` }} />
          </div>

          <ol className="grid grid-cols-3 gap-2 text-xs md:grid-cols-6">
            {STEP_LABELS.map((label, index) => {
              const number = index + 1
              const active = number === step
              const complete = number < step
              return (
                <li
                  key={label}
                  className={`rounded-lg border px-2 py-2 text-center ${
                    active
                      ? 'border-rocket-400 text-rocket-300'
                      : complete
                        ? 'border-emerald-500/30 text-emerald-300'
                        : 'border-[var(--border-subtle)] text-text-secondary'
                  }`}
                >
                  {complete ? '✓ ' : ''}{label}
                </li>
              )
            })}
          </ol>
        </section>

        {error && (
          <section role="alert" className="rounded-lg border border-red-500/40 bg-red-500/10 p-4 text-red-200">
            {error}
          </section>
        )}

        {step === 1 && (
          <section className="hud-panel space-y-5">
            <div>
              <p className="text-xs uppercase tracking-system text-text-secondary">Step 1</p>
              <h2 className="text-2xl font-semibold text-text-primary">What are you promoting?</h2>
            </div>
            <label className="block space-y-2 text-sm font-medium text-text-secondary">
              <span>Product or website link</span>
              <input
                value={sourceUrl}
                onChange={(event) => setSourceUrl(event.target.value)}
                className="hud-input w-full"
                placeholder="example.com/product"
              />
              <span className="block text-xs font-normal">Launchpad adds https:// automatically when needed.</span>
            </label>
            <div className="flex items-center gap-3 text-xs uppercase tracking-system text-text-secondary">
              <span className="h-px flex-1 bg-[var(--border-subtle)]" />
              or
              <span className="h-px flex-1 bg-[var(--border-subtle)]" />
            </div>
            <label className="block space-y-2 text-sm font-medium text-text-secondary">
              <span>Describe your product</span>
              <textarea
                value={productDescription}
                onChange={(event) => setProductDescription(event.target.value)}
                className="hud-input min-h-28 w-full resize-y"
                placeholder="Example: Printable fantasy paint-by-number downloads for adults who enjoy relaxing creative projects."
              />
            </label>
          </section>
        )}

        {step === 2 && (
          <section className="hud-panel space-y-5">
            <div>
              <p className="text-xs uppercase tracking-system text-text-secondary">Step 2</p>
              <h2 className="text-2xl font-semibold text-text-primary">What should this campaign accomplish?</h2>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              {GOALS.map((item) => (
                <button key={item.id} type="button" className={choiceClass(goal === item.id)} onClick={() => setGoal(item.id)}>
                  <span className="block font-semibold text-text-primary">{item.title}</span>
                  <span className="mt-1 block text-sm text-text-secondary">{item.description}</span>
                </button>
              ))}
            </div>
          </section>
        )}

        {step === 3 && (
          <section className="hud-panel space-y-5">
            <div>
              <p className="text-xs uppercase tracking-system text-text-secondary">Step 3</p>
              <h2 className="text-2xl font-semibold text-text-primary">Choose a related search</h2>
              <p className="mt-1 text-sm text-text-secondary">These are Google autocomplete suggestions, not search-volume rankings.</p>
            </div>
            <div className="flex flex-col gap-3 md:flex-row">
              <input
                value={keywordTopic}
                onChange={(event) => setKeywordTopic(event.target.value)}
                className="hud-input flex-1"
                placeholder={productDescription.trim() || 'Enter a broad topic'}
              />
              <button type="button" className="hud-button-secondary px-4 py-2" onClick={findKeywords} disabled={keywordLoading}>
                {keywordLoading ? 'Finding searches...' : 'Find related searches'}
              </button>
            </div>
            {keywordOptions.length > 0 && (
              <div className="grid gap-2 md:grid-cols-2">
                {keywordOptions.map((option, index) => (
                  <button key={option} type="button" className={choiceClass(keyword === option)} onClick={() => setKeyword(option)}>
                    <span className="font-medium text-text-primary">{option}</span>
                    {index === 0 && <span className="ml-2 text-xs text-rocket-300">Recommended</span>}
                  </button>
                ))}
              </div>
            )}
            <label className="block space-y-2 text-sm font-medium text-text-secondary">
              <span>Selected keyword</span>
              <input
                value={keyword}
                onChange={(event) => setKeyword(event.target.value)}
                className="hud-input w-full"
                placeholder="Choose a suggestion or enter your own"
              />
            </label>
          </section>
        )}

        {step === 4 && (
          <section className="hud-panel space-y-5">
            <div>
              <p className="text-xs uppercase tracking-system text-text-secondary">Step 4</p>
              <h2 className="text-2xl font-semibold text-text-primary">How should your campaign sound?</h2>
            </div>
            <div className="grid gap-3 md:grid-cols-3">
              {STYLES.map((item) => (
                <button key={item.id} type="button" className={choiceClass(style === item.id)} onClick={() => setStyle(item.id)}>
                  <span className="block text-lg font-semibold text-text-primary">{item.title}</span>
                  <span className="mt-1 block text-sm text-rocket-300">{item.description}</span>
                  <span className="mt-3 block text-sm italic text-text-secondary">“{item.sample}”</span>
                </button>
              ))}
            </div>
          </section>
        )}

        {step === 5 && (
          <section className="hud-panel space-y-5">
            <div>
              <p className="text-xs uppercase tracking-system text-text-secondary">Step 5</p>
              <h2 className="text-2xl font-semibold text-text-primary">Ready to build</h2>
              <p className="mt-1 text-sm text-text-secondary">Review your choices before Launchpad creates and saves the funnel, article, and email sequence.</p>
            </div>
            <dl className="grid gap-3 md:grid-cols-2">
              {buildSummary.map((item) => (
                <div key={item.label} className="rounded-lg border border-[var(--border-subtle)] bg-[rgba(10,16,24,0.55)] p-4">
                  <dt className="text-xs uppercase tracking-system text-text-secondary">{item.label}</dt>
                  <dd className="mt-1 break-words text-sm text-text-primary">{item.value}</dd>
                </div>
              ))}
            </dl>
            <button type="button" className="hud-button-primary w-full px-5 py-3 text-base" onClick={buildCampaign} disabled={building}>
              {building ? 'Building your campaign...' : 'Build My Campaign'}
            </button>
            {building && (
              <p className="text-center text-sm text-text-secondary">
                Reading your product, creating the funnel, writing the article, and preparing emails…
              </p>
            )}
          </section>
        )}

        {step === 6 && (
          <section className="hud-panel space-y-5">
            <div>
              <p className="text-xs uppercase tracking-system text-text-secondary">Step 6</p>
              <h2 className="text-2xl font-semibold text-text-primary">{content ? 'Your campaign is ready' : 'Build your campaign first'}</h2>
            </div>

            {ingestion && (
              <div
                className={`rounded-lg border p-3 text-sm ${
                  ingestion.status === 'success' || ingestion.status === 'not_provided'
                    ? 'border-emerald-500/35 bg-emerald-500/10 text-emerald-200'
                    : 'border-amber-500/35 bg-amber-500/10 text-amber-200'
                }`}
              >
                <p className="font-medium">
                  {ingestion.status === 'success' ? '✓ Product page read' : ingestion.status === 'not_provided' ? '✓ Product description used' : 'Product page unavailable'}
                </p>
                <p className="mt-1">{ingestion.message}</p>
              </div>
            )}

            {warnings.length > 0 && (
              <div className="rounded-lg border border-amber-500/35 bg-amber-500/10 p-3 text-sm text-amber-200">
                {warnings.map((warning) => <p key={warning}>{warning}</p>)}
              </div>
            )}

            {content ? (
              <>
                <div className="grid gap-4 md:grid-cols-3">
                  <article className="rounded-xl border border-emerald-500/25 bg-emerald-500/5 p-4">
                    <p className="text-xs uppercase tracking-system text-emerald-300">✓ Funnel ready</p>
                    <h3 className="mt-2 font-semibold text-text-primary">{content.funnel.headline}</h3>
                    <p className="mt-2 text-sm text-text-secondary">{content.funnel.subheadline}</p>
                  </article>
                  <article className="rounded-xl border border-emerald-500/25 bg-emerald-500/5 p-4">
                    <p className="text-xs uppercase tracking-system text-emerald-300">✓ Article ready</p>
                    <h3 className="mt-2 font-semibold text-text-primary">{content.article.metaTitle}</h3>
                    <p className="mt-2 text-sm text-text-secondary">{content.article.metaDescription}</p>
                  </article>
                  <article className="rounded-xl border border-emerald-500/25 bg-emerald-500/5 p-4">
                    <p className="text-xs uppercase tracking-system text-emerald-300">✓ Emails ready</p>
                    <h3 className="mt-2 font-semibold text-text-primary">{content.emails.length} messages created</h3>
                    <p className="mt-2 text-sm text-text-secondary">{content.emails[0]?.subject || 'Email sequence prepared'}</p>
                  </article>
                </div>
                <div className="rounded-lg border border-[var(--border-subtle)] p-4 text-sm text-text-secondary">
                  Campaign saved as a draft{funnelId ? '.' : ', but the funnel could not be saved.'}
                </div>
                <button type="button" className="hud-button-secondary px-4 py-2" onClick={() => setStep(1)}>
                  Build another campaign
                </button>
              </>
            ) : (
              <button type="button" className="hud-button-primary px-4 py-2" onClick={() => setStep(5)}>
                Review and build
              </button>
            )}
          </section>
        )}

        <nav className="flex items-center justify-between gap-3" aria-label="Wizard navigation">
          <button type="button" className="hud-button-secondary px-4 py-2" onClick={goBack} disabled={step === 1 || building}>
            Back
          </button>
          {step < 5 && (
            <button type="button" className="hud-button-primary px-5 py-2" onClick={goNext}>
              Continue
            </button>
          )}
        </nav>
      </div>
    </main>
  )
}
