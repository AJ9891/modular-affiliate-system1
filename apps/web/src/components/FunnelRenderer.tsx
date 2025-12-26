'use client'

import { FunnelBlock } from '@/lib/types'

interface FunnelRendererProps {
  blocks: FunnelBlock[]
}

export default function FunnelRenderer({ blocks }: FunnelRendererProps) {
  const renderBlock = (block: FunnelBlock) => {
    switch (block.type) {
      case 'hero':
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
              <button className="px-8 py-4 bg-blue-600 text-white text-lg font-semibold rounded-lg hover:bg-blue-700 transition-colors">
                {block.content.cta}
              </button>
            </div>
          </section>
        )

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