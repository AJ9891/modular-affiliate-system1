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
    <BrandModeProvider>
      <DragDropBuilder onSave={handleSave} />
    </BrandModeProvider>
  )
}
