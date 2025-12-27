export type FunnelStepType =
  | "hero"
  | "problem"
  | "credibility"
  | "mechanism"
  | "cta"
  | "footer";

export const FUNNEL_FLOW: FunnelStepType[] = [
  "hero",
  "problem",
  "mechanism",
  "credibility",
  "cta",
  "footer",
];

export const FUNNEL_STEP_INTENT = {
  hero: {
    goal: "Stop scrolling and establish tone",
    maxWords: 40,
  },
  problem: {
    goal: "Name the frustration without shaming",
    maxWords: 120,
  },
  mechanism: {
    goal: "Explain how this works without magic",
    maxWords: 150,
  },
  credibility: {
    goal: "Reduce skepticism without flexing",
    maxWords: 80,
  },
  cta: {
    goal: "Invite action without pressure",
    maxWords: 20,
  },
};
