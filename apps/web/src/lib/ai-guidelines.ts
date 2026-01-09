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

// Boost Nudge Guidelines and Validation
const BOOST_COOLDOWN_MS = 6 * 60 * 60 * 1000; // 6 hours

export type BoostTrigger = "inactivity" | "completion" | "error" | "typing" | "reading";
export type BoostContext = {
  userState: "active" | "inactive" | "paused";
  lastActivity: number;
  isTyping: boolean;
  isReading: boolean;
  hasError: boolean;
  lastBoostTime?: number;
};

/**
 * Validates boost nudge tone to ensure it's supportive, not pushy
 */
export function validateBoostTone(message: string): {
  passed: boolean;
  issues: string[];
} {
  const issues: string[] = [];
  const lowerMessage = message.toLowerCase();

  // Fail if: Shames the user for stopping
  const shamingPatterns = [
    "you stopped",
    "giving up",
    "quit again",
    "you're not trying",
    "lazy",
    "you should be",
    "why did you stop"
  ];

  shamingPatterns.forEach(pattern => {
    if (lowerMessage.includes(pattern)) {
      issues.push(`Shames user: "${pattern}"`);
    }
  });

  // Fail if: Uses urgency language
  const urgencyPatterns = [
    "now",
    "don't miss",
    "hurry",
    "time's running out",
    "act fast",
    "limited time",
    "urgent"
  ];

  urgencyPatterns.forEach(pattern => {
    if (lowerMessage.includes(pattern)) {
      issues.push(`Uses urgency language: "${pattern}"`);
    }
  });

  // Fail if: Sounds like a coach yelling from the sidelines
  const yellingPatterns = [
    "come on!",
    "push harder",
    "you can do it!",
    "don't give up!",
    "keep going!",
    "fight!",
    "let's go!"
  ];

  yellingPatterns.forEach(pattern => {
    if (lowerMessage.includes(pattern)) {
      issues.push(`Sounds like yelling coach: "${pattern}"`);
    }
  });

  // Check for positive patterns (should pass)
  const acknowledgmentPatterns = ["nice work", "good progress", "you've made"];
  const smallStepPatterns = ["one small step", "try this", "consider"];
  const pauseAcceptance = ["take a break", "when you're ready", "no rush"];

  return {
    passed: issues.length === 0,
    issues
  };
}

/**
 * Validates boost nudge behavior follows timing and interaction guidelines
 */
export function validateBoostBehavior(context: {
  trigger: BoostTrigger;
  timing: BoostContext;
  isDismissible: boolean;
  appearsbriefly: boolean;
  stacksMessages: boolean;
}): {
  passed: boolean;
  issues: string[];
} {
  const issues: string[] = [];

  // Must: Trigger only after inactivity or completion
  const validTriggers = ["inactivity", "completion"];
  if (!validTriggers.includes(context.trigger)) {
    issues.push(`Invalid trigger: ${context.trigger}. Must be inactivity or completion.`);
  }

  // Must: Be dismissible without penalty
  if (!context.isDismissible) {
    issues.push("Boost must be dismissible without penalty");
  }

  // Must: Appear briefly and fade
  if (!context.appearsbriefly) {
    issues.push("Boost must appear briefly and fade");
  }

  // Must not: Stack messages
  if (context.stacksMessages) {
    issues.push("Boost must not stack messages");
  }

  // Must not: Interrupt typing or reading
  if (context.timing.isTyping || context.timing.isReading) {
    issues.push("Boost must not interrupt typing or reading");
  }

  // Must not: Appear during errors
  if (context.timing.hasError) {
    issues.push("Boost must not appear during errors (that's Anchor's job)");
  }

  // Timing guardrail: 6 hour cooldown
  if (context.timing.lastBoostTime) {
    const timeSinceLastBoost = Date.now() - context.timing.lastBoostTime;
    if (timeSinceLastBoost < BOOST_COOLDOWN_MS) {
      issues.push(`Boost cooldown not met. ${Math.round((BOOST_COOLDOWN_MS - timeSinceLastBoost) / (1000 * 60 * 60))} hours remaining.`);
    }
  }

  return {
    passed: issues.length === 0,
    issues
  };
}

/**
 * Determines if a boost should be triggered based on context
 */
export function shouldTriggerBoost(context: BoostContext): {
  shouldTrigger: boolean;
  reason: string;
} {
  // Check cooldown first
  if (context.lastBoostTime) {
    const timeSinceLastBoost = Date.now() - context.lastBoostTime;
    if (timeSinceLastBoost < BOOST_COOLDOWN_MS) {
      return {
        shouldTrigger: false,
        reason: "Cooldown period active"
      };
    }
  }

  // Don't interrupt active states
  if (context.isTyping || context.isReading) {
    return {
      shouldTrigger: false,
      reason: "User is actively engaging"
    };
  }

  // Don't show during errors
  if (context.hasError) {
    return {
      shouldTrigger: false,
      reason: "Error state - Anchor's territory"
    };
  }

  // Trigger conditions
  const inactivityThreshold = 30 * 60 * 1000; // 30 minutes
  const timeSinceActivity = Date.now() - context.lastActivity;
  
  if (context.userState === "inactive" && timeSinceActivity > inactivityThreshold) {
    return {
      shouldTrigger: true,
      reason: "User has been inactive for over 30 minutes"
    };
  }

  return {
    shouldTrigger: false,
    reason: "No valid trigger conditions met"
  };
}

/**
 * Creates a validated boost message
 */
export function createBoostMessage(type: "acknowledgment" | "small_step" | "pause_ok"): string {
  const messages = {
    acknowledgment: [
      "Nice work on what you've built so far.",
      "You've made good progress today.",
      "Your funnel is taking shape nicely."
    ],
    small_step: [
      "When you're ready, try adding one more element.",
      "Consider tweaking that headline when you have a moment.",
      "Maybe test a different color scheme?"
    ],
    pause_ok: [
      "Taking a break is perfectly fine.",
      "Your work will be here when you return.",
      "Sometimes stepping away brings fresh ideas."
    ]
  };

  const options = messages[type];
  return options[Math.floor(Math.random() * options.length)];
}

// Centralized Personality Output
export type Personality = "anchor" | "boost" | "glitch" | "default";

/**
 * Centralize personality output to prevent drift
 * Each personality has specific formatting rules for consistency
 */
export function getPersonalitySafeCopy(
  personality: Personality,
  message: string
): string {
  if (personality === "anchor") {
    return message.replace(/!/g, "")
  }

  if (personality === "boost") {
    return message.slice(0, 120)
  }

  return message
}