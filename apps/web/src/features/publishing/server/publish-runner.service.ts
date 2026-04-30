import type { SupabaseClient } from '@supabase/supabase-js'
import { createServiceRoleClient } from '@/lib/supabase-server'

export interface CreateScheduleInput {
  title: string
  runAt: string
  content: {
    type: 'article_and_funnel' | 'article_only' | 'funnel_only'
    payload: Record<string, unknown>
  }
  funnelId?: string
}

export interface CmsIntegrationInput {
  provider: string
  targetUrl: string
  authType?: 'none' | 'bearer' | 'basic' | 'header'
  authValue?: string
  config?: Record<string, unknown>
  isActive?: boolean
}

function assertValidRunAt(value: string): string {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    throw new Error('runAt must be a valid ISO date')
  }
  return date.toISOString()
}

function isRecoverableDatabaseError(issue: unknown): boolean {
  if (!issue || typeof issue !== 'object') return false
  const candidate = issue as { code?: string; message?: string }
  const code = candidate.code || ''
  const message = (candidate.message || '').toLowerCase()

  return (
    code === '42P01' ||
    code === 'PGRST205' ||
    message.includes('could not find the table') ||
    message.includes('schema cache')
  )
}

function buildPublishHeaders(integration: {
  auth_type?: string | null
  auth_value?: string | null
}) {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  }

  const authType = (integration.auth_type || 'none').toLowerCase()
  const authValue = integration.auth_value || ''

  if (authType === 'bearer' && authValue) {
    headers.Authorization = `Bearer ${authValue}`
  }

  if (authType === 'basic' && authValue) {
    headers.Authorization = `Basic ${Buffer.from(authValue).toString('base64')}`
  }

  if (authType === 'header' && authValue) {
    headers['X-Integration-Secret'] = authValue
  }

  return headers
}

export async function createScheduleForUser(
  supabase: SupabaseClient,
  userId: string,
  input: CreateScheduleInput
) {
  const title = input.title.trim()
  if (!title) throw new Error('title is required')

  const runAtIso = assertValidRunAt(input.runAt)

  const { data, error } = await supabase
    .from('content_schedule')
    .insert({
      user_id: userId,
      title,
      run_at: runAtIso,
      status: 'queued',
      content_type: input.content.type,
      content_payload: input.content.payload,
      funnel_id: input.funnelId || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .select('*')
    .single()

  if (error || !data) {
    throw new Error(error?.message || 'Failed to create schedule')
  }

  return data
}

export async function listSchedulesForUser(supabase: SupabaseClient, userId: string) {
  const { data, error } = await supabase
    .from('content_schedule')
    .select('*')
    .eq('user_id', userId)
    .order('run_at', { ascending: true })
    .limit(100)

  if (error) {
    throw new Error(error.message)
  }

  return data || []
}

export async function saveCmsIntegrationForUser(
  supabase: SupabaseClient,
  userId: string,
  input: CmsIntegrationInput
) {
  const provider = input.provider.trim()
  const targetUrl = input.targetUrl.trim()

  if (!provider) throw new Error('provider is required')
  if (!targetUrl) throw new Error('targetUrl is required')

  const { data, error } = await supabase
    .from('cms_integrations')
    .insert({
      user_id: userId,
      provider,
      target_url: targetUrl,
      auth_type: input.authType || 'none',
      auth_value: input.authValue || null,
      config: input.config || {},
      is_active: input.isActive ?? true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .select('*')
    .single()

  if (error || !data) {
    throw new Error(error?.message || 'Failed to save integration')
  }

  return data
}

export async function listCmsIntegrationsForUser(supabase: SupabaseClient, userId: string) {
  const { data, error } = await supabase
    .from('cms_integrations')
    .select('id,provider,target_url,auth_type,is_active,last_test_status,last_error,created_at,updated_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) {
    throw new Error(error.message)
  }

  return data || []
}

async function markScheduleStatus(
  admin: SupabaseClient,
  scheduleId: string,
  status: 'published' | 'failed',
  errorMessage?: string
) {
  const now = new Date().toISOString()
  await admin
    .from('content_schedule')
    .update({
      status,
      updated_at: now,
      published_at: status === 'published' ? now : null,
    })
    .eq('id', scheduleId)
  void errorMessage
}

export async function runDuePublishSchedules(limit = 25) {
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return {
      success: false,
      processed: 0,
      published: 0,
      failed: 0,
      message: 'SUPABASE_SERVICE_ROLE_KEY is required for publish runner',
    }
  }

  const admin = createServiceRoleClient()
  const nowIso = new Date().toISOString()

  const { data: schedules, error: scheduleError } = await admin
    .from('content_schedule')
    .select('*')
    .eq('status', 'queued')
    .lte('run_at', nowIso)
    .order('run_at', { ascending: true })
    .limit(limit)

  if (scheduleError) {
    if (isRecoverableDatabaseError(scheduleError)) {
      return { success: true, processed: 0, published: 0, failed: 0, message: 'No schedule tables found yet' }
    }
    throw new Error(scheduleError.message)
  }

  const queue = schedules || []
  let published = 0
  let failed = 0

  for (const schedule of queue) {
    const scheduleId = schedule.id as string
    const userId = schedule.user_id as string

    const { data: integration, error: integrationError } = await admin
      .from('cms_integrations')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (integrationError || !integration) {
      failed += 1
      await admin.from('publish_jobs').insert({
        user_id: userId,
        schedule_id: scheduleId,
        cms_integration_id: null,
        status: 'failed',
        attempt: 1,
        error_message: integrationError?.message || 'No active CMS integration found',
        created_at: new Date().toISOString(),
      })
      await markScheduleStatus(admin, scheduleId, 'failed', integrationError?.message || 'No active CMS integration found')
      continue
    }

    const publishPayload = {
      title: schedule.title,
      contentType: schedule.content_type,
      content: schedule.content_payload,
      scheduleId,
      userId,
      requestedAt: new Date().toISOString(),
    }

    try {
      const response = await fetch(String(integration.target_url), {
        method: 'POST',
        headers: buildPublishHeaders(integration),
        body: JSON.stringify(publishPayload),
      })

      const responseText = await response.text().catch(() => '')

      if (!response.ok) {
        failed += 1

        await admin.from('publish_jobs').insert({
          user_id: userId,
          schedule_id: scheduleId,
          cms_integration_id: integration.id,
          status: 'failed',
          attempt: 1,
          error_message: `Publish failed (${response.status}): ${responseText.slice(0, 500)}`,
          response_payload: { status: response.status, body: responseText.slice(0, 1000) },
          created_at: new Date().toISOString(),
        })

        await markScheduleStatus(admin, scheduleId, 'failed', `Publish failed (${response.status})`)
        continue
      }

      published += 1

      await admin.from('publish_jobs').insert({
        user_id: userId,
        schedule_id: scheduleId,
        cms_integration_id: integration.id,
        status: 'sent',
        attempt: 1,
        response_payload: { status: response.status, body: responseText.slice(0, 1000) },
        created_at: new Date().toISOString(),
        published_at: new Date().toISOString(),
      })

      await markScheduleStatus(admin, scheduleId, 'published')
    } catch (error) {
      failed += 1
      const message = error instanceof Error ? error.message : 'Unknown publish error'

      await admin.from('publish_jobs').insert({
        user_id: userId,
        schedule_id: scheduleId,
        cms_integration_id: integration.id,
        status: 'failed',
        attempt: 1,
        error_message: message,
        created_at: new Date().toISOString(),
      })

      await markScheduleStatus(admin, scheduleId, 'failed', message)
    }
  }

  return {
    success: true,
    processed: queue.length,
    published,
    failed,
  }
}
