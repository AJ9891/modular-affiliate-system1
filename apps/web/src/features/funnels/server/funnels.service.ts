import type { SupabaseClient, User } from '@supabase/supabase-js'
import { createServiceRoleClient } from '@/lib/supabase-server'
import { validateFunnel } from '@/lib/validators/funnels'
import { ValidationError } from '@/lib/http'
import { checkUserCanPerform, incrementUserUsage } from '@/lib/plan-manager'

function isRecoverableFunnelReadError(issue: unknown): boolean {
  if (!issue || typeof issue !== 'object') return false

  const candidate = issue as { code?: string; message?: string }
  const code = candidate.code || ''
  const message = (candidate.message || '').toLowerCase()

  return (
    code === '42501' ||
    code === 'PGRST205' ||
    code === '42P01' ||
    message.includes('permission denied') ||
    message.includes('could not find the table')
  )
}

function sanitizeData(obj: unknown): unknown {
  if (typeof obj === 'string') {
    return obj === 'new' ? 'custom' : obj
  }

  if (Array.isArray(obj)) {
    return obj.map(sanitizeData)
  }

  if (obj && typeof obj === 'object') {
    const sanitized: Record<string, unknown> = {}
    for (const [key, value] of Object.entries(obj)) {
      if (key === 'new') continue
      if (key === 'id' && typeof value === 'string' && (value === 'new' || value.includes('block-'))) {
        continue
      }
      sanitized[key] = sanitizeData(value)
    }
    return sanitized
  }

  return obj
}

export async function listFunnelsForUser(supabase: SupabaseClient, userId: string) {
  const reader = process.env.SUPABASE_SERVICE_ROLE_KEY ? createServiceRoleClient() : supabase
  const { data: funnels, error } = await reader
    .from('funnels')
    .select('*')
    .eq('user_id', userId)

  if (error) {
    if (isRecoverableFunnelReadError(error)) {
      console.warn('[FUNNELS API] Recoverable read error:', error)
      return []
    }
    throw error
  }

  return funnels || []
}

export async function createFunnelForUser(
  _supabase: SupabaseClient,
  user: User,
  body: unknown
) {
  const isDevelopment = process.env.NODE_ENV === 'development'
  const { name, template, niche, blocks, theme, slug } = validateFunnel(body)
  const adminClient = createServiceRoleClient()

  const canCreate = await checkUserCanPerform(user.id, 'maxFunnels')
  if (!canCreate) {
    const err = new Error('Plan limit reached for funnels')
    ;(err as Error & { status?: number }).status = 402
    throw err
  }

  const { data: existingUser } = await adminClient
    .from('users')
    .select('id')
    .eq('id', user.id)
    .single()

  if (!existingUser) {
    const { error: userCreateError } = await adminClient
      .from('users')
      .insert({
        id: user.id,
        email: user.email || '',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })

    if (userCreateError) {
      console.error('[FUNNELS API] Error creating user:', userCreateError)
    }
  }

  const sanitizedBlocks = sanitizeData(blocks) as Array<Record<string, unknown>>
  const sanitizedTheme = sanitizeData(theme) || {
    primaryColor: '#667eea',
    secondaryColor: '#764ba2',
    fontFamily: 'Inter',
  }

  const blocksData = {
    template: sanitizeData(template) || 'custom',
    niche: sanitizeData(niche) || 'general',
    theme: sanitizedTheme,
    blocks: sanitizedBlocks,
  }

  let baseSlug =
    (sanitizeData(slug) as string | undefined) ||
    name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') ||
    `funnel-${Date.now()}`

  if (baseSlug.includes('new')) {
    baseSlug = baseSlug.replace(/new/g, 'custom')
  }

  let uniqueSlug = baseSlug
  let counter = 1
  let slugExists = true

  while (slugExists) {
    const { data: existingFunnel } = await adminClient
      .from('funnels')
      .select('slug')
      .eq('user_id', user.id)
      .eq('slug', uniqueSlug)
      .single()

    if (!existingFunnel) {
      slugExists = false
    } else {
      uniqueSlug = `${baseSlug}-${counter}`
      counter += 1
    }
  }

  const insertData = {
    user_id: user.id,
    name: name.trim(),
    slug: uniqueSlug,
    blocks: blocksData,
    active: true,
    niche_id: null,
    status: 'draft',
    team_id: null,
    brand_mode: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }

  const insertDataStr = JSON.stringify(insertData)
  if (insertDataStr.includes('"new"')) {
    throw new ValidationError('Data validation failed: Invalid values detected')
  }

  const { data, error } = await adminClient
    .from('funnels')
    .insert(insertData)
    .select('funnel_id, user_id, name, slug, blocks, active, created_at, updated_at')

  if (error) {
    let userMessage = 'Failed to save funnel'
    if (error.message.includes('duplicate')) userMessage = 'A funnel with this name already exists'
    else if (error.message.includes('constraint')) userMessage = 'Invalid funnel data - please check all fields'
    else if (error.message.includes('permission')) userMessage = 'Permission denied - please try logging out and back in'

    if (isDevelopment) {
      console.error('[FUNNELS API] Database insertion error:', error)
    }

    const err = new Error(userMessage)
    ;(err as Error & { status?: number }).status = 400
    throw err
  }

  if (!data || data.length === 0) {
    const err = new Error('Failed to create funnel - no data returned')
    ;(err as Error & { status?: number }).status = 400
    throw err
  }

  await incrementUserUsage(user.id, 'funnel_creation')
  return data[0]
}
