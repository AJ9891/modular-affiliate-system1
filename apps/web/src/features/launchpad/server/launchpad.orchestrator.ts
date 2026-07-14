import type { SupabaseClient } from '@supabase/supabase-js'
import { HttpError } from '@/lib/http'
import { createLogger } from '@/lib/observability/logger'

const logger = createLogger('launchpad-orchestrator')

export type LaunchpadReadiness = {
  ready: boolean
  checks: {
    funnelExists: boolean
    offerAttached: boolean
    emailReady: boolean
    previewPassed: boolean
    ctaPassed: boolean
  }
  blockers: string[]
  version: number
}

type LaunchpadReadinessRow = {
  id: string
  user_id: string
  funnel_id: string | null
  selected_offer_id: string | null
  preview_check_passed: boolean
  cta_check_passed: boolean
  version: number
}

export class LaunchpadService {
  constructor(
    private readonly supabase: SupabaseClient,
    private readonly userId: string
  ) {}

  async runReadinessChecks(launchpadId: string): Promise<LaunchpadReadiness> {
    const { data, error } = await this.supabase
      .from('launchpads')
      .select(`
        id,
        user_id,
        funnel_id,
        selected_offer_id,
        preview_check_passed,
        cta_check_passed,
        version
      `)
      .eq('id', launchpadId)
      .eq('user_id', this.userId)
      .is('deleted_at', null)
      .single()

    if (error || !data) {
      throw new HttpError('Launchpad not found', 404)
    }

    const launchpad = data as LaunchpadReadinessRow
    const [funnelResult, offerResult, userResult] = await Promise.all([
      launchpad.funnel_id
        ? this.supabase
            .from('funnels')
            .select('funnel_id')
            .eq('funnel_id', launchpad.funnel_id)
            .eq('user_id', this.userId)
            .is('deleted_at', null)
            .maybeSingle()
        : Promise.resolve({ data: null, error: null }),
      launchpad.selected_offer_id
        ? this.supabase
            .from('offers')
            .select('id')
            .eq('id', launchpad.selected_offer_id)
            .eq('user_id', this.userId)
            .is('deleted_at', null)
            .maybeSingle()
        : Promise.resolve({ data: null, error: null }),
      this.supabase
        .from('users')
        .select('email_automation_provisioned')
        .eq('id', this.userId)
        .single(),
    ])

    if (funnelResult.error || offerResult.error || userResult.error) {
      logger.error('launchpad.readiness.failed', {
        userId: this.userId,
        launchpadId,
        funnelError: funnelResult.error?.message,
        offerError: offerResult.error?.message,
        userError: userResult.error?.message,
      })
      throw new HttpError('Unable to verify launch readiness right now', 503)
    }

    const checks = {
      funnelExists: Boolean(funnelResult.data),
      offerAttached: Boolean(offerResult.data),
      emailReady: Boolean(userResult.data?.email_automation_provisioned),
      previewPassed: launchpad.preview_check_passed,
      ctaPassed: launchpad.cta_check_passed,
    }

    const blockers = [
      !checks.funnelExists ? 'Create and save a funnel' : null,
      !checks.offerAttached ? 'Attach an offer' : null,
      !checks.emailReady ? 'Finish email automation setup' : null,
      !checks.previewPassed ? 'Pass the public preview check' : null,
      !checks.ctaPassed ? 'Pass the CTA tracking check' : null,
    ].filter((value): value is string => value !== null)

    logger.info('launchpad.readiness.checked', {
      userId: this.userId,
      launchpadId,
      ready: blockers.length === 0,
      blockers,
    })

    return {
      ready: blockers.length === 0,
      checks,
      blockers,
      version: launchpad.version,
    }
  }
}
