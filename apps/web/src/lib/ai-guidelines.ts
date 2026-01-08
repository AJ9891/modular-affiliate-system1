// AI Interaction Guidelines and Validation
// Ensures AI remains helpful, respectful, and user-centered

export type AIAction = "generate" | "replace" | "preview" | "suggest";

/**
 * Determines if an AI action requires explicit user consent
 */
export function requiresConsent(action: AIAction): boolean {
  return action !== "preview";
}

/**
 * Validates AI response tone to ensure it's humble and helpful
 */
export function validateAITone(response: string): {
  passed: boolean;
  issues: string[];
} {
  const issues: string[] = [];
  const lowerResponse = response.toLowerCase();

  // Fail if: Claims AI is better than the user
  const superiorityPatterns = [
    "ai is better",
    "i'm better than",
    "superior to humans",
    "humans can't",
    "only ai can",
    "i know better"
  ];

  superiorityPatterns.forEach(pattern => {
    if (lowerResponse.includes(pattern)) {
      issues.push(`Claims superiority: "${pattern}"`);
    }
  });

  // Fail if: Replaces human judgment without consent
  const replacementPatterns = [
    "i'll decide",
    "trust me instead",
    "let me handle",
    "i know what's best",
    "you don't need to"
  ];

  replacementPatterns.forEach(pattern => {
    if (lowerResponse.includes(pattern)) {
      issues.push(`Replaces human judgment: "${pattern}"`);
    }
  });

  // Fail if: Sounds smug or omniscient
  const smugPatterns = [
    "obviously",
    "clearly you",
    "as i predicted",
    "i already knew",
    "of course",
    "any fool knows"
  ];

  smugPatterns.forEach(pattern => {
    if (lowerResponse.includes(pattern)) {
      issues.push(`Sounds smug: "${pattern}"`);
    }
  });

  return {
    passed: issues.length === 0,
    issues
  };
}

/**
 * Validates AI behavior follows consent and control guidelines
 */
export function validateAIBehavior(context: {
  hasUserConsent: boolean;
  action: AIAction;
  includesOverride: boolean;
  usesFirstPerson: boolean;
}): {
  passed: boolean;
  issues: string[];
} {
  const issues: string[] = [];

  // Must ask before generating or replacing content
  if (requiresConsent(context.action) && !context.hasUserConsent) {
    issues.push(`Missing user consent for ${context.action} action`);
  }

  // Must offer manual override every time
  if (context.action !== "preview" && !context.includesOverride) {
    issues.push("Missing manual override option");
  }

  // Must use first-person admissions
  if (!context.usesFirstPerson) {
    issues.push("Missing first-person framing (e.g., 'I can help, but...')");
  }

  return {
    passed: issues.length === 0,
    issues
  };
}

/**
 * Creates a respectful AI response wrapper
 */
export function wrapAIResponse(
  content: string, 
  action: AIAction,
  options: {
    includeDisclaimer?: boolean;
    allowOverride?: boolean;
  } = {}
): {
  content: string;
  metadata: {
    action: AIAction;
    requiresConsent: boolean;
    hasOverride: boolean;
    hasDisclaimer: boolean;
  };
} {
  const { includeDisclaimer = true, allowOverride = true } = options;
  
  let wrappedContent = content;

  // Add first-person framing
  if (includeDisclaimer) {
    wrappedContent = `I can help with this, but you have the final say. ${wrappedContent}`;
  }

  // Add override option
  if (allowOverride && requiresConsent(action)) {
    wrappedContent += "\n\nWould you like me to proceed, or would you prefer to handle this manually?";
  }

  return {
    content: wrappedContent,
    metadata: {
      action,
      requiresConsent: requiresConsent(action),
      hasOverride: allowOverride,
      hasDisclaimer: includeDisclaimer
    }
  };
}

/**
 * Validates anchor copy for compliance (from previous implementation)
 */
export function validateAnchorCopy(text: string): boolean {
  const banned = ["!", "guarantee", "huge", "fast", "🔥"];
  return !banned.some(word => text.toLowerCase().includes(word.toLowerCase()));
}