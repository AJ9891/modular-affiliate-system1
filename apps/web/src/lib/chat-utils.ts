/**
 * Utilities for chat message parsing and formatting
 */

export interface ChatAction {
  action: 'CREATE_CHECKOUT' | 'VIEW_PRICING' | 'START_TRIAL'
  plan?: 'starter' | 'pro' | 'agency'
}

/**
 * Extracts action from AI response text
 * Looks for ACTION: {json} pattern at the end of the message
 */
export function extractActionFromResponse(text: string): { content: string; action: ChatAction | null } {
  // Look for ACTION: {...} pattern
  const actionMatch = text.match(/ACTION:\s*(\{[^{}]*"action"[^{}]*\})/i)
  
  if (!actionMatch) {
    return { content: text, action: null }
  }

  try {
    const action = JSON.parse(actionMatch[1]) as ChatAction
    // Remove action from content
    const content = text.replace(/ACTION:\s*\{[^{}]*"action"[^{}]*\}/i, '').trim()
    return { content, action }
  } catch (e) {
    console.warn('Failed to parse action:', actionMatch[1], e)
    return { content: text, action: null }
  }
}

/**
 * Validates if an action object is properly formed
 */
export function isValidAction(action: unknown): action is ChatAction {
  if (!action || typeof action !== 'object') return false
  const obj = action as Record<string, unknown>
  return (
    typeof obj.action === 'string' &&
    ['CREATE_CHECKOUT', 'VIEW_PRICING', 'START_TRIAL'].includes(obj.action) &&
    (obj.plan === undefined || ['starter', 'pro', 'agency'].includes(String(obj.plan)))
  )
}

/**
 * Formats action as JSON for streaming response
 */
export function formatActionJson(message: string, action: ChatAction | null): string {
  return JSON.stringify({ message, action })
}
