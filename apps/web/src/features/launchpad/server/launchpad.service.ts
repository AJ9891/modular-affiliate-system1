import type { User } from '@supabase/supabase-js'
import { z } from 'zod'
import { ValidationError, HttpError } from '@/lib/http'
import { createServiceRoleClient } from '@/lib/supabase-server'
import { checkUserCanPerform, incrementUserUsage } from '@/lib/plan-manager'
import { AI_MODELS, openai } from '@/lib/openai'
import { emailService } from '@/lib/email/service'
import type { AutomationSequence } from '@/lib/email/types'
import { canCreateLaunchpad } from '@/features/launchpad/domain/launchpad.rules'
import { CURRENT_WORKFLOW_VERSION } from '@/features/launchpad/domain/launchpad.constants'
import { createLogger } from '@/lib/observability/logger'

const launchpadLogger = createLogger('launchpad')

type BrandModeKey = 'rocket' | 'antiguru' | 'meltdown'
type Tone = 'professional' | 'casual' | 'urgent' | 'friendly'

type Benefit = {
  title: string
  description: string
}

type FunnelAsset = {
  name: string
  slugBase: string
  landing: {
    headline: string
    subheadline: string
    cta: string
    benefits: Benefit[]
  }
  blocks: Array<Record<string, unknown>>
}

type LeadMagnetAsset = {
  title: string
  description: string
  fileName: string
  markdown: string
}

type EmailAsset = {
  subject: string
  preview: string
  body: string
  cta: string
  delay: number
}

type SavedFunnel = {
  funnel_id: string
  slug: string
  name: string
}

type SavedDownload = {
  id: string
  storage_url: string
}

type LaunchpadVariant = {
  id: string
  name: string
  changes: Record<string, string>
}

const brandModeSchema = z.enum(['rocket', 'antiguru', 'meltdown']).default('rocket')
const toneSchema = z.enum(['professional', 'casual', 'urgent', 'friendly']).default('professional')

const launchpadInputSchema = z.object({
  productName: z.string().trim().min(1).max(140),
  niche: z.string().trim().min(1).max(120),
  audience: z.string().trim().min(1).max(180),
  campaignName: z.string().trim().min(1).max(160).optional(),
  offerSummary: z.string().trim().min(1).max(1200).optional(),
  sourceUrl: z.string().trim().url().optional(),
  keyBenefits: z.array(z.string().trim().min(1).max(240)).max(6).optional(),
  brandMode: brandModeSchema.optional(),
  tone: toneSchema.optional(),
  leadMagnetTitle: z.string().trim().min(1).max(160).optional(),
})

export type LaunchpadInput = z.infer<typeof launchpadInputSchema>

const BRAND_PROFILES: Record<BrandModeKey, { voice: string; prompt: string }> = {
  rocket: {
    voice: 'encouraging, direct, momentum-focused',
    prompt: 'Write with clear momentum and grounded optimism. Avoid hype and impossible claims.',
  },
  antiguru: {
    voice: 'direct, anti-hype, transparent',
    prompt: 'Write plainly and call out marketing friction without sarcasm or exaggerated promises.',
  },
  meltdown: {
    voice: 'witty, skeptical, still useful',
    prompt: 'Use light AI-skeptical humor while staying helpful, compliant, and clear.',
  },
}

function parseLaunchpadInput(body: unknown): LaunchpadInput {
  const parsed = launchpadInputSchema.safeParse(body)
  if (!parsed.success) {
    throw new ValidationError('Invalid launchpad payload', parsed.error.format())
  }
  return parsed.data
}

function slugify(value: string): string {
  const slug = value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

  return slug || `launchpad-${Date.now()}`
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function text(value: unknown, fallback: string): string {
  return typeof value === 'string' && value.trim().length > 0 ? value.trim() : fallback
}

function normalizeBenefits(value: unknown, fallback: Benefit[]): Benefit[] {
  if (!Array.isArray(value)) return fallback

  const benefits = value.flatMap((item): Benefit[] => {
    if (typeof item === 'string' && item.trim()) {
      return [{ title: item.trim().slice(0, 72), description: item.trim() }]
    }

    if (!isRecord(item)) return []

    const title = text(item.title, 'Key benefit')
    return [{ title, description: text(item.description, title) }]
  })

  return benefits.length > 0 ? benefits.slice(0, 3) : fallback
}

function normalizeEmails(value: unknown, fallback: EmailAsset[]): EmailAsset[] {
  if (!Array.isArray(value)) return fallback

  const emails = value.flatMap((item, index): EmailAsset[] => {
    if (!isRecord(item)) return []

    return [
      {
        subject: text(item.subject, fallback[index]?.subject || 'A quick note before you decide'),
        preview: text(item.preview, fallback[index]?.preview || 'A practical next step for your workflow.'),
        body: text(item.body, fallback[index]?.body || 'Here is the shortest path to understand the offer.'),
        cta: text(item.cta, fallback[index]?.cta || 'Review the details'),
        delay: typeof item.delay === 'number' && item.delay >= 0 ? item.delay : fallback[index]?.delay || index,
      },
    ]
  })

  return emails.length > 0 ? emails.slice(0, 5) : fallback
}

async function ensureUserRow(userId: string, email?: string | null) {
  const admin = createServiceRoleClient()
  const { data: existing } = await admin.from('users').select('id').eq('id', userId).maybeSingle()

  if (existing) return

  const now = new Date().toISOString()
  const { error } = await admin.from('users').insert({
    id: userId,
    email: email || `${userId}@placeholder.local`,
    created_at: now,
    updated_at: now,
  })

  if (error) {
    throw new Error(`Failed to initialize user profile: ${error.message}`)
  }
}

async function checkPlanLimit(userId: string) {
  const [canCreateFunnel, canUseAI, canCreateEmailSequence] = await Promise.all([
    checkUserCanPerform(userId, 'maxFunnels'),
    checkUserCanPerform(userId, 'maxAIGenerationsPerMonth'),
    checkUserCanPerform(userId, 'maxEmailSequences'),
  ])

  if (!canCreateFunnel) {
    throw new HttpError('Plan limit reached for funnels', 402)
  }

  if (!canUseAI) {
    throw new HttpError('Plan limit reached for AI generations', 402)
  }

  if (!canCreateEmailSequence) {
    throw new HttpError('Plan limit reached for email sequences', 402)
  }
}

async function assertLaunchpadCapacity(userId: string) {
  const admin = createServiceRoleClient()
  const [{ data: user, error: userError }, { count, error: countError }] = await Promise.all([
    admin.from('users').select('max_launchpads').eq('id', userId).single(),
    admin
      .from('launchpads')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId)
      .is('deleted_at', null)
      .neq('status', 'archived'),
  ])

  if (userError) {
    throw new Error(`Unable to load launchpad capacity: ${userError.message}`)
  }

  if (countError) {
    throw new Error(`Unable to count active launchpads: ${countError.message}`)
  }

  if (!canCreateLaunchpad({
    activeCount: count ?? 0,
    maxLaunchpads: user.max_launchpads ?? 0,
  })) {
    throw new HttpError('Launchpad capacity reached for this plan', 402)
  }
}

async function saveLaunchpadRecord(
  userId: string,
  input: LaunchpadInput,
  funnelId: string
) {
  const admin = createServiceRoleClient()
  const { data, error } = await admin
    .from('launchpads')
    .insert({
      user_id: userId,
      name: input.campaignName || `${input.productName} Launchpad`,
      niche: input.niche,
      campaign_name: input.campaignName || null,
      funnel_id: funnelId,
      status: 'draft',
      workflow_version: CURRENT_WORKFLOW_VERSION,
    })
    .select('id')
    .single()

  if (error) {
    if (error.message.toLowerCase().includes('capacity')) {
      throw new HttpError('Launchpad capacity reached for this plan', 402)
    }
    throw new Error(`Unable to save launchpad: ${error.message}`)
  }

  return data.id as string
}

function getBrandProfile(brandMode: BrandModeKey = 'rocket') {
  return BRAND_PROFILES[brandMode]
}

function buildFallbackFunnel(input: LaunchpadInput): FunnelAsset {
  const benefits = (input.keyBenefits && input.keyBenefits.length > 0 ? input.keyBenefits : [
    `A clearer path for ${input.audience}`,
    `Practical next steps in ${input.niche}`,
    `A low-friction way to evaluate ${input.productName}`,
  ]).slice(0, 3)

  const normalizedBenefits = benefits.map((benefit) => ({
    title: benefit.slice(0, 72),
    description: benefit,
  }))

  const headline = `${input.productName} for ${input.audience}`
  const subheadline = input.offerSummary || `A focused ${input.niche} funnel built to turn interested visitors into qualified leads.`
  const cta = 'Get the guide'

  return {
    name: input.campaignName || `${input.productName} Launchpad`,
    slugBase: slugify(input.campaignName || input.productName),
    landing: {
      headline,
      subheadline,
      cta,
      benefits: normalizedBenefits,
    },
    blocks: [
      {
        id: 'hero',
        type: 'hero',
        content: { headline, subheadline, cta },
      },
      {
        id: 'benefits',
        type: 'benefits',
        content: {
          title: `Why ${input.productName}`,
          items: normalizedBenefits,
        },
      },
      {
        id: 'lead-magnet',
        type: 'download',
        content: {
          headline: input.leadMagnetTitle || `${input.productName} Quickstart`,
          description: 'Get the practical checklist before choosing your next step.',
          button_text: cta,
        },
      },
      {
        id: 'cta',
        type: 'cta',
        content: {
          headline: 'Ready to move forward?',
          button_text: cta,
        },
      },
    ],
  }
}

function buildFallbackLeadMagnet(input: LaunchpadInput): LeadMagnetAsset {
  const title = input.leadMagnetTitle || `${input.productName} Quickstart Checklist`
  const benefits = input.keyBenefits?.length ? input.keyBenefits : [
    `Clarify whether ${input.productName} fits your current goal.`,
    `Identify the fastest useful next step for ${input.audience}.`,
    `Avoid common friction before taking action.`,
  ]

  const markdown = [
    `# ${title}`,
    '',
    input.offerSummary || `Use this short checklist to evaluate ${input.productName} for ${input.audience}.`,
    '',
    '## Quick Checks',
    ...benefits.slice(0, 5).map((benefit) => `- ${benefit}`),
    '',
    '## Next Step',
    `If this matches your ${input.niche} goal, return to the funnel and continue with the recommended action.`,
    '',
  ].join('\n')

  return {
    title,
    description: `A practical lead magnet for ${input.productName}.`,
    fileName: `${slugify(title)}.md`,
    markdown,
  }
}

function buildFallbackEmails(input: LaunchpadInput): EmailAsset[] {
  return [
    {
      subject: `${input.productName}: start here`,
      preview: 'A quick orientation before you make a decision.',
      body: `${input.offerSummary || `${input.productName} may help ${input.audience} make progress in ${input.niche}.`}\n\nStart by reviewing the checklist and matching it to your current priority.`,
      cta: 'Read the checklist',
      delay: 0,
    },
    {
      subject: `What to compare before choosing ${input.productName}`,
      preview: 'Use this simple filter before you move forward.',
      body: `The strongest fit is usually clear when the offer solves a specific friction point for ${input.audience}. Look for clarity, support, and a realistic next step.`,
      cta: 'Review the fit',
      delay: 1,
    },
    {
      subject: `Final check on ${input.productName}`,
      preview: 'A calm yes/no framework for your next step.',
      body: `If ${input.productName} lines up with your current ${input.niche} goal, take the next step. If not, keep the checklist and revisit when the timing is better.`,
      cta: 'See the next step',
      delay: 3,
    },
  ]
}

async function generateJson<T>(params: {
  system: string
  prompt: string
  fallback: T
  normalize: (raw: unknown, fallback: T) => T
}): Promise<T> {
  if (!openai) return params.fallback

  try {
    const completion = await openai.chat.completions.create({
      model: AI_MODELS.GPT35,
      messages: [
        { role: 'system', content: params.system },
        { role: 'user', content: params.prompt },
      ],
      temperature: 0.7,
      max_tokens: 1400,
      response_format: { type: 'json_object' },
    })

    const raw = completion.choices[0]?.message?.content
    if (!raw) return params.fallback

    return params.normalize(JSON.parse(raw), params.fallback)
  } catch (error) {
    console.warn('Launchpad AI generation fell back:', error)
    return params.fallback
  }
}

async function generateFunnel(input: LaunchpadInput, brand: { prompt: string; voice: string }): Promise<FunnelAsset> {
  const fallback = buildFallbackFunnel(input)

  return generateJson({
    fallback,
    system: `You create compliant affiliate launch funnels. ${brand.prompt}`,
    prompt: `Create landing-page funnel content.

Product: ${input.productName}
Campaign: ${input.campaignName || input.productName}
Niche: ${input.niche}
Audience: ${input.audience}
Offer summary: ${input.offerSummary || 'Not provided'}
Key benefits: ${(input.keyBenefits || []).join(' | ') || 'Not provided'}
Tone: ${input.tone || 'professional'}
Brand voice: ${brand.voice}

Return strict JSON:
{
  "name": "string",
  "slugBase": "string",
  "landing": {
    "headline": "string",
    "subheadline": "string",
    "cta": "string",
    "benefits": [{ "title": "string", "description": "string" }]
  }
}`,
    normalize(raw, sourceFallback) {
      if (!isRecord(raw)) return sourceFallback
      const landingRaw = isRecord(raw.landing) ? raw.landing : {}
      const landing = {
        headline: text(landingRaw.headline, sourceFallback.landing.headline),
        subheadline: text(landingRaw.subheadline, sourceFallback.landing.subheadline),
        cta: text(landingRaw.cta, sourceFallback.landing.cta),
        benefits: normalizeBenefits(landingRaw.benefits, sourceFallback.landing.benefits),
      }

      const normalized: FunnelAsset = {
        ...sourceFallback,
        name: text(raw.name, sourceFallback.name),
        slugBase: slugify(text(raw.slugBase, sourceFallback.slugBase)),
        landing,
      }

      return {
        ...normalized,
        blocks: buildFallbackFunnel({
          ...input,
          campaignName: normalized.name,
          leadMagnetTitle: input.leadMagnetTitle,
        }).blocks.map((block) => {
          if (block.id === 'hero') return { ...block, content: { headline: landing.headline, subheadline: landing.subheadline, cta: landing.cta } }
          if (block.id === 'benefits') return { ...block, content: { title: `Why ${input.productName}`, items: landing.benefits } }
          if (block.id === 'cta') return { ...block, content: { headline: 'Ready to move forward?', button_text: landing.cta } }
          return block
        }),
      }
    },
  })
}

async function generateLeadMagnet(input: LaunchpadInput, brand: { prompt: string; voice: string }): Promise<LeadMagnetAsset> {
  const fallback = buildFallbackLeadMagnet(input)

  return generateJson({
    fallback,
    system: `You write useful lead magnets for affiliate funnels. ${brand.prompt}`,
    prompt: `Create a concise markdown lead magnet.

Product: ${input.productName}
Niche: ${input.niche}
Audience: ${input.audience}
Offer summary: ${input.offerSummary || 'Not provided'}
Requested title: ${input.leadMagnetTitle || 'Not provided'}
Brand voice: ${brand.voice}

Return strict JSON:
{
  "title": "string",
  "description": "string",
  "markdown": "markdown string"
}`,
    normalize(raw, sourceFallback) {
      if (!isRecord(raw)) return sourceFallback
      const title = text(raw.title, sourceFallback.title)
      return {
        title,
        description: text(raw.description, sourceFallback.description),
        fileName: `${slugify(title)}.md`,
        markdown: text(raw.markdown, sourceFallback.markdown),
      }
    },
  })
}

async function generateEmailSequence(input: LaunchpadInput, brand: { prompt: string; voice: string }): Promise<EmailAsset[]> {
  const fallback = buildFallbackEmails(input)

  return generateJson({
    fallback,
    system: `You write compliant email follow-up sequences. ${brand.prompt}`,
    prompt: `Create a 3-email follow-up sequence for a lead magnet signup.

Product: ${input.productName}
Niche: ${input.niche}
Audience: ${input.audience}
Offer summary: ${input.offerSummary || 'Not provided'}
Tone: ${input.tone || 'professional'}
Brand voice: ${brand.voice}

Return strict JSON:
{
  "emails": [
    { "subject": "string", "preview": "string", "body": "string", "cta": "string", "delay": 0 }
  ]
}`,
    normalize(raw, sourceFallback) {
      if (!isRecord(raw)) return sourceFallback
      return normalizeEmails(raw.emails, sourceFallback)
    },
  })
}

async function resolveUniqueSlug(userId: string, baseSlug: string): Promise<string> {
  const admin = createServiceRoleClient()
  let candidate = baseSlug
  let counter = 1

  while (true) {
    const { data } = await admin
      .from('funnels')
      .select('funnel_id')
      .eq('user_id', userId)
      .eq('slug', candidate)
      .maybeSingle()

    if (!data) return candidate

    candidate = `${baseSlug}-${counter}`
    counter += 1
  }
}

async function saveFunnel(userId: string, input: LaunchpadInput, funnel: FunnelAsset): Promise<SavedFunnel> {
  const admin = createServiceRoleClient()
  const now = new Date().toISOString()
  const slug = await resolveUniqueSlug(userId, funnel.slugBase)

  const { data, error } = await admin
    .from('funnels')
    .insert({
      user_id: userId,
      name: funnel.name,
      slug,
      blocks: {
        template: 'launchpad',
        niche: input.niche,
        productName: input.productName,
        audience: input.audience,
        sourceUrl: input.sourceUrl || null,
        generatedAt: now,
        blocks: funnel.blocks,
      },
      active: true,
      status: 'draft',
      niche_id: null,
      team_id: null,
      brand_mode: input.brandMode || 'rocket',
      created_at: now,
      updated_at: now,
    })
    .select('funnel_id, slug, name')
    .single()

  if (error || !data) {
    throw new Error(`Failed to save funnel: ${error?.message || 'No data returned'}`)
  }

  await incrementUserUsage(userId, 'funnel_creation')
  return data as SavedFunnel
}

async function saveLeadMagnet(userId: string, funnelId: string, leadMagnet: LeadMagnetAsset): Promise<SavedDownload> {
  const admin = createServiceRoleClient()
  const fileBody = Buffer.from(leadMagnet.markdown, 'utf8')
  const filePath = `${userId}/generated/${Date.now()}_${leadMagnet.fileName}`

  const { error: uploadError } = await admin.storage.from('downloads').upload(filePath, fileBody, {
    contentType: 'text/markdown; charset=utf-8',
    upsert: false,
  })

  if (uploadError) {
    throw new Error(`Failed to save lead magnet file: ${uploadError.message}`)
  }

  const {
    data: { publicUrl },
  } = admin.storage.from('downloads').getPublicUrl(filePath)

  const { data, error } = await admin
    .from('downloads')
    .insert({
      user_id: userId,
      title: leadMagnet.title,
      description: leadMagnet.description,
      file_name: leadMagnet.fileName,
      file_path: filePath,
      file_size: fileBody.byteLength,
      file_type: 'text/markdown',
      storage_url: publicUrl,
      download_count: 0,
      is_active: true,
      require_email: true,
    })
    .select('id, storage_url')
    .single()

  if (error || !data) {
    await admin.storage.from('downloads').remove([filePath])
    throw new Error(`Failed to save lead magnet metadata: ${error?.message || 'No data returned'}`)
  }

  const generationId = await createGenerationRecord(userId, funnelId)
  if (generationId) {
    await admin.from('generated_assets').insert({
      generation_id: generationId,
      asset_type: 'raw',
      content_json: {
        kind: 'lead_magnet',
        downloadId: data.id,
        title: leadMagnet.title,
        description: leadMagnet.description,
      },
      content_text: leadMagnet.markdown,
    })
  }

  return data as SavedDownload
}

async function createGenerationRecord(userId: string, funnelId: string): Promise<string | null> {
  const admin = createServiceRoleClient()
  const { data, error } = await admin
    .from('funnel_generations')
    .insert({
      user_id: userId,
      funnel_id: funnelId,
      source_url: `launchpad://${funnelId}`,
      status: 'completed',
      started_at: new Date().toISOString(),
      completed_at: new Date().toISOString(),
    })
    .select('id')
    .single()

  if (error || !data?.id) {
    console.warn('Unable to persist launchpad generation record:', error?.message)
    return null
  }

  return data.id as string
}

function emailHtml(email: EmailAsset): string {
  const body = email.body
    .split('\n')
    .filter((line) => line.trim().length > 0)
    .map((line) => `<p>${line.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</p>`)
    .join('')

  return `${body}<p><strong>${email.cta}</strong></p>`
}

async function createSendSharkSequence(
  userId: string,
  funnelId: string,
  emails: EmailAsset[]
): Promise<AutomationSequence> {
  return emailService.createAutomation({
    userId,
    name: `Launchpad follow-up: ${funnelId}`,
    trigger: 'signup',
    active: true,
    emails: emails.map((email, index) => ({
      delay: email.delay ?? index,
      template: {
        name: `Launchpad Email ${index + 1}`,
        subject: email.subject,
        preheader: email.preview,
        html: emailHtml(email),
        text: `${email.body}\n\n${email.cta}`,
      },
    })),
  })
}

async function createABVariants(userId: string, funnelId: string, funnel: FunnelAsset): Promise<LaunchpadVariant[]> {
  const canABTest = await checkUserCanPerform(userId, 'canABTest')
  if (!canABTest) return []

  const variants: LaunchpadVariant[] = [
    {
      id: 'control',
      name: 'Control',
      changes: {
        headline: funnel.landing.headline,
        cta: funnel.landing.cta,
      },
    },
    {
      id: 'benefit-led',
      name: 'Benefit-led headline',
      changes: {
        headline: funnel.landing.benefits[0]?.title || funnel.landing.headline,
        cta: funnel.landing.cta,
      },
    },
    {
      id: 'direct-cta',
      name: 'Direct CTA',
      changes: {
        headline: funnel.landing.headline,
        cta: 'Send me the guide',
      },
    },
  ]

  const admin = createServiceRoleClient()
  const { error } = await admin.from('ab_tests').insert({
    funnel_id: funnelId,
    user_id: userId,
    block_id: 'hero',
    test_name: 'Launchpad headline and CTA test',
    test_type: 'headline',
    variations: variants,
    traffic_split: {
      control: 34,
      'benefit-led': 33,
      'direct-cta': 33,
    },
    status: 'draft',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  })

  if (error) {
    console.warn('Unable to create launchpad A/B variants:', error.message)
    return []
  }

  return variants
}

export async function createLaunchpad(
  userId: string,
  input: LaunchpadInput,
  options: { userEmail?: string | null } = {}
) {
  launchpadLogger.info('launchpad.create.started', { userId })
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new HttpError('Supabase service role is required to create launchpads', 500)
  }

  await ensureUserRow(userId, options.userEmail)
  await checkPlanLimit(userId)
  await assertLaunchpadCapacity(userId)

  const brand = getBrandProfile(input.brandMode || 'rocket')

  const funnel = await generateFunnel(input, brand)
  const leadMagnet = await generateLeadMagnet(input, brand)
  const emails = await generateEmailSequence(input, brand)

  const savedFunnel = await saveFunnel(userId, input, funnel)
  const savedLeadMagnet = await saveLeadMagnet(userId, savedFunnel.funnel_id, leadMagnet)
  const emailSequence = await createSendSharkSequence(userId, savedFunnel.funnel_id, emails)

  if (openai) {
    await incrementUserUsage(userId, 'ai_generation')
  }

  const variants = await createABVariants(userId, savedFunnel.funnel_id, funnel)
  const launchpadId = await saveLaunchpadRecord(userId, input, savedFunnel.funnel_id)
  launchpadLogger.info('launchpad.create.completed', {
    userId,
    launchpadId,
    funnelId: savedFunnel.funnel_id,
  })

  return {
    launchpadId,
    funnelId: savedFunnel.funnel_id,
    publicUrl: `/f/${savedFunnel.slug}`,
    variants,
    leadMagnet: {
      id: savedLeadMagnet.id,
      url: `/api/downloads/${savedLeadMagnet.id}`,
      storageUrl: savedLeadMagnet.storage_url,
    },
    emailSequence: {
      id: emailSequence.id,
      name: emailSequence.name,
      emails: emailSequence.emails.length,
    },
  }
}

export async function createLaunchpadFromRequest(user: User, body: unknown) {
  const input = parseLaunchpadInput(body)
  return createLaunchpad(user.id, input, { userEmail: user.email })
}
