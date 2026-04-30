import { describe, expect, it } from 'vitest'
import {
  getMissingStartupChecklistFields,
  getStartupChecklistProgress,
  getStartupDefaultsFromIntent,
  mapTrafficGoalToSource,
} from '@/lib/launchpad/startupChecklist'

describe('launchpad startup checklist', () => {
  it('tracks throttle progress as fields are completed', () => {
    const empty = getStartupChecklistProgress({
      campaignName: '',
      funnelType: '',
      trafficGoal: '',
    })
    expect(empty.completed).toBe(0)
    expect(empty.label).toBe('Throttle: 0/3 Completed')

    const partial = getStartupChecklistProgress({
      campaignName: 'First Campaign',
      funnelType: 'lead-gen',
      trafficGoal: '',
    })
    expect(partial.completed).toBe(2)
    expect(partial.label).toBe('Throttle: 2/3 Completed')
  })

  it('returns only missing checklist fields', () => {
    const missing = getMissingStartupChecklistFields({
      campaignName: '  ',
      funnelType: 'vsl',
      trafficGoal: '',
    })
    expect(missing).toEqual(['campaignName', 'trafficGoal'])
  })

  it('maps preflight intents to sensible startup defaults', () => {
    expect(getStartupDefaultsFromIntent('first-funnel')).toEqual({
      funnelType: 'lead-gen',
      trafficGoal: 'first-10-sales',
    })
    expect(getStartupDefaultsFromIntent('import-traffic')).toEqual({
      funnelType: 'review',
      trafficGoal: 'first-100-visitors',
    })
  })

  it('maps traffic goals to startup source profiles', () => {
    expect(mapTrafficGoalToSource('first-100-visitors')).toBe('organic')
    expect(mapTrafficGoalToSource('first-25-leads')).toBe('email')
    expect(mapTrafficGoalToSource('first-10-sales')).toBe('paid')
  })
})

