import { BrandModeKey } from '@/contexts/BrandModeContext'

/**
 * Brand-specific overrides for AI behavior
 */
export function applyBrandOverrides(
  prompt: string,
  brandKey: BrandModeKey
): string {
  let modifiedPrompt = prompt

  if (brandKey === 'rocket') {
    // Rocket mode: enforce zero humor, maximum clarity
    modifiedPrompt += `\n\nADDITIONAL ROCKET MODE RULES:\n- No humor whatsoever\n- No sarcasm\n- Pure clarity and confidence\n- Forward momentum only`
  }

  if (brandKey === 'antiguru') {
    // Anti-Guru: allow contrast language
    modifiedPrompt += `\n\nADDITIONAL ANTI-GURU RULES:\n- Contrast language is allowed\n- Mild sarcasm is permitted\n- Call out BS when relevant\n- Stay calm, never angry`
  }

  if (brandKey === 'meltdown') {
    // Meltdown: allows mild sarcasm and self-deprecation
    modifiedPrompt += `\n\nADDITIONAL MELTDOWN RULES:\n- Mild sarcasm allowed\n- Self-aware AI humor\n- Reluctant but helpful tone\n- Never insult the user`
  }

  return modifiedPrompt
}
