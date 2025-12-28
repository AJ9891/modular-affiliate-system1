import { BrandMode } from '@/lib/brandModes'
import { BrandModeKey } from '@/contexts/BrandModeContext'
import Image from 'next/image'

const heroImages: Record<BrandModeKey, string> = {
  rocket: '/images/rocket-hero.png',
  antiguru: '/images/ai-clipboard.png',
  meltdown: '/images/ai-meltdown.png',
}

export function Hero({
  content,
  brand,
  brandKey,
}: {
  content: {
    headline: string
    subheadline: string
    cta: string
  }
  brand: BrandMode
  brandKey: BrandModeKey
}) {
  const themeClass =
    brand.visualTheme === 'glitch'
      ? 'bg-black text-red-500 glitch'
      : brand.visualTheme === 'ai'
      ? 'bg-neutral-900 text-white'
      : 'bg-gradient-to-b from-orange-500 to-black text-white'

  return (
    <section className={`p-20 ${themeClass} flex items-center justify-between`}>
      <div className="max-w-2xl">
        <h1 className="text-5xl font-extrabold mb-6">
          {content.headline}
        </h1>
        <p className="text-xl mb-8">
          {content.subheadline}
        </p>
        <button className="px-6 py-3 text-lg font-bold bg-white text-black rounded">
          {content.cta}
        </button>
      </div>
      <div className="relative w-96 h-96">
        <Image
          src={heroImages[brandKey]}
          alt={content.headline}
          fill
          className="object-contain"
        />
      </div>
    </section>
  )
}
