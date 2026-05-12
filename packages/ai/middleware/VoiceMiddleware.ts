import { bindVoice } from '../voices/VoiceBinder'
import type { MiddlewareEnvelope } from './types'

export function injectVoiceMiddleware(envelope: MiddlewareEnvelope): MiddlewareEnvelope {
  const voice = bindVoice(envelope.context)
  if (!voice) {
    return {
      ...envelope,
      metadata: {
        ...envelope.metadata,
        voice_blocked: true,
        voice_reason: 'Voice is not permitted for this context',
      },
    }
  }

  return {
    ...envelope,
    prompt: `${voice.header.system}\n\n${envelope.prompt}`,
    metadata: {
      ...envelope.metadata,
      voice_id: voice.header.id,
      voice_constraints: voice.header.constraints,
    },
  }
}
