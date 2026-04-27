import type { IngestedUrlData } from './urlIngestion'

const KEY_BENEFIT_HINTS = [
  'save',
  'faster',
  'simple',
  'easy',
  'grow',
  'increase',
  'boost',
  'improve',
  'results',
  'automation',
  'conversion',
  'sales',
  'leads',
  'profit',
  'optimize',
  'tracking',
]

const NICHE_MATCHERS: Array<{ niche: string; pattern: RegExp }> = [
  { niche: 'SaaS', pattern: /saas|software|platform|tool|dashboard|automation/i },
  { niche: 'AI Tools', pattern: /ai |artificial intelligence|prompt|llm|automation/i },
  { niche: 'Affiliate Marketing', pattern: /affiliate|commission|offer|funnel|conversion/i },
  { niche: 'Ecommerce', pattern: /ecommerce|shopify|store|dropshipping|product catalog/i },
  { niche: 'Coaching', pattern: /coach|coaching|mentor|consulting|session/i },
  { niche: 'Education', pattern: /course|training|academy|lesson|workshop|learn/i },
  { niche: 'Health & Wellness', pattern: /health|fitness|wellness|nutrition|weight/i },
  { niche: 'Finance', pattern: /finance|invest|trading|budget|tax|money/i },
]

export interface OfferSignalHints {
  nicheHint?: string
  audienceHint?: string
}

export interface OfferSignals {
  productName: string
  niche: string
  audience: string
  offerSummary: string
  keyBenefits: string[]
  sourceUrl: string
  sourceHost: string
  sourceTitle: string
  sourceDescription: string
  sourceHeadings: string[]
}

function normalizeWhitespace(value: string): string {
  return value.replace(/\s+/g, ' ').trim()
}

function inferProductName(ingested: IngestedUrlData): string {
  const title = normalizeWhitespace(ingested.title)

  if (title.length > 0) {
    const [candidate] = title.split(/\s[-|:]\s|\| |- |: /)
    if (candidate && candidate.trim().length > 2) {
      return candidate.trim().slice(0, 80)
    }

    return title.slice(0, 80)
  }

  const hostLabel = ingested.host.replace(/^www\./, '').split('.')[0]
  if (hostLabel.length > 0) {
    return hostLabel
      .split(/[-_]/)
      .filter(Boolean)
      .map((piece) => piece[0].toUpperCase() + piece.slice(1))
      .join(' ')
      .slice(0, 80)
  }

  return 'Untitled Offer'
}

function inferNiche(ingested: IngestedUrlData, hint?: string): string {
  if (hint && hint.trim().length > 0) {
    return hint.trim().slice(0, 60)
  }

  const corpus = `${ingested.title} ${ingested.description} ${ingested.headings.join(' ')} ${ingested.contentText.slice(0, 1500)}`

  for (const matcher of NICHE_MATCHERS) {
    if (matcher.pattern.test(corpus)) {
      return matcher.niche
    }
  }

  return 'Affiliate Marketing'
}

function inferAudience(ingested: IngestedUrlData, hint?: string): string {
  if (hint && hint.trim().length > 0) {
    return hint.trim().slice(0, 120)
  }

  const corpus = `${ingested.title} ${ingested.description} ${ingested.headings.join(' ')} ${ingested.contentText.slice(0, 1500)}`.toLowerCase()

  if (/(founder|startup|small business|entrepreneur)/.test(corpus)) {
    return 'Founders and lean operators who need faster execution'
  }

  if (/(marketer|affiliate|traffic|conversion|campaign)/.test(corpus)) {
    return 'Marketers who want predictable conversion lift'
  }

  if (/(creator|coach|consultant|agency)/.test(corpus)) {
    return 'Creators and service operators selling offers online'
  }

  if (/(student|beginner|new to|first time)/.test(corpus)) {
    return 'Beginners looking for a simple, guided starting point'
  }

  return 'People comparing practical solutions before buying'
}

function sentenceRanker(text: string): string[] {
  return text
    .split(/(?<=[.!?])\s+/)
    .map((line) => normalizeWhitespace(line))
    .filter((line) => line.length >= 28 && line.length <= 180)
}

function inferSummary(ingested: IngestedUrlData, productName: string): string {
  const firstStrongSentence = sentenceRanker(`${ingested.description}. ${ingested.contentText}`)[0]
  if (firstStrongSentence) return firstStrongSentence

  if (ingested.description.trim().length > 0) {
    return normalizeWhitespace(ingested.description).slice(0, 220)
  }

  if (ingested.title.trim().length > 0) {
    return `${productName} helps users get better outcomes with a clearer workflow.`
  }

  return 'The offer presents a direct path to better outcomes for a targeted audience.'
}

function inferBenefits(ingested: IngestedUrlData, fallbackSummary: string): string[] {
  const candidateLines = [
    ...ingested.headings,
    ...sentenceRanker(`${ingested.description}. ${ingested.contentText}`),
  ]

  const ranked = candidateLines
    .map((line) => ({
      line: normalizeWhitespace(line),
      score: KEY_BENEFIT_HINTS.reduce((score, token) => (line.toLowerCase().includes(token) ? score + 1 : score), 0),
    }))
    .filter((item) => item.line.length >= 12)
    .sort((a, b) => b.score - a.score || a.line.length - b.line.length)

  const selected: string[] = []

  for (const candidate of ranked) {
    const normalized = candidate.line
    if (!selected.some((existing) => existing.toLowerCase() === normalized.toLowerCase())) {
      selected.push(normalized)
    }
    if (selected.length >= 4) break
  }

  if (selected.length === 0) {
    selected.push(fallbackSummary)
  }

  return selected.slice(0, 4)
}

export function extractOfferSignals(ingested: IngestedUrlData, hints: OfferSignalHints = {}): OfferSignals {
  const productName = inferProductName(ingested)
  const niche = inferNiche(ingested, hints.nicheHint)
  const audience = inferAudience(ingested, hints.audienceHint)
  const offerSummary = inferSummary(ingested, productName)
  const keyBenefits = inferBenefits(ingested, offerSummary)

  return {
    productName,
    niche,
    audience,
    offerSummary,
    keyBenefits,
    sourceUrl: ingested.normalizedUrl,
    sourceHost: ingested.host,
    sourceTitle: ingested.title,
    sourceDescription: ingested.description,
    sourceHeadings: ingested.headings,
  }
}
