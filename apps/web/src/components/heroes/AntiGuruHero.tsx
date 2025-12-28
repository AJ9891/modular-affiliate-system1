export function AntiGuruHero({
  content,
}: {
  content: {
    headline: string
    subheadline: string
    cta: string
  }
}) {
  return (
    <section className="min-h-screen bg-[#0F172A] flex items-center px-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-6xl font-extrabold text-white">
          {content.headline}
        </h1>
        <p className="mt-6 text-xl text-gray-300">
          {content.subheadline}
        </p>

        <ul className="mt-8 space-y-2 text-gray-400">
          <li>❌ "Six figures in 30 days"</li>
          <li>❌ Passive income fairy tales</li>
          <li>❌ Fake scarcity timers</li>
        </ul>

        <button className="mt-10 bg-yellow-400 px-8 py-4 text-black rounded-xl">
          {content.cta}
        </button>
      </div>
    </section>
  )
}
