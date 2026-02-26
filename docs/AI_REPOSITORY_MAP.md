# Launchpad Repository Map

AI, Voice, and Prompt Architecture (framework-agnostic; assumes React + API stack)

```text
/launchpad
├── /apps
│   ├── /web
│   └── /api
├── /packages
│   ├── /ai
│   ├── /voices
│   ├── /templates
│   ├── /analytics
│   └── /core
├── /docs
└── /tests
```

AI is not buried inside UI or backend logic. It lives in shared packages.

## 1) Core AI System Package

```text
/packages/ai
├── index.ts
├── context
│   ├── AIContextResolver.ts
│   ├── RiskAssessor.ts
│   └── Context.types.ts
├── voices
│   ├── VoiceBinder.ts
│   ├── voiceRegistry.ts
│   └── Voice.types.ts
├── prompts
│   ├── PromptAssembler.ts
│   ├── promptContracts
│   │   ├── hero.contract.ts
│   │   ├── cta.contract.ts
│   │   ├── funnel.contract.ts
│   │   ├── template.contract.ts
│   │   ├── onboarding.contract.ts
│   │   └── glitch.contract.ts
│   └── Prompt.types.ts
├── linting
│   ├── ResponseLinter.ts
│   ├── lintRules.ts
│   └── Lint.types.ts
├── services
│   ├── AIClient.ts
│   └── AIService.ts
└── ui
    ├── SuggestionRenderer.tsx
    └── ExplanationToggle.tsx
```

Why this matters: prompts are contracts, not strings. Voices are first-class modules, not adjectives. Linting is mandatory, not optional.

## 2) Voice System Package

```text
/packages/voices
├── index.ts
├── boost
│   ├── boost.header.ts
│   ├── boost.rules.ts
│   └── boost.examples.ts
├── antiGuru
│   ├── antiGuru.header.ts
│   ├── antiGuru.rules.ts
│   └── antiGuru.examples.ts
├── glitch
│   ├── glitch.header.ts
│   ├── glitch.rules.ts
│   └── glitch.examples.ts
└── VoiceRegistry.ts
```

Responsibilities: defines non-editable system headers, tone constraints, and allowed surfaces. If a voice is not registered here, it does not exist.

## 3) Prompt Contracts (Critical Layer)

```text
/packages/ai/prompts/promptContracts
├── hero.contract.ts
├── cta.contract.ts
├── funnel.contract.ts
├── template.contract.ts
├── onboarding.contract.ts
├── analytics.contract.ts
└── glitch.contract.ts
```

Example export:

```text
export const HeroPromptContract = {
  allowedVoices: ["boost", "anti-guru", "glitch"],
  riskLevel: "medium",
  outputShape: "options-with-explanations",
  overwritePolicy: "never",
  persuasionLevel: "low"
}
```

Contracts enforce behavior at architecture level, not in copy reviews.

## 4) UI Components → AI Bindings

```text
/apps/web/components
├── builder
│   ├── HeroBlock.tsx
│   ├── CTABlock.tsx
│   ├── ProofBlock.tsx
│   └── FunnelCanvas.tsx
├── onboarding
│   ├── Welcome.tsx
│   ├── Checklist.tsx
│   └── GuidedBuild.tsx
└── analytics
    ├── Dashboard.tsx
    └── InsightCard.tsx
```

Each AI-enabled component imports one hook only: `useAISuggestions(contract, componentContext)`. Components never build prompts, select voices, or call the AI directly.

## 5) API Layer (No Prompt Logic Here)

```text
/apps/api
├── ai
│   ├── suggest.ts
│   ├── explain.ts
│   └── validate.ts
├── funnels
├── users
└── analytics
```

API responsibilities: authentication, rate limiting, logging, passing context safely.
API forbidden actions: writing prompts, editing voice rules, skipping linting. The API is a courier, not a thinker.

## 6) Templates Package (Voice-Aware)

```text
/packages/templates
├── index.ts
├── boost
│   ├── cleanLaunch.template.ts
│   └── evergreen.template.ts
├── antiGuru
│   ├── noHype.template.ts
│   └── skeptic.template.ts
├── glitch
│   ├── doNotClick.template.ts
│   └── tiredAI.template.ts
└── Template.types.ts
```

Each template declares: `voice`, `risk`, `audience`, `aiAllowed`. Templates cannot override voice rules.

## 7) Analytics + Insight AI

```text
/packages/analytics
├── index.ts
├── metrics
├── insights
│   ├── InsightAI.ts
│   ├── insight.contract.ts
│   └── insight.rules.ts
└── reports
```

Boost-only. No parody. No experimentation. Instrument panel, not billboard.

## 8) Tests (Trust Is Enforced)

```text
/tests
├── ai
│   ├── voiceEnforcement.test.ts
│   ├── intentDrift.test.ts
│   ├── persuasionLeak.test.ts
│   └── glitchContainment.test.ts
├── prompts
└── templates
```

If Glitch leaks into onboarding, tests fail. If urgency sneaks into Anti-Guru, tests fail.

## 9) Docs (Codex Lives Here)

```text
/docs
├── CODEX_AI.md
├── CODEX_VOICES.md
├── CODEX_TEMPLATES.md
├── CODEX_ONBOARDING.md
└── CODEX_ARCHITECTURE.md
```

Operational law, not marketing copy.

## 10) Final Repo Law

If someone can “just tweak a prompt” without touching contracts, voices, and linting, the repo is wrong. Launchpad stays trustworthy because prompts are constrained, voices are contained, AI is predictable, and users stay in control.
