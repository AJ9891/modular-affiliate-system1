import fs from 'node:fs'
import path from 'node:path'

const repoRoot = process.cwd()
const errors = []

function readFile(relativePath) {
  const fullPath = path.join(repoRoot, relativePath)
  if (!fs.existsSync(fullPath)) {
    errors.push(`Missing required file: ${relativePath}`)
    return ''
  }
  return fs.readFileSync(fullPath, 'utf8')
}

function requireText(relativePath, snippets) {
  const body = readFile(relativePath)
  for (const snippet of snippets) {
    if (!body.includes(snippet)) {
      errors.push(`${relativePath} is missing required text: ${snippet}`)
    }
  }
}

function requireImport(relativePath, importSnippet) {
  const body = readFile(relativePath)
  if (!body.includes(importSnippet)) {
    errors.push(`${relativePath} must import shared contracts via: ${importSnippet}`)
  }
}

function banPattern(relativePath, pattern, reason) {
  const body = readFile(relativePath)
  if (pattern.test(body)) {
    errors.push(`${relativePath} violates law guard: ${reason}`)
  }
}

function assertNoRootCaptureArtifacts() {
  const rootEntries = fs.readdirSync(repoRoot, { withFileTypes: true })
  const blockedPatterns = [
    /^Dashboard (dark|light)\.png$/,
    /^saved_resource\.html$/,
    /^Web App Reverse Engineering\.html$/,
    /^profile_picture\.thumbnail\.jpeg$/,
    /^main-.*\.css$/,
    /^root-.*\.css$/,
    /^conversation-small-.*\.css$/,
    /^code-block-.*\.css$/,
    /^codemirror-.*\.css$/,
    /^product-variants-.*\.css$/,
    /^prosemirror-.*\.css$/,
    /^writing-block-editor-.*\.css$/,
    /^ansi-.*\.css$/,
    /^table-components-.*\.css$/,
    /^silk-hq-.*\.css$/,
    /^index-.*\.css$/,
  ]

  for (const entry of rootEntries) {
    if (!entry.isFile()) continue
    const fileName = entry.name
    if (fileName.endsWith('.download')) {
      errors.push(`Root capture artifact detected: ${fileName}`)
      continue
    }
    if (fileName.length >= 80 && !fileName.endsWith('.md')) {
      errors.push(`Suspicious long root filename detected: ${fileName}`)
      continue
    }
    if (blockedPatterns.some((pattern) => pattern.test(fileName))) {
      errors.push(`Blocked root artifact detected: ${fileName}`)
    }
  }
}

requireText('docs/architecture/laws.md', [
  'Identity Law',
  'State Law',
  'Capability Law',
  'Contract Law',
  'Event Law',
  'Decision Law',
  'Composition Law',
  'Evolution Law',
])

requireText('docs/codex/AI_RULES.md', ['Required Output Envelope', 'policy_flags'])
requireText('docs/codex/VOICE_RULES.md', ['Voice Contract', 'fallback_style'])
requireText('docs/codex/ONBOARDING_RULES.md', ['state machine', 'Step completion'])
requireText('docs/codex/TEMPLATE_RULES.md', ['Template Contract', 'version'])

requireText('packages/contracts/src/index.ts', [
  "export * from './plans'",
  "export * from './events'",
  "export * from './voice'",
  "export * from './template-metadata'",
  "export * from './onboarding'",
])

requireText('packages/contracts/src/ai.ts', [
  'AiDecisionEnvelope',
  'confidence',
  'policyFlags',
])

requireText('packages/contracts/src/voice.ts', [
  'VOICE_IDS',
  'VoiceContract',
  'fallbackStyle',
])

requireText('packages/contracts/template-metadata.schema.json', [
  'templateId',
  'requiredInputs',
  'outputShape',
  'capabilityRequirements',
])

requireText('apps/web/eslint.config.mjs', [
  "'@typescript-eslint/consistent-type-imports'",
  "'no-restricted-imports'",
])

requireImport('apps/web/src/app/api/profile/plan/route.ts', "from '@contracts/plans'")
requireImport('apps/web/src/lib/api/settings.ts', "from '@contracts/plans'")

banPattern(
  'apps/web/src/app/api/profile/plan/route.ts',
  /\[['\"]free['\"],\s*['\"]starter['\"],\s*['\"]pro['\"],\s*['\"]agency['\"]\]/,
  'hard-coded plan tuple detected; use @contracts/plans constants'
)

banPattern(
  'apps/web/src/lib/api/settings.ts',
  /plan\s*===\s*['\"]free['\"]\s*\|\|\s*plan\s*===\s*['\"]starter['\"]/,
  'hard-coded plan branching detected; use isPlanId from @contracts/plans'
)

assertNoRootCaptureArtifacts()

if (errors.length > 0) {
  console.error('Law check failed:')
  for (const error of errors) {
    console.error(`- ${error}`)
  }
  process.exit(1)
}

console.log('Law check passed.')
