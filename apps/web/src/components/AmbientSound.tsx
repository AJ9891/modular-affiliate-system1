'use client'

import { useEffect, useRef } from 'react'

type AmbientSoundProps = {
  enabled: boolean
  src: string
  volume: number
}

export function AmbientSound({ enabled, src, volume }: AmbientSoundProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio(src)
      audioRef.current.loop = true
      audioRef.current.volume = volume
    }

    if (enabled) {
      audioRef.current.play().catch(() => {})
    } else {
      audioRef.current.pause()
    }

    return () => {
      audioRef.current?.pause()
    }
  }, [enabled, src, volume])

  return null
}
