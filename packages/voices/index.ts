import { voiceRegistry } from './VoiceRegistry'
import { boostHeader } from './boost/boost.header'
import { boostRules } from './boost/boost.rules'
import { boostExamples } from './boost/boost.examples'
import { antiGuruHeader } from './antiGuru/antiGuru.header'
import { antiGuruRules } from './antiGuru/antiGuru.rules'
import { antiGuruExamples } from './antiGuru/antiGuru.examples'
import { glitchHeader } from './glitch/glitch.header'
import { glitchRules } from './glitch/glitch.rules'
import { glitchExamples } from './glitch/glitch.examples'
import type { VoiceId } from './Voice.types'

type Entry = { id: VoiceId; header: string; rules: string[]; examples: string[]; allowedSurfaces?: string[] }

const entries: Entry[] = [
  { id: 'boost', header: boostHeader, rules: boostRules, examples: boostExamples, allowedSurfaces: ['builder', 'live_funnel', 'onboarding', 'analytics'] },
  { id: 'anti-guru', header: antiGuruHeader, rules: antiGuruRules, examples: antiGuruExamples, allowedSurfaces: ['builder', 'live_funnel', 'templates'] },
  { id: 'glitch', header: glitchHeader, rules: glitchRules, examples: glitchExamples, allowedSurfaces: ['builder', 'templates'] }
]

entries.forEach(entry => {
  voiceRegistry.register({
    // @ts-expect-error allowing hyphenated id per docs; normalize in real implementation
    id: entry.id,
    header: { header: entry.header, rules: entry.rules },
    rules: { header: entry.header, rules: entry.rules },
    examples: { header: entry.header, rules: entry.examples },
    allowedSurfaces: entry.allowedSurfaces
  })
})

export { voiceRegistry }
export * from './Voice.types'
