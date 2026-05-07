'use client'

import { FunnelBlock } from '@/lib/types'

interface FunnelRendererProps {
  blocks: FunnelBlock[]
}

export default function FunnelRenderer({ blocks }: FunnelRendererProps) {
  const resolveCtaHref = (content: Record<string, any>) => {
    const candidates = [
      content.ctaLink,
      content.buttonLink,
      content.link,
      content.url,
      content.affiliateLink,
      content.affiliate_link,
    ]
    const first = candidates.find((value) => typeof value === 'string' && value.trim().length > 0)
    return typeof first === 'string' ? first : null
  }

  const normalizeBenefits = (content: Record<string, any>) => {
    const source = content.items ?? content.benefits ?? []
    if (!Array.isArray(source)) return []

    return source
      .map((item: any, index: number) => {
        if (typeof item === 'string') {
          const text = item.trim()
          if (!text) return null
          return {
            title: `Benefit ${index + 1}`,
            description: text,
          }
        }

        if (item && typeof item === 'object') {
          const title =
            (typeof item.title === 'string' && item.title.trim()) ||
            (typeof item.headline === 'string' && item.headline.trim()) ||
            `Benefit ${index + 1}`
          const description =
            (typeof item.description === 'string' && item.description.trim()) ||
            (typeof item.text === 'string' && item.text.trim()) ||
            (typeof item.body === 'string' && item.body.trim()) ||
            ''
          return { title, description }
        }

        return null
      })
      .filter(Boolean)
  }

  const normalizeBlockType = (type: unknown) => {
    if (typeof type !== 'string') return ''

    const normalized = type.trim().toLowerCase().replace(/_/g, '-')

    if (normalized === 'benefit') return 'benefits'
    if (normalized === 'testimonials') return 'testimonial'

    return normalized
  }

  const renderBlock = (block: FunnelBlock) => {
    const blockType = normalizeBlockType(block.type)

    switch (blockType) {
      case 'hero':
        {
          const ctaHref = resolveCtaHref(block.content || {})
        return (
          <section className="py-20 px-6 text-center" style={block.style}>
            <div className="max-w-4xl mx-auto">
              <h1 className="text-4xl md:text-6xl font-bold mb-6">
                {block.content.headline}
              </h1>
              {block.content.subheadline && (
                <p className="text-xl text-gray-600 mb-8">
                  {block.content.subheadline}
                </p>
              )}
              {ctaHref ? (
                <a
                  href={ctaHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex px-8 py-4 bg-blue-600 text-white text-lg font-semibold rounded-lg hover:bg-blue-700 transition-colors"
                >
                  {block.content.cta || block.content.buttonText || 'Learn more'}
                </a>
              ) : (
                <button className="px-8 py-4 bg-blue-600 text-white text-lg font-semibold rounded-lg hover:bg-blue-700 transition-colors">
                  {block.content.cta || block.content.buttonText || 'Learn more'}
                </button>
              )}
            </div>
          </section>
        )
        }

      case 'features':
        return (
          <section className="py-16 px-6" style={block.style}>
            <div className="max-w-6xl mx-auto">
              <h2 className="text-3xl font-bold text-center mb-12">
                {block.content.headline}
              </h2>
              <div className="grid md:grid-cols-3 gap-8">
                {block.content.features?.map((feature: any, index: number) => (
                  <div key={index} className="text-center">
                    <div className="text-4xl mb-4">{feature.icon}</div>
                    <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                    <p className="text-gray-600">{feature.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )

      case 'benefits':
        {
          const title = block.content.title || block.content.headline || 'Key Benefits'
          const items = normalizeBenefits(block.content || {})

          return (
            <section className="py-16 px-6" style={block.style}>
              <div className="max-w-6xl mx-auto">
                <h2 className="text-3xl font-bold text-center mb-12">{title}</h2>
                {items.length === 0 ? (
                  <p className="text-center text-gray-600">No benefits provided.</p>
                ) : (
                  <div className="grid md:grid-cols-3 gap-8">
                    {items.map((item: any, index: number) => (
                      <article key={`${item.title}-${index}`} className="rounded-xl border border-gray-200 p-6 bg-white">
                        <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                        {item.description && <p className="text-gray-600">{item.description}</p>}
                      </article>
                    ))}
                  </div>
                )}
              </div>
            </section>
          )
        }

      case 'testimonial':
        {
          const items = Array.isArray(block.content.testimonials)
            ? block.content.testimonials
            : Array.isArray(block.content.items)
              ? block.content.items
              : [block.content]

          return (
            <section className="py-16 px-6" style={block.style}>
              <div className="max-w-5xl mx-auto">
                <h2 className="text-3xl font-bold text-center mb-12">{block.content.headline || 'Testimonials'}</h2>
                <div className="grid gap-6 md:grid-cols-2">
                  {items.map((item: any, index: number) => (
                    <article key={`${item?.author || 'testimonial'}-${index}`} className="rounded-xl border border-gray-200 p-6 bg-white">
                      <p className="text-gray-700">“{item?.quote || item?.text || 'Great results.'}”</p>
                      {(item?.author || item?.name) && (
                        <p className="mt-3 text-sm font-semibold text-gray-900">- {item.author || item.name}</p>
                      )}
                    </article>
                  ))}
                </div>
              </div>
            </section>
          )
        }

      case 'email-capture':
        return (
          <section className="py-16 px-6 bg-gray-50" style={block.style}>
            <div className="max-w-md mx-auto text-center">
              <h2 className="text-2xl font-bold mb-4">
                {block.content.headline}
              </h2>
              <p className="text-gray-600 mb-6">
                {block.content.subheadline}
              </p>
              <form className="flex gap-2">
                <input
                  type="email"
                  placeholder={block.content.placeholder || "Enter your email"}
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="submit"
                  className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
                >
                  {block.content.buttonText || "Subscribe"}
                </button>
              </form>
            </div>
          </section>
        )

      case 'cta':
        {
          const ctaHref = resolveCtaHref(block.content || {})
          return (
            <section className="py-16 px-6 text-center" style={block.style}>
              <div className="max-w-3xl mx-auto">
                <h2 className="text-3xl font-bold mb-4">
                  {block.content.headline}
                </h2>
                {block.content.subheadline && (
                  <p className="text-lg text-gray-600 mb-8">
                    {block.content.subheadline}
                  </p>
                )}
                {ctaHref ? (
                  <a
                    href={ctaHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex px-8 py-4 bg-blue-600 text-white text-lg font-semibold rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    {block.content.buttonText || block.content.cta || 'Continue'}
                  </a>
                ) : (
                  <button className="px-8 py-4 bg-blue-600 text-white text-lg font-semibold rounded-lg hover:bg-blue-700 transition-colors">
                    {block.content.buttonText || block.content.cta || 'Continue'}
                  </button>
                )}
                {block.content.subtext && (
                  <p className="mt-4 text-sm text-gray-500">{block.content.subtext}</p>
                )}
              </div>
            </section>
          )
        }

      case 'text':
        return (
          <section className="py-16 px-6" style={block.style}>
            <div className="max-w-4xl mx-auto">
              <div className="prose prose-lg mx-auto" dangerouslySetInnerHTML={{ __html: block.content.html }} />
            </div>
          </section>
        )

      default:
        return (
          <section className="py-16 px-6" style={block.style}>
            <div className="max-w-4xl mx-auto">
              <p>Unknown block type: {block.type}</p>
            </div>
          </section>
        )
    }
  }

  return (
    <div className="min-h-screen">
      {blocks.map((block, index) => (
        <div key={index}>
          {renderBlock(block)}
        </div>
      ))}
    </div>
  )
}
