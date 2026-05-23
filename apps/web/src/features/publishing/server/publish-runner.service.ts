import type { SupabaseClient } from '@supabase/supabase-js'
import { createServiceRoleClient } from '@/lib/supabase-server'

const DEFAULT_MAX_PUBLISH_ATTEMPTS = 3
const DEFAULT_RETRY_BASE_SECONDS = 300
const DEFAULT_RETRY_MAX_SECONDS = 6 * 60 * 60

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

function parsePositiveInt(raw: string | undefined, fallback: number): number {
  const parsed = Number(raw)
  if (!Number.isFinite(parsed) || parsed <= 0) return fallback
  return Math.floor(parsed)
}

const MAX_PUBLISH_ATTEMPTS = parsePositiveInt(
  process.env.PUBLISH_MAX_ATTEMPTS,
  DEFAULT_MAX_PUBLISH_ATTEMPTS
)

const RETRY_BASE_SECONDS = parsePositiveInt(
  process.env.PUBLISH_RETRY_BASE_SECONDS,
  DEFAULT_RETRY_BASE_SECONDS
)

const RETRY_MAX_SECONDS = parsePositiveInt(
  process.env.PUBLISH_RETRY_MAX_SECONDS,
  DEFAULT_RETRY_MAX_SECONDS
)

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

function computeBackoffSeconds(attempt: number): number {
  const exponent = Math.max(0, attempt - 1)
  const uncapped = RETRY_BASE_SECONDS * 2 ** exponent
  return Math.min(RETRY_MAX_SECONDS, uncapped)
}

function buildRetryState(attempt: number): {
  isTerminal: boolean
  retryAt: string | null
  backoffSeconds: number | null
} {
  if (attempt >= MAX_PUBLISH_ATTEMPTS) {
    return {
      isTerminal: true,
      retryAt: null,
      backoffSeconds: null,
    }
  }

  const backoffSeconds = computeBackoffSeconds(attempt)
  return {
    isTerminal: false,
    retryAt: new Date(Date.now() + backoffSeconds * 1000).toISOString(),
    backoffSeconds,
  }
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

async function rescheduleQueuedSchedule(admin: SupabaseClient, scheduleId: string, runAtIso: string) {
  await admin
    .from('content_schedule')
    .update({
      status: 'queued',
      run_at: runAtIso,
      updated_at: new Date().toISOString(),
      published_at: null,
    })
    .eq('id', scheduleId)
}

async function getNextPublishAttempt(admin: SupabaseClient, scheduleId: string): Promise<number> {
  const { data, error } = await admin
    .from('publish_jobs')
    .select('attempt')
    .eq('schedule_id', scheduleId)
    .order('attempt', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (error) {
    if (isRecoverableDatabaseError(error)) return 1
    throw new Error(error.message || 'Failed to resolve publish attempt')
  }

  const priorAttempt = Number((data as { attempt?: number } | null)?.attempt || 0)
  return priorAttempt + 1
}

async function insertPublishJob(
  admin: SupabaseClient,
  payload: {
    userId: string
    scheduleId: string
    integrationId: string | null
    status: 'sent' | 'failed'
    attempt: number
    errorMessage?: string
    responsePayload?: Record<string, unknown>
  }
) {
  await admin.from('publish_jobs').insert({
    user_id: payload.userId,
    schedule_id: payload.scheduleId,
    cms_integration_id: payload.integrationId,
    status: payload.status,
    attempt: payload.attempt,
    error_message: payload.errorMessage || null,
    response_payload: payload.responsePayload || null,
    created_at: new Date().toISOString(),
    ...(payload.status === 'sent' ? { published_at: new Date().toISOString() } : {}),
  })
}

export async function runDuePublishSchedules(limit = 25) {
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return {
      success: false,
      processed: 0,
      published: 0,
      failed: 0,
      retried: 0,
      deadLettered: 0,
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
      return {
        success: true,
        processed: 0,
        published: 0,
        failed: 0,
        retried: 0,
        deadLettered: 0,
        message: 'No schedule tables found yet'
      }
    }
    throw new Error(scheduleError.message)
  }

  const queue = schedules || []
  let published = 0
  let failed = 0
  let retried = 0
  let deadLettered = 0

  for (const schedule of queue) {
    const scheduleId = schedule.id as string
    const userId = schedule.user_id as string
    const attempt = await getNextPublishAttempt(admin, scheduleId)

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
      const message = integrationError?.message || 'No active CMS integration found'
      const retry = buildRetryState(attempt)

      await insertPublishJob(admin, {
        userId,
        scheduleId,
        integrationId: null,
        status: 'failed',
        attempt,
        errorMessage: message,
        responsePayload: {
          terminal: retry.isTerminal,
          retryAt: retry.retryAt,
          backoffSeconds: retry.backoffSeconds,
        },
      })

      if (retry.isTerminal) {
        deadLettered += 1
        await markScheduleStatus(admin, scheduleId, 'failed', message)
      } else if (retry.retryAt) {
        retried += 1
        await rescheduleQueuedSchedule(admin, scheduleId, retry.retryAt)
      }
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
        const message = `Publish failed (${response.status}): ${responseText.slice(0, 500)}`
        const retry = buildRetryState(attempt)

        await insertPublishJob(admin, {
          userId,
          scheduleId,
          integrationId: integration.id,
          status: 'failed',
          attempt,
          errorMessage: message,
          responsePayload: {
            status: response.status,
            body: responseText.slice(0, 1000),
            terminal: retry.isTerminal,
            retryAt: retry.retryAt,
            backoffSeconds: retry.backoffSeconds,
          },
        })

        if (retry.isTerminal) {
          deadLettered += 1
          await markScheduleStatus(admin, scheduleId, 'failed', `Publish failed (${response.status})`)
        } else if (retry.retryAt) {
          retried += 1
          await rescheduleQueuedSchedule(admin, scheduleId, retry.retryAt)
        }
        continue
      }

      published += 1

      await insertPublishJob(admin, {
        userId,
        scheduleId,
        integrationId: integration.id,
        status: 'sent',
        attempt,
        responsePayload: { status: response.status, body: responseText.slice(0, 1000) },
      })

      await markScheduleStatus(admin, scheduleId, 'published')
    } catch (error) {
      failed += 1
      const message = error instanceof Error ? error.message : 'Unknown publish error'
      const retry = buildRetryState(attempt)

      await insertPublishJob(admin, {
        userId,
        scheduleId,
        integrationId: integration.id,
        status: 'failed',
        attempt,
        errorMessage: message,
        responsePayload: {
          terminal: retry.isTerminal,
          retryAt: retry.retryAt,
          backoffSeconds: retry.backoffSeconds,
        },
      })

      if (retry.isTerminal) {
        deadLettered += 1
        await markScheduleStatus(admin, scheduleId, 'failed', message)
      } else if (retry.retryAt) {
        retried += 1
        await rescheduleQueuedSchedule(admin, scheduleId, retry.retryAt)
      }
    }
  }

  return {
    success: true,
    processed: queue.length,
    published,
    failed,
    retried,
    deadLettered,
  }
}
