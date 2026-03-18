'use client'

import DragDropBuilder from '@/components/DragDropBuilder'
import { BrandModeProvider } from '@/contexts/BrandModeContext'
import { useRouter } from 'next/navigation'

export default function BuilderV2Page() {
  const router = useRouter()

  const handleSave = async (blocks: any[]) => {
    try {
      const response = await fetch('/api/funnels', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'My Funnel',
          slug: `funnel-${Date.now()}`,
          blocks,
        })
      })

      if (!response.ok) throw new Error('Failed to save')

      alert('Funnel saved successfully!')
      router.push('/dashboard')
    } catch (error) {
      alert('Error saving funnel')
      throw error
    }
  }

  return (
    <div className="theme-engineering min-h-screen">
      <div className="px-6 py-6 md:px-10 flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-cyan-200/70">Engineering Bay</p>
          <h1 className="text-2xl font-semibold text-white">Builder V2</h1>
          <p className="text-sm text-white/70">Raw telemetry · JSON mode · low-level control.</p>
        </div>
        <div className="text-right text-white/60 text-xs">
          Raw Telemetry Mode
          <br />
          For visual mode, use Visual Builder
        </div>
      </div>
      <BrandModeProvider>
        <DragDropBuilder onSave={handleSave} />
      </BrandModeProvider>
    </div>
  )
}
