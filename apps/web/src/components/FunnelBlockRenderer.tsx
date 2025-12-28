import { BrandModeKey } from '@/contexts/BrandModeContext'
import { shouldRenderComponent, FunnelComponent } from '@/lib/componentFiltering'

export function FunnelBlockRenderer({
  blocks,
  brandKey,
}: {
  blocks: FunnelComponent[]
  brandKey: BrandModeKey
}) {
  return (
    <div className="funnel-container">
      {blocks.map((block, index) => {
        // Filter out blocks not allowed for this brand
        if (!shouldRenderComponent(block, brandKey)) {
          return null
        }

        // Render the block component
        const Component = block.component
        return (
          <div key={`${block.type}-${index}`} className="funnel-block">
            <Component {...block.props} />
          </div>
        )
      })}
    </div>
  )
}
