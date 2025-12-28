import { BrandModeKey } from '@/contexts/BrandModeContext'
import { getFunnelBrandMode } from '@/lib/brandModes'
import { getComponentsByBrand } from '@/components/componentRegistry'
import { shouldRenderComponent, FunnelComponent } from '@/lib/componentFiltering'

/**
 * Example: Rendering a funnel with brand-aware component filtering
 */
export async function renderFunnelWithBrand(funnelId: string, blocks: FunnelComponent[]) {
  // 1. Get the funnel's brand mode from the database
  const brand = await getFunnelBrandMode(funnelId)
  
  // Extract the brand key from the brand object (we need the key, not the full object)
  // This would need to be stored or derived - for now, assuming we have it
  const brandKey: BrandModeKey = 'rocket' // or 'antiguru' or 'meltdown'
  
  // 2. Filter blocks to only those allowed for this brand
  const filteredBlocks = blocks.filter(block => 
    shouldRenderComponent(block, brandKey)
  )
  
  return {
    brand,
    brandKey,
    blocks: filteredBlocks,
  }
}

/**
 * Example: Get available components for brand mode selector
 */
export function getAvailableComponentsForBrand(brandKey: BrandModeKey) {
  // Get only components that work with this brand
  return getComponentsByBrand(brandKey)
}

/**
 * Example: Inline filtering in a component
 */
export function FunnelPreview({ 
  blocks, 
  brandKey 
}: { 
  blocks: FunnelComponent[]
  brandKey: BrandModeKey 
}) {
  return (
    <div>
      {blocks.map((block, index) => {
        // Filter out blocks not allowed for this brand
        if (!shouldRenderComponent(block, brandKey)) {
          return null
        }
        
        return (
          <div key={index}>
            {/* Render block component */}
            Block: {block.type}
          </div>
        )
      })}
    </div>
  )
}
