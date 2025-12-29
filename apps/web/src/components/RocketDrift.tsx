'use client'

import { motion, useScroll, useTransform } from 'framer-motion'
import Image from 'next/image'
import { useRef } from 'react'

export function RocketDrift({
  src,
  alt,
}: {
  src: string
  alt: string
}) {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  })

  const y = useTransform(scrollYProgress, [0, 1], [40, -40])

  return (
    <div ref={ref} className="relative overflow-visible">
      <motion.div style={{ y }}>
        <Image
          src={src}
          alt={alt}
          width={700}
          height={700}
          priority
        />
      </motion.div>
    </div>
  )
}
