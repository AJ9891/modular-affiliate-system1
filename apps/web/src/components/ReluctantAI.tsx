'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'
import { useState } from 'react'

export function ReluctantAI({
  src = '/images/ai-meltdown.png',
  alt = 'Overworked AI holding clipboard',
}: {
  src?: string
  alt?: string
}) {
  const [hovered, setHovered] = useState(false)

  return (
    <div className="relative inline-block">
      <motion.div
        onHoverStart={() => setHovered(true)}
        onHoverEnd={() => setHovered(false)}
        animate={{
          rotate: hovered ? -2 : 0,
        }}
        transition={{
          type: 'spring',
          stiffness: 200,
          damping: 12,
        }}
      >
        <Image
          src={src}
          alt={alt}
          width={500}
          height={700}
          priority
        />
      </motion.div>

      {hovered && (
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-xs text-red-400"
        >
          I already tested this. Please stop testing me.
        </motion.div>
      )}
    </div>
  )
}
