import { describe, expect, it } from 'vitest'
import {
  buildLaunchpadFunnelCreateInput,
  getLaunchpadTemplateByCategory,
} from '@/lib/launchpad/templateCatalog'
import { getTemplateById } from '@/config/funnelTemplates'

describe('launchpad template catalog', () => {
  it('builds a real lead magnet funnel payload from the lead-gen selection', () => {
    const templateCard = getLaunchpadTemplateByCategory('lead-gen')
    const leadMagnetTemplate = getTemplateById('anchor-lead-magnet')

    expect(templateCard).not.toBeNull()
    expect(leadMagnetTemplate).not.toBeNull()

    if (!templateCard || !leadMagnetTemplate) {
      throw new Error('Lead magnet template fixture is missing')
    }

    const payload = buildLaunchpadFunnelCreateInput(templateCard, 'health')

    expect(payload.template).toBe('anchor-lead-magnet')
    expect(payload.niche).toBe('health')
    expect(payload.blocks).toEqual(leadMagnetTemplate.blocks)
    expect(payload.theme).toEqual(leadMagnetTemplate.theme)
    expect(payload.blocks.length).toBeGreaterThan(0)
  })
})
