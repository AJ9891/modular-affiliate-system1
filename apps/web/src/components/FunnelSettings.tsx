import { useState } from 'react'
import { BrandModeSelect } from '@/components/BrandModeSelect'
import { updateFunnelBrandMode } from '@/lib/brandModes'
import { BrandModeKey } from '@/contexts/BrandModeContext'

export function FunnelSettings({ funnel }: { funnel: { id: string; brand_mode: BrandModeKey } }) {
  const [brandMode, setBrandMode] = useState<BrandModeKey>(funnel.brand_mode || 'rocket')

  async function saveBrandMode(value: BrandModeKey) {
    setBrandMode(value)
    await updateFunnelBrandMode(funnel.id, value)
  }

  return (
    <BrandModeSelect
      value={brandMode}
      onChange={saveBrandMode}
    />
  )
}
