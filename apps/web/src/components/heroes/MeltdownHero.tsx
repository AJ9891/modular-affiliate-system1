import Image from 'next/image'

export function MeltdownHero({
  content,
}: {
  content: {
    headline: string
    subheadline: string
    cta: string
  }
}) {
  return (
    <section className="relative min-h-screen bg-black text-red-500 overflow-hidden font-mono">

      {/* Glitch background */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,0,0,0.15),transparent_60%)]" />

      {/* AI Image */}
      <div className="absolute right-10 top-1/2 -translate-y-1/2 w-[40%] opacity-90">
        <Image
          src="/images/ai-meltdown.png"
          alt="Overworked AI having a meltdown"
          width={700}
          height={900}
          priority
        />
      </div>

      {/* Copy */}
      <div className="relative z-10 max-w-5xl px-8 pt-32">
        <h1 className="text-5xl font-extrabold leading-tight max-w-2xl glitch-text" data-text={content.headline}>
          {content.headline}
        </h1>

        <p className="mt-6 text-xl text-red-300 max-w-xl">
          {content.subheadline}
        </p>

        <button className="mt-10 px-6 py-3 bg-red-500 text-black font-bold rounded">
          {content.cta}
        </button>

        <p className="mt-4 text-xs text-red-700">
          *The AI is fine. Probably.
        </p>
      </div>
    </section>
  )
}

