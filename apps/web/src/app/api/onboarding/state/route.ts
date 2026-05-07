import { type NextRequest, NextResponse } from 'next/server'
import { createServerRouteClient } from '@/lib/supabase-server'
import { AuthError, requireUser } from '@/lib/authz'
import {
  ONBOARDING_COMPLETE_STEP,
  MIN_LAUNCHPAD_STEP,
  clampPreflightStep,
  createDefaultPreflightState,
  defaultPreflightChecklist,
  isOnboardingIntent,
  sanitizeCampaignName,
  type OnboardingIntent,
  type PreflightChecklist,
  type PreflightState,
} from '@/lib/onboarding/preflight'

export const dynamic = 'force-dynamic'

type UsersRow = {
  onboarding_seen: boolean | null
  onboarding_step: number | null
  onboarding_complete: boolean | null
  launchpad_stage: number | null
}

type OnboardingProgressRow = {
  intent: string | null
  campaign_name: string | null
  checklist: unknown
  current_step: number | null
  completed: boolean | null
  updated_at: string | null
}

function isMissingTableError(error: { code?: string; message?: string } | null): boolean {
  if (!error) return false
  return error.code === '42P01' || error.message?.includes('onboarding_progress') === true
}

function normalizeChecklist(input: unknown): PreflightChecklist {
  const base = defaultPreflightChecklist()

  if (!input || typeof input !== 'object') {
    return base
  }

  const raw = input as Record<string, unknown>
  return {
    identity: Boolean(raw.identity),
    intent: Boolean(raw.intent),
    campaign: Boolean(raw.campaign),
    ready: Boolean(raw.ready),
  }
}

function toIntent(value: unknown): OnboardingIntent | null {
  if (!isOnboardingIntent(value)) {
    return null
  }

  return value
}

function toLaunchpadStage(value: number | null): number | null {
  if (value === null) return null
  return Math.max(1, Math.floor(value))
}

function buildState(
  profile: UsersRow,
  progress: OnboardingProgressRow | null,
): PreflightState {
  const fallback = createDefaultPreflightState()
  const checklist = progress ? normalizeChecklist(progress.checklist) : fallback.checklist

  const onboardingSeen = Boolean(profile.onboarding_seen)
  const onboardingComplete = Boolean(profile.onboarding_complete)
  const onboardingStep = Number(profile.onboarding_step ?? 0)
  const currentStep = clampPreflightStep(Number(progress?.current_step ?? 1))
  const progressCompleted = Boolean(progress?.completed)

  const preflightComplete =
    onboardingSeen ||
    progressCompleted ||
    (currentStep >= 4 && checklist.ready)

  return {
    currentStep,
    intent: toIntent(progress?.intent ?? null),
    campaignName: sanitizeCampaignName(progress?.campaign_name),
    checklist,
    preflightComplete,
    onboardingSeen,
    onboardingStep,
    onboardingComplete,
    launchpadStage: toLaunchpadStage(profile.launchpad_stage ?? null),
    updatedAt: progress?.updated_at ?? null,
  }
}

async function getProfile(supabase: Awaited<ReturnType<typeof createServerRouteClient>>, userId: string): Promise<UsersRow> {
  const { data, error } = await supabase
    .from('users')
    .select('onboarding_seen, onboarding_step, onboarding_complete, launchpad_stage')
    .eq('id', userId)
    .maybeSingle<UsersRow>()

  if (error) {
    throw new Error(error.message)
  }

  return {
    onboarding_seen: data?.onboarding_seen ?? null,
    onboarding_step: data?.onboarding_step ?? null,
    onboarding_complete: data?.onboarding_complete ?? null,
    launchpad_stage: data?.launchpad_stage ?? null,
  }
}

async function getProgress(
  supabase: Awaited<ReturnType<typeof createServerRouteClient>>,
  userId: string,
): Promise<OnboardingProgressRow | null> {
  const { data, error } = await supabase
    .from('onboarding_progress')
    .select('intent, campaign_name, checklist, current_step, completed, updated_at')
    .eq('user_id', userId)
    .maybeSingle<OnboardingProgressRow>()

  if (error) {
    if (isMissingTableError(error)) {
      return null
    }

    throw new Error(error.message)
  }

  return data ?? null
}

export async function GET() {
  try {
    const supabase = await createServerRouteClient()
    const user = await requireUser(supabase)

    const profile = await getProfile(supabase, user.id)
    const progress = await getProgress(supabase, user.id)

    return NextResponse.json(buildState(profile, progress))
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status })
    }

    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unable to load onboarding state' },
      { status: 500 },
    )
  }
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createServerRouteClient()
    const user = await requireUser(supabase)

    const profile = await getProfile(supabase, user.id)
    const payload = (await req.json().catch(() => ({}))) as Record<string, unknown>

    const incomingStep = clampPreflightStep(Number(payload.currentStep ?? 1))
    const incomingChecklist = normalizeChecklist(payload.checklist)
    const incomingIntent = toIntent(payload.intent)
    const incomingCampaignName = sanitizeCampaignName(payload.campaignName)

    const preflightComplete =
      Boolean(payload.preflightComplete) ||
      (incomingStep >= 4 && incomingChecklist.ready)

    const progressRecord = {
      user_id: user.id,
      intent: incomingIntent,
      campaign_name: incomingCampaignName || null,
      checklist: incomingChecklist,
      current_step: preflightComplete ? 4 : incomingStep,
      completed: preflightComplete,
      updated_at: new Date().toISOString(),
    }

    const { error: progressError } = await supabase
      .from('onboarding_progress')
      .upsert(progressRecord, { onConflict: 'user_id' })

    if (progressError && !isMissingTableError(progressError)) {
      throw new Error(progressError.message)
    }

    const currentOnboardingStep = Number(profile.onboarding_step ?? 0)
    const nextOnboardingStep = preflightComplete
      ? Math.max(currentOnboardingStep, MIN_LAUNCHPAD_STEP)
      : Math.max(currentOnboardingStep, 1)

    const nextLaunchpadStage = preflightComplete
      ? Math.max(Number(profile.launchpad_stage ?? 1), 2)
      : Math.max(Number(profile.launchpad_stage ?? 1), 1)

    const userUpdate = {
      onboarding_seen: Boolean(profile.onboarding_seen) || preflightComplete,
      onboarding_step: nextOnboardingStep,
      onboarding_complete: Boolean(profile.onboarding_complete),
      launchpad_stage: nextLaunchpadStage,
    }

    const { error: userUpdateError } = await supabase
      .from('users')
      .update(userUpdate)
      .eq('id', user.id)

    if (userUpdateError) {
      throw new Error(userUpdateError.message)
    }

    const nextProfile = await getProfile(supabase, user.id)
    const nextProgress = await getProgress(supabase, user.id)
    return NextResponse.json(buildState(nextProfile, nextProgress))
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status })
    }

    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unable to save onboarding state' },
      { status: 500 },
    )
  }
}
