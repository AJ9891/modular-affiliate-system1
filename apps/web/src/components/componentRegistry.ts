import { RocketHero } from './heroes/RocketHero'
import { MeltdownHero } from './heroes/MeltdownHero'
import { AntiGuruSection } from './sections/AntiGuruSection'
import { BrandModeKey } from '@/contexts/BrandModeContext'

export type ComponentRegistryItem = {
  type: string
  label: string
  component: React.ComponentType<any>
  allowedBrand?: BrandModeKey | BrandModeKey[]
  description?: string
}

export const COMPONENT_REGISTRY: ComponentRegistryItem[] = [
  {
    type: 'hero-rocket',
    label: 'Hero — Launch Mode',
    component: RocketHero,
    allowedBrand: 'rocket',
  },
  {
    type: 'hero-meltdown',
    label: 'Hero — AI Meltdown',
    component: MeltdownHero,
    allowedBrand: 'meltdown',
  },
  {
    type: 'anti-guru',
    label: 'Anti-Guru Comparison',
    component: AntiGuruSection,
    allowedBrand: 'antiguru',
  },
  // Add more components here as they are created
]

export function getComponentByType(type: string) {
  return COMPONENT_REGISTRY.find(item => item.type === type)
}

export function getComponentsByBrand(brandKey: BrandModeKey) {
  return COMPONENT_REGISTRY.filter(item => {
    if (!item.allowedBrand) return true
    if (Array.isArray(item.allowedBrand)) {
      return item.allowedBrand.includes(brandKey)
    }
    return item.allowedBrand === brandKey
  })
}
