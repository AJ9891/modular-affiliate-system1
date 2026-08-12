'use client'

import { useEffect, useMemo, useState } from 'react'
import type { VisionChatMessage } from '../domain/vision.types'

const STORAGE_KEY_PREFIX = 'launchpad_vision_chat_memory_v2'
const MAX_MESSAGES = 120

function validMessage(value: unknown): value is VisionChatMessage {
  if (!value || typeof value !== 'object') return false
  const item = value as Record<string, unknown>
  return typeof item.id === 'string' && (item.role === 'user' || item.role === 'system') && typeof item.content === 'string'
}

export function useVisionMemory(initialMessage: VisionChatMessage, userId: string) {
  const storageKey = useMemo(() => `${STORAGE_KEY_PREFIX}:${userId}`, [userId])
  const [messages, setMessages] = useState<VisionChatMessage[]>(() => {
    if (typeof window === 'undefined') return [initialMessage]
    try {
      const parsed = JSON.parse(window.localStorage.getItem(storageKey) ?? '[]') as unknown
      if (Array.isArray(parsed)) {
        const cached = parsed.filter(validMessage).slice(-MAX_MESSAGES)
        if (cached.length) return cached
      }
    } catch { /* session cache is optional */ }
    return [initialMessage]
  })

  useEffect(() => {
    try { window.localStorage.setItem(storageKey, JSON.stringify(messages.slice(-MAX_MESSAGES))) } catch { /* cache only */ }
  }, [messages, storageKey])

  const append = (...next: VisionChatMessage[]) => setMessages((current) => [...current, ...next].slice(-MAX_MESSAGES))
  return { messages, append }
}
