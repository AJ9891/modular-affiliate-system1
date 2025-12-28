import Image from 'next/image'
import { motion } from 'framer-motion'

export function RocketHero({
  content,
}: {
  content: {
    headline: string
    subheadline: string
    cta_primary: string
    cta_secondary: string
  }
}) {
  return (
    <section className="relative min-h-screen bg-black text-white overflow-hidden">
      
      {/* Background glow */}
      <div className="absolute inset-0 bg-gradient-to-b from-orange-500/20 via-black to-black" />
      
      {/* Animated background gradient */}
      <motion.div
        className="absolute inset-0"
        animate={{ backgroundPositionY: ['0%', '10%'] }}
        transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
      />

      {/* Rocket image */}
      <motion.div
        className="absolute right-0 top-1/2 -translate-y-1/2 w-[50%] opacity-90"
        initial={{ y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 1.2, ease: 'easeOut' }}
      >
        <Image
          src="/images/rocket-hero.png"
          alt="Launchpad Rocket"
          width={900}
          height={1200}
          priority
        />
      </motion.div>

      {/* Content */}
      <div className="relative z-10 max-w-6xl px-8 pt-32">
        <motion.h1
          className="text-6xl font-extrabold leading-tight max-w-2xl"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          {content.headline}
        </motion.h1>

        <motion.p
          className="mt-6 text-xl text-gray-300 max-w-xl"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          {content.subheadline}
        </motion.p>

        <motion.div
          className="mt-10 flex gap-4"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          <button className="px-6 py-3 bg-orange-500 text-black font-bold rounded">
            {content.cta_primary}
          </button>

          <button className="px-6 py-3 border border-gray-600 rounded text-gray-300 hover:border-white">
            {content.cta_secondary}
          </button>
        </motion.div>
      </div>
    </section>
  )
}
