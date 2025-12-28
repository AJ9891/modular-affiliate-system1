import { BrandModeKey } from '@/contexts/BrandModeContext'

export type FunnelComponent = {
  type: string
  allowedBrand?: BrandModeKey | BrandModeKey[]
  [key: string]: any
}

export function shouldRenderComponent(
  component: FunnelComponent,
  currentBrand: BrandModeKey
): boolean {
  // If no brand restriction, always render
  if (!component.allowedBrand) {
    return true
  }

  // Check if current brand matches allowed brand(s)
  if (Array.isArray(component.allowedBrand)) {
    return component.allowedBrand.includes(currentBrand)
  }

  return component.allowedBrand === currentBrand
}
